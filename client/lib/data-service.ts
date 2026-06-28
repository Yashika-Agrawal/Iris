import { corsair, pool } from './corsair';
import { getCached } from './cache';
import { Thread, Message, CalEvent, Priority } from '../types';

async function getAccountId(tenantId: string): Promise<string | null> {
  try {
    const res = await pool.query(
      `SELECT id FROM corsair_accounts WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    return res.rows[0]?.id || null;
  } catch {
    return null;
  }
}

function formatThread(t: any): Thread {
  const messages = t.messages || [];
  const firstMessage = messages[0] || {};
  const payload = firstMessage.payload || {};
  const headers = payload.headers || [];

  const fromHeader = firstMessage.from || headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || 'Unknown';
  const subjectHeader = firstMessage.subject || headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
  const dateHeader = headers.find((h: any) => h.name?.toLowerCase() === 'date')?.value || new Date().toISOString();

  let from = fromHeader;
  let fromEmail = fromHeader;
  const emailMatch = fromHeader.match(/^(.*?)\s*<(.*?)>$/);
  if (emailMatch) {
    from = emailMatch[1].replace(/['"]/g, '').trim();
    fromEmail = emailMatch[2].trim();
  }

  const isUnread = messages.some((m: any) => m.labelIds?.includes('UNREAD'));
  const labels = messages.reduce((acc: string[], m: any) => {
    if (m.labelIds) {
      m.labelIds.forEach((l: string) => {
        if (!acc.includes(l)) acc.push(l);
      });
    }
    return acc;
  }, []);

  let body = t.snippet || '';
  if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else if (payload.parts) {
    const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }

  let priority: Priority = 'fyi';
  let responseWindow: string | undefined;

  const subjectLower = subjectHeader.toLowerCase();
  if (subjectLower.includes('urgent') || subjectLower.includes('important') || isUnread) {
    priority = 'important';
  }
  if (subjectLower.includes('confirmation') || subjectLower.includes('demo') || subjectLower.includes('immediately')) {
    priority = 'urgent';
    responseWindow = 'reply within 2h';
  }

  return {
    id: t.id || '',
    from,
    fromEmail,
    subject: subjectHeader,
    preview: t.snippet || '',
    body,
    date: dateHeader,
    isUnread,
    priority,
    responseWindow,
    labels,
  };
}

function formatMessages(t: any): Message[] {
  return (t.messages || []).map((m: any) => {
    const payload = m.payload || {};
    const headers = payload.headers || [];
    const mFrom = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || '';
    const mTo = headers.find((h: any) => h.name?.toLowerCase() === 'to')?.value || '';
    const mDate = headers.find((h: any) => h.name?.toLowerCase() === 'date')?.value || '';

    let mBody = m.snippet || '';
    if (payload.body?.data) {
      mBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        mBody = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: m.id || '',
      threadId: m.threadId || '',
      from: mFrom,
      to: mTo,
      body: mBody,
      date: mDate,
    };
  });
}

function formatEvent(item: any): CalEvent {
  const guests = item.attendees?.map((a: any) => a.email || a.displayName || '').filter(Boolean) || [];
  return {
    id: item.id || '',
    title: item.summary || 'Untitled Event',
    start: item.start?.dateTime || item.start?.date || '',
    end: item.end?.dateTime || item.end?.date || '',
    guests,
    description: item.description || '',
  };
}

export class DataService {
  private tenantId: string;
  private _accountId: string | null = null;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private async accountId(): Promise<string | null> {
    if (!this._accountId) {
      this._accountId = await getAccountId(this.tenantId);
    }
    return this._accountId;
  }

  async searchThreads(query: string): Promise<{ from: string; subject: string; date: string; preview: string }[]> {
    const accId = await this.accountId();
    if (!accId) return [];

    try {
      const tenant = corsair.withTenant(this.tenantId);
      const res = await tenant.gmail.api.threads.list({ userId: 'me', q: query, maxResults: 5 });
      if (!res.threads || res.threads.length === 0) return [];

      const results = await Promise.all(res.threads.map(async (t: any) => {
        try {
          const full = await tenant.gmail.api.threads.get({
            userId: 'me', id: t.id, format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          });
          const headers = full.messages?.[0]?.payload?.headers || [];
          return {
            from: headers.find((h: any) => h.name === 'From')?.value || 'Unknown',
            subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
            date: headers.find((h: any) => h.name === 'Date')?.value || 'Unknown Date',
            preview: t.snippet || '',
          };
        } catch {
          return { from: 'Unknown', subject: 'Error', date: '', preview: t.snippet || '' };
        }
      }));
      return results;
    } catch {
      return [];
    }
  }

  async getThreads(): Promise<Thread[]> {
    const accId = await this.accountId();
    if (!accId) return [];

    return getCached(accId, { ttl: 5 * 60_000, type: 'threads', key: 'inbox' }, async () => {
      const tenant = corsair.withTenant(this.tenantId);
      const response = await tenant.gmail.api.threads.list({
        userId: 'me', maxResults: 10, q: 'in:inbox',
      });
      const threadsList = response.threads || [];
      const threadIds = threadsList.map((t: any) => t.id);

      if (threadIds.length === 0) return [];

      const placeholders = threadIds.map((_: any, i: number) => `$${i + 1}`).join(',');
      const dbRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'threads' AND entity_id IN (${placeholders})`,
        threadIds
      );
      const msgRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'messages' AND data->>'threadId' IN (${placeholders}) ORDER BY data->>'internalDate' ASC`,
        threadIds
      );

      const messagesByThread: Record<string, any[]> = {};
      msgRes.rows.forEach((r: any) => {
        const tId = r.data.threadId;
        if (!messagesByThread[tId]) messagesByThread[tId] = [];
        messagesByThread[tId].push(r.data);
      });

      const detailedThreads = await Promise.all(
        threadIds.map(async (id: string) => {
          let threadData = dbRes.rows.find((r: any) => r.data.id === id)?.data;
          if (threadData) {
            threadData.messages = messagesByThread[id] || [];
            const lastMsg = threadData.messages[threadData.messages.length - 1];
            if (lastMsg?.snippet) {
              threadData.snippet = lastMsg.snippet;
            }
          }
          if (!threadData || !threadData.messages || threadData.messages.length === 0) {
            try {
              threadData = await tenant.gmail.api.threads.get({ id, userId: 'me', format: 'full' });
            } catch { /* ignore */ }
          }
          return threadData;
        })
      );

      return detailedThreads.filter(Boolean).map(formatThread);
    });
  }

  async getThread(threadId: string): Promise<{ thread: Thread; messages: Message[] } | null> {
    const accId = await this.accountId();
    if (!accId) return null;

    return getCached(accId, { ttl: 5 * 60_000, type: 'thread', key: threadId }, async () => {
      const dbRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'threads' AND entity_id = $1 LIMIT 1`,
        [threadId]
      );

      let threadData = dbRes.rows[0]?.data;
      let tenant;

      if (!threadData) {
        tenant = corsair.withTenant(this.tenantId);
        threadData = await tenant.gmail.api.threads.get({ id: threadId, userId: 'me', format: 'full' });
      } else {
        const msgRes = await pool.query(
          `SELECT data FROM corsair_entities WHERE entity_type = 'messages' AND data->>'threadId' = $1 ORDER BY data->>'internalDate' ASC`,
          [threadId]
        );
        threadData.messages = msgRes.rows.map((r: any) => r.data);
        if (threadData.messages.length > 0) {
          const lastMsg = threadData.messages[threadData.messages.length - 1];
          if (lastMsg?.snippet) threadData.snippet = lastMsg.snippet;
        }
      }

      if (threadData && (!threadData.messages || threadData.messages.length === 0)) {
        if (!tenant) {
          tenant = corsair.withTenant(this.tenantId);
        }
        try {
          threadData = await tenant.gmail.api.threads.get({ id: threadId, userId: 'me', format: 'full' });
        } catch { /* ignore */ }
      }

      const messagesList = threadData?.messages || [];
      const isUnread = messagesList.some((m: any) => m.labelIds?.includes('UNREAD'));
      if (isUnread) {
        try {
          const tenant = corsair.withTenant(this.tenantId);
          await tenant.gmail.api.threads.modify({
            id: threadId, userId: 'me', removeLabelIds: ['UNREAD'],
          });
        } catch { /* ignore */ }
      }

      if (!threadData) return { thread: null as any, messages: [] };

      return {
        thread: formatThread(threadData),
        messages: formatMessages(threadData),
      };
    });
  }

  async getEvents(dateFrom: string): Promise<CalEvent[]> {
    const accId = await this.accountId();
    if (!accId) return [];

    const day = dateFrom.split('T')[0];
    return getCached(accId, { ttl: 5 * 60_000, type: 'events', key: day }, async () => {
      const tenant = corsair.withTenant(this.tenantId);
      const response = await tenant.googlecalendar.api.events.getMany({
        timeMin: dateFrom, singleEvents: true, orderBy: 'startTime',
      });
      return (response.items || []).map(formatEvent);
    });
  }

  async getProfile(): Promise<{ email: string } | null> {
    const accId = await this.accountId();
    if (!accId) return null;

    return getCached(accId, { ttl: 60 * 60_000, type: 'profile', key: 'me' }, async () => {
      const tenant = corsair.withTenant(this.tenantId);
      const accessToken = await tenant.gmail.keys.get_access_token();
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const profile = await res.json();
      return { email: profile.emailAddress };
    });
  }

  async getSettings(): Promise<{
    gmailConnected: boolean;
    calendarConnected: boolean;
    userEmail: string | null;
  }> {
    let gmailConnected = false;
    let calendarConnected = false;
    let userEmail: string | null = null;

    try {
      const tenant = corsair.withTenant(this.tenantId);
      const gmailToken = await tenant.gmail.keys.get_refresh_token();
      if (gmailToken) {
        gmailConnected = true;
        const profile = await this.getProfile();
        userEmail = profile?.email || null;
      }
    } catch { /* not connected */ }

    try {
      const tenant = corsair.withTenant(this.tenantId);
      const calToken = await tenant.googlecalendar.keys.get_refresh_token();
      calendarConnected = !!calToken;
    } catch { /* not connected */ }

    return { gmailConnected, calendarConnected, userEmail };
  }
}

export { formatThread, formatMessages, formatEvent };
