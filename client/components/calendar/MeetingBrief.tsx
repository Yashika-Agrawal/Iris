'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CalEvent, Thread } from '../../types';
import { IconX, IconArrowUpRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface MeetingBriefProps {
  event: CalEvent | null;
  thread: Thread | null;
  isVisible: boolean;
  onDismiss: () => void;
}

export function MeetingBrief({ event, thread, isVisible, onDismiss }: MeetingBriefProps) {
  const router = useRouter();

  if (!event || !isVisible) return null;

  const start = new Date(event.start);
  const diffMs = start.getTime() - Date.now();
  const diffMins = Math.max(0, Math.round(diffMs / 60000));

  const handleOpenThread = () => {
    if (thread) {
      router.push(`/mail/${thread.id}`);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 w-[360px] bg-surface border border-border hover:border-border-strong rounded-lg p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs select-none"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-accent-blue font-semibold">
              <span>◆ Starting in {diffMins} minutes</span>
            </div>
            <button
              onClick={onDismiss}
              className="text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <IconX size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-primary">{event.title}</h3>
            <span className="text-secondary">with {event.guests.join(', ')}</span>
          </div>

          <div className="h-[1px] bg-border/50" />

          {thread && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                LAST EMAIL FROM {thread.from.split(' ')[0].toUpperCase()}
              </span>
              <p className="text-secondary italic line-clamp-2 leading-relaxed">
                "{thread.preview}"
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
              OPEN ACTION ITEMS
            </span>
            <ul className="list-disc list-inside text-secondary pl-1 flex flex-col gap-1">
              <li>Share updated deck ← from last meeting thread</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            {thread && (
              <button
                onClick={handleOpenThread}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 text-white rounded font-medium cursor-pointer transition-colors"
              >
                Open thread <IconArrowUpRight size={12} />
              </button>
            )}
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 hover:bg-elevated text-secondary hover:text-primary rounded font-medium cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
