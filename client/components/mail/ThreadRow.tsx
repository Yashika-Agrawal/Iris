import { Thread } from '../../types';
import { PriorityDot } from '../ui/PriorityDot';

interface ThreadRowProps {
  thread: Thread;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ThreadRow({ thread, isSelected, onSelect }: ThreadRowProps) {
  return (
    <button
      onClick={() => onSelect(thread.id)}
      className={`w-full text-left p-4 transition-colors hover:bg-elevated/50 flex flex-col gap-1 border-l-2 ${
        isSelected ? 'border-accent-blue bg-elevated' : 'border-transparent'
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <span className={`text-sm ${thread.isUnread ? 'font-bold text-primary' : 'text-secondary'}`}>
          {thread.from}
        </span>
        <span className="text-xs text-muted">{new Date(thread.date).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <PriorityDot priority={thread.priority} />
        <span className={`text-sm truncate ${thread?.isUnread ? 'text-primary font-medium' : 'text-secondary'}`}>
          {thread?.subject}
        </span>
      </div>
      <span className="text-xs text-muted truncate">{thread?.preview}</span>
    </button>
  );
}
