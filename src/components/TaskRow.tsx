
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, GripVertical, AlertCircle, CheckCircle2, CornerDownRight, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Indent, Outdent } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskRowProps {
  task: Task;
  tasks: Task[];
  index: number;
  level: number;
  isSelected: boolean;
  onUpdate: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSetParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
  onMoveToWeek: (taskId: string, direction: 'next' | 'previous') => void;
  onMoveTaskUpDown: (taskId: string, direction: 'up' | 'down') => void;
  onSelectTask: (taskId: string | null) => void;
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

export function TaskRow({ task, tasks, index, level, isSelected, onUpdate, onDelete, onToggleDone, onMove, onSetParent, getTaskById, onMoveToWeek, onMoveTaskUpDown, onSelectTask }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.isNew);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 8;
  
  const isImportant = task.title.startsWith('!');
  const displayTitle = isImportant ? task.title.substring(1) : task.title;
  const isParent = tasks.some(t => t.parentId === task.id);
  
  const isMobile = useIsMobile();
  const longPressTimer = useRef<NodeJS.Timeout>();
  
  const siblings = tasks.filter(t => t.parentId === task.parentId);
  const mySiblingIndex = siblings.findIndex(t => t.id === task.id);
  const isFirstSibling = mySiblingIndex === 0;
  const isLastSibling = mySiblingIndex === siblings.length - 1;
  
  const canUnindent = !!task.parentId;
  // A task can be indented if it's not a parent itself and the task above it is not a child.
  const canIndent = !isParent && index > 0 && tasks[index-1] && !tasks[index-1].parentId;


  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.TASK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
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

      if (dragIndex === hoverIndex) {
        return;
      }
      
      if (!initialClientOffset || !currentClientOffset) return;
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      const deltaX = currentClientOffset.x - initialClientOffset.x;
      const isIndenting = deltaX > INDENT_WIDTH * 4;
      const isUnindenting = deltaX < -INDENT_WIDTH * 4;
      
      const dragItem = tasks.find(t => t.id === item.id);
      if(!dragItem) return;

      const hoverItemCanBeParent = !task.parentId;
      const dragItemCanBeChild = !tasks.some(t => t.parentId === dragItem.id);
      
      if (isIndenting && hoverItemCanBeParent && dragItemCanBeChild && dragItem.id !== task.id) {
          onSetParent(dragItem.id, task.id);
          return;
      }
      
      if (isUnindenting && dragItem.parentId) {
          onSetParent(dragItem.id, null);
          return;
      }


      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
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
  drop(preview(ref));
  

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
      if(task.isNew){
        onDelete(task.id);
      }
    }
  };
  
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isDone && !isMobile) {
      setIsEditing(true);
      onSelectTask(task.id);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onSelectTask(task.id);
    longPressTimer.current = setTimeout(() => {
      if (!task.isDone) {
        setIsEditing(true);
      }
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if(longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  
  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      onSelectTask(task.id);
    } else {
      onSelectTask(task.id);
    }
  };


  return (
    <div 
      ref={ref} 
      style={{ opacity }} 
      data-handler-id={handlerId} 
      className={cn("w-full", isSelected ? 'bg-accent/20' : '')}
      onClick={handleRowClick}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onTouchMove={isMobile ? handleTouchEnd : undefined}
    >
        <div className={cn('flex items-center w-full p-2 min-h-14 md:min-h-12', isDragging ? 'bg-muted' : '')}>
            <div
                className='flex items-center flex-grow min-w-0 gap-2'
            >
                <div 
                  ref={drag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(task.id)
                  }}
                  className='flex p-1 -m-1 transition-opacity opacity-25 cursor-grab md:opacity-0 group-hover/row:opacity-100 touch-none'
                >
                    <GripVertical className="size-4 text-muted-foreground" />
                </div>
                <div className="flex items-center flex-grow min-w-0 gap-2" style={{ paddingLeft: `${level * INDENT_WIDTH}px` }}>
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
                      className="flex items-center flex-grow min-w-0 gap-2 select-none"
                      onClick={handleTitleClick}
                    >
                      {isImportant && <AlertCircle className="size-4 text-destructive shrink-0" />}
                      <p
                        className={cn(
                          "text-[0.9rem] md:text-sm font-medium flex-grow line-clamp-2",
                          task.isDone && "line-through",
                          isParent && "font-bold"
                        )}
                      >
                        {displayTitle}
                      </p>
                    </div>
                  )}
                </div>
            </div>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); onToggleDone(task.id); }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(task.id)
                  }}
                  className="transition-opacity md:opacity-0 group-hover/row:opacity-100 data-[state=open]:opacity-100"
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Created: {format(new Date(task.createdAt), 'dd.MM.yyyy')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleDone(task.id)} className="md:hidden">
                   <CheckCircle2 className={cn("mr-2 size-4", task.isDone ? 'text-green-500' : 'text-muted-foreground')} />
                   <span>{task.isDone ? 'Mark as not done' : 'Mark as done'}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'up')} disabled={isFirstSibling}>
                    <ArrowUp className="mr-2 size-4" />
                    <span>Move Up</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'down')} disabled={isLastSibling}>
                    <ArrowDown className="mr-2 size-4" />
                    <span>Move Down</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onSetParent(task.id, canUnindent ? null : (tasks[index-1] ? tasks[index-1].id : null))} disabled={!canIndent && !canUnindent}>
                    {canUnindent ? <Outdent className="mr-2 size-4" /> : <Indent className="mr-2 size-4" />}
                    <span>{canUnindent ? 'Un-indent' : 'Indent'}</span>
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
