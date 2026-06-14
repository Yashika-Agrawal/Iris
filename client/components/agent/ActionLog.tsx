'use client';
import { motion } from 'framer-motion';

export interface ActionLine {
  id: string;
  status: 'done' | 'active' | 'pending';
  text: string;
}

interface ActionLogProps {
  logs: ActionLine[];
}

export function ActionLog({ logs }: ActionLogProps) {
  return (
    <div className="flex flex-col gap-2.5 px-5 py-4 bg-[#0d0d0d] border-t border-border font-mono text-[11px] select-none">
      {logs.map((log, index) => {
        const isDone = log.status === 'done';
        const isActive = log.status === 'active';

        return (
          <motion.div
            key={log.id || index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2.5 leading-normal ${
              isDone ? 'text-[#333]' : isActive ? 'text-primary' : 'text-muted'
            }`}
          >
            {isDone && (
              <span className="text-accent-green shrink-0 font-bold">✓</span>
            )}
            {isActive && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-blue"></span>
              </span>
            )}
            {!isDone && !isActive && (
              <span className="text-muted shrink-0">•</span>
            )}
            <span>{log.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
