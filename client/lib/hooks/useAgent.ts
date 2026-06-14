'use client';
import { useState } from 'react';
import { AgentMessage, ToolCall } from '../../types';

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: AgentMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantMsg: AgentMessage = { role: 'assistant', content: '', toolCalls: [] };
      
      setMessages([...newMessages, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMsg.content += chunk;
        
        const lines = assistantMsg.content.split('\n');
        const toolCalls: ToolCall[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('✓') || trimmed.startsWith('●') || trimmed.startsWith('•')) {
            const content = trimmed.substring(1).trim();
            const contentLower = content.toLowerCase();
            let service: 'gmail' | 'gcal' = 'gmail';
            
            if (
              contentLower.includes('calendar') ||
              contentLower.includes('event') ||
              contentLower.includes('gcal') ||
              contentLower.includes('slot') ||
              contentLower.includes('meeting')
            ) {
              service = 'gcal';
            }
            
            toolCalls.push({
              service,
              label: content
            });
          }
        }
        
        assistantMsg.toolCalls = toolCalls;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg };
          return updated;
        });
      }
    } catch (e) {
      console.error('Error in agent stream:', e);
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, sendMessage, isStreaming };
}
