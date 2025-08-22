'use client';

import React, { useState, useRef, useEffect } from 'react';
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

interface TaskRowProps {
  task: Task;
  onUpdate: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskRow({ task, onUpdate, onDelete }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(task.title === 'New Task');
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // If title is empty, revert to original title
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

  return (
    <div className="flex items-center w-full p-2 group">
      <div className="flex items-center flex-grow">
        <Button variant="ghost" size="icon" className="cursor-move mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
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
              task "{task.title}".
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
  );
}
