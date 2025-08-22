export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'done';
  parentId: string | null;
  subTasks: Task[];
  createdAt: string;
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}
