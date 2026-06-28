import { CalEvent } from '../../types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API Error: ${res.status}`);
  }
  return res.json();
}

export async function listEvents(weekStart: string): Promise<CalEvent[]> {
  return apiFetch(`/api/calendar/events?from=${encodeURIComponent(weekStart)}`);
}

export async function createEvent(title: string, start: string, end: string, guests: string[]): Promise<any> {
  return apiFetch('/api/calendar/create', {
    method: 'POST',
    body: JSON.stringify({ title, start, end, guests }),
  });
}
