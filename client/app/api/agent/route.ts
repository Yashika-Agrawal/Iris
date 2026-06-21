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

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable. Cannot run agent.");
    }

    // REAL MODE: Execute via @openai/agents
    if (!OpenAIAgentsProvider) {
      throw new Error('@corsair-dev/mcp or @openai/agents is not installed correctly.');
    }

    const tenantId = await getTenantId();
    const provider = new OpenAIAgentsProvider();
    const tools = provider.build({ 
      corsair, 
      tool, 
      tenantId: tenantId 
    });

      const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      
      const agent = new Agent({
      name: 'corsair-agent',
      model: 'gpt-4o-mini', // Changed to mini to save tokens
      instructions: `You are Iris, a highly capable AI assistant using Corsair tools.
      You MUST use the provided tools to fulfill the user's requests.
      
      CRITICAL TIMEZONE CONTEXT:
      The user's current local time is ${currentTime} (Asia/Kolkata timezone). 
      You MUST use this timezone context when interpreting relative times (e.g., "today", "tomorrow", "3 PM") and ensure all ISO strings generated for Calendar events reflect this correct timezone offset!
      
      CRITICAL INSTRUCTIONS FOR CORSAIR NATIVE TOOLS:
      The 'run_script' tool gives you the global 'corsair' object. Because this is a multi-tenant app, you MUST bind it to the current user's tenant before using any plugins!
      The current user's tenant ID is EXACTLY: "${tenantId}"
      You MUST use this exact string when calling withTenant(). Do not shorten it to "default" or anything else.
      
      Example script to read emails:
      try {
        const tenant = corsair.withTenant("${tenantId}");
        return await tenant.gmail.api.threads.list({ userId: "me" });
      } catch (err) {
        return "ERROR_FROM_CORSAIR: " + err.message;
      }
      
      Example script to send an email:
      try {
        const tenant = corsair.withTenant("${tenantId}");
        const emailStr = "To: someone@example.com\\r\\nSubject: Meeting\\r\\n\\r\\nBody text here";
        const rawEncoded = Buffer.from(emailStr).toString('base64url');
        return await tenant.gmail.api.messages.send({ userId: "me", raw: rawEncoded });
      } catch (err) {
        return "ERROR_FROM_CORSAIR: " + err.message;
      }
      
      Example script to schedule an event:
      try {
        const tenant = corsair.withTenant("${tenantId}");
        return await tenant.googlecalendar.api.events.create({ calendarId: "primary", event: { ... } });
      } catch (err) {
        return "ERROR_FROM_CORSAIR: " + err.message;
      }
      
      Do not get stuck in a loop. If a tool returns 'ERROR_FROM_CORSAIR', YOU MUST explicitly quote that exact error string in your final response to the user so they can debug it!`,
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
