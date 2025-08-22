'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { STATUS_CYCLE } from '@/lib/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTaskCard } from '@/components/MobileTaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { format, startOfWeek, addDays } from 'date-fns';

const initialTasksData: Omit<Task, 'id' | 'createdAt' | 'parentId'>[] = [
  {
    title: '!Plan summer vacation',
    isDone: false,
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
    isDone: false,
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
    isDone: true,
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
    isDone: false,
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
    title: '!Call the plumber',
    isDone: false,
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
    isDone: false,
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
    isDone: false,
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
    isDone: false,
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
      isDone: task.isDone ?? false,
    };
  });
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;


  useEffect(() => {
    const initialTasks = addIdsAndDates(initialTasksData);
    const sortedInitialTasks = [...initialTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTasks(sortedInitialTasks);
    setIsClient(true);
  }, []);

  const getTaskById = useCallback((taskId: string) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  const handleStatusChange = (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => {
    const task = getTaskById(taskId);
    if (task?.isDone) return;

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
      isDone: false,
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
  
  const handleToggleDone = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, isDone: !task.isDone } : task
      )
    );
  }

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

        const childTaskData = newTasks[childIndex];

        // Prevent nesting if parent already has a parent
        if (parentId) {
            const parentTask = newTasks.find(t => t.id === parentId);
            if (parentTask?.parentId) {
                toast({ title: "Nesting Limit", description: "You can only have one level of nesting.", variant: 'destructive' });
                return currentTasks;
            }
             // prevent nesting on itself
            if(childId === parentId) return currentTasks;
        }
        
        const updatedChild = { ...childTaskData, parentId };
        newTasks[childIndex] = updatedChild;

        // When indenting, move child to be right after the parent
        if (parentId) {
            const parentIndex = newTasks.findIndex(t => t.id === parentId);
            if (childIndex !== parentIndex + 1) {
                const [movedTask] = newTasks.splice(childIndex, 1);
                // After splice, parent index might have shifted
                const newParentIndex = newTasks.findIndex(t => t.id === parentId);
                newTasks.splice(newParentIndex + 1, 0, movedTask);
            }
        } 
        // When un-indenting, move to top level right after its old parent group
        else if (childTaskData.parentId) {
            const [movedTask] = newTasks.splice(childIndex, 1);
            
            const oldParentId = childTaskData.parentId;
            const oldParentIndex = newTasks.findIndex(t => t.id === oldParentId);
            const siblings = newTasks.filter(t => t.parentId === oldParentId);
            const lastSiblingIndex = siblings.length > 0
                ? newTasks.findIndex(t => t.id === siblings[siblings.length - 1].id)
                : oldParentIndex;

            newTasks.splice(lastSiblingIndex + 1, 0, movedTask);
        }

        return newTasks;
    });
  }, [toast]);

  if (!isClient || DndBackend === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  const getTaskLevel = (taskId: string, tasks: Task[]): number => {
    let level = 0;
    let currentTask = tasks.find(t => t.id === taskId);
    while (currentTask && currentTask.parentId) {
        level++;
        currentTask = tasks.find(t => t.id === currentTask!.parentId);
    }
    return level;
  };

  const renderTaskTree = (tasksToRender: Task[], allTasks: Task[], level = 0) => {
    return tasksToRender.map((task) => {
      const children = allTasks.filter(child => child.parentId === task.id);
      const taskIndex = allTasks.findIndex(t => t.id === task.id);
      
      return (
        <React.Fragment key={task.id}>
           <MobileTaskCard
              task={task}
              index={taskIndex}
              onStatusChange={handleStatusChange}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleDone={handleToggleDone}
              onMoveTask={handleMoveTask}
              onSetTaskParent={handleSetTaskParent}
              level={level}
              getTaskById={getTaskById}
              tasks={tasks}
            />
          {children.length > 0 && renderTaskTree(children, allTasks, level + 1)}
        </React.Fragment>
      )
    });
  }

  const taskTree = tasks.filter(task => !task.parentId);

  const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDisplay = `Week of ${format(startOfWeekDate, 'MMMM, do')}`;
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));

  return (
    <DndProvider backend={DndBackend} options={{ enableMouseEvents: true }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {isMobile ? (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-headline">Tasks</h2>
                     <Button size="icon" variant="default" onClick={handleAddTask} aria-label="Add new task">
                        <Plus className="size-4" />
                      </Button>
                  </div>
                  {renderTaskTree(taskTree, tasks)}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold font-headline mb-4">{weekDisplay}</h2>
                <TaskGrid
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleDone={handleToggleDone}
                  onAddTask={handleAddTask}
                  onMoveTask={handleMoveTask}
                  onSetTaskParent={handleSetTaskParent}
                  getTaskById={getTaskById}
                  weekDates={weekDates}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
