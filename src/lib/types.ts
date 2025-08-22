
export type TaskStatus = 'default' | 'planned' | 'completed' | 'rescheduled' | 'cancelled';

export const STATUS_CYCLE: TaskStatus[] = ['default', 'planned', 'completed', 'rescheduled', 'cancelled'];

export interface Task {
  id: string;
  title: string;
  createdAt: string;
  parentId?: string | null;
  isDone?: boolean;
  week: string; // e.g. "2024-34"
  isNew?: boolean;
  statuses: {
    monday: TaskStatus;
    tuesday: TaskStatus;
    wednesday: TaskStatus;
    thursday: TaskStatus;
    friday: TaskStatus;
    saturday: TaskStatus;
    sunday: TaskStatus;
  };
}
