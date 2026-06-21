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

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable. Cannot generate briefing.");
    }

    // REAL MODE: Fetch data using @openai/agents
    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const provider = new OpenAIAgentsProvider();
    const tools = await provider.build({ corsair, tool });

    tools.push(tool({
      name: 'search_emails',
      description: 'Search the users emails. ALWAYS use this to read emails.',
      parameters: z.object({ query: z.string().optional() }),
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
      description: 'List calendar events in a time range. ALWAYS use this to read events.',
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
      name: 'corsair-briefing-agent',
      model: 'gpt-4o-mini', // Switched to mini to save 95% on token costs!
      instructions: `You are an executive assistant summarizing activity. 
      You have custom tools to read data. 
      1. ALWAYS use 'search_emails' to read emails.
      2. ALWAYS use 'list_calendar_events' to read calendar events.
      3. If an operation fails or returns no data, DO NOT RETRY.
      4. DO NOT get stuck in a loop.
      
      CRITICAL: Even if the API fails entirely or you cannot fetch data, YOU MUST STILL OUTPUT THE JSON OBJECT EXACTLY. Just fill the numbers with 0 and use empty arrays [].
      UNDER NO CIRCUMSTANCES should you output plain text or apologies like "I cannot fetch". YOU MUST ONLY OUTPUT JSON matching this TypeScript interface:
      {
        "stats": { "urgentEmailsCount": number, "meetingsCount": number, "conflictsCount": number, "followupsCount": number },
        "actions": [{ "id": string, "title": string, "summary": string, "source": "email" | "calendar", "urgency": "high" | "medium" | "low", "impact": "critical" | "normal", "actionLabel": string }],
        "commitments": [{ "id": string, "sender": string, "text": string, "riskLevel": "high" | "medium" | "low", "dueDate": string, "status": "active" }]
      }`,
      tools,
    });

    const result = await run(agent, "Generate my daily briefing JSON.");
    
    let parsedData;
    try {
      // Find the first '{' and the last '}' to extract the JSON object
      const startIdx = result.finalOutput.indexOf('{');
      const endIdx = result.finalOutput.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error(`No JSON braces found in LLM output.`);
      }
      const jsonString = result.finalOutput.substring(startIdx, endIdx + 1);
      parsedData = JSON.parse(jsonString);
    } catch (e: any) {
      console.error("Failed to parse LLM JSON:", result.finalOutput);
      const rawSnippet = result.finalOutput ? result.finalOutput.substring(0, 150) : 'empty';
      throw new Error(`Invalid JSON: ${e.message} | Raw LLM Output: ${rawSnippet}...`);
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in briefing route:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
