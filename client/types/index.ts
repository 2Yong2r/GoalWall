export interface Goal {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Task {
  id: string;
  goalId: string | null;
  description: string;
  priority: 'high' | 'medium' | 'low';
  startDate: string | null;
  endDate: string | null;
  completionPercentage: number;
  actualCompletionDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  updateContent: string;
  completionPercentage: number;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
