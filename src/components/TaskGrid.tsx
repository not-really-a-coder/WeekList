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
  showWeekends: boolean;
  weeklyTasksCount: number;
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
  showWeekends,
  weeklyTasksCount,
}: TaskGridProps) {

  const taskTree = tasks.reduce((acc, task, index) => {
    if (!task.parentId) {
      acc.push(task);
    }
    return acc;
  }, [] as Task[]);

  const visibleWeekdays = showWeekends ? weekdays : weekdays.slice(0, 5);
  const taskColumnSpan = showWeekends ? 'col-start-8' : 'col-start-6';
  const taskHeaderSpan = showWeekends ? 'col-start-8' : 'col-start-6';
  const gridColsClass = showWeekends 
    ? 'grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,12fr)]' 
    : 'grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,14fr)]';

  const renderTask = (task: Task, index: number, level = 0) => {
    const children = allTasks.filter(child => child.id !== task.id && child.parentId === task.id);
    const taskIndexInAllTasks = allTasks.findIndex(t => t.id === task.id);
    const isSelected = selectedTaskId === task.id;
    const isDone = task.title.startsWith('[v]');
    const isLastTask = index === tasks.length -1;


    return (
      <React.Fragment key={task.id}>
        <div className="contents group/row" data-state={isSelected ? 'selected' : 'unselected'}>
            {visibleWeekdays.map((day, dayIndex) => (
              <div key={day} className={cn(
                  "bg-card group-hover/row:bg-muted/50 transition-colors flex items-center justify-center", 
                  isSelected ? 'bg-accent/20' : '',
                  isLastTask && dayIndex === 0 && "md:rounded-bl-lg",
                  isLastTask && dayIndex === visibleWeekdays.length - 1 && "hidden" // handled by TaskRow
                )}>
                <StatusCell
                  task={task}
                  status={task.statuses[day]}
                  onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
                  disabled={isDone}
                  onSetTaskParent={onSetTaskParent}
                />
              </div>
            ))}
            <div className={cn("bg-card flex items-center group-hover/row:bg-muted/50 transition-colors relative", 
                taskColumnSpan, 
                isSelected ? 'bg-accent/20' : '',
                isLastTask && "md:rounded-br-lg"
              )}>
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
        {children.map((child, childIndex) => renderTask(child, tasks.findIndex(t => t.id === child.id), level + 1))}
      </React.Fragment>
    );
  };


  return (
    <div className={cn("grid gap-px bg-border border md:rounded-lg shadow-lg", gridColsClass)} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      {dayHeaders.slice(0, showWeekends ? 7 : 5).map((day, index) => (
        <div key={index} className={cn(
          "bg-muted p-2 font-bold font-headline text-muted-foreground flex flex-col items-center justify-center text-base sticky top-14 z-10",
          index === 0 && "md:rounded-tl-lg",
        )}>
          <span className="text-sm">{day}</span>
          <span className="text-xs font-normal">{format(weekDates[index], 'd')}</span>
        </div>
      ))}
      <div className={cn(
          "bg-muted p-2 font-bold font-headline text-muted-foreground flex items-center justify-between sticky top-14 z-10 md:rounded-tr-lg", 
          taskHeaderSpan
        )}>
        <span className="text-sm">Task</span>
        <Button size="icon" variant="ghost" onClick={onAddTask} aria-label="Add new task">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Grid Content */}
      {tasks.length > 0 ? (
        taskTree.map((task, index) => renderTask(task, tasks.findIndex(t => t.id === task.id)))
      ) : (
        <div className={cn("bg-card text-center p-12 text-muted-foreground md:rounded-b-lg", showWeekends ? "col-span-8" : "col-span-6")}>
          No tasks for this week. Add one or move to a different week.
        </div>
      )}
    </div>
  );
}
