import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { corsair } from '../../../../../../lib/corsair';
import { getTenantId } from '../../../../../../lib/tenant';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Fetch the thread context from Corsair
    const thread = await corsair.plugins.gmail.api.threads.getThread({ id: params.id }, { tenantId });
    
    // Extract text snippets from the messages to give the LLM context
    const messagesText = thread.messages?.map((m: any) => m.snippet || '').join('\n') || '';

    const prompt = `
    Analyze the following email thread and suggest 3-4 quick, highly actionable next steps or replies I can take. 
    Keep each suggestion concise, under 6 words. (e.g. "Confirm demo at 11am", "Draft a polite decline", "Follow up next week").
    
    Email Thread Context:
    ${messagesText.substring(0, 3000)}
    `;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        actions: z.array(z.string())
      }),
      prompt
    });

    return NextResponse.json({ actions: object.actions });
  } catch (error) {
    console.error('Suggest Actions Error:', error);
    // Fallback to generic actions if AI fails or token limits are reached
    return NextResponse.json({ 
      actions: ['Reply', 'Schedule a meeting', 'Follow up later'] 
    });
  }
}
