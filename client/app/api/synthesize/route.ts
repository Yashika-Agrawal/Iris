import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { threads, events } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
    You are an executive assistant organizing my day.
    Given these emails and events, identify up to 3 of the most urgent and important items that need my attention right now.
    
    Here are the email threads:
    ${JSON.stringify(threads, null, 2)}

    Here are the calendar events:
    ${JSON.stringify(events, null, 2)}
    
    Select up to 3 FocusItems. Use the 'email' type for threads that need a reply, 'calendar' type for upcoming meetings, and 'followup' for things that need a follow up.
    `;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        items: z.array(z.discriminatedUnion('type', [
          z.object({
            type: z.literal('email'),
            thread: z.any().describe('The entire thread object exactly as provided')
          }),
          z.object({
            type: z.literal('calendar'),
            event: z.any().describe('The entire calendar event object exactly as provided')
          }),
          z.object({
            type: z.literal('followup'),
            threadId: z.string(),
            subject: z.string(),
            dueIn: z.string()
          })
        ]))
      }),
      prompt
    });

    return NextResponse.json({ items: object.items });
  } catch (error) {
    console.error('Synthesis Error:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
