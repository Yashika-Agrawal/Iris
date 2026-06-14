import { CalEvent } from '../../types';

const COLORS = [
  { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500' },
];

export function EventBlock({ event, layoutInfo }: { event: CalEvent; layoutInfo?: { column: number; totalColumns: number } }) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;
  
  // Hash to pick a consistent color per event
  const hash = event.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + event.id.length;
  const color = COLORS[hash % COLORS.length];

  const column = layoutInfo?.column || 0;
  const totalColumns = layoutInfo?.totalColumns || 1;
  const widthPercent = 100 / totalColumns;
  const leftPercent = column * widthPercent;

  return (
    <div 
      className={`absolute ${color.bg} border-l-[3px] ${color.border} rounded p-1.5 overflow-hidden backdrop-blur-md transition-all hover:z-50 shadow-sm`}
      style={{
        top: `${startMinutes}px`,
        height: `${durationMinutes}px`,
        width: `calc(${widthPercent}% - 2px)`,
        left: `calc(${leftPercent}% + 1px)`
      }}
    >
      <div className={`text-[11px] font-bold ${color.text} truncate leading-tight`}>{event.title}</div>
      <div className={`text-[9px] ${color.text} opacity-90 truncate leading-tight mt-0.5 font-mono`}>
        {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
    </div>
  );
}
