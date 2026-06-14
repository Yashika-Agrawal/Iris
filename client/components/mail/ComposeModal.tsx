'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendEmail } from '../../lib/api/gmail';

export function ComposeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleOpenCompose = () => setIsOpen(true);
    const handleOpenReply = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-compose', handleOpenCompose);
    window.addEventListener('open-reply', handleOpenReply);

    return () => {
      window.removeEventListener('open-compose', handleOpenCompose);
      window.removeEventListener('open-reply', handleOpenReply);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendEmail(to, subject, body);
      setIsOpen(false);
      setTo('');
      setSubject('');
      setBody('');
    } catch (e) {
      console.error('Failed to send email:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 right-80 w-[500px] bg-surface border border-border rounded-t-xl shadow-2xl z-50 flex flex-col"
        >
          <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-elevated rounded-t-xl">
            <span className="text-sm font-medium text-primary">New Message</span>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-primary">X</button>
          </div>
          <div className="flex flex-col p-2 gap-2">
            <input 
              type="text" 
              placeholder="To" 
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full bg-transparent border-b border-border px-2 py-2 text-sm text-primary placeholder-muted focus:outline-none focus:border-border-strong"
            />
            <input 
              type="text" 
              placeholder="Subject" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-transparent border-b border-border px-2 py-2 text-sm text-primary placeholder-muted focus:outline-none focus:border-border-strong"
            />
            <textarea 
              placeholder="Body" 
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full bg-transparent px-2 py-2 text-sm text-primary placeholder-muted focus:outline-none resize-none min-h-[250px]"
            />
          </div>
          <div className="p-3 border-t border-border flex justify-between items-center">
            <button 
              onClick={handleSend}
              disabled={isSending || !to || !body}
              className="px-6 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
