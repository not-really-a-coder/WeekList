
'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { GripVertical, Save, Trash2, AlertCircle } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { StatusCell } from './StatusCell';

interface MobileTaskCardProps {
  task: Task;
  tasks: Task[];
  index: number;
  onStatusChange: (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newTitle: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (dragIndex: number, hoverIndex: number) => void;
  onSetTaskParent: (childId: string, parentId: string | null) => void;
  level: number;
  getTaskById: (taskId: string) => Task | undefined;
}

const ItemTypes = {
  TASK: 'task',
};

interface DragItem {
    index: number;
    id: string;
    type: string;
    level: number;
}

const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MobileTaskCard({ task, tasks, index, onStatusChange, onUpdateTask, onDeleteTask, onMoveTask, onSetTaskParent, level, getTaskById }: MobileTaskCardProps) {
  const isImportant = task.title.startsWith('!');
  const displayTitle = isImportant ? task.title.substring(1) : task.title;

  const [isEditing, setIsEditing] = useState(displayTitle === 'New Task');
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 20;

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: () => ({ id: task.id, index, type: ItemTypes.TASK, level }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop<DragItem>({
    accept: ItemTypes.TASK,
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      const initialClientOffset = monitor.getInitialClientOffset();
      const currentClientOffset = monitor.getClientOffset();

      if (!initialClientOffset || !currentClientOffset) return;

      const deltaX = currentClientOffset.x - initialClientOffset.x;
      const isIndenting = deltaX > INDENT_WIDTH * 2;
      const isOutdenting = deltaX < -INDENT_WIDTH * 2;

      // Logic for un-nesting by dragging left
      if (isOutdenting && item.level > 0) {
        onSetTaskParent(item.id, null);
        item.level = 0; // Update dragged item's level optimistically
        return; // Prevent other actions when outdenting
      }

      // Logic for nesting by dragging right
      if (isIndenting && item.level === 0) {
        const potentialParentIndex = hoverIndex - 1;
        if (potentialParentIndex >= 0) {
          const potentialParentTask = tasks[potentialParentIndex];
           if (potentialParentTask && !potentialParentTask.parentId && potentialParentTask.id !== item.id) {
              onSetTaskParent(item.id, potentialParentTask.id);
              item.level = 1;
              return;
            }
        }
      }

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      onMoveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const handleSave = () => {
    if (title.trim() === '!' || title.trim() === '') {
        onDeleteTask(task.id);
    } else {
        onUpdateTask(task.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
        setTitle(task.title);
        setIsEditing(false);
    }
  };
  
  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if(displayTitle === 'New Task'){
        inputRef.current.select();
      }
    }
  }, [isEditing, displayTitle]);

  // Attach the drag source to the dragRef
  drag(dragRef);

  useEffect(() => {
    // This is the fix for the text selection issue on touch devices
    const node = dragRef.current;
    if (node) {
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };
      node.addEventListener('touchstart', preventDefault, { passive: false });
      node.addEventListener('touchmove', preventDefault, { passive: false });
      return () => {
        node.removeEventListener('touchstart', preventDefault);
        node.removeEventListener('touchmove', preventDefault);
      };
    }
  }, []);
  
  const indentStyle = { paddingLeft: `${level * INDENT_WIDTH}px` };

  return (
    <div ref={preview} className="relative">
       <div ref={drop(ref) as React.Ref<HTMLDivElement>} style={indentStyle}>
        <Card className={cn('overflow-hidden', isDragging ? 'bg-primary/20 ring-2 ring-primary' : '', isImportant ? 'border-destructive/50' : '')}>
          <CardHeader className={cn("flex flex-row items-center justify-between p-4")}>
            <div className="flex items-center gap-2 flex-grow min-w-0">
                <div ref={dragRef} className="cursor-move touch-none p-2 -m-2">
                    <GripVertical className="size-5 text-muted-foreground" />
                </div>
                {isImportant && !isEditing && (
                    <AlertCircle className="size-4 text-destructive shrink-0" />
                )}
                {isEditing ? (
                     <Input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        className="flex-grow bg-background text-base"
                    />
                ) : (
                    <CardTitle className="text-base font-medium flex-grow cursor-pointer truncate" onClick={() => setIsEditing(true)}>
                        {displayTitle}
                    </CardTitle>
                )}
            </div>
            <div className="flex items-center flex-shrink-0">
                 {isEditing && (
                    <Button size="icon" variant="ghost" onClick={handleSave}>
                        <Save className="size-4" />
                    </Button>
                 )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Delete task">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the task "{displayTitle}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteTask(task.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-t bg-border gap-px">
                {dayHeaders.map((day) => (
                    <div key={day} className={cn("p-2 text-center font-bold text-xs bg-card text-muted-foreground")}>{day}</div>
                ))}
                {weekdays.map((day) => (
                    <StatusCell
                        key={day}
                        status={task.statuses[day]}
                        onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
                        className={cn('bg-card')}
                    />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
