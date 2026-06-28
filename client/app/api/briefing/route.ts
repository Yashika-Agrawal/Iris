import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { corsair, pool } from '../../../lib/corsair';
import { getTenantId } from '../../../lib/tenant';
import { DataService } from '../../../lib/data-service';
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

    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const tenantId = await getTenantId();
    const service = new DataService(tenantId);

    const accRes = await pool.query(
      `SELECT id FROM corsair_accounts WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );
    const accountId = accRes.rows[0]?.id;

    if (accountId) {
      const briefRes = await pool.query(
        `SELECT data, created_at FROM corsair_entities WHERE entity_type = 'briefing' AND entity_id = $1 LIMIT 1`,
        [`${accountId}:briefing:daily`]
      );
      if (briefRes.rows.length > 0) {
        const age = Date.now() - new Date(briefRes.rows[0].created_at).getTime();
        if (age < 10 * 60_000) {
          return NextResponse.json(briefRes.rows[0].data);
        }
      }
    }

    const provider = new OpenAIAgentsProvider();
    const tools = await provider.build({ corsair, tool });

    tools.push(tool({
      name: 'search_emails',
      description: 'Search the users emails. ALWAYS use this to read emails.',
      parameters: z.object({ query: z.string().optional() }),
      execute: async ({ query }: any) => {
        try {
          const s = new DataService(tenantId);
          const results = await s.searchThreads(query || 'in:inbox');
          if (results.length === 0) return "No emails found.";
          return results.map(r => `From: ${r.from} | Subject: ${r.subject} | Date: ${r.date} | Preview: ${r.preview}`).join('\n---\n');
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
          const events = await service.getEvents(timeMinIso);
          const filtered = events.filter(e => !timeMaxIso || e.start < timeMaxIso);
          if (filtered.length === 0) return "No events found.";
          return filtered.map(e => `Event: ${e.title} | Start: ${e.start} | End: ${e.end}`).join('\n');
        } catch (err: any) {
          return `Failed to list events: ${err.message}`;
        }
      }
    }));

    const agent = new Agent({
      name: 'corsair-briefing-agent',
      model: 'gpt-4o-mini',
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

    if (accountId) {
      try {
        await pool.query(
          `INSERT INTO corsair_entities (id, account_id, entity_id, entity_type, version, data, created_at, updated_at)
           VALUES ($1, $2, $3, 'briefing', '1', $4, NOW(), NOW())
           ON CONFLICT (entity_type, entity_id) DO UPDATE
           SET data = $4, updated_at = NOW(), created_at = NOW()`,
          [crypto.randomUUID(), accountId, `${accountId}:briefing:daily`, JSON.stringify(parsedData)]
        );
      } catch (e) {
        console.error('Failed to cache briefing:', e);
      }
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in briefing route:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
