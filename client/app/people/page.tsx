'use client';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { NavRail } from '../../components/layout/NavRail';
import { IconClock, IconMessage, IconCalendarEvent, IconUsers, IconAlertCircle } from '@tabler/icons-react';
import { Avatar } from '../../components/ui/Avatar';

import { Loader } from '../../components/ui/Loader';

function PeopleSidebar({ profilesCount }: { profilesCount: number }) {
  return (
    <div className="flex flex-col h-full bg-surface p-4 gap-5">
      <div>
        <h3 className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
          Network Summary
        </h3>
        <p className="text-[10px] text-muted font-sans mt-0.5">Quick stats on key relationships</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-3 bg-elevated border border-border rounded flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted uppercase">Core Contacts</span>
          <span className="text-lg font-bold text-primary">{profilesCount} Active</span>
        </div>
        <div className="p-3 bg-elevated border border-border rounded flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted uppercase">Pending Responses</span>
          <span className="text-lg font-bold text-accent-orange">{profilesCount > 0 ? '4 Waiting' : '0 Waiting'}</span>
        </div>
        <div className="p-3 bg-elevated border border-border rounded flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted uppercase">Unanswered Questions</span>
          <span className="text-lg font-bold text-accent-blue">{profilesCount > 0 ? '4 Queries' : '0 Queries'}</span>
        </div>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [hasSynthesized, setHasSynthesized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSynthesize = async () => {
    setIsLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [threadsRes, eventsRes] = await Promise.all([
        fetch('/api/gmail/threads').catch(() => null),
        fetch(`/api/calendar/events?from=${encodeURIComponent(todayStart.toISOString())}`).catch(() => null)
      ]);

      const threads = threadsRes?.ok ? await threadsRes.json() : [];
      const events = eventsRes?.ok ? await eventsRes.json() : [];

      const res = await fetch('/api/synthesize-people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threads, events })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profiles && data.profiles.length > 0) {
          setProfiles(data.profiles);
        }
      }
    } catch (error) {
      console.error('Failed to synthesize people intelligence:', error);
    } finally {
      setHasSynthesized(true);
      setIsLoading(false);
    }
  };

  return (
    <AppShell
      nav={<NavRail />}
      sidebar={<PeopleSidebar profilesCount={profiles.length} />}
      main={
        <div className="h-full bg-base overflow-y-auto p-8 text-primary max-w-3xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-border pb-4 flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#f4f4f5] flex items-center gap-2">
              <IconUsers size={22} className="text-accent-blue" />
              Relationship Intelligence
            </h1>
            <p className="text-xs text-[#a1a1aa] font-sans">
              AI-compiled key contacts, last contact touchpoints, open items, and upcoming commitments.
            </p>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader label="Iris is analyzing your network..." sublabel="Extracting commitments and open questions" />
            </div>
          ) : !hasSynthesized ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-4 text-center">
              <h2 className="text-xl font-bold text-primary">Your Relationship Graph</h2>
              <p className="text-secondary max-w-sm text-sm">
                Click below to let Iris analyze your recent emails and calendar events to extract open questions and pending commitments across your key contacts.
              </p>
              <button
                onClick={handleSynthesize}
                className="px-4 py-2 mt-2 bg-accent-blue text-white rounded-md font-semibold hover:bg-opacity-90 transition-opacity"
              >
                Synthesize Intelligence
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="bg-surface border border-border hover:border-border-strong rounded-lg p-5 flex flex-col gap-4 transition-all"
                >
                  {/* Contact Profile Header */}
                  <div className="flex justify-between items-start border-b border-[#161616] pb-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.avatar || p.name.split(' ').map((n: string)=>n[0]).join('')} />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">{p.name}</span>
                        <span className="text-[10px] text-muted font-mono">{p.email}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted font-mono flex items-center gap-1.5">
                      <IconClock size={11} /> Last contact: {p.lastContact}
                    </div>
                  </div>

                  {/* Info blocks: Open Questions, Pending follow-ups, Upcoming Meetings */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left block: Open questions */}
                    <div className="flex flex-col gap-2 bg-[#09090d] border border-[#16161c] rounded p-3 text-xs">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-muted uppercase flex items-center gap-1">
                        <IconMessage size={10} /> Open Questions
                      </span>
                      {p.openQuestions.length > 0 ? (
                        <ul className="flex flex-col gap-1.5 text-secondary list-disc pl-3">
                          {p.openQuestions.map((q: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{q}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted italic">No open queries</span>
                      )}
                    </div>

                    {/* Right block: Commitments and calendar */}
                    <div className="flex flex-col gap-3.5">
                      {/* Pending followups */}
                      <div className="bg-[#09090d] border border-[#16161c] rounded p-3 text-xs flex flex-col gap-1.5">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-muted uppercase flex items-center gap-1">
                          <IconAlertCircle size={10} /> Overdue Items
                        </span>
                        <p className="text-secondary leading-normal">
                          {p.pendingFollowups > 0 ? (
                            <span className="text-accent-orange font-semibold">
                              {p.pendingFollowups} commitment{p.pendingFollowups > 1 ? 's' : ''} require response
                            </span>
                          ) : (
                            <span className="text-accent-green font-semibold">No pending follow-ups</span>
                          )}
                        </p>
                      </div>

                      {/* Upcoming meetings */}
                      {p.upcomingMeeting && (
                        <div className="bg-[#09090d] border border-[#16161c] rounded p-3 text-xs flex flex-col gap-1.5">
                          <span className="text-[9px] font-mono font-bold tracking-wider text-muted uppercase flex items-center gap-1">
                            <IconCalendarEvent size={10} /> Next Touchpoint
                          </span>
                          <p className="text-primary font-semibold font-mono flex items-center gap-1.5">
                            📅 {p.upcomingMeeting}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}
