import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Task } from './types';

export interface SharedData {
    week: string;
    tasks: Task[];
    version: number;
}

const CURRENT_VERSION = 1;

export function encodeShareData(tasks: Task[], week: string): string {
    const data: SharedData = {
        week,
        tasks,
        version: CURRENT_VERSION,
    };
    const json = JSON.stringify(data);
    return compressToEncodedURIComponent(json).replace(/\+/g, '_');
}

export function decodeShareData(slug: string): SharedData | null {
    try {
        const restoredSlug = slug.replace(/_/g, '+');
        const json = decompressFromEncodedURIComponent(restoredSlug);
        if (!json) return null;
        const data = JSON.parse(json) as SharedData;
        return data;
    } catch (error) {
        console.error('Failed to decode share data', error);
        return null;
    }
}
