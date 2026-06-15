'use client';
import { useState } from 'react';
import { useThread } from '../../../lib/hooks/useThread';
import { useParams, useRouter } from 'next/navigation';
import { IconArrowUp, IconSparkles, IconArchive, IconClock, IconTrash, IconCornerUpLeft, IconDots } from '@tabler/icons-react';
import { CreateEventModal } from '../../../components/calendar/CreateEventModal';
import { Loader } from '../../../components/ui/Loader';

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params?.threadId as string;
  const { thread, isLoading, messages = [] } = useThread(threadId);
  const [prompt, setPrompt] = useState('');
  
  const [isScheduling, setIsScheduling] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isTrashing, setIsTrashing] = useState(false);

  const handleReply = () => {
    window.dispatchEvent(new CustomEvent('open-reply', {
      detail: { to: thread?.fromEmail, subject: thread?.subject }
    }));
  };

  const handleAction = async (action: 'archive' | 'trash') => {
    if (action === 'archive') setIsArchiving(true);
    if (action === 'trash') setIsTrashing(true);
    
    try {
      const res = await fetch(`/api/gmail/thread/${threadId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        window.dispatchEvent(new Event('refresh-threads'));
        router.push('/mail');
      }
    } catch (e) {
      console.error(`Failed to ${action} thread`, e);
    } finally {
      setIsArchiving(false);
      setIsTrashing(false);
    }
  };

  if (isLoading) {
    return <Loader label="Loading Thread" sublabel="Fetching messages..." />;
  }

  if (!thread) {
    return (
      <div className="h-full flex items-center justify-center text-secondary text-xs font-mono bg-base">
        No thread selected.
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col relative bg-base">
      <div className="flex-1 max-w-2xl mx-auto w-full px-12 py-8 flex flex-col gap-10">
        {/* Email Header */}
        <div className="flex flex-col gap-3 border-b border-[#161616] pb-6 mt-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-semibold text-[#f4f4f5] leading-tight">{thread.subject}</h1>
            <button className="text-muted hover:text-primary transition-colors cursor-pointer">
              <IconDots size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
            <span className="font-medium text-[#ddd]">{thread.from}</span>
            <span className="text-muted">&lt;{thread.fromEmail}&gt;</span>
            <span className="mx-2 text-[#333]">•</span>
            <span>{new Date(thread.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            {thread.priority === 'urgent' && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3f0f0f] text-[#ef4444]">
                urgent
              </span>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="flex flex-col gap-6 text-[#d4d4d8] text-sm leading-[1.8] font-sans whitespace-pre-wrap break-words overflow-x-hidden">
          {messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id} className="break-words max-w-full">{m.body || '(No content)'}</div>
            ))
          ) : (
            <div className="break-words max-w-full">{thread.preview}</div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-[-2px] left-0 right-0 z-20 w-full bg-base/95 backdrop-blur-md border-t border-[#161616]">
        <div className="max-w-2xl mx-auto w-full px-12 py-5 flex flex-col gap-5">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <button onClick={handleReply} className="flex items-center gap-2 px-4 py-2 bg-[#1a2535] hover:bg-[#202e42] border border-[#1e3a5f] text-[#60a5fa] rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              <IconCornerUpLeft size={16} /> Reply <span className="text-[#3b82f6]/50 text-[10px] font-mono ml-1 border border-[#3b82f6]/30 px-1 rounded">r</span>
            </button>
            <button onClick={() => handleAction('archive')} disabled={isArchiving} className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated border border-border text-secondary hover:text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              <IconArchive size={16} /> {isArchiving ? 'Archiving...' : 'Archive'} <span className="text-muted text-[10px] font-mono ml-1 border border-border px-1 rounded">e</span>
            </button>
            <button onClick={() => setIsScheduling(true)} className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated border border-border text-secondary hover:text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              <IconClock size={16} /> Schedule
            </button>
            <button onClick={() => handleAction('trash')} disabled={isTrashing} className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-elevated border border-border text-secondary hover:text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer ml-auto">
              <IconTrash size={16} /> {isTrashing && '...'}
            </button>
          </div>

          {/* Iris Suggestions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[#555] font-mono tracking-wider uppercase whitespace-nowrap">
              <IconSparkles size={12} className="text-accent-blue" />
              Suggested Actions
            </div>
            
            <div className="flex items-center flex-wrap gap-2">
              {['Confirm demo at 11am', 'Book a meeting', 'Follow up with Rohan', 'Summarise Inbox'].map((chip, idx) => (
                <button 
                  key={idx}
                  className="px-3 py-1.5 bg-surface border border-border hover:border-[#333] hover:bg-elevated text-secondary hover:text-primary rounded-full text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isScheduling && (
        <CreateEventModal 
          prefilledGuest={thread.fromEmail} 
          onClose={() => setIsScheduling(false)} 
        />
      )}
    </div>
  );
}
