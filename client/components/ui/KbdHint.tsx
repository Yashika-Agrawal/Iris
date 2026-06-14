export function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 bg-elevated border border-border rounded text-[10px] text-muted font-mono inline-flex items-center">
      {children}
    </kbd>
  );
}
