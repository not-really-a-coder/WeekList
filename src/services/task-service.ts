'use server';

import type { Task, TaskStatus } from '@/lib/types';
import { getWeek, getYear, parse, formatISO, format, startOfWeek, setWeek } from 'date-fns';

const ID_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 4;

const STATUS_MAP: Record<string, TaskStatus> = {
  'o': 'planned',
  '>': 'rescheduled',
  'v': 'completed',
  'x': 'cancelled',
  ' ': 'default',
  '-': 'default'
};
const STATUS_MAP_REVERSE: Record<TaskStatus, string> = {
  planned: 'o',
  rescheduled: '>',
  completed: 'v',
  cancelled: 'x',
  default: ' ',
};

export async function generateTaskId(existingIds: string[]): Promise<string> {
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
  const tasks: Task[] = [];
  let currentWeek = '';
  let currentYear = '';

  const lines = markdown.split('\n');

  for (const line of lines) {
    if (line.startsWith('## Week of')) {
      const dateString = line.substring(12);
      const parsedDate = parse(dateString, 'MMMM d, yyyy', new Date());
      if (!isNaN(parsedDate.getTime())) {
          currentYear = getYear(parsedDate).toString();
          currentWeek = getWeek(parsedDate, { weekStartsOn: 1 }).toString();
      }
      continue;
    }

    const taskMatch = line.match(/^- (  )*(\[.?\]) \[(.+)\] (.*)\s\(id:(.*)\)$/);
    if (taskMatch) {
      
      const titleContent = taskMatch[4].trim();
      const metadataString = taskMatch[5];
      
      const idMatch = metadataString.match(/^(.*?);/);
      const createdMatch = metadataString.match(/created:(.*?)(?:;|$)/);
      const parentIdMatch = metadataString.match(/parentId:(.*)/);

      if (!idMatch || !createdMatch) continue;

      const id = idMatch[1].trim();
      const createdAt = formatISO(new Date(createdMatch[1].trim()));
      const parentId = parentIdMatch ? parentIdMatch[1].trim() : null;

      const title = `${taskMatch[2]} ${titleContent}`;
      const statusesRaw = taskMatch[3];

      const statuses: Task['statuses'] = {
        monday: STATUS_MAP[statusesRaw[0] || ' '],
        tuesday: STATUS_MAP[statusesRaw[1] || ' '],
        wednesday: STATUS_MAP[statusesRaw[2] || ' '],
        thursday: STATUS_MAP[statusesRaw[3] || ' '],
        friday: STATUS_MAP[statusesRaw[4] || ' '],
        saturday: STATUS_MAP[statusesRaw[5] || ' '],
        sunday: STATUS_MAP[statusesRaw[6] || ' '],
      };

      const task: Task = {
        id,
        title,
        createdAt,
        parentId,
        week: `${currentYear}-${currentWeek}`,
        statuses,
      };
      
      tasks.push(task);
    }
  }

  const taskMap = new Map(tasks.map(t => [t.id, t]));
  for (const task of tasks) {
    if (task.parentId && !taskMap.has(task.parentId)) {
        task.parentId = null;
    }
  }

  return tasks;
}


export async function formatMarkdown(tasks: Task[]): Promise<string> {
    const tasksByWeek = tasks.reduce((acc, task) => {
        if (!task.week) return acc;
        if (!acc[task.week]) {
            acc[task.week] = [];
        }
        acc[task.week].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const sortedWeeks = Object.keys(tasksByWeek).sort((a, b) => {
        const [yearA, weekA] = a.split('-').map(Number);
        const [yearB, weekB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return weekA - weekB;
    });

    let markdown = '# WeekList Tasks\n\n';

    for (const weekKey of sortedWeeks) {
        if (!/^\d{4}-\d{1,2}$/.test(weekKey)) continue;

        const [year, weekNum] = weekKey.split('-').map(Number);
        if (weekNum < 1 || weekNum > 53) continue;

        const date = setWeek(new Date(year, 0, 4), weekNum, { weekStartsOn: 1 });
        const weekStartFormatted = format(startOfWeek(date, { weekStartsOn: 1 }), 'MMMM d, yyyy');
        
        markdown += `## Week of ${weekStartFormatted}\n\n`;

        const weekTasks = tasksByWeek[weekKey];
        
        const buildTaskTree = (parentId: string | null) => {
            const children = weekTasks.filter(t => t.parentId === parentId)
              .sort((a, b) => tasks.findIndex(t => t.id === a.id) - tasks.findIndex(t => t.id === b.id));
            
            for (const task of children) {
                const indent = task.parentId ? '  ' : '';
                
                const statusString = [
                    STATUS_MAP_REVERSE[task.statuses.monday],
                    STATUS_MAP_REVERSE[task.statuses.tuesday],
                    STATUS_MAP_REVERSE[task.statuses.wednesday],
                    STATUS_MAP_REVERSE[task.statuses.thursday],
                    STATUS_MAP_REVERSE[task.statuses.friday],
                    STATUS_MAP_REVERSE[task.statuses.saturday],
                    STATUS_MAP_REVERSE[task.statuses.sunday],
                ].join('');

                const taskTextOnly = task.title.substring(task.title.indexOf(']') + 2);
                
                let metadata = `(id:${task.id};created:${format(new Date(task.createdAt), 'yyyy-MM-dd')}`;
                if (task.parentId) {
                    metadata += `;parentId:${task.parentId}`;
                }
                metadata += ')';

                const coreTitle = `${task.title.substring(0, 4)}[${statusString}] ${taskTextOnly}`;

                const taskLine = `${indent}- ${coreTitle.replace(/\s\(id:.*\)$/, '')} ${metadata}\n`;

                markdown += taskLine;
                
                buildTaskTree(task.id);
            }
        };

        buildTaskTree(null);
        markdown += '\n';
    }

    return markdown.trim() + '\n';
}
