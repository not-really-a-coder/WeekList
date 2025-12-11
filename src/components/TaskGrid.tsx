
'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { StatusCell } from './StatusCell';
import { TaskRow } from './TaskRow';
import { Button } from './ui/button';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';



interface TaskGridProps {
  tasks: Task[];
  allTasks: Task[];
  selectedTaskId: string | null;
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId: string) => void;
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
  onToggleWeekends: () => void;
  weeklyTasksCount: number;
  today: Date;
  isPrint?: boolean;
  isAIFeatureEnabled?: boolean;
  hideCompleted?: boolean;
  onToggleHideCompleted?: () => void;
  fitToScreen?: boolean;
  onToggleFitToScreen?: () => void;
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
  onToggleWeekends,
  weeklyTasksCount,
  today,
  isPrint = false,
  isAIFeatureEnabled = false,
  hideCompleted = false,
  onToggleHideCompleted,
  fitToScreen = false,
  onToggleFitToScreen,
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
  const rowColumnSpan = showWeekends ? 'col-span-8' : 'col-span-6';

  const renderTask = (task: Task, index: number, level = 0) => {
    const isDone = task.title.startsWith('[v]');
    if (hideCompleted && isDone) {
      return null;
    }

    const children = allTasks.filter(child => child.id !== task.id && child.parentId === task.id);
    const taskIndexInAllTasks = allTasks.findIndex(t => t.id === task.id);
    const isSelected = selectedTaskId === task.id;
    const isLastTask = index === weeklyTasksCount - 1;


    return (
      <React.Fragment key={task.id}>
        <div className={cn(
          "contents group/row",
        )} data-state={isSelected ? 'selected' : 'unselected'}>
          {visibleWeekdays.map((day, dayIndex) => (
            <div key={day} className={cn(
              "bg-card transition-colors flex items-center justify-center relative",
              "group-data-[state=selected]/row:bg-accent/100",
              isLastTask && dayIndex === 0 && "rounded-bl-lg"
            )}>
              <StatusCell
                task={task}
                status={task.statuses[day]}
                onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
                disabled={isDone || isPrint}
                onSetTaskParent={onSetTaskParent}
              />
            </div>
          ))}
          <div className={cn("bg-card flex items-center transition-colors relative",
            taskColumnSpan,
            "group-data-[state=selected]/row:bg-accent/100",
            isLastTask && "rounded-br-lg"
          )}>
            <TaskRow
              isPrint={isPrint}
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
              isAIFeatureEnabled={isAIFeatureEnabled}
            />
          </div>
        </div>
        {children.map((child, childIndex) => renderTask(child, tasks.findIndex(t => t.id === child.id), level + 1))}
      </React.Fragment>
    );
  };



  return (
    <div className={cn(
      "grid gap-px bg-border border rounded-lg relative",
      gridColsClass,
      !fitToScreen && "min-w-[620px]"
    )} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      {dayHeaders.slice(0, showWeekends ? 7 : 5).map((day, index) => {
        const isToday = isSameDay(weekDates[index], today);
        return (
          <div key={index} className={cn(
            "bg-muted p-2 font-bold font-headline text-muted-foreground flex flex-col items-center justify-center text-base",
            index === 0 && "rounded-tl-lg",
            isToday && !isPrint && "border-b-2 border-primary"
          )}>
            <span className="text-sm">{day}</span>
            <span className="text-xs font-normal">{format(weekDates[index], 'd')}</span>
          </div>
        )
      })}
      <div className={cn(
        "bg-muted p-2 font-bold font-headline text-muted-foreground flex items-center justify-between rounded-tr-lg",
        taskHeaderSpan,
      )}>
        <div className='flex items-center gap-2'>
          <span className="text-sm">Task</span>
          {!isPrint && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <SlidersHorizontal className="size-4" />
                  <span className="sr-only">View options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem
                  checked={showWeekends}
                  onSelect={(e) => e.preventDefault()}
                  onClick={onToggleWeekends}
                >
                  Show Weekends
                </DropdownMenuCheckboxItem>
                {onToggleHideCompleted && (
                  <DropdownMenuCheckboxItem
                    checked={hideCompleted}
                    onSelect={(e) => e.preventDefault()}
                    onClick={onToggleHideCompleted}
                  >
                    Hide Closed
                  </DropdownMenuCheckboxItem>
                )}
                {onToggleFitToScreen && (
                  <DropdownMenuCheckboxItem
                    checked={fitToScreen}
                    onClick={onToggleFitToScreen}
                  >
                    Fit to screen
                  </DropdownMenuCheckboxItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {!isPrint && (
          <Button size="icon" variant="ghost" onClick={onAddTask} aria-label="Add new task">
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {/* Grid Content */}
      {tasks.length > 0 ? (
        taskTree.map((task, index) => renderTask(task, tasks.findIndex(t => t.id === task.id)))
      ) : (
        <div className={cn("bg-card text-center p-12 text-muted-foreground rounded-b-lg", showWeekends ? "col-span-8" : "col-span-6")}>
          No tasks for this week. Add one or move to a different week.
        </div>
      )}
    </div>
  );
}



