'use server';

// This file is no longer used for its original purpose of parsing
// and formatting markdown. The functions are kept to avoid breaking
// imports in a more complex application. They can be safely deleted
// if no other component depends on them.

import type { Task } from '@/lib/types';

export async function generateTaskId(existingIds: string[]): Promise<string> {
  // This function might still be useful for generating new task IDs in-memory.
  const ID_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const ID_LENGTH = 4;
  let newId: string;
  do {
    newId = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      newId += ID_CHARSET.charAt(Math.floor(Math.random() * ID_CHARSET.length));
    }
  } while (existingIds.includes(newId));
  return newId;
}


export async function parseMarkdown(markdown: string): Promise<Task[]> {
  console.log('Markdown parsing is disabled.');
  return [];
}

export async function formatMarkdown(tasks: Task[]): Promise<string> {
  console.log('Markdown formatting is disabled.');
  return '# Tasks\n\nNo tasks to format.';
}
