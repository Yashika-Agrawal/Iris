'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLayoutDashboard, IconMail, IconCalendar, IconUsers, IconSettings, IconUser, IconLogout } from '@tabler/icons-react';
import { Avatar } from '../ui/Avatar';

export function NavRail() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.gmailConnected) {
          setIsConnected(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleDisconnect = async () => {
    try {
      await fetch('/api/auth/disconnect', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error('Failed to disconnect', e);
    }
  };

  const links = [
    { name: 'briefing', href: '/briefing', icon: <IconLayoutDashboard size={20} />, activeMatch: (path: string) => path.startsWith('/briefing') },
    { name: 'inbox', href: '/mail', icon: <IconMail size={20} />, activeMatch: (path: string) => path === '/mail' || path.startsWith('/mail/') },
    { name: 'people', href: '/people', icon: <IconUsers size={20} />, activeMatch: (path: string) => path.startsWith('/people') },
    { name: 'calendar', href: '/calendar', icon: <IconCalendar size={20} />, activeMatch: (path: string) => path.startsWith('/calendar') },
    { name: 'settings', href: '/settings', icon: <IconSettings size={20} />, activeMatch: (path: string) => path.startsWith('/settings') },
  ];

  return (
    <div className="flex flex-col h-full items-center py-4 justify-between bg-base w-14 border-r border-border select-none">
      <div className="flex flex-col gap-4 items-center w-full">
        {links.map((link) => {
          const isActive = pathname ? link.activeMatch(pathname) : false;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-elevated text-primary' 
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {link.icon}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        {isConnected ? (
          <button onClick={handleDisconnect} className="text-muted hover:text-accent-red transition-colors p-2" title="Disconnect Google Account">
            <IconLogout size={18} />
          </button>
        ) : null}
        
        {isConnected ? (
          <Avatar initials="ME" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-muted border border-border">
            <IconUser size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
