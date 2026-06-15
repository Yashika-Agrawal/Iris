import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';

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

    const agent = new Agent({
      name: 'corsair-agent',
      model: 'gpt-4o', // Or gpt-4.1 if available
      instructions:
        'You have access to Corsair tools. Use list_operations to discover available APIs, get_schema to understand required arguments, and run_script to execute them. When referencing resources (like channels), always use their ID, not their name.',
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
