'use server';

import fs from 'fs/promises';
import path from 'path';

const getFilePath = async (fileName: string): Promise<string> => {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
  return path.join(dataDir, fileName);
};

export async function readFile(fileName: string): Promise<string> {
  const filePath = await getFilePath(fileName);
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
  const filePath = await getFilePath(fileName);
  await fs.writeFile(filePath, content, 'utf-8');
}
