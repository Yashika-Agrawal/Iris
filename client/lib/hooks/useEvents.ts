import { useState, useEffect } from 'react';
import { CalEvent } from '../../types';
import { listEvents } from '../api/calendar';

let globalEvents: CalEvent[] | null = null;
const listeners = new Set<() => void>();

export function useEvents(weekStart: string) {
  const [events, setEvents] = useState<CalEvent[]>(globalEvents || []);
  const [isLoading, setIsLoading] = useState(!globalEvents);

  useEffect(() => {
    async function load() {
      if (globalEvents) return;
      setIsLoading(true);
      try {
        const data = await listEvents(weekStart);
        globalEvents = data;
        setEvents(data);
        listeners.forEach(l => l());
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    const handleUpdate = () => {
      setEvents(globalEvents || []);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [weekStart]);

  const addEvent = (newEvent: CalEvent) => {
    if (globalEvents) {
      globalEvents = [...globalEvents, newEvent];
    } else {
      globalEvents = [newEvent];
    }
    listeners.forEach(l => l());
  };

  return { events, isLoading, addEvent };
}
