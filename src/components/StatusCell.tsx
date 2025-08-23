
'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';
import { Dot } from './Dot';
import { useDrop } from 'react-dnd';
import type { Task } from '@/lib/types';


interface StatusCellProps {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
  className?: string;
  disabled?: boolean;
  onSetParent?: (childId: string, parentId: string | null) => void;
  task: Task;
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

export function StatusCell({ status, onStatusChange, className, disabled = false, onSetParent, task }: StatusCellProps) {

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: ItemTypes.TASK,
    drop: (item, monitor) => {
        if (onSetParent && task.parentId) {
            onSetParent(task.id, null);
        }
    },
    canDrop: (item, monitor) => {
        return item.id === task.id && !!task.parentId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && monitor.canDrop(),
    }),
  }), [task, onSetParent]);


  return (
    <div
      ref={drop}
      onClick={() => !disabled && onStatusChange(status)}
      className={cn(
        'h-full w-full flex items-center justify-center transition-colors',
        !disabled && 'cursor-pointer',
        disabled && 'opacity-40',
        className
      )}
    >
      <div className="flex items-center justify-center scale-125 relative top-0.5">{statusIcons[status]}</div>
    </div>
  );
}
