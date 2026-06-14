import { useState, useEffect } from 'react';
import { Thread, Message } from '../../types';
import { getThread } from '../api/gmail';

export function useThread(threadId: string | null) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!threadId) {
      setThread(null);
      setMessages([]);
      return;
    }

    async function load() {
      setIsLoading(true);
      try {
        const data = await getThread(threadId!);
        setThread(data.thread);
        setMessages(data.messages);
      } catch (e) {
        console.error('Error loading thread:', e);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [threadId]);

  return { thread, messages, isLoading };
}
