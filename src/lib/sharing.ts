import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Task, TaskStatus, STATUS_CYCLE } from './types';

// V3 Optimized Types (Array-based)
// [id, parentId, statusesString, collapsed, title]
export type TaskDataV3 = [string, string, string, number, string];

// [version, week, data]
export type SharedDataV3 = [number, string, TaskDataV3[]];

// V2 Minified Types (Legacy)
export interface MinifiedTask {
    i: string;         // id (mapped to short string)
    t: string;         // title
    p?: string;        // parentId (mapped)
    s: number[];       // statuses [Mon, Tue, Wed, Thu, Fri, Sat, Sun] indexes
    c?: number;        // isCollapsed (1 = true, undefined/0 = false)
}

export interface SharedDataV2 {
    v: number;         // version (2)
    w: string;         // week
    d: MinifiedTask[]; // data
}

// Legacy V1 Type (compatible output for app)
export interface SharedDataV1 {
    week: string;
    tasks: Task[];
    version: number;
}

export type SharedData = SharedDataV1;

const CURRENT_VERSION = 3;
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function encodeShareData(tasks: Task[], week: string): string {
    // ID Mapping (UUID -> Base36 Counter)
    const idMap = new Map<string, string>();
    let counter = 0;

    // First pass: generate short IDs
    tasks.forEach(task => {
        if (!idMap.has(task.id)) {
            idMap.set(task.id, counter.toString(36));
            counter++;
        }
    });

    const minifiedTasks: TaskDataV3[] = tasks.map(task => {
        // Create 7-char string "0120120"
        const statusString = WEEKDAYS.map(day => {
            const status = task.statuses[day];
            return STATUS_CYCLE.indexOf(status);
        }).join('');

        const mappedId = idMap.get(task.id)!;
        const mappedParent = task.parentId ? (idMap.get(task.parentId) || '') : '';
        const collapsed = task.isCollapsed ? 1 : 0;

        return [
            mappedId,
            mappedParent,
            statusString,
            collapsed,
            task.title
        ];
    });

    // Version 3 structure: [3, week, tasks]
    const data: SharedDataV3 = [
        CURRENT_VERSION,
        week,
        minifiedTasks
    ];

    const json = JSON.stringify(data);
    return compressToEncodedURIComponent(json).replace(/\+/g, '_');
}

export function decodeShareData(slug: string): SharedDataV1 | null {
    try {
        const restoredSlug = slug.replace(/_/g, '+');
        const json = decompressFromEncodedURIComponent(restoredSlug);
        if (!json) return null;

        const rawData = JSON.parse(json);

        // Detect Version
        // V3 is an array where the first element is the version number
        if (Array.isArray(rawData) && rawData[0] === 3) {
            return decodeV3(rawData as SharedDataV3);
        } else if (rawData.v === 2) {
            return decodeV2(rawData as SharedDataV2);
        } else {
            // Assume V1
            return rawData as SharedDataV1;
        }

    } catch (error) {
        console.error('Failed to decode share data', error);
        return null;
    }
}

function decodeV3(data: SharedDataV3): SharedDataV1 {
    const [version, week, taskData] = data;

    const tasks: Task[] = taskData.map(t => {
        const [id, parentId, statusString, collapsed, title] = t;

        const statuses: any = {};
        // statusString is "01230..."
        WEEKDAYS.forEach((day, index) => {
            const char = statusString[index];
            const statusIndex = parseInt(char, 10);
            statuses[day] = STATUS_CYCLE[statusIndex] || 'default';
        });

        return {
            id: id,
            title: title,
            createdAt: new Date().toISOString(), // Mock date
            parentId: parentId === '' ? null : parentId,
            week: week,
            isCollapsed: collapsed === 1,
            statuses: statuses
        };
    });

    return {
        week,
        tasks,
        version
    };
}

function decodeV2(data: SharedDataV2): SharedDataV1 {
    const tasks: Task[] = data.d.map(mTask => {
        const statuses: any = {};
        WEEKDAYS.forEach((day, index) => {
            const statusIndex = mTask.s[index];
            statuses[day] = STATUS_CYCLE[statusIndex] || 'default';
        });

        return {
            id: mTask.i, // Keep the short ID for the snapshot view
            title: mTask.t,
            createdAt: new Date().toISOString(), // Mock date
            parentId: mTask.p || null,
            week: data.w,
            isCollapsed: !!mTask.c,
            statuses: statuses
        };
    });

    return {
        week: data.w,
        tasks: tasks,
        version: 2
    };
}
