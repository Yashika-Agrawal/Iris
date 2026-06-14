'use client';
import { motion } from 'framer-motion';
import { FocusItem } from '../../types';
import { ResponseTimer } from '../ui/ResponseTimer';
import { IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface FocusCardProps {
  item: FocusItem;
  index: number;
  onDismiss: (id: string) => void;
}

export function FocusCard({ item, index, onDismiss }: FocusCardProps) {
  const router = useRouter();

  let priority = 'fyi';
  if (item.type === 'email') {
    priority = item.thread.priority;
  } else if (item.type === 'calendar') {
    priority = 'important';
  } else if (item.type === 'followup') {
    priority = 'urgent';
  }

  const borderColors = {
    urgent: 'border-l-accent-red',
    important: 'border-l-accent-amber',
    fyi: 'border-l-accent-green',
  };

  const borderLColor = borderColors[priority as keyof typeof borderColors] || 'border-l-accent-green';

  const handleAction = () => {
    if (item.type === 'email') {
      router.push(`/mail/${item.thread.id}`);
    } else if (item.type === 'calendar') {
      router.push('/calendar');
    } else if (item.type === 'followup') {
      router.push(`/mail/${item.threadId}`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-reply'));
      }, 300);
    }
  };

  const getItemId = () => {
    if (item.type === 'email') return item.thread.id;
    if (item.type === 'calendar') return item.event.id;
    return item.threadId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: index * 0.08, duration: 0.2 }}
      className={`group bg-surface border border-border hover:border-border-strong rounded-lg p-[14px] pl-[16px] border-l-2 ${borderLColor} relative transition-all duration-150 flex flex-col gap-3`}
    >
      <button
        onClick={() => onDismiss(getItemId())}
        className="absolute top-3 right-3 text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
      >
        <IconX size={14} />
      </button>

      {item.type === 'email' && (
        <>
          <div className="flex flex-col gap-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-accent-red font-bold select-none">•</span>
              {item.thread.responseWindow && (
                <ResponseTimer window={item.thread.responseWindow} />
              )}
              <span className="text-sm text-primary font-medium">
                {item.thread.from} is waiting on your {item.thread.subject}
              </span>
            </div>
            <p className="text-xs text-secondary line-clamp-1 italic">
              "{item.thread.preview}"
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleAction}
              className="px-3 py-1 bg-elevated hover:bg-border-strong text-xs font-medium text-primary rounded transition-colors cursor-pointer"
            >
              Reply now
            </button>
            <button
              onClick={() => onDismiss(item.thread.id)}
              className="px-3 py-1 hover:bg-elevated text-xs font-medium text-muted hover:text-secondary rounded transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </>
      )}

      {item.type === 'calendar' && (
        <>
          <div className="flex flex-col gap-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-accent-blue font-bold select-none">◆</span>
              <span className="text-sm text-primary font-medium">
                {item.event.title} — {item.event.start}
              </span>
            </div>
            <p className="text-xs text-secondary">
              {item.event.guests.length} attendees · no prep done
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleAction}
              className="px-3 py-1 bg-elevated hover:bg-border-strong text-xs font-medium text-primary rounded transition-colors cursor-pointer"
            >
              View brief
            </button>
            <button
              onClick={() => onDismiss(item.event.id)}
              className="px-3 py-1 hover:bg-elevated text-xs font-medium text-muted hover:text-secondary rounded transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </>
      )}

      {item.type === 'followup' && (
        <>
          <div className="flex flex-col gap-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-accent-amber font-bold select-none">↑</span>
              <span className="text-sm text-primary font-medium">
                You promised Rohan a deck — {item.dueIn}
              </span>
            </div>
            <p className="text-xs text-secondary">
              Thread: "{item.subject}"
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleAction}
              className="px-3 py-1 bg-elevated hover:bg-border-strong text-xs font-medium text-primary rounded transition-colors cursor-pointer"
            >
              Draft email
            </button>
            <button
              onClick={() => onDismiss(item.threadId)}
              className="px-3 py-1 hover:bg-elevated text-xs font-medium text-muted hover:text-secondary rounded transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
