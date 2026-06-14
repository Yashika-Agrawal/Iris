import { AgentMessage } from '../../types';
import { MessageBubble } from './MessageBubble';

export function MessageList({ messages }: { messages: AgentMessage[] }) {
  if (messages.length === 0) {
    return <div className="p-4 text-sm text-muted text-center">How can I help?</div>;
  }
  return (
    <div className="p-4">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
    </div>
  );
}
