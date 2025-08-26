import React from 'react';
import { ScrollArea } from './ui/scroll-area';

interface DebugWindowProps {
  logs: string[];
}

export function DebugWindow({ logs }: DebugWindowProps) {
  return (
    <ScrollArea className="h-64 w-full rounded-md border bg-muted p-4">
      <div className="text-sm font-mono">
        {logs.map((log, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {log}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}
