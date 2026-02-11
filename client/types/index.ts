export interface Goal {
  id: string;
  name: string;
  description: string | null;
  order: number;
  deletedAt: string | null;
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
  isRepeat: boolean;
  repeatInterval: number;
  repeatUnit: 'day' | 'week' | 'month' | 'year';
  repeatEndDate: string | null;
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
  startTime: string | null;
  endTime: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  completedAt: string | null;
  isRepeat: boolean;
  repeatInterval: number;
  repeatUnit: 'day' | 'week' | 'month' | 'year';
  repeatEndDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}
