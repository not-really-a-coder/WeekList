'use server';

// This file is no longer used but is kept to avoid breaking imports
// in a more complex application. It can be safely deleted if no other
// component depends on it.

export async function readFile(fileName: string): Promise<string> {
  console.log(`readFile for ${fileName} is disabled.`);
  return '';
}

export async function writeFile(fileName: string, content: string): Promise<void> {
  console.log(`writeFile for ${fileName} is disabled.`);
}
