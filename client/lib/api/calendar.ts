import { CalEvent } from '../../types';

export async function listEvents(weekStart: string): Promise<CalEvent[]> {
  const res = await fetch(`/api/calendar/events?from=${encodeURIComponent(weekStart)}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function createEvent(title: string, start: string, end: string, guests: string[]): Promise<any> {
  const res = await fetch('/api/calendar/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, start, end, guests }),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}
