import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getTenantId } from '../../../../../../lib/tenant';
import { DataService } from '../../../../../../lib/data-service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const resolvedParams = await params;

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const service = new DataService(tenantId);
    const result = await service.getThread(resolvedParams.id);
    const threadData = result?.thread;
    const messagesText = result?.messages?.map((m: any) => m.body || '').join('\n') || '';
    
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
