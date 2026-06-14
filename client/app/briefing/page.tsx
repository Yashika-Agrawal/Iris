'use client';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { NavRail } from '../../components/layout/NavRail';
import { mockBriefingStats, mockActionItems, mockCommitments } from '../../lib/mockData';
import { IconAlertTriangle, IconCalendar, IconMail, IconClock, IconCheck, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';

function BriefingSidebar() {
  const [commitments, setCommitments] = useState(mockCommitments);

  const handleResolve = (id: string) => {
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  };

  return (
    <div className="flex flex-col h-full bg-surface p-4 gap-5">
      <div>
        <h3 className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
          Active Commitments
        </h3>
        <p className="text-[10px] text-muted font-sans mt-0.5">Surfaced from your messages</p>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {commitments.map((c) => (
          <div
            key={c.id}
            className={`border rounded p-3 flex flex-col gap-2 transition-all ${
              c.status === 'completed'
                ? 'bg-elevated/40 border-[#1a1a1a] opacity-50'
                : c.riskLevel === 'high'
                ? 'bg-[#1f0f0f]/30 border-accent-red/20'
                : 'bg-elevated border-border'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-muted">{c.sender}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                c.status === 'completed'
                  ? 'bg-muted/10 text-secondary'
                  : c.riskLevel === 'high'
                  ? 'bg-accent-red/10 text-accent-red'
                  : c.riskLevel === 'medium'
                  ? 'bg-accent-orange/10 text-accent-orange'
                  : 'bg-accent-green/10 text-accent-green'
              }`}>
                {c.status === 'completed' ? 'DONE' : c.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <p className="text-xs text-[#ddd] leading-relaxed font-sans">{c.text}</p>
            
            {c.riskDescription && c.status !== 'completed' && (
              <p className="text-[10px] text-accent-red leading-normal font-sans italic">
                ⚠ {c.riskDescription}
              </p>
            )}

            <div className="flex justify-between items-center text-[10px] text-muted mt-1 pt-2 border-t border-[#1a1a1a]">
              <span className="flex items-center gap-1">
                <IconClock size={10} /> {c.status === 'completed' ? 'Resolved' : 'Due ' + new Date(c.dueDate).toLocaleDateString('en-US')}
              </span>
              {c.status !== 'completed' && (
                <button
                  onClick={() => handleResolve(c.id)}
                  className="text-primary hover:text-accent-green hover:underline cursor-pointer transition-colors"
                >
                  Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BriefingPage() {
  const [actions, setActions] = useState(mockActionItems);
  const [conflictResolved, setConflictResolved] = useState(false);

  const handleExecute = (id: string) => {
    if (id === 'act-2') {
      setConflictResolved(true);
      setActions(prev => prev.map(a => a.id === id ? { ...a, summary: 'rescheduled spec review to 3 PM. Double-booking conflict resolved.', actionLabel: 'Conflict Resolved' } : a));
    } else {
      alert(`Navigating to execute: ${id}`);
    }
  };

  return (
    <AppShell
      nav={<NavRail />}
      sidebar={<BriefingSidebar />}
      main={
        <div className="h-full bg-base overflow-y-auto p-8 text-primary max-w-3xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="border-b border-border pb-5 flex flex-col gap-2">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
              return <h1 className="text-xl font-bold tracking-tight text-[#f4f4f5]">{greeting}, Yashika</h1>;
            })()}
            <p className="text-xs text-[#a1a1aa] font-sans">
              Here is your daily synthesized briefing as of {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.
            </p>
          </div>

          {/* Stat Indicators Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1 shadow-lg shadow-accent-red/2">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">URGENT BRIEF</span>
              <span className="text-2xl font-bold text-accent-red">{mockBriefingStats.urgentEmailsCount}</span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">MEETINGS TODAY</span>
              <span className="text-2xl font-bold text-accent-blue">{mockBriefingStats.meetingsCount}</span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">CONFLICTS</span>
              <span className={`text-2xl font-bold ${conflictResolved ? 'text-accent-green' : 'text-accent-red'}`}>
                {conflictResolved ? 0 : mockBriefingStats.conflictsCount}
              </span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">FOLLOW-UPS</span>
              <span className="text-2xl font-bold text-accent-orange">{mockBriefingStats.followupsCount}</span>
            </div>
          </div>



          {/* Unified Actions Hub Timelines */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-tight">Today's Priorities</h2>
            <div className="flex flex-col gap-3">
              {actions.map((act) => {
                const isConflict = act.id === 'act-2';
                if (isConflict && conflictResolved) {
                  return (
                    <div key={act.id} className="p-4 rounded-lg bg-surface border border-[#1a1a1a] flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="text-accent-green"><IconCheck size={16} /></div>
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-semibold text-secondary line-through">Double Booking Conflict (2:00 PM)</span>
                          <p className="text-muted">{act.summary}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted">RESOLVED</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className={`mt-0.5 ${act.urgency === 'high' ? 'text-accent-red' : 'text-accent-orange'}`}>
                        {act.source === 'email' ? <IconMail size={16} /> : <IconCalendar size={16} />}
                      </div>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-semibold text-primary flex items-center gap-2">
                          {act.title}
                          {act.impact === 'critical' && (
                            <span className="text-[8px] font-mono px-1 py-0.5 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded">CRITICAL IMPACT</span>
                          )}
                        </span>
                        <p className="text-secondary leading-relaxed max-w-xl">{act.summary}</p>
                      </div>
                    </div>
                    <div>
                      {isConflict ? (
                        <button
                          onClick={() => handleExecute(act.id)}
                          className="px-3.5 py-1.5 bg-[#1f0f0f] border border-accent-red/30 text-accent-red rounded text-[11px] font-semibold cursor-pointer hover:bg-opacity-95 transition whitespace-nowrap"
                        >
                          {act.actionLabel}
                        </button>
                      ) : (
                        <Link
                          href={act.id === 'act-1' ? '/mail/thread-1' : '/mail'}
                          className="px-3.5 py-1.5 bg-[#1a2535] border border-[#1e3a5f] text-[#60a5fa] rounded text-[11px] font-semibold cursor-pointer hover:bg-opacity-95 transition whitespace-nowrap inline-block text-center"
                        >
                          {act.actionLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
    />
  );
}
