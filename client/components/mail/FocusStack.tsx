'use client';
import { AnimatePresence } from 'framer-motion';
import { FocusItem } from '../../types';
import { FocusCard } from './FocusCard';
import { useState, useEffect } from 'react';

interface FocusStackProps {
  items: FocusItem[];
}

export function FocusStack({ items: initialItems }: FocusStackProps) {
  const [items, setItems] = useState<FocusItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDismiss = (id: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.type === 'email') return item.thread.id !== id;
        if (item.type === 'calendar') return item.event.id !== id;
        return item.threadId !== id;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 px-6">
      <div className="flex flex-col gap-1">
        {(() => {
          const hour = new Date().getHours();
          const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
          return <h1 className="text-2xl font-bold text-primary tracking-tight">{greeting}.</h1>;
        })()}
        <p className="text-sm text-secondary">
          {items.length === 0
            ? "You're all caught up for today."
            : `${items.length} ${items.length === 1 ? 'thing needs' : 'things need'} you today.`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const key =
              item.type === 'email'
                ? `email-${item.thread.id}`
                : item.type === 'calendar'
                ? `calendar-${item.event.id}`
                : `followup-${item.threadId}`;
            return (
              <FocusCard
                key={key}
                item={item}
                index={index}
                onDismiss={handleDismiss}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
