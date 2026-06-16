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
    You are an AI Chief of Staff analyzing my email and calendar to build a "Relationship Intelligence" graph.
    Given my recent email threads and calendar events, identify up to 3-5 of the most important people I am interacting with.
    
    For each person, extract:
    1. Their Name and Email.
    2. Last contact (e.g. "Yesterday", "2 hours ago", "Today at 2:00 PM" based on the timestamp of their last email or meeting).
    3. Any "openQuestions": Questions I asked them that they haven't answered, or questions they asked me that I haven't answered.
    4. "pendingFollowups": Count of action items or commitments pending between us.
    5. "upcomingMeeting": The time of our next scheduled meeting, if any. Otherwise null.

    Here are the email threads:
    ${JSON.stringify(threads, null, 2)}

    Here are the calendar events:
    ${JSON.stringify(events, null, 2)}
    `;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        profiles: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          avatar: z.string().optional(),
          lastContact: z.string(),
          openQuestions: z.array(z.string()),
          pendingFollowups: z.number(),
          upcomingMeeting: z.string().nullable()
        }))
      }),
      prompt
    });

    return NextResponse.json({ profiles: object.profiles });
  } catch (error) {
    console.error('People Synthesis Error:', error);
    return NextResponse.json({ profiles: [] }, { status: 500 });
  }
}
