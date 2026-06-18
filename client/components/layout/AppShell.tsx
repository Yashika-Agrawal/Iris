'use client';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { CommandBar } from '../agent/CommandBar';
import { useAgent } from '../../lib/hooks/useAgent';
import { MessageList } from '../agent/MessageList';
import { IconSend, IconSparkles, IconChevronUp, IconChevronDown, IconTrash } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

interface AppShellProps {
  nav: ReactNode;
  sidebar?: ReactNode;
  main: ReactNode;
}

export function AppShell({ nav, sidebar, main }: AppShellProps) {
  const { messages, sendMessage, isStreaming } = useAgent();
  const [inputText, setInputText] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Automatically open and scroll chat when messages stream in
  useEffect(() => {
    if (messages.length > 0) {
      setIsChatExpanded(true);
    }
  }, [messages.length]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatExpanded]);

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid h-screen relative overflow-hidden bg-base" style={{ gridTemplateColumns: sidebar ? '48px 240px 1fr' : '48px 1fr' }}>
      {/* Left nav rail */}
      <div className="bg-base border-r border-border h-full flex flex-col z-10">{nav}</div>
      
      {/* Sidebar (Threads, contacts etc) */}
      {sidebar && (
        <div className="bg-surface border-r border-border h-full overflow-y-auto z-10">{sidebar}</div>
      )}
      
      {/* Main viewport with the ChatGPT style bottom search/chat bar */}
      <div className="flex flex-col h-full overflow-hidden bg-base">
        {/* Actual page content wrapper */}
        <div className="flex-1 overflow-y-auto relative">
          {main}
        </div>

        {/* Global ChatGPT-style bottom type bar */}
        <div className="w-full p-6 bg-base border-t border-border z-30 flex flex-col items-center">
          <div className="w-full max-w-2xl flex flex-col gap-2 relative">
            
            {/* Slide-up Chat History */}
            <AnimatePresence>
              {isChatExpanded && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                  className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl max-h-[350px] overflow-y-auto mb-2 flex flex-col"
                >
                  <div className="flex justify-between items-center px-4 py-2 border-b border-border/60 bg-elevated/40 sticky top-0 backdrop-blur-md z-10">
                    <span className="text-[10px] font-mono text-secondary flex items-center gap-1.5 font-semibold">
                      <IconSparkles size={11} className="text-accent-blue animate-pulse" />
                      IRIS CO-PILOT ACTIVE
                    </span>
                    <button 
                      onClick={() => setIsChatExpanded(false)}
                      className="text-muted hover:text-primary transition-colors text-[10px] font-mono flex items-center gap-1"
                    >
                      Minimize <IconChevronDown size={12} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <MessageList messages={messages} />
                    <div ref={chatEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chatbox Input Container */}
            <div className="relative flex items-center bg-surface border border-border hover:border-border-strong focus-within:border-accent-blue/70 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] rounded-2xl p-2.5 transition-all w-full">
              {/* Sparkle icon indicator */}
              <div className="pl-2.5 pr-2 text-muted">
                <IconSparkles size={16} className={isStreaming ? "text-accent-blue animate-spin" : "text-muted"} />
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Iris anything... (e.g. 'draft a reply to Rohan', 'is there a conflict?')"
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-primary text-sm placeholder-muted focus:outline-none resize-none py-1.5 font-sans leading-relaxed min-h-[24px] max-h-[120px]"
              />

              {/* Action buttons inside chatbox */}
              <div className="flex items-center gap-1.5 pl-2">
                {messages.length > 0 && !isChatExpanded && (
                  <button
                    onClick={() => setIsChatExpanded(true)}
                    className="p-1.5 text-muted hover:text-primary transition-colors hover:bg-border/30 rounded-lg"
                    title="Open Chat Log"
                  >
                    <IconChevronUp size={16} />
                  </button>
                )}
                
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !inputText.trim()}
                  className={`p-2 rounded-xl transition-all ${
                    inputText.trim() 
                      ? 'bg-accent-blue text-white shadow-md hover:bg-blue-600 scale-100' 
                      : 'bg-border/30 text-muted cursor-not-allowed scale-95'
                  }`}
                >
                  <IconSend size={14} />
                </button>
              </div>
            </div>
            
            {/* Quick Helper Text */}
            <div className="flex items-center justify-between px-2 text-[10px] text-muted">
              <span>Press <kbd className="font-mono bg-border/40 px-1 py-0.5 rounded">Enter</kbd> to query, <kbd className="font-mono bg-border/40 px-1 py-0.5 rounded">Shift+Enter</kbd> for line</span>
              {messages.length > 0 && (
                <span>Co-pilot session active</span>
              )}
            </div>

          </div>
        </div>
      </div>

      <CommandBar />
    </div>
  );
}
