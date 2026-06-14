'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IconSearch, IconSparkles, IconMail, IconCalendar, IconUsers, IconArrowRight } from '@tabler/icons-react';

interface CommandItem {
  id: string;
  category: 'Actions' | 'Navigation' | 'AI Chief of Staff';
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for global Ctrl+K / ⌘K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'nav-briefing',
      category: 'Navigation',
      label: 'Go to Daily Briefing Dashboard',
      icon: <IconSparkles size={16} className="text-accent-blue" />,
      action: () => { router.push('/briefing'); setIsOpen(false); }
    },
    {
      id: 'nav-inbox',
      category: 'Navigation',
      label: 'Go to Smart Inbox',
      icon: <IconMail size={16} className="text-accent-green" />,
      action: () => { router.push('/mail'); setIsOpen(false); }
    },
    {
      id: 'nav-people',
      category: 'Navigation',
      label: 'Go to Relationship Intelligence Network',
      icon: <IconUsers size={16} className="text-accent-blue" />,
      action: () => { router.push('/people'); setIsOpen(false); }
    },
    {
      id: 'nav-calendar',
      category: 'Navigation',
      label: 'Go to Calendar Schedule',
      icon: <IconCalendar size={16} className="text-secondary" />,
      action: () => { router.push('/calendar'); setIsOpen(false); }
    },
    {
      id: 'act-resched',
      category: 'Actions',
      label: 'Resolve Double-booking Conflict (Move spec review to 3 PM)',
      icon: <IconCalendar size={16} className="text-accent-red" />,
      action: () => { router.push('/briefing'); setIsOpen(false); }
    },
    {
      id: 'act-reply-piyush',
      category: 'AI Chief of Staff',
      label: 'Draft reply to Piyush: Reschedule Confirm',
      icon: <IconSparkles size={16} className="text-accent-orange" />,
      action: () => { router.push('/mail/thread-2'); setIsOpen(false); }
    },
    {
      id: 'act-review-board',
      category: 'AI Chief of Staff',
      label: 'Review Q3 Board Budget Deck (Requires Action)',
      icon: <IconMail size={16} className="text-accent-red" />,
      action: () => { router.push('/mail/thread-1'); setIsOpen(false); }
    },
    {
      id: 'act-coffee',
      category: 'Actions',
      label: 'Schedule coffee with Rahul Gupta next week',
      icon: <IconCalendar size={16} className="text-secondary" />,
      action: () => { router.push('/people'); setIsOpen(false); }
    }
  ];

  // Filter commands
  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-[520px] bg-[#0c0c0e] border border-[#1a1a1c] rounded-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[380px]"
          >
            {/* Input search bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1c]">
              <IconSearch size={16} className="text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search actions, navigate screens, ask Iris..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-primary placeholder-muted focus:outline-none border-none outline-none font-sans"
              />
              <span className="text-[10px] font-mono text-muted px-2 py-0.5 border border-[#1a1a1c] rounded bg-elevated">ESC</span>
            </div>

            {/* List entries grouped or single */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 select-none">
              {filtered.length > 0 ? (
                filtered.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded flex items-center justify-between transition-colors cursor-pointer text-xs ${
                        isSelected 
                          ? 'bg-[#16161c] text-primary' 
                          : 'text-[#888]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {cmd.icon}
                        <span className="font-sans font-medium">{cmd.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-muted uppercase tracking-wider bg-elevated px-1.5 py-0.5 rounded border border-[#1a1a1a]">{cmd.category}</span>
                        {isSelected && <IconArrowRight size={12} className="text-muted" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted font-mono">
                  No matching assistant tasks found.
                </div>
              )}
            </div>

            {/* Helper footer */}
            <div className="px-4 py-2 border-t border-[#1a1a1c] bg-[#070709] flex justify-between items-center text-[10px] text-muted font-mono">
              <span>Use ↑↓ keys to navigate, enter to select</span>
              <span>Ctrl+K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

