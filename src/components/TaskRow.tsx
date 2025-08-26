
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, GripVertical, AlertCircle, CheckCircle2, CornerDownRight, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Indent, Outdent, Wand2 } from 'lucide-react';
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
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { handleBreakDownTask } from '@/app/actions';


interface TaskRowProps {
  task: Task;
  tasks: Task[];
  index: number;
  level: number;
  isSelected: boolean;
  onUpdate: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
  onMove: (dragId: string, hoverId: string) => void;
  onSetParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
  onMoveToWeek: (taskId: string, direction: 'next' | 'previous') => void;
  onMoveTaskUpDown: (taskId: string, direction: 'up' | 'down') => void;
  onSelectTask: (taskId: string | null) => void;
  onAddSubTasks: (parentId: string, subTasks: string[]) => void;
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

export function TaskRow({ task, tasks, index, level, isSelected, onUpdate, onDelete, onToggleDone, onMove, onSetParent, getTaskById, onMoveToWeek, onMoveTaskUpDown, onSelectTask, onAddSubTasks }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.isNew);
  const [editableTitle, setEditableTitle] = useState(task.title.substring(task.title.indexOf(']') + 2));
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 8;
  
  const isDone = task.title.startsWith('[v]');
  const taskText = task.title.substring(task.title.indexOf(']') + 2);
  const isImportant = taskText.startsWith('!');
  const displayTitle = isImportant ? taskText.substring(1) : taskText;
  const isParent = tasks.some(t => t.parentId === task.id);
  
  const isMobile = useIsMobile();
  const longPressTimer = useRef<NodeJS.Timeout>();
  
  const siblings = tasks.filter(t => t.parentId === task.parentId);
  const mySiblingIndex = siblings.findIndex(t => t.id === task.id);
  
  const canUnindent = !!task.parentId;
  
  const taskAbove = index > 0 ? tasks[index - 1] : null;
  const canIndent = !isParent && index > 0 && taskAbove && !taskAbove.parentId;


  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.TASK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    canDrop(item, monitor) {
      if (!ref.current) return false;
      // Allow dropping as long as it's not on itself.
      // The detailed logic for indent/unindent/reorder is in the drop handler.
      return item.id !== task.id;
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
        if (!ref.current) return;

        const dragId = item.id;
        const hoverId = task.id;

        if (dragId === hoverId) return;
        
        const clientOffset = monitor.getClientOffset();
        const initialClientOffset = monitor.getInitialClientOffset();
        if (!clientOffset || !initialClientOffset) return;

        const deltaX = clientOffset.x - initialClientOffset.x;
        const isIndenting = deltaX > INDENT_WIDTH * 4;
        
        const dragItem = getTaskById(dragId);
        const hoverItem = getTaskById(hoverId);

        if (!dragItem || !hoverItem) return;
        
        const canDragItemBeChild = !tasks.some(t => t.parentId === dragId);
        const canHoverItemBeParent = !hoverItem.parentId;
        
        // Indent Action
        if (isIndenting && canDragItemBeChild && canHoverItemBeParent) {
            onSetParent(dragId, hoverId);
            return; // Prevent reordering if indenting
        }
        
        const isUnindenting = deltaX < -(INDENT_WIDTH * 4);
        
        // Un-indent Action
        if (isUnindenting && dragItem.parentId) {
            onSetParent(dragId, null);
            return; // Prevent reordering if un-indenting
        }

        // Default: Reorder Action
        onMove(dragId, hoverId);
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) return;

      const dragId = item.id;
      const hoverId = task.id;
      
      if (dragId === hoverId) return;
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const deltaX = clientOffset.x - (monitor.getInitialClientOffset()?.x || 0);
      if (Math.abs(deltaX) > INDENT_WIDTH * 2) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      const dragIndex = tasks.findIndex(t => t.id === dragId);
      const hoverIndex = tasks.findIndex(t => t.id === hoverId);
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragId, hoverId);
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
      // For new tasks, select the text so user can start typing immediately
      if (task.isNew) {
        inputRef.current.select();
      }
    }
  }, [isEditing, task.isNew]);
  
  useEffect(() => {
    // When the original task title changes from outside, update the editable title
    setEditableTitle(task.title.substring(task.title.indexOf(']') + 2));
  }, [task.title]);

  const handleSave = () => {
    const trimmedTitle = editableTitle.trim();
    if (trimmedTitle === '' || trimmedTitle === '!') {
        onDelete(task.id);
    } else {
        const titlePrefix = task.title.substring(0, task.title.indexOf(']') + 1);
        const newTitle = `${titlePrefix} ${trimmedTitle}`;
        onUpdate(task.id, newTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      // Revert to original title on escape
      setEditableTitle(task.title.substring(task.title.indexOf(']') + 2));
      setIsEditing(false);
      // If it was a new task, delete it on escape
      if(task.isNew){
        onDelete(task.id);
      }
    }
  };
  
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone && !isMobile) {
      setIsEditing(true);
      onSelectTask(task.id);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onSelectTask(task.id);
    longPressTimer.current = setTimeout(() => {
      if (!isDone) {
        setIsEditing(true);
      }
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if(longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  
  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTask(task.id);
  };

  const handleBreakdownClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsBreakingDown(true);
      try {
          const subTasks = await handleBreakDownTask(taskText);
          onAddSubTasks(task.id, subTasks);
      } catch (error) {
          console.error("Failed to break down task", error);
      } finally {
          setIsBreakingDown(false);
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
                  className='flex p-0 -m-1 transition-opacity opacity-25 cursor-grab md:opacity-0 group-hover/row:opacity-100 touch-none'
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
                        value={editableTitle}
                        onChange={(e) => setEditableTitle(e.target.value)}
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
                          isDone && "line-through text-muted-foreground",
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
            className={cn('hidden md:flex transition-opacity', isDone ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100')}
          >
            <CheckCircle2 className={cn("size-4", isDone ? 'text-green-500' : 'text-muted-foreground')} />
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
                   <CheckCircle2 className={cn("mr-2 size-4", isDone ? 'text-green-500' : 'text-muted-foreground')} />
                   <span>{isDone ? 'Mark as not done' : 'Mark as done'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBreakdownClick} disabled={isBreakingDown || isDone}>
                   <Wand2 className={cn("mr-2 size-4", isBreakingDown && "animate-pulse")} />
                   <span>Break down task</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'up')} disabled={mySiblingIndex === 0 && !task.parentId && index === 0}>
                    <ArrowUp className="mr-2 size-4" />
                    <span>Move Up</span>
                    <DropdownMenuShortcut>Ctrl+↑</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'down')} disabled={index === tasks.length - 1}>
                    <ArrowDown className="mr-2 size-4" />
                    <span>Move Down</span>
                    <DropdownMenuShortcut>Ctrl+↓</DropdownMenuShortcut>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    if (canUnindent) {
                      onSetParent(task.id, null);
                    } else if (canIndent && taskAbove) {
                      onSetParent(task.id, taskAbove.id);
                    }
                  }} 
                  disabled={!canIndent && !canUnindent}
                >
                    {canUnindent ? <Outdent className="mr-2 size-4" /> : <Indent className="mr-2 size-4" />}
                    <span>{canUnindent ? 'Un-indent' : 'Indent'}</span>
                    <DropdownMenuShortcut>Tab</DropdownMenuShortcut>
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
