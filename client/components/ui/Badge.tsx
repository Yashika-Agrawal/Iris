export function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'urgent' | 'important' | 'fyi' }) {
  const styles = {
    default: 'bg-elevated text-secondary border border-border',
    urgent: 'bg-accent-red/10 text-accent-red border border-accent-red/20',
    important: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20',
    fyi: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
