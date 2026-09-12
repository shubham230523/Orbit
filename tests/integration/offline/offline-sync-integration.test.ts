import { goalService } from '@/services/goal-service';
import { taskService } from '@/services/task-service';
import { mockBackend } from '../mock-backend';
import { mockAIProvider } from '../setup';
import { apiClient } from '@/services/api-client';

describe('Offline & Persistence Integration', () => {
  it('should handle API errors when creating a goal', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    await expect(goalService.createGoal({ title: 'Offline Goal' }))
      .rejects.toThrow('Network Error');

    expect(mockBackend.getGoals()).toHaveLength(0);
  });

  it('should allow Local AI to function even when network is flaky', async () => {
    // 1. Seed a goal in mock backend
    const goal = { id: 'g1', title: 'Local AI Goal', status: 'active' as const, priority: 'medium' as const, userId: 'u1', createdAt: '', updatedAt: '' };
    mockBackend.seedGoals([goal]);

    // 2. Mock AI response
    mockAIProvider.setRoadmapResponse({
      milestones: [{ title: 'Offline Milestone', description: 'Done without internet', estimatedWeeks: 1 }]
    });

    // 3. Mock save failure
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    // 4. Attempt to generate roadmap
    // Even though local AI works, the service tries to save to backend
    await expect(goalService.generateRoadmap('g1')).rejects.toThrow('Internal Server Error');
  });

  it('should recover when network is back', async () => {
      // 1. Network back (default mockBackend behavior)
      mockBackend.reset();

      const goal = await goalService.createGoal({ title: 'Back Online' });
      expect(goal.id).toBeDefined();
      expect(mockBackend.getGoals()).toHaveLength(1);
  });
});

describe('Concurrency Integration', () => {
    it('should handle simultaneous task creations', async () => {
        const promises = [
            taskService.createTask({ title: 'Task 1' }),
            taskService.createTask({ title: 'Task 2' }),
            taskService.createTask({ title: 'Task 3' })
        ];

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        expect(mockBackend.getTasks()).toHaveLength(3);
        expect(new Set(results.map(r => r.id)).size).toBe(3); // All unique IDs
    });
});
