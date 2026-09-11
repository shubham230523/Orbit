package com.orbit.repositories

import com.orbit.models.Habit
import com.orbit.models.HabitEntry
import com.orbit.models.HabitFrequency
import com.orbit.db.Habits
import com.orbit.db.HabitEntries
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

interface HabitRepository {
    suspend fun createHabit(habit: Habit): Habit
    suspend fun getHabitsByUser(userId: String): List<Habit>
    suspend fun logHabit(entry: HabitEntry): HabitEntry
    suspend fun getHabitLogs(habitId: String): List<HabitEntry>
}

class ExposedHabitRepository : HabitRepository {
    private fun ResultRow.toHabit() = Habit(
        id = this[Habits.id],
        userId = this[Habits.userId],
        title = this[Habits.title],
        frequency = HabitFrequency.valueOf(this[Habits.frequency]),
        createdAt = this[Habits.createdAt]
    )

    private fun ResultRow.toEntry() = HabitEntry(
        id = this[HabitEntries.id],
        habitId = this[HabitEntries.habitId],
        date = this[HabitEntries.date],
        completed = this[HabitEntries.completed]
    )

    override suspend fun createHabit(habit: Habit): Habit = transaction {
        Habits.insert {
            it[id] = habit.id
            it[userId] = habit.userId
            it[title] = habit.title
            it[frequency] = habit.frequency.name
            it[createdAt] = habit.createdAt
        }
        habit
    }

    override suspend fun getHabitsByUser(userId: String): List<Habit> = transaction {
        Habits.select { Habits.userId eq userId }
            .map { it.toHabit() }
    }

    override suspend fun logHabit(entry: HabitEntry): HabitEntry = transaction {
        HabitEntries.insert {
            it[id] = entry.id
            it[habitId] = entry.habitId
            it[date] = entry.date
            it[completed] = entry.completed
        }
        entry
    }

    override suspend fun getHabitLogs(habitId: String): List<HabitEntry> = transaction {
        HabitEntries.select { HabitEntries.habitId eq habitId }
            .map { it.toEntry() }
    }
}
