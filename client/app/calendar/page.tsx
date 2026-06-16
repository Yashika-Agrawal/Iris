'use client';
import { useState } from 'react';
import { WeekView } from '../../components/calendar/WeekView';
import { TodayCommitments } from '../../components/calendar/TodayCommitments';
import { MeetingPrepPanel } from '../../components/calendar/MeetingPrepPanel';

import { PrepMeeting } from '../../types';
import { IconAlertTriangle, IconCalendar, IconCpu, IconCalendarTime, IconUsers } from '@tabler/icons-react';

import { useEvents } from '../../lib/hooks/useEvents';

export default function CalendarPage() {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const { events, isLoading } = useEvents(weekStart.toISOString());

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const endOfToday = new Date(todayDate);
  endOfToday.setHours(23, 59, 59, 999);

  const todaysEvents = events.filter(ev => {
    const evStart = new Date(ev.start);
    return evStart >= todayDate && evStart <= endOfToday;
  });

  const dynamicPrepMeetings: PrepMeeting[] = todaysEvents.map(ev => ({
    id: ev.id,
    title: ev.title,
    time: new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: '30m',
    participants: ev.guests ? ev.guests.map(g => ({ name: g, email: g })) : [],
    brief: ev.description || 'No preparation data available.',
    talkingPoints: [],
    risks: [],
    actions: [],
    relatedEmailIds: []
  }));

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const selectedMeeting = dynamicPrepMeetings.find(m => m.id === selectedMeetingId) || (dynamicPrepMeetings.length > 0 ? dynamicPrepMeetings[0] : null);

  const [activeTab, setActiveTab] = useState<'prep' | 'calendar'>('prep');

  const handleActionComplete = (action: string) => {
    // actions handling
  };

  return (
    <div className="h-full flex flex-col bg-base overflow-hidden select-none">
      {/* Top Navigation / Dashboard bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <IconCpu size={20} className="text-accent-blue" />
          <div>
            <h1 className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
              AI CHIEF OF STAFF • CALENDAR & PREP WORKSPACE
            </h1>
            <p className="text-[11px] text-muted">
              Auto-detecting schedule conflicts, risks, and prepping talking points
            </p>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1.5 bg-[#121212] border border-border p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'prep'
                ? 'bg-border-strong text-primary'
                : 'text-muted hover:text-primary'
            }`}
          >
            AI Prep Workspace
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-border-strong text-primary'
                : 'text-muted hover:text-primary'
            }`}
          >
            Grid Calendar
          </button>
        </div>
      </div>

      {activeTab === 'prep' ? (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 overflow-hidden">
          {/* Left panel: Agenda + Conflicts */}
          <div className="xl:col-span-1 flex flex-col gap-5 overflow-hidden">
            {/* List of Prep Meetings */}
            <div className="flex flex-col gap-3 overflow-hidden">
              <span className="text-[10px] font-mono font-medium text-muted uppercase tracking-wider shrink-0">
                TODAY'S PREP WORKSPACE
              </span>
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="text-xs text-muted font-mono p-4">Loading meetings...</div>
                ) : dynamicPrepMeetings.length === 0 ? (
                  <div className="text-xs text-muted font-mono p-4">No meetings scheduled for today.</div>
                ) : dynamicPrepMeetings.map((meet) => {
                  const isSelected = selectedMeeting?.id === meet.id;
                  return (
                    <button
                      key={meet.id}
                      onClick={() => setSelectedMeetingId(meet.id)}
                      className={`w-full text-left p-3.5 border rounded-lg transition-all flex flex-col gap-2 shrink-0 ${
                        isSelected
                          ? 'bg-[#141414] border-accent-blue'
                          : 'bg-surface hover:bg-[#141414] border-border hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-medium text-primary truncate max-w-[150px]">
                          {meet.title}
                        </span>
                        <span className="text-[10px] font-mono text-muted shrink-0">
                          {meet.time}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {meet.brief}
                      </p>

                      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border/40 w-full">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <IconUsers size={12} /> {meet.participants.length} guests
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-2 border-t border-border">
              <TodayCommitments />
            </div>
          </div>

          {/* Right/Center panel: The deep-dive Prep detail */}
          <div className="xl:col-span-3 flex flex-col h-full overflow-hidden">
            {selectedMeeting ? (
              <MeetingPrepPanel 
                meeting={selectedMeeting} 
                onActionComplete={handleActionComplete} 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-border border-dashed rounded-lg bg-surface text-center p-6">
                <IconCalendar size={32} className="text-muted mb-2" />
                <h3 className="text-sm font-medium text-secondary">Select a meeting from the agenda</h3>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Review the preparation, risks, commitments, and checklist items generated by Iris.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 overflow-hidden">
          <div className="xl:col-span-1 overflow-y-auto">
            <TodayCommitments />
          </div>
          <div className="xl:col-span-3 border border-border rounded-lg overflow-hidden h-[80vh] min-h-[600px]">
            <WeekView />
          </div>
        </div>
      )}
    </div>
  );
}
