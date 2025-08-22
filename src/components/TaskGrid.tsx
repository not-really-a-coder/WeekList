'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { StatusCell } from './StatusCell';
import { TaskRow } from './TaskRow';

interface TaskGridProps {
  tasks: Task[];
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId:string) => void;
}

const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function TaskGrid({ tasks, onStatusChange, onUpdateTask, onDeleteTask }: TaskGridProps) {
  return (
    <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,14fr)] gap-px bg-border border rounded-lg overflow-hidden shadow-lg">
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
          {weekdays.map((day) => (
            <div key={day}>
              <StatusCell
                status={task.statuses[day]}
                onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
              />
            </div>
          ))}
          <div className="bg-card flex items-center col-start-8 group">
            <TaskRow
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
