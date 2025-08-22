import React from 'react';
import type { Task } from '@/lib/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, parentId: string | null) => void;
  onBreakDownTask: (taskId: string) => void;
  isAiLoading: boolean;
}

export function TaskList({ tasks, ...props }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No tasks here.</div>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...props} />
      ))}
    </div>
  );
}
