'use client';
import { useAgent } from '../../lib/hooks/useAgent';
import { MessageList } from '../agent/MessageList';
import { AgentInput } from '../agent/AgentInput';

export function AgentPanel() {
  const { messages, sendMessage, isStreaming } = useAgent();

  return (
    <div className="flex flex-col h-full bg-surface select-none">
      <div className="p-4 border-b border-border flex justify-between items-center text-sm font-medium">
        <span className="text-primary font-semibold">Iris</span>
        <span className="text-[10px] font-mono bg-elevated border border-border px-1.5 py-0.5 rounded text-secondary uppercase tracking-wider">
          GPT-4o
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="p-4 border-t border-border">
        <AgentInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
