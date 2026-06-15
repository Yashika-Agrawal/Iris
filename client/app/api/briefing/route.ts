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
      instructions: `You are an executive assistant summarizing activity. 
      You have tools like list_operations, get_schema, and run_script. 
      1. Fetch emails and calendar events. If you don't know the operation name, use list_operations once.
      2. If an operation fails or returns no data, DO NOT RETRY.
      3. DO NOT get stuck in a loop.
      
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
