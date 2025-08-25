'use server';

import fs from 'fs/promises';
import path from 'path';

const getFilePath = (fileName: string): string => {
  // In a real scenario, this might point to a user-specific directory
  // or a database. For this example, we use the project root.
  return path.join(process.cwd(), fileName);
};

export async function readFile(fileName: string): Promise<string> {
  const filePath = getFilePath(fileName);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty string or a default template
      return '';
    }
    throw error;
  }
}

export async function writeFile(fileName: string, content: string): Promise<void> {
  const filePath = getFilePath(fileName);
  await fs.writeFile(filePath, content, 'utf-8');
}
