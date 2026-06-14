'use client';
import { useEvents } from '../../lib/hooks/useEvents';
import { IconCalendar, IconClock, IconUsers } from '@tabler/icons-react';

export function TodayCommitments() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { events, isLoading } = useEvents(todayStart.toISOString());

  // Filter for today's events
  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.start);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  // Sort chronologically
  todayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-4 bg-surface border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <IconCalendar size={16} className="text-accent-blue" />
        <h2 className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
          TODAY'S COMMITMENTS
        </h2>
      </div>

      {isLoading ? (
        <div className="text-xs text-secondary py-2 font-mono">Loading commitments...</div>
      ) : todayEvents.length === 0 ? (
        <div className="text-xs text-muted py-4 font-mono text-center">
          No events scheduled for today.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {todayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-elevated/40 hover:bg-elevated/80 border border-border hover:border-border-strong rounded p-3 transition-colors flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary font-medium">{event.title}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">
                  <IconClock size={10} />
                  {formatTime(event.start)} - {formatTime(event.end)}
                </span>
              </div>
              {event.guests && event.guests.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <IconUsers size={12} className="text-muted" />
                  <span className="truncate">{event.guests.join(', ')}</span>
                </div>
              )}
              {event.description && (
                <p className="text-xs text-muted line-clamp-1 italic mt-0.5">
                  "{event.description}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
