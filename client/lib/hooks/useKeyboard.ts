'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboard() {
  const router = useRouter();
  const sequence = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        if (e.key === 'Escape') {
          window.dispatchEvent(new CustomEvent('close-all-modals'));
        }
        return;
      }

      const key = e.key.toLowerCase();

      // Check Meta+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-bar'));
        return;
      }

      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-all-modals'));
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      sequence.current.push(key);
      if (sequence.current.length > 2) {
        sequence.current.shift();
      }

      timeoutRef.current = setTimeout(() => {
        sequence.current = [];
      }, 500);

      const seqStr = sequence.current.join('');
      if (seqStr === 'gi') {
        router.push('/mail');
        sequence.current = [];
        return;
      }
      if (seqStr === 'gc') {
        router.push('/calendar');
        sequence.current = [];
        return;
      }

      switch (key) {
        case 'c':
          window.dispatchEvent(new CustomEvent('open-compose'));
          break;
        case 'e':
          window.dispatchEvent(new CustomEvent('archive-thread'));
          break;
        case 'r':
          window.dispatchEvent(new CustomEvent('open-reply'));
          break;
        case '#':
          window.dispatchEvent(new CustomEvent('trash-thread'));
          break;
        case 'j':
          window.dispatchEvent(new CustomEvent('select-next-thread'));
          break;
        case 'k':
          window.dispatchEvent(new CustomEvent('select-prev-thread'));
          break;
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          } else {
            const input = document.querySelector('input') as HTMLInputElement;
            input?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);
}
