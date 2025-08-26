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

const exampleTaskTitles = [
    'Review Q2 financials and prepare a summary report for the board meeting',
    'Onboard the new marketing hire, including setting up their accounts and scheduling orientation meetings',
    'Finalize the project proposal for the "Phoenix" initiative, incorporating feedback from the last review',
    'Cancel all unused software subscriptions to reduce overhead costs',
    'Plan the annual summer team-building event, including venue selection, catering, and activities',
    'Revise the website copy for the new product landing page based on A/B testing results',
    'Order new ergonomic office chairs and standing desks for the entire engineering team',
    'Book flights and accommodations for the upcoming conference in San Francisco',
    'Conduct weekly grocery shopping, making sure to pick up fresh vegetables and supplies for the weekend BBQ',
    'Complete the final draft of the Q2 performance report and submit it to HR',
    'Renew the corporate gym membership for all employees before the end-of-month deadline',
    'Schedule a plumber to fix the leak in the upstairs bathroom and get a quote for a new water heater',
    'Book a dental check-up and cleaning for the family',
    'Pay the quarterly electricity and water utility bills online',
    'Pick up the dry cleaning from the shop on Main Street before it closes at 6 PM',
    'Draft the monthly customer newsletter, featuring new product updates and a customer success story',
    'Prepare for the upcoming client presentation by gathering all necessary data, creating the slides, and rehearsing the key talking points',
    'Research and compare new CRM software options to replace the current outdated system',
    'Follow up with all clients who have outstanding invoices from the previous month',
    'Plan the Q4 team offsite, including brainstorming locations, creating an agenda, and getting budget approval',
    'Update the product roadmap for Q4 to reflect the latest strategic priorities and resource allocations',
    'Organize and declutter the digital file storage system, creating a more intuitive folder structure',
    'Perform a comprehensive security audit of the main application server and document any vulnerabilities',
    'Write and publish a new blog post on the company website about recent industry trends',
    'Coordinate with the design team to create new marketing assets for the upcoming social media campaign',
];

