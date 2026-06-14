'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLayoutDashboard, IconMail, IconCalendar, IconUsers, IconSettings } from '@tabler/icons-react';
import { Avatar } from '../ui/Avatar';

export function NavRail() {
  const pathname = usePathname();

  const links = [
    { name: 'briefing', href: '/briefing', icon: <IconLayoutDashboard size={20} />, activeMatch: (path: string) => path.startsWith('/briefing') },
    { name: 'inbox', href: '/mail', icon: <IconMail size={20} />, activeMatch: (path: string) => path === '/mail' || path.startsWith('/mail/') },
    { name: 'people', href: '/people', icon: <IconUsers size={20} />, activeMatch: (path: string) => path.startsWith('/people') },
    { name: 'calendar', href: '/calendar', icon: <IconCalendar size={20} />, activeMatch: (path: string) => path.startsWith('/calendar') },
    { name: 'settings', href: '/settings', icon: <IconSettings size={20} />, activeMatch: (path: string) => path.startsWith('/settings') },
  ];


  return (
    <div className="flex flex-col h-full items-center py-4 justify-between bg-base w-12 border-r border-border select-none">
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
      <div className="mt-auto">
        <Avatar initials="YA" />
      </div>
    </div>
  );
}
