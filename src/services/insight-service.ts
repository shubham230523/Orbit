import { runQuery } from '@/db/client';
import { useAuthStore } from '@/store/use-auth-store';
import { differenceInDays, parseISO, startOfDay, subDays, format } from 'date-fns';

export interface ProductivityStats {
  completionRate: number; // Percentage
  tasksCompleted: number;
  totalTasks: number;
  habitStreaks: Record<string, number>;
  focusTimeMinutes: number;
  weeklyActivity: { day: string; completed: number }[];
}

export const insightService = {
  async getProductivityStats(): Promise<ProductivityStats> {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      return {
        completionRate: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        habitStreaks: {},
        focusTimeMinutes: 0,
        weeklyActivity: [],
      };
    }

    // 1. Task Completion Stats
    const allTasks = await runQuery<{ status: string; actualDuration: number }>(
      `SELECT t.status, t.actualDuration
       FROM tasks t
       INNER JOIN goals g ON t.goalId = g.id
       WHERE g.userId = ?`,
      [userId]
    );

    const tasksCompleted = allTasks.filter(t => t.status === 'completed').length;
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
    const focusTimeMinutes = allTasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0);

    // 2. Habit Streaks
    const habits = await runQuery<{ id: string; title: string }>(
      'SELECT id, title FROM habits WHERE userId = ?',
      [userId]
    );
    const habitStreaks: Record<string, number> = {};

    for (const habit of habits) {
      const entries = await runQuery<{ date: string; completed: number }>(
        'SELECT date, completed FROM habit_entries WHERE habitId = ? ORDER BY date DESC',
        [habit.id]
      );

      let streak = 0;
      const today = startOfDay(new Date());

      for (let i = 0; i < entries.length; i++) {
        const entryDate = startOfDay(parseISO(entries[i].date));
        const diff = differenceInDays(today, entryDate);

        // If missed a day (diff > i), streak is broken.
        // We allow 0 (today) or 1 (yesterday) for the first entry.
        if (entries[i].completed === 1 && diff <= i) {
          streak++;
        } else if (diff > i) {
          break;
        }
      }
      habitStreaks[habit.title] = streak;
    }

    // 3. Weekly Activity
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');

      // Query completed tasks for this day belonging to the current user
      const count = await runQuery<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM tasks t
         INNER JOIN goals g ON t.goalId = g.id
         WHERE t.status = 'completed'
         AND date(t.updatedAt) = date(?)
         AND g.userId = ?`,
        [dateStr, userId]
      );

      weeklyActivity.push({
        day: dayName,
        completed: count[0]?.count || 0
      });
    }

    return {
      completionRate,
      tasksCompleted,
      totalTasks,
      habitStreaks,
      focusTimeMinutes,
      weeklyActivity,
    };
  }
};
