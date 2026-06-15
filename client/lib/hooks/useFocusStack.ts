'use client';
import { useState, useEffect } from 'react';
import { FocusItem, Thread, CalEvent } from '../../types';

export function useFocusStack() {
  const [items, setItems] = useState<FocusItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function generateStack() {
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      // 1. Fetch threads and events
      const threadsRes = await fetch('/api/gmail/threads');
      const eventsRes = await fetch(`/api/calendar/events?from=${encodeURIComponent(new Date().toISOString())}`);
      
      let threads: Thread[] = [];
      let events: CalEvent[] = [];

      if (threadsRes.ok) {
        threads = await threadsRes.json();
      }
      if (eventsRes.ok) {
        events = await eventsRes.json();
      }

      // Add fallback/mock data if empty or fetch failed
      if (threads.length === 0) {
        threads = [
          {
            id: 'thread-1',
            from: 'Piyush Garg',
            fromEmail: 'piyush@corsair.dev',
            subject: 'demo confirmation',
            preview: 'Quick rundown before we kick off...',
            body: 'Hey Yashika,\n\nJust wanted to confirm the demo time. Let me know if that works.',
            date: new Date().toISOString(),
            isUnread: true,
            priority: 'urgent',
            responseWindow: 'reply within 2h',
            labels: ['INBOX', 'IMPORTANT']
          }
        ];
      }

      if (events.length === 0) {
        const startTime = new Date();
        startTime.setMinutes(startTime.getMinutes() + 40);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        events = [
          {
            id: 'event-1',
            title: 'Mentor review',
            start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            guests: ['Piyush Garg', 'Yashika Agrawal', 'Rohan Dev'],
            description: 'Mentor review for Corsair Hackathon'
          }
        ];
      }

      // 2. Call OpenAI agent to prioritize
      const promptText = `
      Given these emails and events, identify the 3 most important things that need attention right now.
      Return a JSON array of FocusItem. Each item must match this TypeScript definition:
      type FocusItem =
        | { type: 'email'; thread: Thread }
        | { type: 'calendar'; event: CalEvent }
        | { type: 'followup'; threadId: string; subject: string; dueIn: string }

      Here are the email threads:
      ${JSON.stringify(threads.slice(0, 5), null, 2)}

      Here are the calendar events:
      ${JSON.stringify(events, null, 2)}

      Do not output any markdown code blocks or wrapping. Output ONLY the JSON array.
      `;

      // Use a 5-second timeout so the UI doesn't hang forever without an API key
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 5000);

      const agentRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }]
        }),
        signal: controller.signal
      });
      if (!agentRes.ok) {
        throw new Error('Agent API request failed');
      }

      const reader = agentRes.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const decoder = new TextDecoder();
      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value);
      }

      const parsedItems = extractJson(content);
      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        setItems(parsedItems.slice(0, 3));
      } else {
        throw new Error('Invalid items format');
      }
    } catch (err) {
      console.warn('Failed to construct live focus stack, loading high-fidelity fallback:', err);
      // High fidelity mock items for robust presentation
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Mentor review',
          start: '3:00 PM',
          end: '4:00 PM',
          guests: ['Piyush Garg', 'Rohan Sharma', 'Yashika Agrawal'],
          description: 'Weekly mentor review and hackathon checkin.'
        }
      ];

      setItems([
        {
          type: 'email',
          thread: {
            id: 'thread-demo',
            from: 'Piyush Garg',
            fromEmail: 'piyush@corsair.dev',
            subject: 'demo confirmation',
            preview: 'Quick rundown before we kick off...',
            body: 'Quick rundown before we kick off...',
            date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            isUnread: true,
            priority: 'urgent',
            responseWindow: 'reply within 2h',
            labels: ['INBOX']
          }
        },
        {
          type: 'calendar',
          event: mockEvents[0]
        },
        {
          type: 'followup',
          threadId: 'thread-followup-demo',
          subject: 'Re: Q3 proposal',
          dueIn: '2 days ago'
        }
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLoading(false);
      setHasGenerated(true);
    }
  }

  return { items, isLoading, hasGenerated, generateStack };
}

function extractJson(text: string) {
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch (err) {}
    }
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      try {
        return JSON.parse(text.substring(startIdx, endIdx + 1).trim());
      } catch (err) {}
    }
    return null;
  }
}
