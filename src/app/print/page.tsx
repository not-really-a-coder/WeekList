'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TaskGrid } from '@/components/TaskGrid';
import { addDays, getWeek, getYear, startOfWeek, format, getDate } from 'date-fns';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'weeklist-tasks';
const SHOW_WEEKENDS_KEY = 'weeklist-show-weekends';

const getDayWithSuffix = (date: Date) => {
    const day = getDate(date);
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    if (day % 10 === 2 && day !== 12) suffix = 'nd';
    if (day % 10 === 3 && day !== 13) suffix = 'rd';
    return <>{day}<sup>{suffix}</sup></>;
};

export default function PrintPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWeekends, setShowWeekends] = useState(true);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      const storedShowWeekends = localStorage.getItem(SHOW_WEEKENDS_KEY);
      if (storedShowWeekends) {
        setShowWeekends(JSON.parse(storedShowWeekends));
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading tasks',
        description: 'Could not load tasks from local storage.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadTasks();
      setIsClient(true);
    }
  }, [loadTasks]);

  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      setTimeout(() => window.print(), 500); // Timeout to allow rendering
    }
  }, [isLoading, tasks]);

  if (!isClient || isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing your tasks for printing...</p>
    </div>;
  }
  
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));

  const currentWeek = getWeek(currentDate, { weekStartsOn: 1 });
  const currentYear = getYear(currentDate);
  const currentWeekKey = `${currentYear}-${currentWeek}`;

  const weeklyTasks = tasks.filter(t => t.week === currentWeekKey);
  
  const weekDisplay = (
    <>
      Week of {format(startOfWeekDate, 'MMMM')} {getDayWithSuffix(startOfWeekDate)}, {format(startOfWeekDate, 'yyyy')}
    </>
  );

  const today = new Date();
  
  return (
    <main className="flex-grow p-4">
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold font-headline">WeekList</h1>
                <h2 className="text-lg font-headline text-muted-foreground">{weekDisplay}</h2>
            </div>
            <TaskGrid
            isPrint
            tasks={weeklyTasks}
            selectedTaskId={null}
            onStatusChange={() => {}}
            onUpdateTask={() => {}}
            onDeleteTask={() => {}}
            onToggleDone={() => {}}
            onAddTask={() => {}}
            onAddTaskAfter={() => {}}
            onAddSubTasks={() => {}}
            onMoveTask={() => {}}
            onSetTaskParent={() => {}}
            getTaskById={(id) => tasks.find(t => t.id === id)}
            weekDates={weekDates}
            onMoveToWeek={() => {}}
            onMoveTaskUpDown={() => {}}
            onSelectTask={() => {}}
            allTasks={tasks}
            showWeekends={showWeekends}
            weeklyTasksCount={weeklyTasks.length}
            today={today}
            />
        </div>
    </main>
  );
}
