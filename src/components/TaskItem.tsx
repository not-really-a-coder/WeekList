'use client';

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Spline, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTaskForm } from './AddTaskForm';
import { Card } from './ui/card';

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, parentId: string | null) => void;
  onBreakDownTask: (taskId: string) => void;
  isAiLoading: boolean;
}

export function TaskItem({ task, onToggleTask, onAddTask, onBreakDownTask, isAiLoading }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card className={cn(
          "group transition-all duration-300",
          task.status === 'done' && 'bg-card/50'
        )}>
        <div className="flex items-center gap-2 p-3">
          <GripVertical className="size-5 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
          <Checkbox
            id={`task-${task.id}`}
            checked={task.status === 'done'}
            onCheckedChange={() => onToggleTask(task.id)}
            className={cn(
              "size-5 rounded-md transition-colors",
              task.status === 'done' && 'border-accent bg-accent text-accent-foreground'
            )}
            aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'not done' : 'done'}`}
          />
          <label
            htmlFor={`task-${task.id}`}
            className={cn('flex-grow text-sm cursor-pointer', task.status === 'done' && 'line-through text-muted-foreground')}
          >
            {task.title}
          </label>
          
          <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 rounded-full data-[state=closed]:-rotate-90 transition-transform">
                <ChevronDown className="size-4" />
                <span className="sr-only">Toggle sub-tasks</span>
              </Button>
            </CollapsibleTrigger>

          {task.status === 'todo' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 rounded-full">
                  <MoreVertical className="size-4" />
                   <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBreakDownTask(task.id)} disabled={isAiLoading}>
                  <Spline className="mr-2 size-4" />
                  Break Down Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
      
      <CollapsibleContent>
          <div className="pl-8 border-l-2 ml-4 border-dashed border-border/80 space-y-2">
              {task.subTasks.map(subTask => (
                  <TaskItem key={subTask.id} task={subTask} onToggleTask={onToggleTask} onAddTask={onAddTask} onBreakDownTask={onBreakDownTask} isAiLoading={isAiLoading} />
              ))}
              {task.status === 'todo' && 
                <AddTaskForm onAddTask={onAddTask} parentId={task.id} />
              }
          </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
