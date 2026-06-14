import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';
import { Thread, Priority } from '../../../../types';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);
    const response = await tenant.gmail.api.threads.list({
      userId: 'me',
      maxResults: 10
    });

    const threadsList = response.threads || [];
    const detailedThreads = await Promise.all(
      threadsList.map(async (t: any) => {
        try {
          return await tenant.gmail.api.threads.get({
            id: t.id,
            userId: 'me',
            format: 'full'
          });
        } catch (e) {
          console.warn(`Failed to fetch details for thread ${t.id}:`, e);
          return t;
        }
      })
    );

    const formatted: Thread[] = detailedThreads.map((t: any) => {
      const messages = t.messages || [];
      const firstMessage = messages[0] || {};
      const payload = firstMessage.payload || {};
      const headers = payload.headers || [];

      // Extract headers
      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';

      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
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
    const mockThreads: Thread[] = [
      {
        id: 'thread-demo',
        from: 'Piyush Garg (Mock)',
        fromEmail: 'piyush@corsair.dev',
        subject: 'demo confirmation',
        preview: 'Quick rundown before we kick off...',
        body: 'Hey Yashika,\n\nJust wanted to confirm the demo time. Let me know if that works.',
        date: new Date().toISOString(),
        isUnread: true,
        priority: 'urgent',
        responseWindow: 'reply within 2h',
        labels: ['INBOX', 'IMPORTANT']
      },
      {
        id: 'thread-followup-demo',
        from: 'Rohan Sharma (Mock)',
        fromEmail: 'rohan@corsair.dev',
        subject: 'Re: Q3 proposal',
        preview: 'Let me know what you think of the proposal...',
        body: 'Hi Yashika,\n\nI sent over the Q3 proposal on Thursday but haven\'t heard back. Let me know if you need any changes.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isUnread: false,
        priority: 'important',
        labels: ['INBOX']
      }
    ];
    return NextResponse.json(mockThreads);
  }
}
