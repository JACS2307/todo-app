export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority?: TaskPriority;
  dueDate?: Date;
  categoryId?: string;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface TaskFilter {
  completed?: boolean;
  priority?: TaskPriority;
  searchTerm?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}
