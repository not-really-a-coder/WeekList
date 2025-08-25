'use server';

import type { Task, TaskStatus } from '@/lib/types';
import { breakDownTask } from '@/ai/flows/break-down-large-tasks';
import { addWeeks, getWeek, getYear, startOfWeek } from 'date-fns';

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

const exampleTaskTitles = [
    'Review Q2 financials',
    'Onboard new marketing hire',
    'Prepare onboarding documents',
    'Schedule intro meetings',
    'Cancel unused software subscriptions',
    '!Finalize project proposal',
    'Team lunch planning',
    'Website copy revisions',
    'Order new office supplies',
    '!Plan summer vacation',
    'Finalize travel bookings',
    'Weekly grocery shopping',
    'Finish Q2 report',
    'Renew gym membership',
    '!Call the plumber',
    'Schedule dentist appointment',
    'Pay electricity bill',
    'Pick up dry cleaning',
];

const generateRandomStatus = (): TaskStatus => {
    const statuses: TaskStatus[] = ['default', 'planned', 'completed', 'rescheduled', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

const generateWeekTasks = async (date: Date, existingIds: string[]): Promise<Task[]> => {
    const year = getYear(date);
    const week = getWeek(date, { weekStartsOn: 1 });
    const weekKey = `${year}-${week}`;
    const weekTasks: Task[] = [];

    const numTasks = 4 + Math.floor(Math.random() * 4); // 4 to 7 tasks per week

    for (let i = 0; i < numTasks; i++) {
        const titleIndex = Math.floor(Math.random() * exampleTaskTitles.length);
        const title = `[ ] ${exampleTaskTitles[titleIndex]}`;
        const newId = await generateTaskId(existingIds.concat(weekTasks.map(t => t.id)));
        
        const task: Task = {
            id: newId,
            title: title,
            createdAt: new Date().toISOString(),
            parentId: null,
            statuses: {
                monday: generateRandomStatus(),
                tuesday: generateRandomStatus(),
                wednesday: generateRandomStatus(),
                thursday: generateRandomStatus(),
                friday: generateRandomStatus(),
                saturday: generateRandomStatus(),
                sunday: generateRandomStatus(),
            },
            week: weekKey,
        };
        weekTasks.push(task);
    }
    return weekTasks;
};

export async function handleBreakDownTask(taskTitle: string): Promise<string[]> {
  try {
    const result = await breakDownTask({
      task: taskTitle,
    });
    return result.subTasks;
  } catch (error) {
    console.error('Error breaking down task:', error);
    return [];
  }
}

export async function getTasks(): Promise<Task[]> {
    const today = new Date();
    const allTasks: Task[] = [];
    const allIds: string[] = [];

    for (let i = -2; i <= 2; i++) {
        const weekDate = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), i);
        const weeklyTasks = await generateWeekTasks(weekDate, allIds);
        allTasks.push(...weeklyTasks);
        allIds.push(...weeklyTasks.map(t => t.id));
    }
    
    // Add some subtasks for demonstration
    if (allTasks.length > 5) {
      allTasks[2].parentId = allTasks[1].id;
      allTasks[3].parentId = allTasks[1].id;
    }

    return allTasks;
}

// This function no longer saves to a file. It's now a placeholder.
export async function saveTasks(tasks: Task[]): Promise<void> {
  // In a real application, this would save to a database or other persistent storage.
  // For this example, we do nothing, and tasks are regenerated on each page load.
  console.log('Task saving is disabled in this demo.');
  return Promise.resolve();
}
