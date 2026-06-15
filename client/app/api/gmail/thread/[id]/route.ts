import { NextResponse } from 'next/server';
import { corsair, pool } from '../../../../../lib/corsair';
import { getTenantId } from '../../../../../lib/tenant';
import { Thread, Message, Priority } from '../../../../../types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dbRes = await pool.query(
      `SELECT data FROM corsair_entities WHERE entity_type = 'threads' AND entity_id = $1 LIMIT 1`,
      [id]
    );

    let threadData = dbRes.rows[0]?.data;
    let tenant;
    
    // Fallback if not in cache yet
    if (!threadData) {
      const tenantId = await getTenantId();
      tenant = corsair.withTenant(tenantId);
      threadData = await tenant.gmail.api.threads.get({ id, userId: 'me', format: 'full' });
    } else {
      // Fetch messages for this thread from cache
      const msgRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'messages' AND data->>'threadId' = $1 ORDER BY data->>'internalDate' ASC`,
        [id]
      );
      threadData.messages = msgRes.rows.map((r: any) => r.data);
      if (threadData.messages.length > 0) {
        const lastMsg = threadData.messages[threadData.messages.length - 1];
        if (lastMsg.snippet) {
          threadData.snippet = lastMsg.snippet;
        }
      }
    }

    // Fallback to API if we got the thread from cache but messages are missing
    if (threadData && (!threadData.messages || threadData.messages.length === 0)) {
      if (!tenant) {
        const tenantId = await getTenantId();
        tenant = corsair.withTenant(tenantId);
      }
      try {
        threadData = await tenant.gmail.api.threads.get({ id, userId: 'me', format: 'full' });
      } catch (e) {
        console.error(`Failed to fallback fetch full thread ${id}`, e);
      }
    }

    if (id === 'thread-demo') {
      const thread: Thread = {
        id: 'thread-demo',
        from: 'Piyush Garg',
        fromEmail: 'piyush@corsair.dev',
        subject: 'demo confirmation',
        preview: 'Quick rundown before we kick off...',
        body: 'Hey Yashika,\n\nJust wanted to confirm the demo time. Let me know if that works.',
        date: new Date().toISOString(),
        isUnread: true,
        priority: 'urgent',
        responseWindow: 'reply within 2h',
        labels: ['INBOX', 'IMPORTANT']
      };
      const messages: Message[] = [
        {
          id: 'msg-demo-1',
          threadId: 'thread-demo',
          from: 'Piyush Garg <piyush@corsair.dev>',
          to: 'Yashika Agrawal <yashika@example.com>',
          body: 'Hey Yashika,\n\nJust wanted to confirm the demo time. Let me know if that works.',
          date: new Date().toISOString()
        }
      ];
      return NextResponse.json({ thread, messages });
    }

    if (id === 'thread-followup-demo') {
      const thread: Thread = {
        id: 'thread-followup-demo',
        from: 'Rohan Sharma',
        fromEmail: 'rohan@corsair.dev',
        subject: 'Re: Q3 proposal',
        preview: 'Let me know what you think of the proposal...',
        body: 'Hi Yashika,\n\nI sent over the Q3 proposal on Thursday but haven\'t heard back. Let me know if you need any changes.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isUnread: false,
        priority: 'important',
        labels: ['INBOX']
      };
      const messages: Message[] = [
        {
          id: 'msg-followup-1',
          threadId: 'thread-followup-demo',
          from: 'Rohan Sharma <rohan@corsair.dev>',
          to: 'Yashika Agrawal <yashika@example.com>',
          body: 'Hi Yashika,\n\nI sent over the Q3 proposal on Thursday but haven\'t heard back. Let me know if you need any changes.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        }
      ];
      return NextResponse.json({ thread, messages });
    }

    // response is already fetched above

    const messagesList = threadData.messages || [];
    const firstMessage = messagesList[0] || {};
    const firstPayload = firstMessage.payload || {};
    const firstHeaders = firstPayload.headers || [];

    // Automatically mark the thread as read if it is unread
    const isUnread = messagesList.some((m: any) => m.labelIds?.includes('UNREAD'));
    if (isUnread) {
      try {
        const tenantId = await getTenantId();
        const tenant = corsair.withTenant(tenantId);
        await tenant.gmail.api.threads.modify({
          id,
          userId: 'me',
          removeLabelIds: ['UNREAD']
        });
      } catch (modifyError) {
        console.warn(`Failed to mark thread ${id} as read:`, modifyError);
      }
    }


    const fromHeader = firstMessage.from || firstHeaders.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
    const subjectHeader = firstMessage.subject || firstHeaders.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
    const dateHeader = firstHeaders.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

    let from = fromHeader;
    let fromEmail = fromHeader;
    const emailMatch = fromHeader.match(/^(.*?)\s*<(.*?)>$/);
    if (emailMatch) {
      from = emailMatch[1].replace(/['"]/g, '').trim();
      fromEmail = emailMatch[2].trim();
    }

    const labels = messagesList.reduce((acc: string[], m: any) => {
      if (m.labelIds) {
        m.labelIds.forEach((l: string) => {
          if (!acc.includes(l)) acc.push(l);
        });
      }
      return acc;
    }, []);

    let body = threadData.snippet || '';
    if (firstPayload.body?.data) {
      body = Buffer.from(firstPayload.body.data, 'base64').toString('utf-8');
    } else if (firstPayload.parts) {
      const textPart = firstPayload.parts.find((p: any) => p.mimeType === 'text/plain');
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

    const thread: Thread = {
      id: threadData.id || '',
      from,
      fromEmail,
      subject: subjectHeader,
      preview: threadData.snippet || '',
      body,
      date: dateHeader,
      isUnread,
      priority,
      responseWindow,
      labels
    };

    const messages: Message[] = messagesList.map((m: any) => {
      const payload = m.payload || {};
      const headers = payload.headers || [];
      const mFrom = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
      const mTo = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
      const mDate = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

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
        date: mDate
      };
    });

    return NextResponse.json({ thread, messages });
  } catch (error) {
    console.error(`Error fetching thread:`, error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
