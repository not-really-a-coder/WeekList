'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { handleSuggestTasks } from './actions';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { STATUS_CYCLE } from '@/lib/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const initialTasksData: Omit<Task, 'id' | 'createdAt' | 'parentId'>[] = [
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

const addIdsAndDates = (tasks: Omit<Task, 'id' | 'createdAt' | 'parentId'>[]): Task[] => {
  return tasks.map((task, index) => {
    return {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - index * 1000).toISOString(),
      parentId: null,
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
    const sortedInitialTasks = [...initialTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTasks(sortedInitialTasks);
    setIsClient(true);
  }, []);

  const runSuggestTasks = () => {
    startAiTransition(async () => {
      // AI suggestion logic to be implemented
    });
  };

  const getTaskById = useCallback((taskId: string) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

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
      parentId: null,
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
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId && task.parentId !== taskId));
  };

  const handleMoveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [movedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, movedTask);
      return newTasks;
    });
  }, []);

  const handleSetTaskParent = useCallback((childId: string, parentId: string | null) => {
    setTasks(currentTasks => {
      let newTasks = [...currentTasks];
      const childIndex = newTasks.findIndex(t => t.id === childId);
      
      if (childIndex === -1) return currentTasks;

      // Prevent nesting if parent already has a parent
      if (parentId) {
        const parentTask = newTasks.find(t => t.id === parentId);
        if (parentTask?.parentId) {
          toast({ title: "Nesting Limit", description: "You can only have one level of nesting.", variant: 'destructive' });
          return currentTasks;
        }
      }
      
      const childTask = { ...newTasks[childIndex], parentId };
      newTasks[childIndex] = childTask;

      // When un-indenting, move to top level right after its old parent group
      if (parentId === null) {
        const oldParentId = currentTasks[childIndex].parentId;
        if (oldParentId) {
            const [movedTask] = newTasks.splice(childIndex, 1);
            
            const oldParentIndex = newTasks.findIndex(t => t.id === oldParentId);
            const siblings = newTasks.filter(t => t.parentId === oldParentId);
            const lastSiblingIndex = siblings.length > 0
                ? newTasks.findIndex(t => t.id === siblings[siblings.length - 1].id)
                : oldParentIndex;

            newTasks.splice(lastSiblingIndex + 1, 0, movedTask);
        }
      } else {
        // When indenting, move child to be right after the parent
        const parentIndex = newTasks.findIndex(t => t.id === parentId);
        if (childIndex !== parentIndex + 1) {
            const [movedTask] = newTasks.splice(childIndex, 1);
            const newParentIndex = newTasks.findIndex(t => t.id === parentId);
            newTasks.splice(newParentIndex + 1, 0, movedTask);
        }
      }

      return newTasks;
    });
  }, [toast]);

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header onSuggestTasks={runSuggestTasks} isAiLoading={isAiLoading} />
        <main className="flex-grow p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <TaskGrid
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
              onSetTaskParent={handleSetTaskParent}
              getTaskById={getTaskById}
            />
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
