'use client';

import React, { useState, useTransition, useEffect } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { handleSuggestTasks } from './actions';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { STATUS_CYCLE } from '@/lib/types';

const initialTasksData: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: 'Plan summer vacation',
    statuses: {
      monday: 'planned',
      tuesday: 'planned',
      wednesday: 'default',
      thursday: 'default',
      friday: 'completed',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Weekly grocery shopping',
    statuses: {
      monday: 'default',
      tuesday: 'default',
      wednesday: 'default',
      thursday: 'default',
      friday: 'default',
      saturday: 'completed',
      sunday: 'default',
    },
  },
  {
    title: 'Finish Q2 report',
    statuses: {
      monday: 'planned',
      tuesday: 'completed',
      wednesday: 'default',
      thursday: 'default',
      friday: 'default',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Renew gym membership',
    statuses: {
      monday: 'default',
      tuesday: 'default',
      wednesday: 'rescheduled',
      thursday: 'planned',
      friday: 'default',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Call the plumber',
    statuses: {
      monday: 'cancelled',
      tuesday: 'default',
      wednesday: 'default',
      thursday: 'default',
      friday: 'default',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Schedule dentist appointment',
    statuses: {
      monday: 'default',
      tuesday: 'planned',
      wednesday: 'default',
      thursday: 'default',
      friday: 'default',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Pay electricity bill',
    statuses: {
      monday: 'default',
      tuesday: 'default',
      wednesday: 'default',
      thursday: 'completed',
      friday: 'default',
      saturday: 'default',
      sunday: 'default',
    },
  },
  {
    title: 'Pick up dry cleaning',
    statuses: {
      monday: 'default',
      tuesday: 'default',
      wednesday: 'default',
      thursday: 'default',
      friday: 'planned',
      saturday: 'default',
      sunday: 'default',
    },
  },
];

const addIdsAndDates = (tasks: Omit<Task, 'id' | 'createdAt'>[]): Task[] => {
  return tasks.map((task) => {
    return {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
  });
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAiLoading, startAiTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const initialTasks = addIdsAndDates(initialTasksData);
    setTasks(initialTasks);
    setIsClient(true);
  }, []);
  
  const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const runSuggestTasks = () => {
    startAiTransition(async () => {
      // AI suggestion logic to be implemented
    });
  };

  const handleStatusChange = (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => {
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    const newStatus = STATUS_CYCLE[nextIndex];

    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
          const newStatuses = { ...task.statuses, [day]: newStatus };
          return { ...task, statuses: newStatuses };
        }
        return task;
      })
    );
  };
  
  const handleAddTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: 'New Task',
      createdAt: new Date().toISOString(),
      statuses: {
        monday: 'default',
        tuesday: 'default',
        wednesday: 'default',
        thursday: 'default',
        friday: 'default',
        saturday: 'default',
        sunday: 'default',
      },
    };
    setTasks(currentTasks => [newTask, ...currentTasks]);
  };

  const handleUpdateTask = (taskId: string, newTitle: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, title: newTitle } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
  };


  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onSuggestTasks={runSuggestTasks} isAiLoading={isAiLoading} />
      <main className="flex-grow p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <TaskGrid
            tasks={sortedTasks}
            onStatusChange={handleStatusChange}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        </div>
      </main>
    </div>
  );
}
