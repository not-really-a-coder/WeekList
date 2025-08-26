'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { STATUS_CYCLE } from '@/lib/types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { addDays, getWeek, getYear, parseISO, setWeek, startOfWeek, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Legend } from '@/components/Legend';
import { getTasks, saveTasks, getTasksMarkdown } from './actions';
import { handleBreakDownTask } from '@/app/actions';

const ID_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 4;

async function generateTaskId(existingIds: string[]): Promise<string> {
  let newId: string;
  do {
    newId = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      newId += ID_CHARSET.charAt(Math.floor(Math.random() * ID_CHARSET.length));
    }
  } while (existingIds.includes(newId));
  return newId;
}


const formatWeekDisplay = (date: Date) => {
  const formattedDate = format(date, 'MMMM d, yyyy');
  return `Week of ${formattedDate}`;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading tasks',
        description: error instanceof Error ? error.message : 'Could not load tasks.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
    setIsClient(true);
  }, [loadTasks]);

  const updateAndSaveTasks = useCallback((newTasksOrFn: Task[] | ((currentTasks: Task[]) => Task[])) => {
    let finalTasks: Task[] = [];

    // First, update the state optimistically
    setTasks(currentTasks => {
      if (typeof newTasksOrFn === 'function') {
        finalTasks = newTasksOrFn(currentTasks);
      } else {
        finalTasks = newTasksOrFn;
      }
      return finalTasks;
    });

    // Then, trigger the server action in a transition
    startTransition(() => {
      // Use the `finalTasks` variable which holds the updated state
      saveTasks(finalTasks).catch(e => toast({ variant: 'destructive', title: 'Save failed', description: e.message }));
    });
  }, [toast, startTransition]);

  const handleMoveTaskUpDown = useCallback((taskId: string, direction: 'up' | 'down') => {
      updateAndSaveTasks(currentTasks => {
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
  }, [updateAndSaveTasks]);


  const handleSetTaskParent = useCallback((childId: string, parentId: string | null) => {
    updateAndSaveTasks(currentTasks => {
      const childTask = currentTasks.find(t => t.id === childId);
      if (!childTask) return currentTasks;

      // Prevent nesting a task that already has children
      const hasChildren = currentTasks.some(t => t.parentId === childId);
      if (parentId && hasChildren) {
        toast({
          variant: 'destructive',
          title: 'Nesting failed',
          description: 'Cannot indent a task that already has sub-tasks.',
        });
        return currentTasks;
      }

      // Prevent nesting more than one level deep
      if (parentId) {
        const parentTask = currentTasks.find(t => t.id === parentId);
        if (parentTask?.parentId) {
          toast({
            variant: 'destructive',
            title: 'Nesting failed',
            description: 'Cannot nest a task more than one level deep.',
          });
          return currentTasks;
        }
      }

      let newTasks = currentTasks.map(t => t.id === childId ? { ...t, parentId } : t);

      // Reorder: move the child to be right after the parent
      if (parentId) {
        const childIndex = newTasks.findIndex(t => t.id === childId);
        const [movedChild] = newTasks.splice(childIndex, 1);
        
        const parentIndex = newTasks.findIndex(t => t.id === parentId);
        newTasks.splice(parentIndex + 1, 0, movedChild);
      }

      return newTasks;
    });
  }, [updateAndSaveTasks, toast]);


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
            if (!potentialParent.parentId && !tasks.some(t => t.parentId === selectedTaskId)) {
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
    if (task?.title.startsWith('[v]')) return;
    
    if (isMobile) {
      setSelectedTaskId(taskId);
    }

    const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    const newStatus = STATUS_CYCLE[nextIndex];

    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
          const newStatuses = { ...task.statuses, [day]: newStatus };
          return { ...task, statuses: newStatuses };
        }
        return task;
      })
    );
  };
  
  const handleAddTask = async () => {
    const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
    const currentYear = getYear(currentDate);
    const newTaskId = await generateTaskId(tasks.map(t => t.id));
    const newTask: Task = {
      id: newTaskId,
      title: '[ ] New Task',
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
      week: `${currentYear}-${currentWeek}`,
      isNew: true,
    };
    updateAndSaveTasks(currentTasks => [newTask, ...currentTasks]);
    setSelectedTaskId(newTask.id);
  };
  
  const handleAddSubTasks = useCallback(async (parentId: string, subTaskTitles: string[]) => {
      const parentTask = tasks.find(t => t.id === parentId);
      if (!parentTask) return;

      const newSubTasks: Task[] = [];
      const existingIds = tasks.map(t => t.id);

      for (const title of subTaskTitles) {
          const newId = await generateTaskId(existingIds.concat(newSubTasks.map(t => t.id)));
          const newTask: Task = {
              id: newId,
              title: `[ ] ${title}`,
              createdAt: new Date().toISOString(),
              parentId: parentId,
              week: parentTask.week,
              statuses: {
                  monday: 'default', tuesday: 'default', wednesday: 'default',
                  thursday: 'default', friday: 'default', saturday: 'default',
                  sunday: 'default',
              },
          };
          newSubTasks.push(newTask);
      }

      updateAndSaveTasks(currentTasks => {
          const parentIndex = currentTasks.findIndex(t => t.id === parentId);
          if (parentIndex === -1) return currentTasks;

          const newTasks = [...currentTasks];
          newTasks.splice(parentIndex + 1, 0, ...newSubTasks);
          return newTasks;
      });
  }, [tasks, updateAndSaveTasks]);


  const handleUpdateTask = (taskId: string, newTitle: string) => {
    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, title: newTitle, isNew: false } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    updateAndSaveTasks(currentTasks => currentTasks.filter(task => task.id !== taskId && task.parentId !== taskId));
    setSelectedTaskId(null);
  };
  
  const handleToggleDone = (taskId: string) => {
    updateAndSaveTasks(currentTasks =>
      currentTasks.map(task => {
        if (task.id === taskId) {
            const isDone = task.title.startsWith('[v]');
            const newTitle = isDone
              ? `[ ]${task.title.substring(3)}`
              : `[v]${task.title.substring(3)}`;
            
            return { ...task, title: newTitle };
        }
        return task
      })
    );
  }

  const handleMoveTask = useCallback((dragId: string, hoverId: string) => {
    updateAndSaveTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const dragIndex = newTasks.findIndex(t => t.id === dragId);
      const hoverIndex = newTasks.findIndex(t => t.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) {
          return newTasks;
      }

      const [movedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, movedTask);
      
      return newTasks;
    });
  }, [updateAndSaveTasks]);


  const handleMoveTaskToWeek = useCallback((taskId: string, direction: 'next' | 'previous') => {
    updateAndSaveTasks(currentTasks => {
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
  }, [updateAndSaveTasks]);

  const handleMoveUnfinishedToNextWeek = useCallback(() => {
    const currentWeekKey = `${getYear(currentDate)}-${getWeek(currentDate, { weekStartsOn: 1 })}`;
    
    updateAndSaveTasks(currentTasks => {
      const unfinishedTasks = currentTasks.filter(t => t.week === currentWeekKey && !t.title.startsWith('[v]'));
      
      if (unfinishedTasks.length === 0) {
        toast({ title: "All tasks are finished!", description: "Nothing to move to the next week." });
        return currentTasks;
      }

      const nextWeekDate = addDays(currentDate, 7);
      const nextWeek = getWeek(nextWeekDate, { weekStartsOn: 1 });
      const nextYear = getYear(nextWeekDate);
      const nextWeekKey = `${nextYear}-${nextWeek}`;

      const unfinishedTaskIds = unfinishedTasks.map(t => t.id);

      toast({ title: `Moved ${unfinishedTasks.length} unfinished tasks to the next week.` });

      return currentTasks.map(task => 
        unfinishedTaskIds.includes(task.id) 
          ? { ...task, week: nextWeekKey } 
          : task
      );
    });
  }, [currentDate, toast, updateAndSaveTasks]);

  const handleDownload = async () => {
    try {
      const markdown = await getTasksMarkdown(tasks);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weeklist.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error downloading file',
        description: 'Could not generate or download the markdown file.',
      });
    }
  };

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
  
  const weekDisplay = formatWeekDisplay(startOfWeekDate);

  const today = new Date();
  const isCurrentWeek = getYear(currentDate) === getYear(today) && getWeek(currentDate, { weekStartsOn: 1 }) === getWeek(today, { weekStartsOn: 1 });
  
  return (
    <DndProvider backend={DndBackend} options={{ enableMouseEvents: !isMobile }}>
      <div className="min-h-screen bg-background text-foreground flex flex-col" onClick={() => setSelectedTaskId(null)}>
        <Header isSaving={isPending} onDownload={handleDownload} />
        <main className="flex-grow py-4" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto px-0 sm:px-2">
             {isLoading ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
            <>
            <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
                  <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-center justify-center">
                  <h2 
                    className="text-base md:text-xl font-bold font-headline whitespace-nowrap"
                   >{weekDisplay}</h2>
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
                onAddSubTasks={handleAddSubTasks}
                onMoveTask={handleMoveTask}
                onSetTaskParent={handleSetTaskParent}
                getTaskById={getTaskById}
                weekDates={weekDates}
                onMoveToWeek={handleMoveTaskToWeek}
                onMoveTaskUpDown={handleMoveTaskUpDown}
                onSelectTask={handleSelectTask}
                allTasks={tasks}
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
            </>
            )}
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
