'use client';
import { useState, useEffect } from 'react';
import { IconClock } from '@tabler/icons-react';

interface ResponseTimerProps {
  window?: string; // e.g. "reply within 2h", "18h", "2d"
}

export function ResponseTimer({ window: windowProp }: ResponseTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!windowProp) return;

    // Parse duration like "2h" or "18h" or "2 days"
    const match = windowProp.match(/(\d+)\s*(h|m|d|day)/);
    if (!match) {
      setTimeLeft(windowProp);
      return;
    }

    const value = parseInt(match[1]);
    const unit = match[2];
    let totalSeconds = 0;
    if (unit === 'h') totalSeconds = value * 3600;
    else if (unit === 'm') totalSeconds = value * 60;
    else if (unit === 'd' || unit === 'day') totalSeconds = value * 86400;

    const startTime = Date.now();
    const endTime = startTime + totalSeconds * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      if (remaining === 0) {
        setTimeLeft('Overdue');
        return;
      }
      
      const seconds = Math.floor(remaining / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m ${secs}s left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [windowProp]);

  if (!windowProp) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-mono select-none">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-red"></span>
      </span>
      <IconClock size={12} className="shrink-0" />
      <span>{timeLeft || windowProp}</span>
    </div>
  );
}
