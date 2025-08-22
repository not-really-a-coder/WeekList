'use client';

import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeekDayColumnProps {
  dayTitle: string;
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  selectedTask: Task | null;
}

export function WeekDayColumn({ dayTitle, tasks, onTaskSelect, selectedTask }: WeekDayColumnProps) {
  return (
    <div className="bg-card flex flex-col">
      <div className="p-2 text-center border-b border-border">
        <h2 className="font-bold font-headline">{dayTitle}</h2>
      </div>
      <div className="p-2 space-y-2 flex-grow">
        {tasks.map(task => (
          <Card
            key={task.id}
            onClick={() => onTaskSelect(task)}
            className={cn(
              'cursor-pointer hover:bg-muted/50 transition-colors',
              selectedTask?.id === task.id && 'bg-primary text-primary-foreground',
              task.status === 'done' && 'opacity-50'
            )}
          >
            <CardContent className="p-2">
              <p className={cn("text-sm", selectedTask?.id === task.id ? "" : "text-card-foreground", task.status === 'done' && 'line-through')}>
                {task.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
