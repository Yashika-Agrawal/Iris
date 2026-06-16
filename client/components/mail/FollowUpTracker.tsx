'use client';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconClock } from '@tabler/icons-react';

interface FollowUpItem {
  id: string;
  name: string;
  subject: string;
  dueIn: string;
}

export function FollowUpTracker() {
  const [isOpen, setIsOpen] = useState(true);
  const [followups, setFollowups] = useState<FollowUpItem[]>([]);

  const handleCancel = (id: string) => {
    setFollowups((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col border-t border-border mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated/40 text-left text-xs font-mono font-medium text-secondary cursor-pointer"
      >
        <span>FOLLOWING UP ({followups.length})</span>
        {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </button>

      {isOpen && followups.length > 0 && (
        <div className="flex flex-col gap-2 p-2 px-4 pb-4">
          {followups.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-border hover:border-border-strong rounded p-2.5 flex flex-col gap-1.5 transition-all text-[11px]"
            >
              <div className="flex justify-between items-center text-primary font-medium">
                <span>↑ {item.name} — {item.subject}</span>
              </div>
              <div className="flex items-center justify-between text-muted mt-0.5">
                <span className="flex items-center gap-1">
                  <IconClock size={10} /> Auto-follow-up in {item.dueIn} if no reply
                </span>
                <button
                  onClick={() => handleCancel(item.id)}
                  className="text-muted hover:text-accent-red hover:underline transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
