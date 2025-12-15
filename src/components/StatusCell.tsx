
'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';
import { Dot } from './Dot';
import { useDrop } from 'react-dnd';
import type { Task } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';


interface StatusCellProps {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
  className?: string;
  disabled?: boolean;
  onSetTaskParent?: (childId: string, parentId: string | null) => void;
  task: Task;
  isReadOnly?: boolean;
}

const ItemTypes = {
  TASK: 'task',
};

interface DragItem {
  index: number;
  id: string;
  type: string;
  level: number;
}


const statusIcons: Record<TaskStatus, React.ReactNode> = {
  default: null,
  planned: <Dot className="size-3 text-muted-foreground/50" />,
  completed: <Check className="size-4 text-green-500" />,
  rescheduled: <ArrowRight className="size-4 text-blue-500" />,
  cancelled: <X className="size-4 text-red-500" />,
};

export function StatusCell({ status, onStatusChange, className, disabled = false, onSetTaskParent, task, isReadOnly = false }: StatusCellProps) {

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: ItemTypes.TASK,
    drop: (item, monitor) => {
      if (onSetTaskParent && task.parentId) {
        onSetTaskParent(task.id, null);
      }
    },
    canDrop: (item, monitor) => {
      return !disabled && item.id === task.id && !!task.parentId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && monitor.canDrop(),
    }),
  }), [task, onSetTaskParent, disabled]);


  const commonClasses = cn(
    'h-full w-full flex items-center justify-center transition-colors',
    !disabled && 'cursor-pointer',
    disabled && 'opacity-40',
    className
  );

  const iconContent = (
    <div className="flex items-center justify-center scale-125 relative top-0.5">{statusIcons[status]}</div>
  );

  if (disabled || status === 'default') {
    return (
      <div
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        onClick={() => !disabled && status === 'default' && onStatusChange('planned')}
        className={commonClasses}
      >
        {iconContent}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
          className={commonClasses}
        >
          {iconContent}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => onStatusChange('planned')}>
          <div className="flex items-center gap-2"><Dot className="size-3 text-muted-foreground/50" /> Planned</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('rescheduled')}>
          <div className="flex items-center gap-2"><ArrowRight className="size-4 text-blue-500" /> Rescheduled</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('completed')}>
          <div className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Completed</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
          <div className="flex items-center gap-2"><X className="size-4 text-red-500" /> Cancelled</div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onStatusChange('default')}>
          Clear
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
