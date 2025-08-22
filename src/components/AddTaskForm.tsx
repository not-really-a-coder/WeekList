'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddTaskFormProps {
  onAddTask: (title: string, parentId?: string | null) => void;
  parentId?: string | null;
}

export function AddTaskForm({ onAddTask, parentId = null }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), parentId);
      setTitle('');
    } else {
      toast({
        title: 'Oops!',
        description: 'Task title cannot be empty.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={parentId ? "Add a sub-task..." : "Add a new task..."}
        className="flex-grow bg-card focus:bg-background"
      />
      <Button type="submit" size="icon" aria-label="Add task">
        <Plus className="size-4" />
      </Button>
    </form>
  );
}
