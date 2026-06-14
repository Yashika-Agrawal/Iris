import { AgentMessage } from '../../types';
import { ToolCallBadge } from './ToolCallBadge';

export function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
        isUser 
          ? 'bg-[#1e3a5f] text-blue-300 rounded-br-sm' 
          : 'bg-elevated text-secondary rounded-bl-sm'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {message.toolCalls && message.toolCalls.map((tc, idx) => (
          <ToolCallBadge key={idx} service={tc.service} label={tc.label} />
        ))}
      </div>
    </div>
  );
}
