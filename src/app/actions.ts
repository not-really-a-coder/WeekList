'use server';

import type { Task, TaskStatus } from '@/lib/types';
import { breakDownTask } from '@/ai/flows/break-down-large-tasks';
import { addWeeks, getWeek, getYear, startOfWeek, parse, format } from 'date-fns';

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



const generateRandomStatus = (): TaskStatus => {
  const statuses: TaskStatus[] = ['default', 'planned', 'completed', 'rescheduled', 'cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};



const generateOnboardingTasks = async (date: Date): Promise<Task[]> => {
  const year = getYear(date);
  const week = getWeek(date, { weekStartsOn: 1 });
  const weekKey = `${year}-${week}`;
  const weekTasks: Task[] = [];
  const allIds: string[] = [];
  const createdDate = new Date().toISOString().split('T')[0];

  const getRandomStatuses = () => ({
    monday: generateRandomStatus(),
    tuesday: generateRandomStatus(),
    wednesday: generateRandomStatus(),
    thursday: generateRandomStatus(),
    friday: generateRandomStatus(),
    saturday: generateRandomStatus(),
    sunday: generateRandomStatus(),
  });

  // 1. Welcome Task
  const t1Id = await generateTaskId(allIds);
  allIds.push(t1Id);
  weekTasks.push({
    id: t1Id,
    title: '[ ] Welcome to WeekList! Click / tap "+" or hit Ctrl+Enter to add a task',
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 2. Planning Task
  const t2Id = await generateTaskId(allIds);
  allIds.push(t2Id);
  weekTasks.push({
    id: t2Id,
    title: '[ ] You can plan each task for a specific weekday and change the status later',
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 3. Organization Task (Parent)
  const t3Id = await generateTaskId(allIds);
  allIds.push(t3Id);
  weekTasks.push({
    id: t3Id,
    title: '[ ] Try Drag&Drop or keyboard hotkeys to conveniently organize your tasks',
    createdAt: createdDate,
    parentId: null,
    statuses: { ...getRandomStatuses(), wednesday: 'planned' }, // Make sure it shows as active/planned
    week: weekKey,
  });
  // Sub-tasks for T3
  const s1Id = await generateTaskId(allIds); allIds.push(s1Id);
  weekTasks.push({
    id: s1Id,
    title: '[ ] For example, you can place tasks with higher priorities higher in the list',
    createdAt: createdDate,
    parentId: t3Id,
    statuses: getRandomStatuses(),
    week: weekKey,
  });
  const s2Id = await generateTaskId(allIds); allIds.push(s2Id);
  weekTasks.push({
    id: s2Id,
    title: '[ ] !Or you can mark the task as Important by adding a "!" symbol in the beginning',
    createdAt: createdDate,
    parentId: t3Id,
    statuses: getRandomStatuses(),
    week: weekKey,
  });
  const s3Id = await generateTaskId(allIds); allIds.push(s3Id);
  weekTasks.push({
    id: s3Id,
    title: "[ ] There's just one level of indentation to keep it simple",
    createdAt: createdDate,
    parentId: t3Id,
    statuses: getRandomStatuses(),
    week: weekKey,
  });
  const s4Id = await generateTaskId(allIds); allIds.push(s4Id);
  weekTasks.push({
    id: s4Id,
    title: '[ ] You can also expand or collapse nested tasks for improved readability and focus!',
    createdAt: createdDate,
    parentId: t3Id,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 4. Closed Task
  const t4Id = await generateTaskId(allIds);
  allIds.push(t4Id);
  weekTasks.push({
    id: t4Id,
    title: "[v] Mark the task as closed if you're not going to come back to it during the week",
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 5. Import/Export Task
  const t5Id = await generateTaskId(allIds);
  allIds.push(t5Id);
  weekTasks.push({
    id: t5Id,
    title: "[ ] Check out Export and Import to markdown in the top right menu. You're in full control of your data",
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 6. Context Menu Task
  const t6Id = await generateTaskId(allIds);
  allIds.push(t6Id);
  weekTasks.push({
    id: t6Id,
    title: '[ ] There are more things you can do with your list - check them in the task context menu!',
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  // 7. Happy Planning Task
  const t7Id = await generateTaskId(allIds);
  allIds.push(t7Id);
  weekTasks.push({
    id: t7Id,
    title: '[ ] Feel free to delete these tasks to start your own WeekList. Happy Planning!',
    createdAt: createdDate,
    parentId: null,
    statuses: getRandomStatuses(),
    week: weekKey,
  });

  return weekTasks;
};


export async function getAIFeatureStatus(): Promise<boolean> {
  return !!process.env.GOOGLE_GENAI_API_KEY;
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


export async function getTasks(): Promise<Task[]> {
  const today = new Date();
  // Only generate for the current week
  const weekDate = startOfWeek(today, { weekStartsOn: 1 });
  const allTasks = await generateOnboardingTasks(weekDate);

  // Logic to ensure parent-child order
  const result: Task[] = [];
  const processedIds = new Set<string>();

  for (const task of allTasks) {
    if (processedIds.has(task.id) || task.parentId) continue;

    result.push(task);
    processedIds.add(task.id);

    const children = allTasks.filter(t => t.parentId === task.id);
    for (const child of children) {
      result.push(child);
      processedIds.add(child.id);
    }
  }

  return result;
}

export async function getTasksMarkdown(tasks: Task[]): Promise<string> {
  let markdown = '# WeekList Tasks\n\n';

  const groupedByWeek = tasks.reduce((acc, task) => {
    (acc[task.week] = acc[task.week] || []).push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => {
    const [yearA, weekA] = a.split('-').map(Number);
    const [yearB, weekB] = b.split('-').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return weekA - weekB;
  });

  for (const week of sortedWeeks) {
    const [year, weekNum] = week.split('-').map(Number);
    const firstDayOfYear = new Date(year, 0, 4); // ISO 8601 week number definition
    const startOfFirstWeek = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
    const weekStartDate = addWeeks(startOfFirstWeek, weekNum - 1);

    markdown += `## Week of ${format(weekStartDate, 'MMMM d, yyyy')}\n\n`;

    const weekTasks = groupedByWeek[week];
    const taskMap = new Map(weekTasks.map(t => [t.id, t]));
    const processedIds = new Set<string>();

    const formatTaskLine = (task: Task, level: number) => {
      if (processedIds.has(task.id)) return '';
      processedIds.add(task.id);

      const indent = '  '.repeat(level);
      const doneMarker = task.title.startsWith('[v]') ? '[v]' : '[ ]';
      const titleText = task.title.substring(task.title.indexOf(']') + 2);

      const statusChars = {
        default: ' ',
        planned: 'o',
        completed: 'v',
        rescheduled: '>',
        cancelled: 'x',
      };
      const statusString = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        .map(day => statusChars[task.statuses[day as keyof Task['statuses']]])
        .join('');

      let metadataParts = [`id: ${task.id}`, `created: ${task.createdAt}`];
      if (task.parentId) {
        metadataParts.push(`parentid: ${task.parentId}`);
      }
      const metadata = `{%${metadataParts.join('; ')}}`;

      let line = `${indent}- ${doneMarker} [${statusString}] ${titleText.trim()} ${metadata}\n`;

      const children = weekTasks.filter(t => t.parentId === task.id);
      for (const child of children) {
        line += formatTaskLine(child, level + 1);
      }
      return line;
    };

    for (const task of weekTasks) {
      if (!task.parentId) {
        markdown += formatTaskLine(task, 0);
      }
    }
    markdown += '\n';
  }

  return markdown;
}

export async function parseTasksMarkdown(markdown: string): Promise<Task[]> {
  const tasks: Task[] = [];
  let currentWeekKey = '';
  const lines = markdown.split('\n');

  const statusMap: { [key: string]: TaskStatus } = {
    ' ': 'default', 'o': 'planned', 'v': 'completed', '>': 'rescheduled', 'x': 'cancelled',
  };
  const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  let parentStack: (Task | null)[] = [null];

  for (const line of lines) {
    if (line.trim() === '') continue;

    if (line.startsWith('## Week of ')) {
      const dateStr = line.substring(11).trim();
      try {
        const date = parse(dateStr, 'MMMM d, yyyy', new Date());
        const year = getYear(date);
        const week = getWeek(date, { weekStartsOn: 1 });
        currentWeekKey = `${year}-${week}`;
      } catch (e) {
        console.error(`Invalid date format for "${dateStr}". Skipping week.`);
        currentWeekKey = '';
      }
      continue;
    }

    if (!currentWeekKey) continue;

    const indentMatch = line.match(/^(\s*)-/);
    if (!indentMatch) continue;

    const indentLevel = indentMatch[1].length / 2;

    const taskRegex = /-\s(\[([ v])\])\s\[([ovx >]{7})\]\s(.*?)\s*\{%(.*)\}/;
    const taskMatch = line.trim().match(taskRegex);

    if (!taskMatch) continue;

    const [, doneMarker, , statusStr, titleText, metadataStr] = taskMatch;

    const metadata: Record<string, string> = {};
    metadataStr.split(';').forEach(part => {
      const [key, ...valueParts] = part.split(':');
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
    });

    if (!metadata.id || !metadata.created) continue;

    const statuses: Task['statuses'] = {
      monday: 'default', tuesday: 'default', wednesday: 'default',
      thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default'
    };
    if (statusStr.length === 7) {
      weekdays.forEach((day, index) => {
        statuses[day] = statusMap[statusStr[index]] || 'default';
      });
    }

    const parentId = metadata.parentid || null;

    const task: Task = {
      id: metadata.id,
      title: `${doneMarker.trim()} ${titleText.trim()}`,
      createdAt: metadata.created,
      parentId: parentId,
      week: currentWeekKey,
      statuses: statuses,
    };

    tasks.push(task);
  }

  // The previous implementation of re-ordering was complex and potentially buggy.
  // The markdown structure itself defines the order. By simply pushing tasks as we parse them,
  // and correctly identifying their parents from the metadata, the final order will be correct
  // when rendered by the UI, which uses a tree-like structure.
  return tasks;
}
