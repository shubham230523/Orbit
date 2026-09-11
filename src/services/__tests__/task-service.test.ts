import { taskService } from '../task-service';
import { apiClient } from '../api-client';

jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('TaskService', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets tasks', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [mockTask] });
    const tasks = await taskService.getTasks();
    expect(tasks).toEqual([mockTask]);
    expect(apiClient.get).toHaveBeenCalledWith('/tasks');
  });

  it('creates a task', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockTask });
    const task = await taskService.createTask({ title: 'New Task' });
    expect(task).toEqual(mockTask);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks', { title: 'New Task' });
  });

  it('updates a task', async () => {
    (apiClient.put as jest.Mock).mockResolvedValueOnce({});
    await taskService.updateTask(mockTask as any);
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/1', mockTask);
  });

  it('deletes a task', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
    await taskService.deleteTask('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
  });
});
