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
      // Use a 60-second timeout to allow the AI agent to finish
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 60000);

      // 1. Fetch threads and events
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const threadsRes = await fetch('/api/gmail/threads', { signal: controller.signal }).catch(() => null);
      const eventsRes = await fetch(`/api/calendar/events?from=${encodeURIComponent(todayStart.toISOString())}`, { signal: controller.signal }).catch(() => null);
      
      let threads: Thread[] = [];
      let events: CalEvent[] = [];

      if (threadsRes && threadsRes.ok) {
        threads = await threadsRes.json();
      }
      if (eventsRes && eventsRes.ok) {
        events = await eventsRes.json();
      }

      // No fallback data anymore. Whatever the API returns is what the AI gets.

      // 2. Call dedicated synthesis endpoint for strict JSON output
      const agentRes = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threads, events }),
        signal: controller.signal
      });
      if (!agentRes.ok) {
        throw new Error('Synthesis API request failed');
      }

      const data = await agentRes.json();
      
      console.log('RAW AI CONTENT:', data);

      if (data.items && Array.isArray(data.items)) {
        setItems(data.items.slice(0, 3));
      } else {
        throw new Error('Invalid items format or empty array returned by AI');
      }
    } catch (err) {
      console.warn('Failed to construct live focus stack:', err);
      setItems([]);
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
