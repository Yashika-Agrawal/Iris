'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Thread } from '../../types';
import { listThreads } from '../api/gmail';

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const threadId = params?.threadId as string | undefined;

  useEffect(() => {
    async function loadThreads() {
      try {
        const data = await listThreads();
        setThreads(data);
      } catch (error) {
        console.error('Failed to load threads:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadThreads();
  }, []);

  // Update local read/unread status when a thread is selected
  useEffect(() => {
    if (threadId) {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, isUnread: false } : t))
      );
    }
  }, [threadId]);

  return { threads, isLoading };
}

