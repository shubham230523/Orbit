import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { Task } from '@/types/domain';

export const taskService = {
  async getTasks(): Promise<(Task & { goalTitle?: string })[]> {
    return await runQuery<Task & { goalTitle?: string }>(
      `SELECT t.*, g.title as goalTitle
       FROM tasks t
       LEFT JOIN goals g ON t.goalId = g.id
       ORDER BY t.createdAt DESC`
    );
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const newTask: Task = {
      id,
      goalId: task.goalId,
      title: task.title || '',
      description: task.description,
      status: task.status || 'todo',
      dueDate: task.dueDate,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      priority: task.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    };

    await runExecute(
      `INSERT INTO tasks (id, goalId, title, description, status, dueDate, estimatedDuration, actualDuration, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.goalId || null,
        newTask.title,
        newTask.description || null,
        newTask.status,
        newTask.dueDate || null,
        newTask.estimatedDuration || null,
        newTask.actualDuration || null,
        newTask.priority,
        newTask.createdAt,
        newTask.updatedAt,
      ]
    );

    return newTask;
  },

  async updateTask(task: Task): Promise<void> {
    const now = new Date().toISOString();
    await runExecute(
      `UPDATE tasks SET goalId = ?, title = ?, description = ?, status = ?, dueDate = ?, estimatedDuration = ?, actualDuration = ?, priority = ?, updatedAt = ?
       WHERE id = ?`,
      [
        task.goalId || null,
        task.title,
        task.description || null,
        task.status,
        task.dueDate || null,
        task.estimatedDuration || null,
        task.actualDuration || null,
        task.priority,
        now,
        task.id,
      ]
    );
  },

  async deleteTask(id: string): Promise<void> {
    await runExecute('DELETE FROM tasks WHERE id = ?', [id]);
  },
};
