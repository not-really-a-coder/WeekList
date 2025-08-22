
'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { StatusCell } from './StatusCell';

interface TaskGridProps {
  tasks: Task[];
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
}

const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function TaskGrid({ tasks, onStatusChange }: TaskGridProps) {
  return (
    <div className="grid grid-cols-8 gap-px bg-border border rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      {dayHeaders.map(day => (
        <div key={day} className="bg-card p-2 text-center font-bold font-headline text-muted-foreground">
          {day}
        </div>
      ))}
      <div className="bg-card p-2 font-bold font-headline text-muted-foreground">Task</div>

      {/* Grid Content */}
      {tasks.map(task => (
        <React.Fragment key={task.id}>
          {weekdays.map(day => (
            <StatusCell
              key={day}
              status={task.statuses[day]}
              onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
            />
          ))}
          <div className="bg-card p-2 flex items-center">
            <p className="text-sm font-medium">{task.title}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
