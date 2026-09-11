export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
