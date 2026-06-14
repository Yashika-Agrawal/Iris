'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createEvent } from '../../lib/api/calendar';

export function CreateEventModal({ prefilledGuest, onClose, onSave }: { prefilledGuest?: string, onClose: () => void, onSave?: (evt: any) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guests, setGuests] = useState(prefilledGuest || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const startIso = new Date(`${date}T${startTime}`).toISOString();
      const endIso = new Date(`${date}T${endTime}`).toISOString();
      const guestList = guests.split(',').map(g => g.trim()).filter(Boolean);
      
      const newEvt = await createEvent(title, startIso, endIso, guestList);
      if (onSave) {
        onSave({ id: newEvt.id || Date.now().toString(), title, start: startIso, end: endIso, guests: guestList });
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface border border-border rounded-2xl w-[400px] shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-elevated rounded-t-2xl">
          <h2 className="text-lg font-bold text-primary">New Event</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent-blue"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent-blue"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-secondary mb-1">Start Time</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent-blue"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-secondary mb-1">End Time</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent-blue"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Guests (comma separated)</label>
            <input 
              type="text" 
              value={guests} 
              onChange={e => setGuests(e.target.value)}
              className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-accent-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
