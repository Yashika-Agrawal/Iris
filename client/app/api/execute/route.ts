import { NextResponse } from 'next/server';
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

    const agent = new Agent({
      name: 'corsair-action-executor',
      model: 'gpt-4o', // We can use 4o for execution since it's a specific instruction without heavy context fetching
      instructions: `You are an executive assistant acting on behalf of the user. You have access to Corsair tools.
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
