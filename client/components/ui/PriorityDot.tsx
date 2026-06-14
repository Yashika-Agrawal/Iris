export function PriorityDot({ priority }: { priority?: 'urgent' | 'important' | 'fyi' }) {
  if (!priority) return null;
  const colors = {
    urgent: 'bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    important: 'bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    fyi: 'bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[priority]} flex-shrink-0`} />;
}
