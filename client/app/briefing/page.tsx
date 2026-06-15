'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { NavRail } from '../../components/layout/NavRail';
import { IconAlertTriangle, IconCalendar, IconMail, IconClock, IconCheck, IconSettings } from '@tabler/icons-react';
import { Loader } from '../../components/ui/Loader';

function BriefingSidebar({ initialCommitments = [], hasGenerated = false }: { initialCommitments: any[], hasGenerated?: boolean }) {
  const [commitments, setCommitments] = useState(initialCommitments);

  useEffect(() => {
    setCommitments(initialCommitments);
  }, [initialCommitments]);

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
        {!hasGenerated ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg bg-surface/50 opacity-60">
            <IconMail size={24} className="text-muted mb-2" />
            <p className="text-xs text-secondary font-semibold">Waiting for Synthesis</p>
            <p className="text-[10px] text-muted mt-1">Click Synthesize to analyze emails for commitments.</p>
          </div>
        ) : commitments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-lg bg-surface/50 opacity-60">
            <IconCheck size={24} className="text-accent-green mb-2" />
            <p className="text-xs text-secondary font-semibold">No Active Commitments</p>
            <p className="text-[10px] text-muted mt-1">You have no outstanding promises to follow up on.</p>
          </div>
        ) : (
          commitments.map((c: any) => (
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
          ))
        )}
      </div>
    </div>
  );
}

export default function BriefingPage() {
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ stats: any, commitments: any[] } | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const generateBriefing = () => {
    setLoading(true);
    setError(null);
    fetch('/api/briefing')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`API Error: ${res.statusText}`);
        }
        return res.json();
      })
      .then(json => {
        if (json.error) {
          throw new Error(json.error);
        }
        setData({ stats: json.stats, commitments: json.commitments });
        setActions(json.actions || []);
        setHasGenerated(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch briefing:', err);
        setError('Failed to synthesize briefing. AI Service might be unavailable or limits exceeded.');
        setLoading(false);
      });
  };

  const handleExecute = async (act: any) => {
    setLoadingActions(prev => ({ ...prev, [act.id]: true }));
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: act.id,
          title: act.title,
          summary: act.summary,
          actionLabel: act.actionLabel
        })
      });
      
      if (res.ok) {
        setCompletedActions(prev => ({ ...prev, [act.id]: true }));
      } else {
        alert('Failed to execute action. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [act.id]: false }));
    }
  };

  if (loading) {
    return <Loader label="Iris is synthesizing..." sublabel="ANALYZING INBOX & CALENDAR" />;
  }

  if (error && !hasGenerated) {
    return (
      <AppShell
        nav={<NavRail />}
        sidebar={<BriefingSidebar initialCommitments={[]} hasGenerated={false} />}
        main={
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <IconAlertTriangle size={48} className="text-accent-orange mb-2" />
            <h2 className="text-xl font-bold text-primary">Synthesis Unavailable</h2>
            <p className="text-secondary max-w-sm">
              {error}
            </p>
            <p className="text-muted text-xs mt-2 max-w-sm">
              Please check your API configuration or try again later. Fallback data not shown to avoid confusion.
            </p>
            <button
              onClick={generateBriefing}
              className="px-4 py-2 mt-4 border border-border text-secondary rounded-md font-semibold hover:bg-surface transition-colors"
            >
              Retry Synthesis
            </button>
          </div>
        }
      />
    );
  }

  if (!hasGenerated || !data) {
    return (
      <AppShell
        nav={<NavRail />}
        sidebar={<BriefingSidebar initialCommitments={[]} hasGenerated={false} />}
        main={
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <h2 className="text-xl font-bold text-primary">Daily Briefing</h2>
            <p className="text-secondary max-w-sm">
              Click below to let Iris analyze your data and synthesize your daily briefing.
            </p>
            <button
              onClick={generateBriefing}
              className="px-4 py-2 mt-2 bg-accent-blue text-white rounded-md font-semibold hover:bg-opacity-90 transition-opacity"
            >
              Synthesize Briefing
            </button>
          </div>
        }
      />
    );
  }

  return (
    <AppShell
      nav={<NavRail />}
      sidebar={<BriefingSidebar initialCommitments={data?.commitments || []} />}
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
              <span className="text-2xl font-bold text-accent-red">{data.stats?.urgentEmailsCount || 0}</span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">MEETINGS TODAY</span>
              <span className="text-2xl font-bold text-accent-blue">{data.stats?.meetingsCount || 0}</span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">CONFLICTS</span>
              <span className={`text-2xl font-bold ${completedActions['act-2'] ? 'text-accent-green' : 'text-accent-red'}`}>
                {completedActions['act-2'] ? 0 : (data.stats?.conflictsCount || 0)}
              </span>
            </div>
            <div className="p-4 bg-[#0d0d12] border border-[#161622] rounded-lg flex flex-col gap-1">
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase">FOLLOW-UPS</span>
              <span className="text-2xl font-bold text-accent-orange">{data.stats?.followupsCount || 0}</span>
            </div>
          </div>

          {/* Unified Actions Hub Timelines */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-tight">Today's Priorities</h2>
            <div className="flex flex-col gap-3">
              {actions.map((act) => {
                const isCompleted = completedActions[act.id];
                if (isCompleted) {
                  return (
                    <div key={act.id} className="p-4 rounded-lg bg-surface border border-[#1a1a1a] flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="text-accent-green"><IconCheck size={16} /></div>
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-semibold text-secondary line-through">{act.title}</span>
                          <p className="text-muted">Executed automatically by AI Assistant.</p>
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
                      <button
                        onClick={() => handleExecute(act)}
                        disabled={loadingActions[act.id]}
                        className={`px-3.5 py-1.5 border rounded text-[11px] font-semibold cursor-pointer transition whitespace-nowrap inline-block text-center ${
                          act.impact === 'critical'
                            ? 'bg-[#1f0f0f] border-accent-red/30 text-accent-red hover:bg-opacity-95'
                            : 'bg-[#1a2535] border-[#1e3a5f] text-[#60a5fa] hover:bg-opacity-95'
                        }`}
                      >
                        {loadingActions[act.id] ? 'Executing...' : act.actionLabel}
                      </button>
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
