'use client';
import { ThreadRow } from './ThreadRow';
import { useThreads } from '../../lib/hooks/useThreads';
import { useParams, useRouter } from 'next/navigation';
import { FollowUpTracker } from './FollowUpTracker';
import { Loader } from '../ui/Loader';

export function ThreadList() {
  const { threads, isLoading } = useThreads();
  const params = useParams();
  const router = useRouter();
  
  const selectedId = params?.threadId as string | undefined;

  if (isLoading) {
    return <Loader label="Loading Threads..." sublabel="" />;
  }

  return (
    <div className="flex flex-col h-full justify-between bg-surface">
      <div className="flex flex-col divide-y divide-border overflow-y-auto flex-1">
        {threads.map((thread) => (
          <ThreadRow 
            key={thread.id} 
            thread={thread} 
            isSelected={thread.id === selectedId} 
            onSelect={(id) => router.push(`/mail/${id}`)} 
          />
        ))}
      </div>
      <FollowUpTracker />
    </div>
  );
}
