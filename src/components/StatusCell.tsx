
'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';
import { Dot } from './Dot';

interface StatusCellProps {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
  className?: string;
}

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  default: null,
  planned: <Dot className="size-3 text-muted-foreground/50" />,
  completed: <Check className="size-4 text-green-500" />,
  rescheduled: <ArrowRight className="size-4 text-blue-500" />,
  cancelled: <X className="size-4 text-red-500" />,
};

export function StatusCell({ status, onStatusChange, className }: StatusCellProps) {

  return (
    <div
      onClick={() => onStatusChange(status)}
      className={cn(
        'h-12 flex items-center justify-center cursor-pointer transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-center scale-125 relative top-0.5">{statusIcons[status]}</div>
    </div>
  );
}