const generateRandomStatus = (): TaskStatus => {
    const statuses: TaskStatus[] = ['default', 'planned', 'completed', 'rescheduled', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateWeekTasks = async (date: Date, usedTitles: Set<string>): Promise<Task[]> => {
    const year = getYear(date);
    const week = getWeek(date, { weekStartsOn: 1 });
    const weekKey = `${year}-${week}`;
    const weekTasks: Task[] = [];
    const allIds: string[] = [];

    const availableTitles = shuffleArray(exampleTaskTitles.filter(t => !usedTitles.has(t)));

    if (availableTitles.length < 5) {
        console.warn("Not enough unique task titles available for a full week's generation.");
        return [];
    }

    const parentId = await generateTaskId(allIds);
    allIds.push(parentId);
    const parentTitle = availableTitles[0];
    usedTitles.add(parentTitle);
    const parentTask: Task = {
        id: parentId,
        title: `[ ] ${parentTitle}`,
        createdAt: new Date().toISOString().split('T')[0],
        parentId: null,
        statuses: { monday: 'planned', tuesday: 'default', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: weekKey,
    };
    weekTasks.push(parentTask);

    const childId = await generateTaskId(allIds);
    allIds.push(childId);
    const childTitle = availableTitles[1];
    usedTitles.add(childTitle);
    const childTask: Task = {
        id: childId,
        title: `[ ] ${childTitle}`,
        createdAt: new Date().toISOString().split('T')[0],
        parentId: parentId,
        statuses: { monday: 'default', tuesday: 'planned', wednesday: 'default', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: weekKey,
    };
    weekTasks.push(childTask);
    
    const importantId = await generateTaskId(allIds);
    allIds.push(importantId);
    const importantTitle = availableTitles[2];
    usedTitles.add(importantTitle);
    const importantTask: Task = {
        id: importantId,
        title: `[ ] !${importantTitle}`,
        createdAt: new Date().toISOString().split('T')[0],
        parentId: null,
        statuses: { monday: 'default', tuesday: 'default', wednesday: 'planned', thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default' },
        week: weekKey,
    };
    weekTasks.push(importantTask);

    const closedId = await generateTaskId(allIds);
    allIds.push(closedId);
    const closedTitle = availableTitles[3];
    usedTitles.add(closedTitle);
    const closedTask: Task = {
        id: closedId,
        title: `[v] ${closedTitle}`,
        createdAt: new Date().toISOString().split('T')[0],
        parentId: null,
        statuses: { monday: 'completed', tuesday: 'completed', wednesday: 'completed', thursday: 'completed', friday: 'completed', saturday: 'default', sunday: 'default' },
        week: weekKey,
    };
    weekTasks.push(closedTask);

    const longDescId = await generateTaskId(allIds);
allIds.push(longDescId);
const longTaskTitle = 'This is a task with a deliberately very long description to test how the user interface handles text overflow, wrapping, and general layout within the constrained space of the task row. It needs to be long enough to see if the line-clamping is effective and if the UI remains usable.';
usedTitles.add(longTaskTitle);
 const longTask: Task = {
    id: longDescId,
    title: `[ ] ${longTaskTitle}`,
    createdAt: new Date().toISOString().split('T')[0],
    parentId: null,
    statuses: { monday: 'default', tuesday: 'default', wednesday: 'default', thursday: 'planned', friday: 'default', saturday: 'default', sunday: 'default' },
    week: weekKey,
};
weekTasks.push(longTask);


    const remainingTitles = availableTitles.slice(4, 6);
    for (const title of remainingTitles) {
        const newId = await generateTaskId(allIds);
        allIds.push(newId);
        usedTitles.add(title);
        const task: Task = {
            id: newId,
            title: `[ ] ${title}`,
            createdAt: new Date().toISOString().split('T')[0],
            parentId: null,
            statuses: { monday: generateRandomStatus(), tuesday: generateRandomStatus(), wednesday: generateRandomStatus(), thursday: generateRandomStatus(), friday: generateRandomStatus(), saturday: generateRandomStatus(), sunday: generateRandomStatus() },
            week: weekKey,
        };
        weekTasks.push(task);
    }

    return shuffleArray(weekTasks);
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
    const usedTitles = new Set<string>();

    for (let i = -2; i <= 2; i++) {
        const weekDate = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), i);
        const weeklyTasks = await generateWeekTasks(weekDate, usedTitles);
        allTasks.push(...weeklyTasks);
    }
    
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    const result: Task[] = [];
    const processedIds = new Set<string>();

    for (const task of allTasks) {
        if (processedIds.has(task.id)) continue;

        if (task.parentId && taskMap.has(task.parentId)) {
            continue;
        }

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
    const firstDayOfYear = new Date(year, 0, 4);
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
      const metadata = `(${metadataParts.join('; ')})`;

      let line = `${indent}- ${doneMarker} [${statusString}] ${titleText} ${metadata}\n`;

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

export async function parseTasksMarkdown(markdown: string): Promise<{ tasks: Task[]; logs: string[] }> {
    const logs: string[] = [];
    logs.push('Starting markdown parsing process...');
    
    const tasks: Task[] = [];
    const lines = markdown.split('\n');
    let currentWeekKey = '';
    const statusMap: { [key: string]: TaskStatus } = {
        ' ': 'default', 'o': 'planned', 'v': 'completed', '>': 'rescheduled', 'x': 'cancelled',
    };
    const weekdays: (keyof Task['statuses'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const parentChildMap: { [childId: string]: string } = {};
    const taskLevels: { [id: string]: number } = {};
    const taskStack: Task[] = [];

    logs.push(`Processing ${lines.length} lines of markdown.`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim() === '') {
            logs.push(`L${i+1}: Skipping empty line.`);
            continue;
        }

        if (line.startsWith('## Week of ')) {
            const dateStr = line.substring(11);
            logs.push(`L${i+1}: Found week header. Parsing date: "${dateStr}"`);
            try {
                const date = parse(dateStr, 'MMMM d, yyyy', new Date());
                if (isNaN(date.getTime())) {
                    logs.push(`L${i+1}: ERROR - Invalid date format for "${dateStr}". Skipping week.`);
                    currentWeekKey = '';
                    continue;
                }
                const year = getYear(date);
                const week = getWeek(date, { weekStartsOn: 1 });
                currentWeekKey = `${year}-${week}`;
                logs.push(`L${i+1}: Successfully parsed week. Key: ${currentWeekKey}`);
            } catch (e) {
                logs.push(`L${i+1}: CRITICAL ERROR parsing week date: "${dateStr}". Error: ${e instanceof Error ? e.message : String(e)}`);
                currentWeekKey = '';
            }
            continue;
        }

        if (!currentWeekKey) {
            logs.push(`L${i+1}: Skipping line as no valid week is set. Line: "${line}"`);
            continue;
        }

        const taskRegex = /^(\s*)- (\[[ v]\]) \[([ovx >]{7})\] (.*?) \((.*)\)\s*$/;
        const match = line.match(taskRegex);

        if (!match) {
            logs.push(`L${i+1}: FAILED to match task regex. Line: "${line}"`);
            continue;
        }
        
        logs.push(`L${i+1}: Successfully matched task regex. Line: "${line}"`);

        const [, indent, doneMarker, statusStr, titleText, metadataStr] = match;
        const level = indent.length / 2;
        logs.push(`L${i+1}:  - Indent level: ${level}`);
        logs.push(`L${i+1}:  - Done marker: ${doneMarker}`);
        logs.push(`L${i+1}:  - Status string: ${statusStr}`);
        logs.push(`L${i+1}:  - Title text: ${titleText}`);
        logs.push(`L${i+1}:  - Metadata: ${metadataStr}`);


        const metadata: Record<string, string> = {};
        metadataStr.split(';').forEach(part => {
            const [key, ...valueParts] = part.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
        logs.push(`L${i+1}:  - Parsed metadata object: ${JSON.stringify(metadata)}`);

        if (!metadata.id || !metadata.created) {
            logs.push(`L${i+1}: ERROR - Task metadata is missing 'id' or 'created'. Skipping task.`);
            continue;
        }

        const statuses: Task['statuses'] = {
            monday: 'default', tuesday: 'default', wednesday: 'default',
            thursday: 'default', friday: 'default', saturday: 'default', sunday: 'default'
        };
        if (statusStr.length === 7) {
            weekdays.forEach((day, index) => {
                statuses[day] = statusMap[statusStr[index]] || 'default';
            });
        }
        logs.push(`L${i+1}:  - Parsed statuses: ${JSON.stringify(statuses)}`);

        const task: Task = {
            id: metadata.id,
            title: `${doneMarker} ${titleText.trim()}`,
            createdAt: metadata.created,
            parentId: metadata.parentid || null,
            week: currentWeekKey,
            statuses: statuses,
        };
        
        tasks.push(task);
        logs.push(`L${i+1}: Successfully created task object: ${JSON.stringify(task)}`);
    }

    logs.push(`Finished parsing. Found ${tasks.length} tasks in total.`);
    logs.push(`Re-ordering tasks to ensure parent-child hierarchy...`);
    
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const result: Task[] = [];
    const processedIds = new Set<string>();

    for (const task of tasks) {
        if (processedIds.has(task.id)) continue;
        
        if (task.parentId === null) {
            result.push(task);
            processedIds.add(task.id);
            
            const queue = [task];
            while (queue.length > 0) {
                const parent = queue.shift();
                if (!parent) continue;
                
                const children = tasks.filter(t => t.parentId === parent.id);
                for (const child of children) {
                    if (!processedIds.has(child.id)) {
                        const parentIndex = result.findIndex(p => p.id === parent.id);
                        const siblings = result.filter(s => s.parentId === parent.id);
                        const lastSiblingIndex = siblings.length > 0 
                          ? result.findLastIndex(p => p.id === siblings[siblings.length - 1].id) 
                          : -1;

                        const insertIndex = lastSiblingIndex !== -1 ? lastSiblingIndex + 1 : parentIndex + 1;
                        
                        result.splice(insertIndex, 0, child);
                        processedIds.add(child.id);
                        queue.push(child);
                    }
                }
            }
        }
    }

    for (const task of tasks) {
        if (!processedIds.has(task.id)) {
            logs.push(`WARNING: Found orphaned task with no parent in the final list: ${task.id}. Appending to the end.`);
            result.push(task);
            processedIds.add(task.id);
        }
    }

    logs.push('Task re-ordering complete.');
    logs.push('Parsing process finished.');

    return { tasks: result, logs };
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  console.log('Task saving is a client-side operation in this demo.');
  return Promise.resolve();
}
