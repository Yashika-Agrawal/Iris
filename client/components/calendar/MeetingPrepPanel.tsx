'use client';
import { useState } from 'react';
import { PrepMeeting } from '../../types';
import { 
  IconUsers, 
  IconAlertTriangle, 
  IconChecklist, 
  IconBulb, 
  IconClock, 
  IconMail, 
  IconCalendarEvent,
  IconArrowRight,
  IconCheck
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface MeetingPrepPanelProps {
  meeting: PrepMeeting;
  onActionComplete?: (action: string) => void;
}

export function MeetingPrepPanel({ meeting, onActionComplete }: MeetingPrepPanelProps) {
  const router = useRouter();
  const [checkedPoints, setCheckedPoints] = useState<Record<string, boolean>>({});
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const togglePoint = (index: number) => {
    setCheckedPoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const executeAction = (action: string, idx: number) => {
    setCompletedActions(prev => ({
      ...prev,
      [idx]: true
    }));
    if (onActionComplete) {
      onActionComplete(action);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-border rounded-lg overflow-hidden select-none">
      {/* Header */}
      <div className="p-5 border-b border-border bg-gray-900 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            <IconCalendarEvent size={10} /> AI PREP READY
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-secondary">
            <IconClock size={12} className="text-muted" /> {meeting.time} ({meeting.duration})
          </span>
        </div>
        
        <h2 className="text-base font-medium text-white">{meeting.title}</h2>
        
        {/* Participants */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex -space-x-1.5 overflow-hidden">
            {meeting.participants.map((p, i) => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-full bg-border-strong text-[9px] font-bold text-primary flex items-center justify-center border border-[#0d0d0d]"
                title={p.email}
              >
                {p.avatar || p.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted truncate">
            {meeting.participants.map(p => p.name).join(', ')}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {/* AI Brief Summary */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
            <IconBulb size={14} className="text-amber-500" />
            <span>AI Executive Briefing</span>
          </div>
          <p className="text-[12px] text-gray-300 leading-relaxed bg-gray-900 border border-border/40 rounded-lg p-3.5 italic">
            "{meeting.brief}"
          </p>
        </div>

        {/* Commitment / Risk Warning */}
        {meeting.risks.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
              <IconAlertTriangle size={14} className="text-rose-500" />
              <span>Commitment Risks & Warnings</span>
            </div>
            <div className="flex flex-col gap-2">
              {meeting.risks.map((risk, idx) => (
                <div key={idx} className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-3 flex items-start gap-2.5">
                  <IconAlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-rose-300 leading-normal">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Talking Points Checklists */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
            <IconChecklist size={14} className="text-accent-blue" />
            <span>Key Talking Points (Interactive)</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {meeting.talkingPoints.length > 0 ? meeting.talkingPoints.map((point, idx) => (
              <label 
                key={idx} 
                className="flex items-start gap-3 bg-gray-900 hover:bg-gray-800 border border-border/30 rounded-lg p-3 cursor-pointer transition-colors text-xs text-gray-300"
              >
                <input 
                  type="checkbox" 
                  checked={!!checkedPoints[idx]} 
                  onChange={() => togglePoint(idx)}
                  className="rounded border-border bg-transparent text-accent-blue focus:ring-accent-blue shrink-0 mt-0.5"
                />
                <span className={checkedPoints[idx] ? 'line-through text-gray-500' : 'text-gray-200'}>
                  {point}
                </span>
              </label>
            )) : (
              <div className="text-[11px] text-muted italic bg-gray-900 border border-border/30 rounded-lg p-3 text-center">
                No key talking points generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Unified Actions Hub recommendation */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
            <IconChecklist size={14} className="text-emerald-500" />
            <span>Recommended Actions</span>
          </div>
          <div className="flex flex-col gap-2">
            {meeting.actions.length > 0 ? meeting.actions.map((act, idx) => (
              <button
                key={idx}
                disabled={completedActions[idx]}
                onClick={() => executeAction(act, idx)}
                className={`w-full flex items-center justify-between text-left p-3 rounded-lg border transition-all text-xs font-mono font-medium ${
                  completedActions[idx] 
                    ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400/60' 
                    : 'bg-[#1a2535] hover:bg-[#202e42] border-[#1e3a5f] text-accent-blue hover:text-white'
                }`}
              >
                <span className="truncate">{completedActions[idx] ? 'Completed: ' + act : act}</span>
                {completedActions[idx] ? (
                  <IconCheck size={14} className="shrink-0" />
                ) : (
                  <IconArrowRight size={14} className="shrink-0" />
                )}
              </button>
            )) : (
              <div className="text-[11px] text-muted italic bg-gray-900 border border-border/30 rounded-lg p-3 text-center">
                No recommended actions at this time.
              </div>
            )}
          </div>
        </div>

        {/* Related Emails / Threads */}
        {meeting.relatedEmailIds && meeting.relatedEmailIds.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
              <IconMail size={14} className="text-indigo-400" />
              <span>Related Context Threads</span>
            </div>
            <div className="flex flex-col gap-2">
              {meeting.relatedEmailIds.map((emailId, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/mail/${emailId}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-900 hover:bg-gray-800 border border-border/50 transition-colors text-left text-xs"
                >
                  <span className="text-gray-300 font-medium truncate">View original email context</span>
                  <IconArrowRight size={12} className="text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
