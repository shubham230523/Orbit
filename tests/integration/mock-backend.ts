import { Goal, Roadmap, Milestone, Task, ScheduleBlock } from '@/types/domain';
import { apiClient } from '@/services/api-client';

class MockBackend {
  private goals: Goal[] = [];
  private roadmaps: Roadmap[] = [];
  private milestones: Milestone[] = [];
  private tasks: Task[] = [];
  private schedule: ScheduleBlock[] = [];

  reset() {
    this.goals = [];
    this.roadmaps = [];
    this.milestones = [];
    this.tasks = [];
    this.schedule = [];
    jest.clearAllMocks();
  }

  private generateId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  setupInterceptors() {
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/goals') return Promise.resolve({ data: this.goals });
      if (url.startsWith('/goals/') && url.endsWith('/roadmap')) {
        const goalId = url.split('/')[2];
        const roadmap = this.roadmaps.find(r => r.goalId === goalId);
        const milestones = this.milestones.filter(m => m.roadmapId === roadmap?.id);
        return Promise.resolve({ data: { roadmap, milestones } });
      }
      if (url.startsWith('/goals/')) {
        const id = url.split('/')[2];
        return Promise.resolve({ data: this.goals.find(g => g.id === id) });
      }
      if (url === '/tasks') return Promise.resolve({ data: this.tasks });
      if (url === '/schedule') return Promise.resolve({ data: this.schedule });

      return Promise.reject(new Error(`Unhandled GET: ${url}`));
    });

    (apiClient.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url === '/goals') {
        const newGoal = { ...data, id: this.generateId('g'), createdAt: new Date().toISOString() };
        this.goals.push(newGoal);
        return Promise.resolve({ data: newGoal });
      }
      if (url.endsWith('/roadmap/save')) {
        const goalId = url.split('/')[2];
        const goal = this.goals.find(g => g.id === goalId);
        const roadmap = {
          id: this.generateId('r'),
          goalId,
          title: goal?.title || 'Roadmap',
          createdAt: new Date().toISOString()
        };
        this.roadmaps.push(roadmap);
        const milestones = data.milestones.map((m: any) => ({
          ...m,
          id: this.generateId('m'),
          roadmapId: roadmap.id,
          status: 'todo'
        }));
        this.milestones.push(...milestones);
        return Promise.resolve({ data: { roadmap, milestones } });
      }
      if (url === '/tasks') {
        const newTask = { ...data, id: this.generateId('t'), createdAt: new Date().toISOString() };
        this.tasks.push(newTask);
        return Promise.resolve({ data: newTask });
      }
      if (url === '/schedule/save') {
        const blocks = data.schedule.map((b: any) => ({
            ...b,
            id: this.generateId('b'),
            userId: 'current-user',
            type: 'TASK'
        }));
        this.schedule = blocks;
        return Promise.resolve({ data: blocks });
      }

      return Promise.reject(new Error(`Unhandled POST: ${url}`));
    });

    (apiClient.put as jest.Mock).mockImplementation((url: string, data: any) => {
        if (url.startsWith('/tasks/')) {
            const id = url.split('/')[2];
            const index = this.tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...data };
            }
            return Promise.resolve({ data: this.tasks[index] });
        }
        return Promise.resolve({});
    });
  }

  seedTasks(tasks: Task[]) {
      this.tasks.push(...tasks);
  }

  seedGoals(goals: Goal[]) {
      this.goals.push(...goals);
  }

  getTasks() { return this.tasks; }
  getGoals() { return this.goals; }
  getSchedule() { return this.schedule; }
}

export const mockBackend = new MockBackend();

jest.mock('@/services/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn().mockReturnThis(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

mockBackend.setupInterceptors();
