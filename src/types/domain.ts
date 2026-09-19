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

export interface Roadmap {
  id: string;
  goalId: string;
  title: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  roadmapId: string;
  title: string;
  description?: string;
  status: 'todo' | 'completed';
  dueDate?: string;
}

export interface ScheduleBlock {
  id: string;
  userId: string;
  taskId?: string;
  habitId?: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'TASK' | 'EVENT' | 'FOCUS' | 'BREAK' | 'HABIT';
  reminderId?: string;
  reminderEnabled?: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: 'DAILY' | 'WEEKLY';
  createdAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
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
