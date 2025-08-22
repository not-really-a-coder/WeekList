
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
    <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,4fr)] gap-px bg-border border rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      {dayHeaders.map((day, index) => (
        <div key={index} className="bg-card p-2 text-center font-bold font-headline text-muted-foreground">
          {day}
        </div>
      ))}
      <div className="bg-card p-2 font-bold font-headline text-muted-foreground col-start-8">Task</div>

      {/* Grid Content */}
      {tasks.map(task => (
        <React.Fragment key={task.id}>
          {weekdays.map((day, index) => (
            <div key={day} className={`col-start-${index + 1}`}>
              <StatusCell
                status={task.statuses[day]}
                onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
              />
            </div>
          ))}
          <div className="bg-card p-2 flex items-center col-start-8">
            <p className="text-sm font-medium">{task.title}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
