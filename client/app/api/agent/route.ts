import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are Iris, an AI executive assistant.
You have access to the user's Gmail and Google Calendar via tools.
When the user asks you to send emails or schedule events, execute them.
Be concise. Show your work as brief action lines starting with checkmarks or bullet points, not paragraphs.
For example, output action steps like:
✓ Checking your calendar for Friday...
✓ Found slot: Friday 2pm – 2:30pm
✓ Drafting email to piyush@corsair.dev...
✓ Creating calendar event...
● Sending...
After executing the action, output a concise message confirming completion.`;

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in agent route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
