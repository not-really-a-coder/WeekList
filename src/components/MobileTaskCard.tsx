'use client';

import React, { useState, useRef } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { GripVertical, Save, Trash2 } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { StatusCell } from './StatusCell';

interface MobileTaskCardProps {
  task: Task;
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

export function MobileTaskCard({ task, index, onStatusChange, onUpdateTask, onDeleteTask, onMoveTask, level }: MobileTaskCardProps) {
  const [isEditing, setIsEditing] = useState(task.title === 'New Task');
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
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

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      onMoveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const handleSave = () => {
    if (title.trim()) {
      onUpdateTask(task.id, title.trim());
    } else {
      setTitle(task.title);
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
  
  const indentStyle = { marginLeft: `${level * INDENT_WIDTH}px`, width: `calc(100% - ${level * INDENT_WIDTH}px)` };

  return (
    <div ref={preview} style={{ opacity: isDragging ? 0.5 : 1, ...indentStyle }} className="relative">
      <div ref={drop(ref) as React.Ref<HTMLDivElement>}>
        <Card className={cn('overflow-hidden', isDragging ? 'bg-muted' : '')}>
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-card-foreground/5">
            <div className="flex items-center gap-2 flex-grow">
                <div ref={drag} className="cursor-move touch-none">
                    <GripVertical className="size-5 text-muted-foreground" />
                </div>
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
                    <CardTitle className="text-base font-medium flex-grow cursor-pointer" onClick={() => setIsEditing(true)}>
                        {task.title}
                    </CardTitle>
                )}
            </div>
            <div className="flex items-center">
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
                        This will permanently delete the task "{task.title}".
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
                    <div key={day} className="p-2 text-center font-bold text-xs bg-card text-muted-foreground">{day}</div>
                ))}
                {weekdays.map((day) => (
                    <StatusCell
                        key={day}
                        status={task.statuses[day]}
                        onStatusChange={() => onStatusChange(task.id, day, task.statuses[day])}
                    />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
