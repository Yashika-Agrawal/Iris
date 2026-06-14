'use client';
import { useState, useEffect } from 'react';
import { CalEvent, Thread } from '../../types';

export function useMeetingBrief() {
  const [briefEvent, setBriefEvent] = useState<CalEvent | null>(null);
  const [briefThread, setBriefThread] = useState<Thread | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkEvents() {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const res = await fetch(`/api/calendar/events?from=${encodeURIComponent(todayStart.toISOString())}`);
        if (!res.ok) return;
        const events: CalEvent[] = await res.json();

        const now = Date.now();
        const incomingEvent = events.find((e) => {
          const startTime = new Date(e.start).getTime();
          const diffMins = (startTime - now) / 60000;
          return diffMins > 0 && diffMins <= 15;
        });

        if (incomingEvent) {
          setBriefEvent(incomingEvent);
          setIsVisible(true);

          const guestsQuery = incomingEvent.guests.length > 0 ? incomingEvent.guests[0] : '';
          const threadsRes = await fetch('/api/gmail/threads');
          if (threadsRes.ok) {
            const threads: Thread[] = await threadsRes.json();
            const related = threads.find((t) =>
              t.from.toLowerCase().includes(guestsQuery.toLowerCase()) ||
              incomingEvent.title.toLowerCase().split(' ').some((word) => t.subject.toLowerCase().includes(word))
            );
            if (related) {
              setBriefThread(related);
            } else if (threads.length > 0) {
              setBriefThread(threads[0]);
            }
          }
        } else {
          if (events.length === 0) {
            const demoTimeout = setTimeout(() => {
              const start = new Date(Date.now() + 1000 * 60 * 12);
              const end = new Date(start.getTime() + 1000 * 60 * 60);
              
              setBriefEvent({
                id: 'event-demo-brief',
                title: 'Mentor review',
                start: start.toISOString(),
                end: end.toISOString(),
                guests: ['Piyush Garg', 'Yashika Agrawal'],
                description: 'Quick checkin on your Corsair Hackathon project progression.'
              });

              setBriefThread({
                id: 'thread-demo-brief',
                from: 'Piyush Garg',
                fromEmail: 'piyush@corsair.dev',
                subject: 'demo confirmation',
                preview: 'Make sure your Corsair connection is live...',
                body: 'Make sure your Corsair connection is live...',
                date: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
                isUnread: true,
                priority: 'urgent',
                responseWindow: 'reply within 2h',
                labels: ['INBOX']
              });

              setIsVisible(true);
            }, 8000);
            return () => clearTimeout(demoTimeout);
          }
        }
      } catch (err) {
        console.error('Failed checking events for brief:', err);
      }
    }

    checkEvents();
    interval = setInterval(checkEvents, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return { briefEvent, briefThread, isVisible, handleDismiss };
}
