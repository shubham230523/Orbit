import { taskService } from '../task-service';
import { runQuery, runExecute } from '@/db/client';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@/db/client', () => ({
  runQuery: jest.fn(),
  runExecute: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('TaskService', () => {
  const mockTask = {
    id: '1',
    goalId: 'goal-1',
    title: 'Test Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets tasks with goal titles', async () => {
    const mockTasksWithGoal = [{ ...mockTask, goalTitle: 'Test Goal' }];
    (runQuery as jest.Mock).mockResolvedValueOnce(mockTasksWithGoal);

    const tasks = await taskService.getTasks();

    expect(tasks).toEqual(mockTasksWithGoal);
    expect(runQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT t.*, g.title as goalTitle')
    );
  });

  it('creates a task', async () => {
    const newId = 'new-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(newId);
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    const taskData = {
      title: 'New Task',
      goalId: 'goal-1',
    };

    const task = await taskService.createTask(taskData);

    expect(task.id).toBe(newId);
    expect(task.title).toBe(taskData.title);
    expect(task.goalId).toBe(taskData.goalId);
    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tasks'),
      expect.arrayContaining([newId, taskData.goalId, taskData.title])
    );
  });

  it('updates a task', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    await taskService.updateTask(mockTask as any);

    expect(runExecute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE tasks SET'),
      expect.arrayContaining([mockTask.title, mockTask.id])
    );
  });

  it('deletes a task', async () => {
    (runExecute as jest.Mock).mockResolvedValueOnce(undefined);

    await taskService.deleteTask('1');

    expect(runExecute).toHaveBeenCalledWith(
      'DELETE FROM tasks WHERE id = ?',
      ['1']
    );
  });
});
