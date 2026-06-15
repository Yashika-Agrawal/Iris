import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';
import { getTenantId } from '../../../lib/tenant';
import { z } from 'zod';

// Dynamic imports to match the snippet while keeping it safe if not installed yet
let OpenAIAgentsProvider: any;
let Agent: any, run: any, tool: any;
try {
  OpenAIAgentsProvider = require('@corsair-dev/mcp').OpenAIAgentsProvider;
  const agentsPackage = require('@openai/agents');
  Agent = agentsPackage.Agent;
  run = agentsPackage.run;
  tool = agentsPackage.tool;
} catch (e) {
  // Ignore imports failing during mock mode
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';

    // MOCK MODE: Return a streaming response without using OpenAI tokens
    if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const chunks = [
            "✓ Checking your calendar for Friday...\n",
            "✓ Found slot: Friday 2pm – 2:30pm\n",
            "✓ Drafting email to piyush@corsair.dev...\n",
            "✓ Creating calendar event...\n",
            "● Done! I have scheduled the meeting and sent the reply."
          ];
          
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise(r => setTimeout(r, 600)); // Simulate thinking/API latency
          }
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // REAL MODE: Execute via @openai/agents
    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const provider = new OpenAIAgentsProvider();
    const tools = await provider.build({ corsair, tool });

    tools.push(tool({
      name: 'send_email_simple',
      description: 'Easily send an email without base64 encoding. ALWAYS use this instead of the gmail plugin.',
      parameters: z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string()
      }),
      execute: async ({ to, subject, body }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const str = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
          const rawEncoded = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await tenant.gmail.api.messages.send({ userId: 'me', raw: rawEncoded });
          return `Email sent successfully! ID: ${res.id}`;
        } catch (err: any) {
          return `Failed to send email: ${err.message}`;
        }
      }
    }));

    tools.push(tool({
      name: 'schedule_meeting_simple',
      description: 'Easily schedule a calendar event. ALWAYS use this instead of the googlecalendar plugin.',
      parameters: z.object({
        summary: z.string(),
        description: z.string().optional(),
        startIso: z.string().describe('ISO string for start time'),
        endIso: z.string().describe('ISO string for end time'),
        attendeeEmails: z.array(z.string()).optional()
      }),
      execute: async ({ summary, description, startIso, endIso, attendeeEmails }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const attendees = attendeeEmails ? attendeeEmails.map((email: string) => ({ email })) : undefined;
          
          const res = await tenant.googlecalendar.api.events.create({
            calendarId: 'primary',
            event: {
              summary,
              description,
              start: { dateTime: startIso },
              end: { dateTime: endIso },
              attendees
            }
          });
          return `Meeting scheduled successfully! Link: ${res.htmlLink}`;
        } catch (err: any) {
          return `Failed to schedule meeting: ${err.message}`;
        }
      }
    }));

    tools.push(tool({
      name: 'search_emails',
      description: 'Search the users emails. ALWAYS use this instead of the gmail plugin to read emails.',
      parameters: z.object({ query: z.string().optional().describe('Gmail search query, e.g. "from:yashika" or "is:unread"') }),
      execute: async ({ query }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const res = await tenant.gmail.api.threads.list({ userId: 'me', q: query, maxResults: 5 });
          if (!res.threads || res.threads.length === 0) return "No emails found.";
          const snippets = await Promise.all(res.threads.map(async (t: any) => {
             try {
                const full = await tenant.gmail.api.threads.get({ userId: 'me', id: t.id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] });
                const subject = full.messages?.[0]?.payload?.headers?.find((h:any)=>h.name==='Subject')?.value || 'No Subject';
                const from = full.messages?.[0]?.payload?.headers?.find((h:any)=>h.name==='From')?.value || 'Unknown';
                const date = full.messages?.[0]?.payload?.headers?.find((h:any)=>h.name==='Date')?.value || 'Unknown Date';
                return `From: ${from} | Subject: ${subject} | Date: ${date} | Preview: ${t.snippet}`;
             } catch (e) { return `Preview: ${t.snippet}`; }
          }));
          return snippets.join('\n---\n');
        } catch (err: any) {
          return `Failed to search emails: ${err.message}`;
        }
      }
    }));

    tools.push(tool({
      name: 'list_calendar_events',
      description: 'List calendar events in a time range. ALWAYS use this instead of the googlecalendar plugin to read events.',
      parameters: z.object({
        timeMinIso: z.string().describe('ISO start time'),
        timeMaxIso: z.string().describe('ISO end time')
      }),
      execute: async ({ timeMinIso, timeMaxIso }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const res = await tenant.googlecalendar.api.events.getMany({
            calendarId: 'primary',
            timeMin: timeMinIso,
            timeMax: timeMaxIso,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 10
          });
          if (!res.items || res.items.length === 0) return "No events found.";
          return res.items.map((e: any) => `Event: ${e.summary} | Start: ${e.start?.dateTime || e.start?.date} | End: ${e.end?.dateTime || e.end?.date} | Status: ${e.status}`).join('\n');
        } catch (err: any) {
          return `Failed to list events: ${err.message}`;
        }
      }
    }));

    const agent = new Agent({
      name: 'corsair-agent',
      model: 'gpt-4o-mini', // Changed to mini to save tokens
      instructions: `You are Iris, a highly capable AI assistant using Corsair tools.
      You MUST use 'run_script' to perform actions.
      
      HINTS:
      - ALWAYS use 'send_email_simple' to send emails.
      - ALWAYS use 'schedule_meeting_simple' to schedule calendar events.
      - ALWAYS use 'search_emails' to read or search emails.
      - ALWAYS use 'list_calendar_events' to read calendar events.
      
      CRITICAL LOOP PREVENTION:
      If you do not know the exact schema for an operation, you MUST use 'get_schema' first.
      If 'run_script' fails, DO NOT RETRY the exact same arguments. Try to fix the arguments based on the error.
      If 'run_script' fails TWICE for the same operation, you MUST STOP and give up. Do not get stuck in an infinite loop! Report the failure to the user.`,
      tools,
    });

    // Run the agent synchronously to get the final output
    const result = await run(agent, lastMessage);
    
    // We wrap the final synchronous output into a stream so the frontend doesn't break
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(result.finalOutput));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in agent route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
