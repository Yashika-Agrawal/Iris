import React from 'react';

interface LoaderProps {
  label?: string;
  sublabel?: string;
}

export function Loader({ label = "Iris is synthesizing...", sublabel = "Loading content" }: LoaderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-base">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-t-2 border-accent-blue animate-spin w-12 h-12 m-auto opacity-70"></div>
        <div className="absolute inset-0 rounded-full border-r-2 border-accent-blue animate-spin w-12 h-12 m-auto opacity-40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="w-3 h-3 bg-accent-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-primary text-sm font-semibold tracking-wide">{label}</div>
        <div className="text-secondary text-xs font-mono tracking-widest uppercase animate-pulse">
          {sublabel}
        </div>
      </div>
    </div>
  );
}
