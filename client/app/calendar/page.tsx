'use client';
import { useState } from 'react';
import { WeekView } from '../../components/calendar/WeekView';
import { TodayCommitments } from '../../components/calendar/TodayCommitments';
import { MeetingPrepPanel } from '../../components/calendar/MeetingPrepPanel';
import { mockPrepMeetings } from '../../lib/mockData';
import { PrepMeeting } from '../../types';
import { IconAlertTriangle, IconCalendar, IconCpu, IconCalendarTime, IconUsers } from '@tabler/icons-react';

export default function CalendarPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<PrepMeeting | null>(mockPrepMeetings[0]);
  const [activeTab, setActiveTab] = useState<'prep' | 'calendar'>('prep');
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, boolean>>({});

  const handleActionComplete = (action: string) => {
    if (action.includes('Reschedule')) {
      // Mark conflict resolved
      setResolvedConflicts(prev => ({ ...prev, 'conflict-1': true }));
      // We can also swap meeting times or show a notification
    }
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
          <div className="xl:col-span-1 flex flex-col gap-5 overflow-y-auto">
            {/* Conflict Warning Banner */}
            {!resolvedConflicts['conflict-1'] && (
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-400 font-medium text-xs font-mono">
                  <IconAlertTriangle size={15} />
                  <span>CONFLICT DETECTED</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  You are double-booked at <strong className="text-primary">2:00 PM today</strong>:
                </p>
                <div className="flex flex-col gap-1.5 text-[11px] font-mono text-secondary pl-1.5 border-l border-rose-500/20">
                  <div>• Q3 Spec Review (Piyush)</div>
                  <div>• Client Sync (DigitalOcean)</div>
                </div>
                <button
                  onClick={() => {
                    handleActionComplete('Reschedule meeting to 3 PM');
                  }}
                  className="w-full mt-1.5 py-1.5 text-center text-[10px] font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded transition-colors"
                >
                  RESOLVE: RESCHEDULE SPEC REVIEW TO 3 PM
                </button>
              </div>
            )}

            {resolvedConflicts['conflict-1'] && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs font-mono">
                  <IconCalendarTime size={15} />
                  <span>CONFLICT RESOLVED</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Spec Review has been rescheduled to 3:00 PM. Calendar has been updated.
                </p>
              </div>
            )}

            {/* List of Prep Meetings */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-medium text-muted uppercase tracking-wider">
                TODAY'S PREP WORKSPACE
              </span>
              <div className="flex flex-col gap-2.5">
                {mockPrepMeetings.map((meet) => {
                  const isSelected = selectedMeeting?.id === meet.id;
                  const hasConflict = !resolvedConflicts['conflict-1'] && meet.time === '2:00 PM';
                  return (
                    <button
                      key={meet.id}
                      onClick={() => setSelectedMeeting(meet)}
                      className={`w-full text-left p-3.5 border rounded-lg transition-all flex flex-col gap-2 ${
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
                        {hasConflict && (
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Conflict
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <TodayCommitments />
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
