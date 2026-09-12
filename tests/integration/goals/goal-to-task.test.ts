import { goalService } from '@/services/goal-service';
import { taskService } from '@/services/task-service';
import { mockBackend } from '../mock-backend';
import { mockAIProvider } from '../setup';

describe('Goal to Task Integration', () => {
  it('should create a goal, generate a roadmap, and allow creating tasks linked to the goal', async () => {
    // 1. Create a Goal
    const goalData = {
      title: 'Learn Integration Testing',
      description: 'Master device-free integration tests in Orbit',
      priority: 'high' as const,
      status: 'active' as const,
      userId: 'user-1'
    };

    const goal = await goalService.createGoal(goalData);
    expect(goal.id).toBeDefined();
    expect(mockBackend.getGoals()).toHaveLength(1);

    // 2. Setup AI mock response for Roadmap
    mockAIProvider.setRoadmapResponse({
      milestones: [
        { title: 'Setup Infrastructure', description: 'Configure Jest and mocks', estimatedWeeks: 1 },
        { title: 'Write First Test', description: 'Create a simple integration test', estimatedWeeks: 1 }
      ]
    });

    // 3. Generate Roadmap
    const { roadmap, milestones } = await goalService.generateRoadmap(goal.id);

    expect(roadmap).toBeDefined();
    expect(milestones).toHaveLength(2);
    expect(milestones[0].title).toBe('Setup Infrastructure');

    // 4. Create a Task for the goal
    const taskData = {
      goalId: goal.id,
      title: 'Implement mock-backend.ts',
      status: 'todo' as const,
      priority: 'high' as const,
      estimatedDuration: 60
    };

    const task = await taskService.createTask(taskData);
    expect(task.id).toBeDefined();
    expect(task.goalId).toBe(goal.id);

    // 5. Verify persistence in mock backend
    const allTasks = await taskService.getTasks();
    expect(allTasks).toContainEqual(expect.objectContaining({
      title: 'Implement mock-backend.ts',
      goalId: goal.id
    }));
  });
});
