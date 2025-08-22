'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { handleSuggestTasks, handleBreakDownTask } from './actions';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { WeekDayColumn } from '@/components/WeekDayColumn';

const initialTasksData: Omit<Task, 'id' | 'createdAt' | 'day'>[] = [
  {
    title: 'Plan summer vacation',
    status: 'todo',
    parentId: null,
    subTasks: [
      { title: 'Research destinations', status: 'todo', parentId: '1', subTasks: [] },
      { title: 'Book flights', status: 'todo', parentId: '1', subTasks: [] },
      { title: 'Reserve accommodation', status: 'done', parentId: '1', subTasks: [] },
    ],
  },
  {
    title: 'Weekly grocery shopping',
    status: 'done',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Finish Q2 report',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Renew gym membership',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Call the plumber',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
    {
    title: 'Schedule dentist appointment',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Pay electricity bill',
    status: 'done',
    parentId: null,
    subTasks: [],
  },
  {
    title: 'Pick up dry cleaning',
    status: 'todo',
    parentId: null,
    subTasks: [],
  },
];

const addIdsDatesAndDays = (tasks: Omit<Task, 'id' | 'createdAt' | 'day'>[], parentId: string | null = null): Task[] => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return tasks.map((task, index) => {
    const id = crypto.randomUUID();
    return {
      ...task,
      id,
      parentId,
      createdAt: new Date().toISOString(),
      day: days[index % days.length], // Assign a day for demo purposes
      subTasks: task.subTasks ? addIdsDatesAndDays(task.subTasks, id) : [],
    };
  });
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAiLoading, startAiTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const initialTasks = addIdsDatesAndDays(initialTasksData);
    setTasks(initialTasks);
    if (initialTasks.length > 0) {
      // Find the first 'todo' task to select initially
      const firstTodo = initialTasks.find(t => t.status === 'todo');
      setSelectedTask(firstTodo || initialTasks[0]);
    }
    setIsClient(true);
  }, []);

  const runSuggestTasks = () => {
    startAiTransition(async () => {
      // AI suggestion logic remains, but we need to adapt it
    });
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const tasksByDay = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    dayNames.forEach(day => {
      grouped[day] = [];
    });
    tasks.forEach(task => {
      if (task.day && dayNames.includes(task.day)) {
        grouped[task.day].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  if (!isClient) {
    return <div>Loading...</div>; // Simple loading state
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onSuggestTasks={runSuggestTasks} isAiLoading={isAiLoading} />
      <main className="flex-grow grid grid-cols-8 gap-px bg-border">
        {weekdays.map((day, index) => (
          <WeekDayColumn
            key={dayNames[index]}
            dayTitle={day}
            tasks={tasksByDay[dayNames[index]]}
            onTaskSelect={setSelectedTask}
            selectedTask={selectedTask}
          />
        ))}

        <div className="col-span-1 bg-card p-4">
          <h2 className="text-lg font-bold font-headline mb-4">Task Details</h2>
          {selectedTask ? (
            <div>
              <h3 className="font-bold">{selectedTask.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{selectedTask.status}</p>
              {/* More details and actions can go here */}
            </div>
          ) : (
            <div className="text-muted-foreground">Select a task to see details</div>
          )}
        </div>
      </main>
    </div>
  );
}
