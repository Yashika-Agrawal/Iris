import { NextResponse } from 'next/server';
import { mockBriefingStats, mockActionItems, mockCommitments } from '../../../lib/mockData';
import { corsair } from '../../../lib/corsair';

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
    // MOCK MODE: Return mock data after a fake 1.5s delay
    if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json({
        stats: mockBriefingStats,
        actions: mockActionItems,
        commitments: mockCommitments
      });
    }

    // REAL MODE: Fetch data using @openai/agents
    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const provider = new OpenAIAgentsProvider();
    const tools = await provider.build({ corsair, tool });

    const agent = new Agent({
      name: 'corsair-briefing-agent',
      model: 'gpt-4o-mini', // Switched to mini to save 95% on token costs!
      instructions: `You are an executive assistant. Your job is to analyze the user's recent activity to synthesize a daily briefing.
      CRITICAL: To save tokens and avoid context limits, you MUST:
      1. Only fetch a maximum of the 10 most recent unread emails.
      2. Only fetch calendar events for TODAY.
      
      You must output EXACTLY a valid JSON object matching this TypeScript interface, and nothing else:
      {
        "stats": { "urgentEmailsCount": number, "meetingsCount": number, "conflictsCount": number, "followupsCount": number },
        "actions": [{ "id": string, "title": string, "summary": string, "source": "email" | "calendar", "urgency": "high" | "medium" | "low", "impact": "critical" | "normal", "actionLabel": string }],
        "commitments": [{ "id": string, "sender": string, "text": string, "riskLevel": "high" | "medium" | "low", "dueDate": string, "status": "active" }]
      }`,
      tools,
    });

    const result = await run(agent, "Generate my daily briefing JSON.");
    
    // Attempt to parse the LLM's raw JSON output
    let parsedData;
    try {
      const cleanedOutput = result.finalOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedOutput);
    } catch (e) {
      console.error("Failed to parse LLM JSON:", result.finalOutput);
      throw new Error("Invalid JSON from LLM");
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in briefing route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
