'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { StatusCell } from './StatusCell';
import { TaskRow } from './TaskRow';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskGridProps {
  tasks: Task[];
  allTasks: Task[];
  selectedTaskId: string | null;
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId:string) => void;
  onToggleDone: (taskId: string) => void;
  onAddTask: () => void;
  onAddTaskAfter: (taskId: string) => void;
  onAddSubTasks: (parentId: string, subTasks: string[]) => void;
  onMoveTask: (dragId: string, hoverId: string) => void;
  onSetTaskParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
  weekDates: Date[];
  onMoveToWeek: (taskId: string, direction: 'next' | 'previous') => void;
  onMoveTaskUpDown: (taskId: string, direction: 'up' | 'down') => void;
  onSelectTask: (taskId: string | null) => void;
}

const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function TaskGrid({
  tasks,
  allTasks,
  selectedTaskId,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onToggleDone,
  onAddTask,
  onAddTaskAfter,
  onAddSubTasks,
  onMoveTask,
  onSetTaskParent,
  getTaskById,
  weekDates,
  onMoveToWeek,
  onMoveTaskUpDown,
  onSelectTask,
}: TaskGridProps) {

  const taskTree = tasks.reduce((acc, task, index) => {
    if (!task.parentId) {
      acc.push(task);
    }
    return acc;
  }, [] as Task[]);


  const renderTask = (task: Task, index: number, level = 0) => {
    const children = allTasks.filter(child => child.id !== task.id && child.parentId === task.id);
    const taskIndexInAllTasks = allTasks.findIndex(t => t.id === task.id);
    const isSelected = selectedTaskId === task.id;
    const isDone = task.title.startsWith('[v]');

    return (
      <React.Fragment key={task.id}>
        <div className="contents group/row" data-state={isSelected ? 'selected' : 'unselected'}>
            {weekdays.map((day) => (
              <div key={day} className={cn("bg-card group-hover/row:bg-muted/50 transition-colors flex items-center justify-center", isSelected ? 'bg-accent/20' : '')}>
                <StatusCell
                  task={task}
                  status={task.statuses[day]}
                  onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
                  disabled={isDone}
                  onSetTaskParent={onSetTaskParent}
                />
              </div>
            ))}
            <div className={cn("bg-card flex items-center col-start-8 group-hover/row:bg-muted/50 transition-colors relative", isSelected ? 'bg-accent/20' : '')}>
              <TaskRow
                task={task}
                index={taskIndexInAllTasks}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onToggleDone={onToggleDone}
                onMove={onMoveTask}
                onSetParent={onSetTaskParent}
                level={level}
                getTaskById={getTaskById}
                tasks={allTasks}
                onMoveToWeek={onMoveToWeek}
                onMoveTaskUpDown={onMoveTaskUpDown}
                onSelectTask={onSelectTask}
                isSelected={isSelected}
                onAddSubTasks={onAddSubTasks}
                onAddTaskAfter={onAddTaskAfter}
              />
            </div>
        </div>
        {children.map((child, childIndex) => renderTask(child, childIndex, level + 1))}
      </React.Fragment>
    );
  };


  return (
    <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,12fr)] gap-px bg-border border md:rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      {dayHeaders.map((day, index) => (
        <div key={index} className="bg-muted p-2 font-bold font-headline text-muted-foreground flex flex-col items-center justify-center text-base">
          <span className="text-sm">{day}</span>
          <span className="text-xs font-normal">{format(weekDates[index], 'd')}</span>
        </div>
      ))}
      <div className="bg-muted p-2 font-bold font-headline text-muted-foreground col-start-8 flex items-center justify-between">
        <span className="text-sm">Task</span>
        <Button size="icon" variant="ghost" onClick={onAddTask} aria-label="Add new task">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Grid Content */}
      {tasks.length > 0 ? (
        taskTree.map((task, index) => renderTask(task, index))
      ) : (
        <div className="col-span-8 bg-card text-center p-12 text-muted-foreground">
          No tasks for this week. Add one or move to a different week.
        </div>
      )}
    </div>
  );
}
