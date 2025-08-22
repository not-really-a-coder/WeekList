export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'done';
  parentId: string | null;
  subTasks: Task[];
  createdAt: string;
}
