import { Thread, Message } from '../../types';

export async function listThreads(): Promise<Thread[]> {
  const res = await fetch('/api/gmail/threads');
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function getThread(id: string): Promise<{ thread: Thread; messages: Message[] }> {
  const res = await fetch(`/api/gmail/thread/${id}`);
  if (!res.ok) throw new Error('Failed to fetch thread');
  return res.json();
}

export async function sendEmail(to: string, subject: string, body: string): Promise<any> {
  const res = await fetch('/api/gmail/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body }),
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}

export async function archiveThread(id: string): Promise<any> {
  const res = await fetch('/api/gmail/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to archive thread');
  return res.json();
}
