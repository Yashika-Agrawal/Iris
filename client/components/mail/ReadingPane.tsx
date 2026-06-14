'use client';
import { Thread, Message } from '../../types';
import { KbdHint } from '../ui/KbdHint';
import { Badge } from '../ui/Badge';
import { IconArrowBackUp, IconArrowForwardUp, IconArchive, IconCalendarEvent } from '@tabler/icons-react';
import { useState } from 'react';
import { CreateEventModal } from '../calendar/CreateEventModal';

export function ReadingPane({ thread, messages = [] }: { thread: Thread | null, messages?: Message[] }) {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  if (!thread) {
    return (
      <div className="h-full flex items-center justify-center text-secondary">
        Select an email
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex items-center gap-4 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <KbdHint>R</KbdHint> Reply
        </div>
        <div className="flex items-center gap-2">
          <KbdHint>E</KbdHint> Archive
        </div>
        <div className="flex items-center gap-2">
          <KbdHint>#</KbdHint> Trash
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-primary">{thread.subject}</h1>
          <div className="flex items-center gap-3">
            <span className="font-medium text-primary">{thread.from}</span>
            <span className="text-sm text-muted">{new Date(thread.date).toLocaleString()}</span>
            {thread.priority && (
              <Badge variant={thread.priority}>{thread.priority}</Badge>
            )}
          </div>
        </div>
        
        <div className="text-secondary leading-relaxed whitespace-pre-wrap">
          {messages.length > 0 ? messages.map(m => m.body).join('\n\n---\n\n') : thread.preview}
        </div>
      </div>

      {/* Action Row */}
      <div className="p-4 border-t border-border flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-border transition-colors rounded-lg text-sm font-medium text-primary"
          onClick={() => window.dispatchEvent(new CustomEvent('open-reply'))}
        >
          <IconArrowBackUp size={16} /> Reply
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-border transition-colors rounded-lg text-sm font-medium text-primary">
          <IconArrowForwardUp size={16} /> Forward
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-border transition-colors rounded-lg text-sm font-medium text-primary"
          onClick={() => window.dispatchEvent(new CustomEvent('archive-thread'))}
        >
          <IconArchive size={16} /> Archive
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-border transition-colors rounded-lg text-sm font-medium text-primary"
          onClick={() => setIsEventModalOpen(true)}
        >
          <IconCalendarEvent size={16} /> Schedule
        </button>
      </div>

      {isEventModalOpen && (
        <CreateEventModal 
          prefilledGuest={thread.from} 
          onClose={() => setIsEventModalOpen(false)} 
        />
      )}
    </div>
  );
}
