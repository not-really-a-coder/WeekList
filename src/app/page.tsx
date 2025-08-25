
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
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { addDays, getWeek, getYear, parseISO, setWeek, startOfWeek, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Legend } from '@/components/Legend';

type InitialTask = Omit<Task, 'id' | 'createdAt' | 'parentId' | 'week'> & { childOfIndex?: number };

const initialTasksData: InitialTask[] = [
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
    title: 'Book flights',
    isDone: false,
    statuses: { monday: 'planned', tuesday: 'default', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
    childOfIndex: 0,
  },
  {
    title: 'Weekly grocery shopping, making sure to pick up fresh vegetables and supplies for the weekend BBQ.',
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

const addIdsAndDates = (tasks: InitialTask[], week: number, year: number): Task[] => {
  const processedTasks: Task[] = tasks.map((task, index) => ({
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date(Date.now() - index * 1000).toISOString(),
    parentId: null,
    isDone: task.isDone ?? false,
    week: `${year}-${week}`,
  }));

  tasks.forEach((task, index) => {
    if (task.childOfIndex !== undefined && processedTasks[task.childOfIndex]) {
      processedTasks[index].parentId = processedTasks[task.childOfIndex].id;
    }
  });

  return processedTasks;
};

const formatWeekDisplay = (date: Date) => {
  const formattedDate = format(date, 'MMMM do, yyyy');
  const match = formattedDate.match(/(\d+)(st|nd|rd|th)/);
  if (match) {
    const [fullMatch, day, suffix] = match;
    const withSuperscript = formattedDate.replace(fullMatch, `${day}<sup>${suffix}</sup>`);
    return `Week of ${withSuperscript}`;
  }
  return `Week of ${formattedDate}`;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);


  useEffect(() => {
    const today = new Date();
    const currentWeek = getWeek(today, { weekStartsOn: 1 });
    const currentYear = getYear(today);
    const initialTasks = addIdsAndDates(initialTasksData, currentWeek, currentYear);
    const sortedInitialTasks = [...initialTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTasks(sortedInitialTasks);
    setIsClient(true);
  }, []);

  const handleMoveTaskUpDown = useCallback((taskId: string, direction: 'up' | 'down') => {
      setTasks(currentTasks => {
        const taskIndex = currentTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return currentTasks;

        const newTasks = [...currentTasks];
        const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;

        if (targetIndex < 0 || targetIndex >= newTasks.length) {
            return currentTasks; 
        }
        
        const taskToMove = newTasks[taskIndex];
        const taskToSwapWith = newTasks[targetIndex];
        
        // simple swap
        newTasks[taskIndex] = taskToSwapWith;
        newTasks[targetIndex] = taskToMove;

        return newTasks;
      });
  }, []);


  const handleSetTaskParent = useCallback((childId: string, parentId: string | null) => {
    setTasks(currentTasks => {
      const childTask = currentTasks.find(t => t.id === childId);
      if (!childTask) return currentTasks;

      // Prevent nesting a task that already has children
      const hasChildren = currentTasks.some(t => t.parentId === childId);
      if (parentId && hasChildren) {
        return currentTasks;
      }

      // Prevent nesting more than one level deep
      if (parentId) {
        const parentTask = currentTasks.find(t => t.id === parentId);
        if (parentTask?.parentId) {
          return currentTasks;
        }
      }

      const newTasks = currentTasks.map(t => t.id === childId ? { ...t, parentId } : t);

      // Reorder: move the child to be right after the parent
      if (parentId) {
        const childIndex = newTasks.findIndex(t => t.id === childId);
        const [movedChild] = newTasks.splice(childIndex, 1);
        
        const parentIndex = newTasks.findIndex(t => t.id === parentId);
        newTasks.splice(parentIndex + 1, 0, movedChild);
      }

      return newTasks;
    });
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobile || !selectedTaskId) return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      if (!selectedTask) return;
      
      const weeklyTasks = tasks.filter(t => t.week === `${getYear(currentDate)}-${getWeek(currentDate, { weekStartsOn: 1 })}`);
      const selectedTaskIndex = weeklyTasks.findIndex(t => t.id === selectedTaskId);

      // New Hotkey Logic
      if (e.key === 'ArrowUp' && !e.ctrlKey) {
        e.preventDefault();
        if (selectedTaskIndex > 0) {
          setSelectedTaskId(weeklyTasks[selectedTaskIndex - 1].id);
        }
      } else if (e.key === 'ArrowDown' && !e.ctrlKey) {
        e.preventDefault();
        if (selectedTaskIndex < weeklyTasks.length - 1) {
          setSelectedTaskId(weeklyTasks[selectedTaskIndex + 1].id);
        }
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        handleMoveTaskUpDown(selectedTaskId, 'up');
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        handleMoveTaskUpDown(selectedTaskId, 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedTask.parentId) {
          handleSetTaskParent(selectedTaskId, null);
        } else {
          if (selectedTaskIndex > 0) {
            const potentialParent = weeklyTasks[selectedTaskIndex - 1];
            if (!potentialParent.parentId) {
              handleSetTaskParent(selectedTaskId, potentialParent.id);
            }
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedTask.parentId) {
          handleSetTaskParent(selectedTaskId, null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTaskId, tasks, isMobile, handleMoveTaskUpDown, handleSetTaskParent, currentDate]);


  const getTaskById = useCallback((taskId: string) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  const handleStatusChange = (taskId: string, day: keyof Task['statuses'], currentStatus: TaskStatus) => {
    const task = getTaskById(taskId);
    if (task?.isDone) return;
    
    if (isMobile) {
      setSelectedTaskId(taskId);
    }

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
    setSelectedTaskId(newTask.id);
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
    setSelectedTaskId(null);
  };
  
  const handleToggleDone = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
            const isNowDone = !task.isDone;
            return { ...task, isDone: isNowDone };
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

  const handleSelectTask = (taskId: string | null) => {
    if (taskId === selectedTaskId) {
      setSelectedTaskId(null); // unselect if clicked again
    } else {
      setSelectedTaskId(taskId);
    }
  };

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
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));

  const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
  const currentYear = getYear(currentDate);
  const currentWeekKey = `${currentYear}-${currentWeek}`;

  const weeklyTasks = tasks.filter(t => t.week === currentWeekKey);
  
  const weekDisplayHTML = formatWeekDisplay(startOfWeekDate);

  const today = new Date();
  const isCurrentWeek = getYear(currentDate) === getYear(today) && getWeek(currentDate, { weekStartsOn: 1 }) === getWeek(today, { weekStartsOn: 1 });
  
  return (
    <DndProvider backend={DndBackend} options={{ enableMouseEvents: !isMobile }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col" onClick={() => setSelectedTaskId(null)}>
        <Header />
        <main className="flex-grow py-4" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto px-0 sm:px-2">
            <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
                  <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-center justify-center">
                  <h2 
                    className="text-base md:text-xl font-bold font-headline whitespace-nowrap"
                    dangerouslySetInnerHTML={{ __html: weekDisplayHTML }}
                   />
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
            <div className="px-0">
              <TaskGrid
                tasks={weeklyTasks}
                selectedTaskId={selectedTaskId}
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
                onMoveTaskUpDown={handleMoveTaskUpDown}
                onSelectTask={handleSelectTask}
              />
                <div className="mt-4 flex flex-row items-start justify-between gap-4 px-2 sm:px-0">
                  <div className="flex-shrink-0 min-w-[45%] sm:min-w-0">
                    <Legend />
                  </div>
                  <div className="flex justify-end text-right sm:justify-end sm:text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" className="max-w-[170px] sm:max-w-xs h-auto p-0 text-right leading-tight whitespace-normal">
                          Move all unfinished tasks to next week
                          <ArrowRight className="ml-2 size-4 inline-block" />
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
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
