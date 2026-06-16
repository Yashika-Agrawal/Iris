import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';
import { getTenantId } from '../../../lib/tenant';
import { z } from 'zod';

let OpenAIAgentsProvider: any;
let Agent: any, run: any, tool: any;
try {
  OpenAIAgentsProvider = require('@corsair-dev/mcp').OpenAIAgentsProvider;
  const agentsPackage = require('@openai/agents');
  Agent = agentsPackage.Agent;
  run = agentsPackage.run;
  tool = agentsPackage.tool;
} catch (e) {}

export async function POST(req: Request) {
  try {
    const { actionId, title, summary, actionLabel } = await req.json();

    // MOCK MODE: Return simulated success after 2 seconds
    if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
      await new Promise(r => setTimeout(r, 2000));
      return NextResponse.json({ success: true, message: 'Mock execution completed successfully.' });
    }

    // REAL MODE: Trigger @openai/agents
    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const provider = new OpenAIAgentsProvider();
    const tools = await provider.build({ corsair, tool });

    tools.push(tool({
      name: 'send_email_simple',
      description: 'Easily send an email without base64 encoding. ALWAYS use this to send emails.',
      parameters: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
      execute: async ({ to, subject, body }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const str = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
          const rawEncoded = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await tenant.gmail.api.messages.send({ userId: 'me', raw: rawEncoded });
          return `Email sent successfully! ID: ${res.id}`;
        } catch (err: any) { return `Failed to send email: ${err.message}`; }
      }
    }));

    tools.push(tool({
      name: 'schedule_meeting_simple',
      description: 'Easily schedule a calendar event. ALWAYS use this to schedule.',
      parameters: z.object({
        summary: z.string(), description: z.string().optional(), startIso: z.string(), endIso: z.string(), attendeeEmails: z.array(z.string()).optional()
      }),
      execute: async ({ summary, description, startIso, endIso, attendeeEmails }: any) => {
        try {
          const tenantId = await getTenantId();
          const tenant = corsair.withTenant(tenantId);
          const attendees = attendeeEmails ? attendeeEmails.map((email: string) => ({ email })) : undefined;
          const res = await tenant.googlecalendar.api.events.create({
            calendarId: 'primary', event: { summary, description, start: { dateTime: startIso }, end: { dateTime: endIso }, attendees }
          });
          return `Meeting scheduled successfully! Link: ${res.htmlLink}`;
        } catch (err: any) { return `Failed to schedule meeting: ${err.message}`; }
      }
    }));

    const agent = new Agent({
      name: 'corsair-action-executor',
      model: 'gpt-4o', // We can use 4o for execution since it's a specific instruction without heavy context fetching
      instructions: `You are an executive assistant acting on behalf of the user. You have custom tools to send emails and schedule meetings.
      ALWAYS use 'send_email_simple' and 'schedule_meeting_simple'. Do not use the default mcp tools.
      Your task is to fulfill the user's request securely and accurately.
      Use the available tools to complete the required action. Once done, return a brief summary of what you did.`,
      tools,
    });

    const prompt = `The user clicked an action button labeled "${actionLabel}". 
    The context of this action is:
    Title: ${title}
    Summary: ${summary}
    
    Please execute the necessary tools to accomplish this task on the user's behalf. Do not ask for confirmation, just do it.`;

    const result = await run(agent, prompt);

    return NextResponse.json({ success: true, message: result.finalOutput });
  } catch (error) {
    console.error('Error executing action:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
