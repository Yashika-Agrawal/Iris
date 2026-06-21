'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Thread } from '../../types';
import { ResponseTimer } from '../ui/ResponseTimer';
import { IconSend, IconEdit, IconCheck } from '@tabler/icons-react';
import { sendEmail } from '../../lib/api/gmail';

interface ThreadIntelligenceProps {
  thread: Thread | null;
}

export function ThreadIntelligence({ thread }: ThreadIntelligenceProps) {
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Derive details from thread
  const aiSummary = thread 
    ? thread.preview || 'No summary available.'
    : '';

  const threadHistory = thread
    ? `This is a conversation regarding: ${thread.subject || 'the email thread'}.`
    : '';

  const initialDraft = thread
    ? `Hi ${thread.from.split(' ')[0]},\n\nThank you for reaching out.\n\nBest regards,`
    : '';

  useEffect(() => {
    if (thread) {
      setDraft(initialDraft);
      setIsSent(false);
      setIsEditing(false);
    }
  }, [thread]);

  if (!thread) {
    return (
      <div className="h-full flex items-center justify-center text-secondary text-sm">
        Select a thread to view Iris intelligence.
      </div>
    );
  }

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendEmail(thread.fromEmail || thread.from, `Re: ${thread.subject}`, draft);
      setIsSent(true);
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setIsSending(false);
    }
  };

  const words = aiSummary.split(' ');

  return (
    <div className="h-full flex flex-col bg-base overflow-y-auto">
      {/* Section 1: What they need from you */}
      <div className="p-6 border-b border-[#111] flex flex-col gap-3">
        <span className="text-[10px] tracking-wider font-mono text-muted uppercase">
          WHAT THEY NEED FROM YOU
        </span>
        <h2 className="text-primary text-sm font-medium leading-relaxed">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03, ease: 'easeOut' }}
            >
              {word}{' '}
            </motion.span>
          ))}
        </h2>
      </div>

      {/* Section 2: Context */}
      <div className="p-6 border-b border-[#111] flex flex-col gap-4">
        <span className="text-[10px] tracking-wider font-mono text-muted uppercase">
          CONTEXT
        </span>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-secondary font-medium">{thread.from}</span>
            <span className="text-muted">{new Date(thread.date).toLocaleString()}</span>
          </div>
          {thread.priority === 'urgent' && thread.responseWindow && (
            <div className="mt-1">
              <ResponseTimer window={thread.responseWindow} />
            </div>
          )}
          <p className="text-secondary text-xs leading-normal line-clamp-2 mt-2">
            {threadHistory}
          </p>
        </div>
      </div>

      {/* Section 3: Suggested reply */}
      <div className="p-6 flex-1 flex flex-col gap-4 min-h-[300px]">
        <span className="text-[10px] tracking-wider font-mono text-muted uppercase">
          SUGGESTED REPLY
        </span>
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={draft}
            disabled={isSent || isSending || !isEditing}
            onChange={(e) => setDraft(e.target.value)}
            className={`w-full flex-1 bg-[#111] border border-border rounded p-3 text-xs font-mono text-secondary placeholder-muted focus:outline-none focus:border-border-strong resize-none ${
              !isEditing ? 'opacity-80' : ''
            }`}
          />
          <div className="flex items-center gap-3">
            {isSent ? (
              <div className="flex items-center gap-1.5 text-accent-green text-xs font-medium">
                <IconCheck size={14} /> Reply sent
              </div>
            ) : (
              <>
                <button
                  onClick={handleSend}
                  disabled={isSending || !draft}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  <IconSend size={12} /> {isSending ? 'Sending...' : 'Send reply'}
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-elevated text-muted hover:text-primary rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  <IconEdit size={12} /> {isEditing ? 'Save' : 'Edit'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
