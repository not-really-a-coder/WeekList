
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
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar, ArrowRight } from 'lucide-react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { format, startOfWeek, addDays, getWeek, getYear, parseISO, setWeek, isSameDay } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Legend } from '@/components/Legend';

const initialTasksData: Omit<Task, 'id' | 'createdAt' | 'parentId' | 'week'>[] = [
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

const addIdsAndDates = (tasks: Omit<Task, 'id' | 'createdAt' | 'parentId' | 'week'>[], week: number, year: number): Task[] => {
  return tasks.map((task, index) => {
    return {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - index * 1000).toISOString(),
      parentId: null,
      isDone: task.isDone ?? false,
      week: `${year}-${week}`,
    };
  });
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;
  const [currentDate, setCurrentDate] = useState(new Date());


  useEffect(() => {
    const today = new Date();
    const currentWeek = getWeek(today, { weekStartsOn: 1 });
    const currentYear = getYear(today);
    const initialTasks = addIdsAndDates(initialTasksData, currentWeek, currentYear);
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
    const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
    const currentYear = getYear(currentDate);
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
      week: `${currentYear}-${currentWeek}`,
      isNew: true,
    };
    setTasks(currentTasks => [newTask, ...currentTasks]);
  };

  const handleUpdateTask = (taskId: string, newTitle: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, title: newTitle, isNew: false } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId && task.parentId !== taskId));
  };
  
  const handleToggleDone = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
            const isNowDone = !task.isDone;
            // if marking as done, clear any planned statuses
            const newStatuses = { ...task.statuses };
            if(isNowDone){
                for(const day in newStatuses){
                    if(newStatuses[day as keyof Task['statuses']] === 'planned'){
                        newStatuses[day as keyof Task['statuses']] = 'default';
                    }
                }
            }
          return { ...task, isDone: isNowDone, statuses: newStatuses };
        }
        return task
      })
    );
  }

  const handleMoveTask = useCallback((dragIndex: number, hoverIndex: number, currentViewTasks: Task[]) => {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks];
        
        const dragItem = currentViewTasks[dragIndex];
        const hoverItem = currentViewTasks[hoverIndex];

        const dragItemGlobalIndex = newTasks.findIndex(t => t.id === dragItem.id);
        const hoverItemGlobalIndex = newTasks.findIndex(t => t.id === hoverItem.id);

        if (dragItemGlobalIndex === -1 || hoverItemGlobalIndex === -1) {
            return newTasks;
        }

        const [movedTask] = newTasks.splice(dragItemGlobalIndex, 1);
        newTasks.splice(hoverItemGlobalIndex, 0, movedTask);
        
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
            let parentIndex = newTasks.findIndex(t => t.id === parentId);
            if(parentIndex > -1){
                const childToMove = newTasks.splice(childIndex, 1)[0];
                parentIndex = newTasks.findIndex(t => t.id === parentId);
                newTasks.splice(parentIndex + 1, 0, childToMove);
            }

        } 
        // When un-indenting, move to top level right after its old parent group
        else if (childTaskData.parentId) {
            const oldParentId = childTaskData.parentId;
            const oldParentIndex = newTasks.findIndex(t => t.id === oldParentId);

            if(oldParentIndex > -1){
                const childToMove = newTasks.splice(childIndex, 1)[0];
                const siblings = newTasks.filter(t => t.parentId === oldParentId);
                const lastSiblingIndex = siblings.length > 0
                    ? newTasks.findIndex(t => t.id === siblings[siblings.length - 1].id)
                    : newTasks.findIndex(t => t.id === oldParentId);
                
                newTasks.splice(lastSiblingIndex + 1, 0, childToMove);
            }
        }

        return newTasks;
    });
  }, [toast]);

  const handleMoveTaskToWeek = useCallback((taskId: string, direction: 'next' | 'previous') => {
    setTasks(currentTasks => {
      const taskToMove = currentTasks.find(t => t.id === taskId);
      if (!taskToMove) return currentTasks;
  
      const childrenToMove = currentTasks.filter(t => t.parentId === taskId);
      const taskIdsToMove = [taskId, ...childrenToMove.map(t => t.id)];
  
      const [year, weekNumber] = taskToMove.week.split('-').map(Number);
      
      const firstDayOfYear = parseISO(`${year}-01-01`);
      const taskDate = setWeek(firstDayOfYear, weekNumber, { weekStartsOn: 1 });
      
      const newDate = addDays(taskDate, direction === 'next' ? 7 : -7);
      
      const newWeek = getWeek(newDate, { weekStartsOn: 1 });
      const newYear = getYear(newDate);
      const newWeekKey = `${newYear}-${newWeek}`;
  
      return currentTasks.map(task => {
        if (taskIdsToMove.includes(task.id)) {
          return { ...task, week: newWeekKey };
        }
        return task;
      });
    });
  }, []);

  const handleMoveUnfinishedToNextWeek = useCallback(() => {
    const currentWeekKey = `${getYear(currentDate)}-${getWeek(currentDate, { weekStartsOn: 1 })}`;
    const unfinishedTasks = tasks.filter(t => t.week === currentWeekKey && !t.isDone);
    
    if (unfinishedTasks.length === 0) {
      toast({ title: "All tasks are finished!", description: "Nothing to move to the next week." });
      return;
    }

    const nextWeekDate = addDays(currentDate, 7);
    const nextWeek = getWeek(nextWeekDate, { weekStartsOn: 1 });
    const nextYear = getYear(nextWeekDate);
    const nextWeekKey = `${nextYear}-${nextWeek}`;

    const unfinishedTaskIds = unfinishedTasks.map(t => t.id);

    setTasks(currentTasks => 
      currentTasks.map(task => 
        unfinishedTaskIds.includes(task.id) 
          ? { ...task, week: nextWeekKey } 
          : task
      )
    );
    
    toast({ title: `Moved ${unfinishedTasks.length} unfinished tasks to the next week.` });
  }, [tasks, currentDate, toast]);

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(newDate => addDays(newDate, 7));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!isClient || DndBackend === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDisplay = `Week of ${format(startOfWeekDate, 'MMMM do, yyyy')}`;
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));

  const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
  const currentYear = getYear(currentDate);
  const currentWeekKey = `${currentYear}-${currentWeek}`;

  const weeklyTasks = tasks.filter(t => t.week === currentWeekKey);

  const today = new Date();
  const isCurrentWeek = getYear(currentDate) === getYear(today) && getWeek(currentDate, { weekStartsOn: 1 }) === getWeek(today, { weekStartsOn: 1 });
  
  return (
    <DndProvider backend={DndBackend} options={{ enableMouseEvents: true }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow py-4 lg:p-8 px-0 sm:px-4">
          <div className="max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-4 mb-4 px-4 sm:px-0">
                  <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
                      <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-center flex-grow justify-center">
                    <h2 className="text-xl font-bold font-headline">{weekDisplay}</h2>
                    {!isCurrentWeek && (
                      <Button variant="ghost" size="icon" onClick={goToToday} aria-label="Go to today">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="icon" onClick={goToNextWeek} aria-label="Next week">
                      <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
              <TaskGrid
                tasks={weeklyTasks}
                onStatusChange={handleStatusChange}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleDone={handleToggleDone}
                onAddTask={handleAddTask}
                onMoveTask={(dragIndex, hoverIndex) => handleMoveTask(dragIndex, hoverIndex, weeklyTasks)}
                onSetTaskParent={handleSetTaskParent}
                getTaskById={getTaskById}
                weekDates={weekDates}
                onMoveToWeek={handleMoveTaskToWeek}
              />
                <div className="mt-4 flex flex-col md:flex-row justify-between items-start gap-4 p-4 sm:p-0">
                  <Legend />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="link" className="md:self-auto self-end">
                        Move all unfinished tasks to next week
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will move all unfinished tasks from the current week to the next one.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMoveUnfinishedToNextWeek}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
