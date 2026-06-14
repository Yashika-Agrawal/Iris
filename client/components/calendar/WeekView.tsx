'use client';
import { useState } from 'react';
import { useEvents } from '../../lib/hooks/useEvents';
import { EventBlock } from './EventBlock';
import { CreateEventModal } from './CreateEventModal';
import { IconPlus } from '@tabler/icons-react';
import { CalEvent } from '../../types';

function getDayLayout(eventsForDay: CalEvent[]) {
  const sorted = [...eventsForDay].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const layout = new Map<string, { column: number; totalColumns: number }>();
  let currentGroup: CalEvent[] = [];
  let groupEnd = 0;
  
  const processGroup = (group: CalEvent[]) => {
    const columns: CalEvent[][] = [];
    for (const event of group) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastEvent = columns[i][columns[i].length - 1];
        if (new Date(lastEvent.end) <= new Date(event.start)) {
          columns[i].push(event);
          layout.set(event.id, { column: i, totalColumns: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        layout.set(event.id, { column: columns.length - 1, totalColumns: 0 });
      }
    }
    for (const event of group) {
      const info = layout.get(event.id);
      if (info) info.totalColumns = columns.length;
    }
  };

  for (const event of sorted) {
    const startT = new Date(event.start).getTime();
    const endT = new Date(event.end).getTime();
    if (currentGroup.length === 0) {
      currentGroup.push(event);
      groupEnd = endT;
    } else {
      if (startT < groupEnd) {
        currentGroup.push(event);
        groupEnd = Math.max(groupEnd, endT);
      } else {
        processGroup(currentGroup);
        currentGroup = [event];
        groupEnd = endT;
      }
    }
  }
  if (currentGroup.length > 0) {
    processGroup(currentGroup);
  }
  return layout;
}

export function WeekView() {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday

  const { events, isLoading, addEvent } = useEvents(weekStart.toISOString());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div className="h-full flex flex-col relative bg-base">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary">Calendar</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <IconPlus size={16} /> New Event
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 min-w-[800px] h-[1440px] relative">
          {/* Time axis */}
          <div className="col-span-1 border-r border-border relative">
            {hours.map(h => (
              <div key={h} className="absolute w-full border-b border-border/50 text-xs text-muted text-right pr-2" style={{ top: `${h * 60}px`, height: '60px' }}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </div>
            ))}
          </div>

          {/* Days */}
          {days.map((day, dayIdx) => (
            <div key={dayIdx} className="col-span-1 border-r border-border relative">
              <div className="h-12 border-b border-border flex flex-col items-center justify-center sticky top-0 bg-surface z-10">
                <span className="text-xs text-muted font-medium">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</span>
                <span className="text-sm font-bold text-primary">{day.getDate()}</span>
              </div>
              <div className="relative h-[1440px]">
                {hours.map(h => (
                  <div key={h} className="absolute w-full border-b border-border/20" style={{ top: `${h * 60}px`, height: '60px' }} />
                ))}
                
                {(() => {
                  const dayEvents = events.filter(e => new Date(e.start).getDay() === day.getDay());
                  const layout = getDayLayout(dayEvents);
                  return dayEvents.map(event => (
                    <EventBlock key={event.id} event={event} layoutInfo={layout.get(event.id)} />
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <CreateEventModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={(evt) => { addEvent(evt); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
}
