
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, GripVertical, CheckCircle2, CornerDownRight, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Indent, Outdent, Wand2, PlusCircle } from 'lucide-react';
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
import { ExclamationMark } from './ExclamationMark';



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
  onAddTaskAfter: (taskId: string) => void;
  isPrint?: boolean;
  isAIFeatureEnabled?: boolean;
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

export function TaskRow({ task, tasks, index, level, isSelected, onUpdate, onDelete, onToggleDone, onMove, onSetParent, getTaskById, onMoveToWeek, onMoveTaskUpDown, onSelectTask, onAddSubTasks, onAddTaskAfter, isPrint = false, isAIFeatureEnabled = false }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.isNew);
  const [editableTitle, setEditableTitle] = useState(task.title.substring(task.title.indexOf(']') + 2));
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 6;

  const isDone = task.title.startsWith('[v]');
  const taskText = task.title.substring(task.title.indexOf(']') + 2);
  const isImportant = taskText.startsWith('!');
  const displayTitle = isImportant ? taskText.substring(1) : taskText;
  const isParent = tasks.some(t => t.parentId === task.id);

  const isMobile = useIsMobile();

  const allWeeklyTasks = tasks.filter(t => t.week === task.week);
  const myNavigableIndex = allWeeklyTasks.findIndex(t => t.id === task.id);

  const canUnindent = !!task.parentId;

  const taskAbove = myNavigableIndex > 0 ? allWeeklyTasks[myNavigableIndex - 1] : null;
  const canIndent = !isParent && myNavigableIndex > 0 && taskAbove;


  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.TASK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    canDrop(item, monitor) {
      if (!ref.current || isPrint) return false;
      return true;
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current || isPrint) return;

      const dragId = item.id;
      const hoverId = task.id;

      const clientOffset = monitor.getClientOffset();
      const initialClientOffset = monitor.getInitialClientOffset();
      if (!clientOffset || !initialClientOffset) return;

      const deltaX = clientOffset.x - initialClientOffset.x;

      const dragItem = getTaskById(dragId);
      if (!dragItem) return;

      const canDragItemBeChild = !tasks.some(t => t.parentId === dragId);

      const isIndenting = deltaX > INDENT_WIDTH * 4;

      if (isIndenting && canDragItemBeChild && myNavigableIndex > 0) {
        const taskToIndentUnder = allWeeklyTasks[myNavigableIndex - 1];

        if (dragId === hoverId && taskToIndentUnder) {
          onSetParent(dragId, taskToIndentUnder.parentId ? taskToIndentUnder.parentId : taskToIndentUnder.id);
          return;
        }

        const hoverItem = getTaskById(hoverId);
        if (!hoverItem) return;

        if (hoverItem.parentId) {
          onSetParent(dragId, hoverItem.parentId);
        } else {
          onSetParent(dragId, hoverId);
        }
        return;
      }

      const isUnindenting = deltaX < -(INDENT_WIDTH * 4);

      if (isUnindenting && dragItem.parentId) {
        onSetParent(dragId, null);
        return;
      }

      if (dragId !== hoverId) {
        onMove(dragId, hoverId);
      }
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current || isPrint) return;

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

      const dragIndex = allWeeklyTasks.findIndex(t => t.id === dragId);
      const hoverIndex = allWeeklyTasks.findIndex(t => t.id === hoverId);

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
    canDrag: !isPrint,
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
      if (isMobile) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isEditing, task.isNew, isMobile]);

  useEffect(() => {
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
      setEditableTitle(task.title.substring(task.title.indexOf(']') + 2));
      setIsEditing(false);
      if (task.isNew) {
        onDelete(task.id);
      }
    } else if (e.key === 'Tab' && !isMobile) {
      e.preventDefault();
      if (canUnindent) {
        onSetParent(task.id, null);
      } else if (canIndent && taskAbove) {
        if (taskAbove.parentId) {
          onSetParent(task.id, taskAbove.parentId);
        } else {
          onSetParent(task.id, taskAbove.id);
        }
      }
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDone || isPrint) return;

    setIsEditing(true);
    onSelectTask(task.id);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (isPrint) return;
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

  const handleAddBetween = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTaskAfter(task.id);
  };


  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={cn(
        "w-full relative",
        !isPrint && !isMobile && "group/row-hover hover:z-20 hover:shadow-[0_0_0_1px_hsl(var(--primary))]",
      )}
      onClick={handleRowClick}
    >
      {!isPrint && (
        <button
          onClick={handleAddBetween}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-data-[state=selected]/row:opacity-100 group-hover/row-hover:opacity-100 transition-opacity"
          aria-label="Add task below"
        >
          <PlusCircle className="size-5 bg-background text-muted-foreground hover:text-primary rounded-full" />
        </button>
      )}
      <div className={cn(
        'flex items-center w-full p-2 min-h-12 md:min-h-[44px]',
        isDragging ? 'bg-muted' : '',
        isImportant && !isDone && 'border-l-2 border-destructive'
      )}>

        <div
          className="flex items-center flex-grow min-w-0 gap-2"
          style={{ paddingLeft: `${level * INDENT_WIDTH}px` }}
        >
          {!isPrint && (
            <div
              ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTask(task.id)
              }}
              className='flex px-1 py-2 -m-2 transition-opacity opacity-25 cursor-grab md:opacity-0 group-hover/row-hover:opacity-100 touch-none shrink-0'
            >
              <GripVertical className="size-4 text-muted-foreground" />
            </div>
          )}
          {task.parentId && <CornerDownRight className="size-4 text-muted-foreground shrink-0" />}

          {isEditing && !isPrint ? (
            <div className="flex items-center flex-grow min-w-0">
              <Input
                ref={inputRef}
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="h-8 flex-grow mr-2 bg-background rounded-md border"
              />
              <Button size="icon" variant="ghost" onClick={handleSave} className="shrink-0">
                <Save className="size-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center flex-grow min-w-0 select-none"
              onClick={handleTitleClick}
            >
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

        {!task.isNew && !isPrint && !isMobile && (
          <div className="flex items-center shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onToggleDone(task.id); }}
              className={cn('hidden md:flex transition-opacity', isDone ? 'opacity-100' : 'opacity-0 group-hover/row-hover:opacity-100')}
            >
              <CheckCircle2 className={cn("size-4", isDone ? 'text-green-500' : 'text-muted-foreground')} />
            </Button>
          </div>
        )}

        {!isPrint && (
          <div className="flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(task.id)
                  }}
                  className="transition-opacity md:opacity-0 group-hover/row-hover:opacity-100 data-[state=open]:opacity-100 md:w-10 md:h-10 w-8 h-8"
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
                {isMobile && (
                  <DropdownMenuItem onClick={() => onToggleDone(task.id)}>
                    <CheckCircle2 className={cn("mr-2 size-4", isDone ? 'text-green-500' : 'text-muted-foreground')} />
                    <span>{isDone ? 'Reopen the task' : 'Close the task'}</span>
                  </DropdownMenuItem>
                )}
                {isAIFeatureEnabled && (
                  <DropdownMenuItem onClick={handleBreakdownClick} disabled={isBreakingDown || isDone}>
                    <Wand2 className={cn("mr-2 size-4", isBreakingDown && "animate-pulse")} />
                    <span>Break down task</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'up')} disabled={myNavigableIndex === 0}>
                  <ArrowUp className="mr-2 size-4" />
                  <span>Move Up</span>
                  {!isMobile && <DropdownMenuShortcut>Ctrl+↑</DropdownMenuShortcut>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveTaskUpDown(task.id, 'down')} disabled={myNavigableIndex === allWeeklyTasks.length - 1}>
                  <ArrowDown className="mr-2 size-4" />
                  <span>Move Down</span>
                  {!isMobile && <DropdownMenuShortcut>Ctrl+↓</DropdownMenuShortcut>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    if (canUnindent) {
                      onSetParent(task.id, null);
                    } else if (canIndent && taskAbove) {
                      if (taskAbove.parentId) {
                        onSetParent(task.id, taskAbove.parentId);
                      } else {
                        onSetParent(task.id, taskAbove.id);
                      }
                    }
                  }}
                  disabled={!canIndent && !canUnindent}
                >
                  {canUnindent ? <Outdent className="mr-2 size-4" /> : <Indent className="mr-2 size-4" />}
                  <span>{canUnindent ? 'Un-indent' : 'Indent'}</span>
                  {!isMobile && <DropdownMenuShortcut>{canUnindent ? "Shift+Tab" : "Tab"}</DropdownMenuShortcut>}
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
                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(task.id)}>
                  <Trash2 className="mr-2 size-4" />
                  <span>Delete task</span>
                  {!isMobile && <DropdownMenuShortcut>Del</DropdownMenuShortcut>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}






