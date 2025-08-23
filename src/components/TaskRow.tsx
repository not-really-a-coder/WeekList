
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, GripVertical, AlertCircle, CheckCircle2, CornerDownRight, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Task } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskRowProps {
  task: Task;
  tasks: Task[];
  index: number;
  level: number;
  onUpdate: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSetParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
  onMoveToWeek: (taskId: string, direction: 'next' | 'previous') => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  level: number;
}

const ItemTypes = {
  TASK: 'task',
};

export function TaskRow({ task, tasks, index, level, onUpdate, onDelete, onToggleDone, onMove, onSetParent, getTaskById, onMoveToWeek }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.isNew);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 24;
  const longPressTimeout = useRef<NodeJS.Timeout>();

  const isImportant = task.title.startsWith('!');
  const displayTitle = isImportant ? task.title.substring(1) : task.title;
  const isParent = tasks.some(t => t.parentId === task.id);

  const handlePressStart = () => {
    longPressTimeout.current = setTimeout(() => {
        setIsEditing(true);
    }, 500); 
  };

  const handlePressEnd = () => {
    if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
    }
  };


  const [{ handlerId, isOverCurrent }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null; isOverCurrent: boolean }>({
    accept: ItemTypes.TASK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      const initialClientOffset = monitor.getInitialClientOffset();
      const currentClientOffset = monitor.getClientOffset();

      if (!initialClientOffset || !currentClientOffset) return;
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      const deltaX = currentClientOffset.x - initialClientOffset.x;
      const isIndenting = deltaX > INDENT_WIDTH;

      // Logic for nesting by dragging right
      if (isIndenting && item.level === 0) {
          const potentialParentIndex = hoverIndex - 1;
          if(potentialParentIndex >= 0) {
            const potentialParentTask = tasks[potentialParentIndex];
            if (potentialParentTask && !potentialParentTask.parentId && potentialParentTask.id !== item.id) {
                onSetParent(item.id, potentialParentTask.id);
                item.level = 1; 
                return; 
            }
          }
      }

      // Prevent dropping on itself
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Vertical reordering logic
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      if (!isIndenting) {
        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: () => {
      return { id: task.id, index, type: ItemTypes.TASK, level };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (task.isNew) {
        inputRef.current.select();
      }
    }
  }, [isEditing, task.isNew]);
  
  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  const handleSave = () => {
    if (title.trim() === '!' || title.trim() === '') {
        onDelete(task.id);
    } else {
        onUpdate(task.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditing(false);
    }
  };
  
  return (
    <div ref={preview} style={{ opacity }} data-handler-id={handlerId} className="w-full">
        <div ref={ref} className={cn('flex items-center w-full p-2 min-h-16 md:min-h-12', isDragging ? 'bg-muted' : '', isOverCurrent && level === 0 && !task.parentId ? 'bg-accent/20' : '')}>
          <div className="hidden md:flex cursor-move p-1 -m-1 opacity-0 group-hover/row:opacity-100 transition-opacity touch-none">
              <GripVertical className="size-4 text-muted-foreground" />
          </div>
          <div className="flex items-center flex-grow min-w-0 gap-2">
            {task.parentId && <CornerDownRight className="size-4 text-muted-foreground shrink-0" />}
            {isEditing ? (
              <>
                <Input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  className="flex-grow mr-2 bg-background"
                />
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Save className="size-4" />
                </Button>
              </>
            ) : (
              <div
                className="flex items-center flex-grow min-w-0 gap-2 select-none touch-none"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onMouseMove={handlePressEnd}
                onTouchMove={handlePressEnd}
              >
                {isImportant && <AlertCircle className="size-4 text-destructive shrink-0" />}
                <p
                  className={cn(
                    "text-base md:text-sm font-medium flex-grow cursor-pointer line-clamp-2",
                    task.isDone && "line-through",
                    isParent && "font-bold"
                  )}
                  onClick={(e) => {
                    const isDesktop = window.innerWidth >= 768;
                    if(isDesktop){
                      setIsEditing(true);
                    }
                  }}
                >
                  {displayTitle}
                </p>
              </div>
            )}
          </div>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onToggleDone(task.id)} 
            className={cn('hidden md:flex transition-opacity', task.isDone ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100')}
          >
            <CheckCircle2 className={cn("size-4", task.isDone ? 'text-green-500' : 'text-muted-foreground')} />
          </Button>

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-100 data-[state=open]:opacity-100 transition-opacity"
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Created: {format(new Date(task.createdAt), 'dd.MM.yyyy')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleDone(task.id)} className="md:hidden">
                   <CheckCircle2 className={cn("mr-2 size-4", task.isDone ? 'text-green-500' : 'text-muted-foreground')} />
                   <span>{task.isDone ? 'Mark as not done' : 'Mark as done'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveToWeek(task.id, 'next')}>
                  <ArrowRight className="mr-2 size-4" />
                  <span>Move to next week</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveToWeek(task.id, 'previous')}>
                  <ArrowLeft className="mr-2 size-4" />
                  <span>Move to previous week</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    <span>Delete task</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  task "{displayTitle}" and all its sub-tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    </div>
  );
}

    