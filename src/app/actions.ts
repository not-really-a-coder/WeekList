'use server';

import { formatMarkdown, parseMarkdown } from '@/services/task-service';
import type { Task } from '@/lib/types';
import { readFile, writeFile } from '@/services/file-service';
import { breakDownTask } from '@/ai/flows/break-down-large-tasks';

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
  try {
    const markdown = await readFile('tasks.md');
    return await parseMarkdown(markdown);
  } catch (error) {
    console.error('Error reading or parsing tasks file:', error);
    // If the file doesn't exist or is invalid, return an empty array
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const markdown = await formatMarkdown(tasks);
    await writeFile('tasks.md', markdown);
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw new Error('Failed to save tasks.');
  }
}

export async function getTasksMarkdown(): Promise<string> {
  try {
    return await readFile('tasks.md');
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return '# No tasks found';
  }
}

export async function uploadTasks(formData: FormData): Promise<Task[]> {
    const file = formData.get('file') as File | null;

    if (!file || !file.name.endsWith('.md')) {
        throw new Error('Please upload a valid Markdown file.');
    }

    try {
        const markdown = await file.text();
        await writeFile('tasks.md', markdown);
        return await parseMarkdown(markdown);
    } catch (error) {
        console.error('Error processing uploaded file:', error);
        throw new Error('Failed to process uploaded file.');
    }
}
