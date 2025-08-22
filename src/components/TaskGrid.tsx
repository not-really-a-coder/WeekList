'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { StatusCell } from './StatusCell';
import { TaskRow } from './TaskRow';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface TaskGridProps {
  tasks: Task[];
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId:string) => void;
  onAddTask: () => void;
  onMoveTask: (dragIndex: number, hoverIndex: number) => void;
  onSetTaskParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
}

const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function TaskGrid({
  tasks,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onMoveTask,
  onSetTaskParent,
  getTaskById,
}: TaskGridProps) {
  const taskTree = tasks.filter(task => !task.parentId);

  const renderTask = (task: Task, index: number, allTasks: Task[], level = 0) => {
    const children = allTasks.filter(child => child.id !== task.id && child.parentId === task.id);
    const taskIndex = allTasks.findIndex(t => t.id === task.id);

    return (
      <React.Fragment key={task.id}>
        <div className="col-span-8 contents">
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
                index={taskIndex}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                onSetParent={onSetTaskParent}
                level={level}
                getTaskById={getTaskById}
              />
            </div>
        </div>

        {children.map(child => renderTask(child, index, allTasks, level + 1))}
      </React.Fragment>
    );
  };


  return (
    <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,14fr)] gap-px bg-border border rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      {dayHeaders.map((day, index) => (
        <div key={index} className="bg-card p-2 text-center font-bold font-headline text-muted-foreground">
          {day}
        </div>
      ))}
      <div className="bg-card p-2 font-bold font-headline text-muted-foreground col-start-8 flex items-center justify-between">
        <span>Task</span>
        <Button size="icon" variant="ghost" onClick={onAddTask} aria-label="Add new task">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Grid Content */}
      {tasks.length > 0 ? (
        taskTree.map((task, index) => renderTask(task, index, tasks))
      ) : (
        <div className="col-span-8 bg-card text-center p-12 text-muted-foreground">
          No tasks yet. Add one to get started!
        </div>
      )}
    </div>
  );
}
