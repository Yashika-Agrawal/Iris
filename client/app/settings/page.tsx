'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SettingsContent() {
  const [tenantId, setTenantId] = useState('default_tenant');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Read current tenant cookie
    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(c => c.trim().startsWith('tenant-id='));
    if (tenantCookie) {
      setTenantId(tenantCookie.split('=')[1].trim());
    }

    async function checkStatus() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setGmailConnected(data.gmailConnected);
          setCalendarConnected(data.calendarConnected);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();

    // Check search params for redirect flags
    const connectedPlugin = searchParams.get('connected');
    const errorMsg = searchParams.get('error');

    if (connectedPlugin) {
      setMessage(`Successfully connected Google Account for ${connectedPlugin === 'gmail' ? 'Gmail' : 'Google Calendar'}!`);
      setIsError(false);
    } else if (errorMsg) {
      setMessage(`OAuth Error: ${errorMsg}`);
      setIsError(true);
    }
  }, [searchParams]);

  const handleSwitchTenant = (newTenantId: string) => {
    document.cookie = `tenant-id=${newTenantId}; path=/; max-age=31536000`;
    setTenantId(newTenantId);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-secondary text-xs font-mono bg-base">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-base p-8 text-primary max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-xs text-secondary font-mono">Scope: Multi-tenant client configuration</p>
        </div>
        <Link 
          href="/mail" 
          className="px-3 py-1.5 text-xs font-mono border border-border rounded hover:bg-elevated hover:text-primary transition"
        >
          ← Back to Dashboard
        </Link>
      </div>


      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg border text-xs font-mono ${isError ? 'bg-accent-red/15 border-accent-red/30 text-accent-red' : 'bg-accent-green/15 border-accent-green/30 text-accent-green'}`}>
          {message}
        </div>
      )}

      {/* Tenant Context Panel */}
      <div className="p-5 rounded-lg border border-border bg-surface flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold mb-1">Active Tenant ID</h2>
          <p className="text-xs text-secondary">
            Switching the tenant ID swaps the database and API context. All email and calendar data will be scoped to this user.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 bg-elevated border border-border rounded text-sm focus:outline-none focus:border-border-strong font-mono"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
          <button
            onClick={() => handleSwitchTenant(tenantId)}
            className="px-4 py-2 bg-elevated hover:bg-border-strong border border-border rounded text-xs font-mono transition"
          >
            Apply Tenant
          </button>
        </div>
      </div>

      {/* Integrations Cards */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Integrations</h2>

        {/* Gmail Integration Card */}
        <div className="p-5 rounded-lg border border-border bg-surface flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium flex items-center gap-2">
              Gmail Connection
              {gmailConnected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-green/15 text-accent-green border border-accent-green/20">Connected</span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/15 text-secondary border border-border">Disconnected</span>
              )}
            </div>
            <p className="text-xs text-secondary max-w-md">
              Allow Iris to fetch, classify, and draft responses for email threads scoped to <strong>{tenantId}</strong>.
            </p>
          </div>
          <div>
            <a
              href={`/api/auth/google/connect?plugin=gmail`}
              className={`px-4 py-2 text-xs font-mono rounded border transition inline-block text-center ${gmailConnected ? 'bg-elevated text-secondary border-border hover:bg-border-strong hover:text-primary' : 'bg-primary text-base font-semibold border-transparent hover:bg-opacity-90'}`}
            >
              {gmailConnected ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
          </div>
        </div>

        {/* Google Calendar Card */}
        <div className="p-5 rounded-lg border border-border bg-surface flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium flex items-center gap-2">
              Google Calendar Connection
              {calendarConnected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-green/15 text-accent-green border border-accent-green/20">Connected</span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/15 text-secondary border border-border">Disconnected</span>
              )}
            </div>
            <p className="text-xs text-secondary max-w-md">
              Allow Iris to schedule meetings and check availability scoped to <strong>{tenantId}</strong>.
            </p>
          </div>
          <div>
            <a
              href={`/api/auth/google/connect?plugin=googlecalendar`}
              className={`px-4 py-2 text-xs font-mono rounded border transition inline-block text-center ${calendarConnected ? 'bg-elevated text-secondary border-border hover:bg-border-strong hover:text-primary' : 'bg-primary text-base font-semibold border-transparent hover:bg-opacity-90'}`}
            >
              {calendarConnected ? 'Reconnect Calendar' : 'Connect Calendar'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-secondary text-xs font-mono bg-base">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
