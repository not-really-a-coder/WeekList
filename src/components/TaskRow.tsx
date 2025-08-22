'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, GripVertical } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface TaskRowProps {
  task: Task;
  tasks: Task[];
  index: number;
  level: number;
  onUpdate: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSetParent: (childId: string, parentId: string | null) => void;
  getTaskById: (taskId: string) => Task | undefined;
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

export function TaskRow({ task, tasks, index, level, onUpdate, onDelete, onMove, onSetParent, getTaskById }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.title === 'New Task');
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const INDENT_WIDTH = 24;

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
      const isOutdenting = deltaX < -INDENT_WIDTH;

      // Logic for un-nesting by dragging left
      if (isOutdenting && item.level > 0) {
        onSetParent(item.id, null);
        item.level = 0; // Update dragged item's level optimistically
        return; // Prevent other actions when outdenting
      }

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

      if (!isIndenting && !isOutdenting) {
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
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(task.id, title.trim());
    } else {
      setTitle(task.title);
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
  
  const indentStyle = { paddingLeft: `${level * INDENT_WIDTH}px` };

  return (
    <div ref={preview} style={{ opacity }} data-handler-id={handlerId} className="w-full">
      <div ref={ref} className={cn('flex items-center w-full p-2 group', isDragging ? 'bg-muted' : '', isOverCurrent && level === 0 && !task.parentId ? 'bg-accent/20' : '')} style={indentStyle}>
        <div className="flex items-center flex-grow">
          <Button ref={drag} variant="ghost" size="icon" className="cursor-move mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <GripVertical className="size-4" />
          </Button>
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
            <p
              className="text-sm font-medium flex-grow cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </p>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete task"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                task "{task.title}" and all its sub-tasks.
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
