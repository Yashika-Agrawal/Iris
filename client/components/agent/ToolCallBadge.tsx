export function ToolCallBadge({ service, label }: { service: 'gmail'|'gcal', label: string }) {
  const styles = service === 'gmail' 
    ? 'bg-[#1a1f2e] text-[#60a5fa]' 
    : 'bg-[#1a2e1a] text-[#4ade80]';
  
  return (
    <div className={`mt-2 inline-flex px-2 py-1 rounded text-xs font-medium ${styles}`}>
      {service === 'gmail' ? 'Gmail: ' : 'GCal: '}{label}
    </div>
  );
}
