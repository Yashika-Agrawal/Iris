import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { corsair, pool } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';
import { Thread, Priority } from '../../../../types';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);
    const response = await tenant.gmail.api.threads.list({
      userId: 'me',
      maxResults: 10,
      q: 'in:inbox'
    });

    const threadsList = response.threads || [];
    const threadIds = threadsList.map((t: any) => t.id);
    
    let detailedThreads = [];
    if (threadIds.length > 0) {
      const placeholders = threadIds.map((_: any, i: number) => `$${i + 1}`).join(',');
      
      // Fetch threads
      const dbRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'threads' AND entity_id IN (${placeholders})`,
        threadIds
      );
      
      // Fetch all messages belonging to these threads
      const msgRes = await pool.query(
        `SELECT data FROM corsair_entities WHERE entity_type = 'messages' AND data->>'threadId' IN (${placeholders}) ORDER BY data->>'internalDate' ASC`,
        threadIds
      );
      
      // Group messages by thread
      const messagesByThread: Record<string, any[]> = {};
      msgRes.rows.forEach((r: any) => {
        const tId = r.data.threadId;
        if (!messagesByThread[tId]) messagesByThread[tId] = [];
        messagesByThread[tId].push(r.data);
      });

      detailedThreads = await Promise.all(threadIds.map(async (id: string) => {
        let threadData = dbRes.rows.find((r: any) => r.data.id === id)?.data;
        
        if (threadData) {
          threadData.messages = messagesByThread[id] || [];
          const lastMsg = threadData.messages[threadData.messages.length - 1];
          if (lastMsg && lastMsg.snippet) {
            threadData.snippet = lastMsg.snippet;
          }
        }
        
        // Fallback to API if not in cache or missing messages
        if (!threadData || !threadData.messages || threadData.messages.length === 0) {
          try {
            threadData = await tenant.gmail.api.threads.get({ id, userId: 'me', format: 'full' });
          } catch (e) {
            console.error(`Failed to fallback fetch thread ${id}`, e);
          }
        }
        
        return threadData;
      }));
      
      detailedThreads = detailedThreads.filter(Boolean);
    }

    const formatted: Thread[] = detailedThreads.map((t: any) => {
      const messages = t.messages || [];
      const firstMessage = messages[0] || {};
      const payload = firstMessage.payload || {};
      const headers = payload.headers || [];

      // Extract headers
      const fromHeader = firstMessage.from || headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
      const subjectHeader = firstMessage.subject || headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
      const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

      let from = fromHeader;
      let fromEmail = fromHeader;
      const emailMatch = fromHeader.match(/^(.*?)\s*<(.*?)>$/);
      if (emailMatch) {
        from = emailMatch[1].replace(/['"]/g, '').trim();
        fromEmail = emailMatch[2].trim();
      }

      // Check unread
      const isUnread = messages.some((m: any) => m.labelIds?.includes('UNREAD'));
      const labels = messages.reduce((acc: string[], m: any) => {
        if (m.labelIds) {
          m.labelIds.forEach((l: string) => {
            if (!acc.includes(l)) acc.push(l);
          });
        }
        return acc;
      }, []);

      // Extract body
      let body = t.snippet || '';
      if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload.parts) {
        const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      // Determine priority and response window
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
        labels
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching threads from Google API:', error);
    return NextResponse.json([]);
  }
}
