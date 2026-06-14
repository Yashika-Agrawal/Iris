import { useState } from 'react';
import { IconSend } from '@tabler/icons-react';

export function AgentInput({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask the agent..."
        disabled={disabled}
        className="w-full bg-base border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:border-border-strong resize-none"
        rows={2}
      />
      <button 
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="absolute bottom-3 right-3 p-1.5 bg-accent-blue/10 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconSend size={16} />
      </button>
    </div>
  );
}
