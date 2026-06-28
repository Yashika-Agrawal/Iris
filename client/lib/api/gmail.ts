import { Thread, Message } from '../../types';

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

export async function listThreads(): Promise<Thread[]> {
  return apiFetch('/api/gmail/threads');
}

export async function getThread(id: string): Promise<{ thread: Thread; messages: Message[] }> {
  return apiFetch(`/api/gmail/thread/${id}`);
}

export async function sendEmail(to: string, subject: string, body: string): Promise<any> {
  return apiFetch('/api/gmail/send', {
    method: 'POST',
    body: JSON.stringify({ to, subject, body }),
  });
}

export async function archiveThread(id: string): Promise<any> {
  return apiFetch('/api/gmail/archive', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}
