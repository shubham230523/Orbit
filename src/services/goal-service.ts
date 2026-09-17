import { v4 as uuidv4 } from 'uuid';
import { runQuery, runExecute } from '@/db/client';
import { Goal, Roadmap, Milestone } from '@/types/domain';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { AIProviderType } from './ai/types';
import { useAuthStore } from '@/store/use-auth-store';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];

    return await runQuery<Goal>(
      'SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
  },

  async getGoal(id: string): Promise<Goal> {
    const goals = await runQuery<Goal>(
      'SELECT * FROM goals WHERE id = ?',
      [id]
    );
    if (goals.length === 0) throw new Error('Goal not found');
    return goals[0];
  },

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');

    const id = uuidv4();
    const now = new Date().toISOString();

    const newGoal: Goal = {
      id,
      userId,
      title: goal.title || '',
      description: goal.description,
      targetDate: goal.targetDate,
      status: goal.status || 'active',
      priority: goal.priority || 'medium',
      createdAt: now,
      updatedAt: now,
    };

    await runExecute(
      `INSERT INTO goals (id, userId, title, description, targetDate, status, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newGoal.id,
        newGoal.userId,
        newGoal.title,
        newGoal.description || null,
        newGoal.targetDate || null,
        newGoal.status,
        newGoal.priority,
        newGoal.createdAt,
        newGoal.updatedAt,
      ]
    );

    return newGoal;
  },

  async updateGoal(goal: Goal): Promise<void> {
    const now = new Date().toISOString();
    await runExecute(
      `UPDATE goals SET title = ?, description = ?, targetDate = ?, status = ?, priority = ?, updatedAt = ?
       WHERE id = ?`,
      [
        goal.title,
        goal.description || null,
        goal.targetDate || null,
        goal.status,
        goal.priority,
        now,
        goal.id,
      ]
    );
  },

  async deleteGoal(id: string): Promise<void> {
    // Delete milestones and roadmaps first due to foreign keys if they are not ON DELETE CASCADE
    // Our schema doesn't have CASCADE, but it has ON foreign_keys = ON.
    // Roadmaps have goalId, Milestones have roadmapId.

    const roadmaps = await runQuery<Roadmap>('SELECT * FROM roadmaps WHERE goalId = ?', [id]);
    for (const rm of roadmaps) {
      await runExecute('DELETE FROM milestones WHERE roadmapId = ?', [rm.id]);
      await runExecute('DELETE FROM roadmaps WHERE id = ?', [rm.id]);
    }

    await runExecute('DELETE FROM tasks WHERE goalId = ?', [id]);
    await runExecute('DELETE FROM goals WHERE id = ?', [id]);
  },

  async getRoadmap(goalId: string): Promise<{ roadmap: Roadmap; milestones: Milestone[] }> {
    const roadmaps = await runQuery<Roadmap>(
      'SELECT * FROM roadmaps WHERE goalId = ?',
      [goalId]
    );

    if (roadmaps.length === 0) {
      throw new Error('Roadmap not found');
    }

    const roadmap = roadmaps[0];
    const milestones = await runQuery<Milestone>(
      'SELECT * FROM milestones WHERE roadmapId = ? ORDER BY dueDate ASC',
      [roadmap.id]
    );

    return { roadmap, milestones };
  },

  async generateRoadmap(goalId: string): Promise<{ roadmap: Roadmap; milestones: Milestone[] }> {
    console.log('[GoalService] generateRoadmap started for:', goalId);
    const provider = AIProviderFactory.getProvider();

    console.log('[GoalService] Fetching goal data...');
    const goal = await this.getGoal(goalId);
    console.log('[GoalService] Goal found:', goal.title);

    console.log('[GoalService] Calling AI provider to generate roadmap...');
    const aiResponse = await provider.generateRoadmap(goal.title, goal.description);
    console.log('[GoalService] AI response received. Milestones count:', aiResponse.milestones.length);

    // Save locally generated roadmap to SQLite
    const roadmapId = uuidv4();
    const now = new Date().toISOString();

    const roadmap: Roadmap = {
      id: roadmapId,
      goalId,
      title: `Roadmap for ${goal.title}`,
      createdAt: now,
    };

    console.log('[GoalService] Saving roadmap to database...');
    await runExecute(
      'INSERT INTO roadmaps (id, goalId, title, createdAt) VALUES (?, ?, ?, ?)',
      [roadmap.id, roadmap.goalId, roadmap.title, roadmap.createdAt]
    );

    const milestones: Milestone[] = [];
    console.log('[GoalService] Saving milestones...');
    const seenTitles = new Set<string>();

    for (const m of aiResponse.milestones) {
      let uniqueTitle = m.title;
      let counter = 1;
      while (seenTitles.has(uniqueTitle.toLowerCase())) {
        uniqueTitle = `${m.title} (${++counter})`;
      }
      seenTitles.add(uniqueTitle.toLowerCase());

      const milestone: Milestone = {
        id: uuidv4(),
        roadmapId,
        title: uniqueTitle,
        description: m.description,
        status: 'todo',
        // Assuming AI provides some sort of duration we could map to a date, but for now null
        dueDate: undefined,
      };

      await runExecute(
        'INSERT INTO milestones (id, roadmapId, title, description, status, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
        [milestone.id, milestone.roadmapId, milestone.title, milestone.description || null, milestone.status, milestone.dueDate || null]
      );
      milestones.push(milestone);
    }

    console.log('[GoalService] Roadmap generation complete!');
    return { roadmap, milestones };
  },
};
