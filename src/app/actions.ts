'use server';

import { breakDownTask } from '@/ai/flows/break-down-large-tasks';
import { suggestTasks } from '@/ai/flows/suggest-tasks';

export async function handleSuggestTasks(completedTasks: string[], incompleteTasks: string[]): Promise<string[]> {
  try {
    const result = await suggestTasks({ completedTasks, incompleteTasks });
    return result.suggestedTasks;
  } catch (error) {
    console.error('Error suggesting tasks:', error);
    return [];
  }
}

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
