package com.orbit.repositories

import com.orbit.models.Goal
import com.orbit.models.GoalStatus
import com.orbit.models.Priority
import com.orbit.db.Goals
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

interface GoalRepository {
    suspend fun createGoal(goal: Goal): Goal
    suspend fun getGoal(id: String): Goal?
    suspend fun getGoalsByUser(userId: String): List<Goal>
    suspend fun updateGoal(goal: Goal): Boolean
    suspend fun deleteGoal(id: String): Boolean
}

class ExposedGoalRepository : GoalRepository {
    private fun ResultRow.toGoal() = Goal(
        id = this[Goals.id],
        userId = this[Goals.userId],
        title = this[Goals.title],
        description = this[Goals.description],
        targetDate = this[Goals.targetDate],
        status = GoalStatus.valueOf(this[Goals.status]),
        priority = Priority.valueOf(this[Goals.priority]),
        createdAt = this[Goals.createdAt],
        updatedAt = this[Goals.updatedAt]
    )

    override suspend fun createGoal(goal: Goal): Goal = transaction {
        Goals.insert {
            it[id] = goal.id
            it[userId] = goal.userId
            it[title] = goal.title
            it[description] = goal.description
            it[targetDate] = goal.targetDate
            it[status] = goal.status.name
            it[priority] = goal.priority.name
            it[createdAt] = goal.createdAt
            it[updatedAt] = goal.updatedAt
        }
        goal
    }

    override suspend fun getGoal(id: String): Goal? = transaction {
        Goals.select { Goals.id eq id }
            .map { it.toGoal() }
            .singleOrNull()
    }

    override suspend fun getGoalsByUser(userId: String): List<Goal> = transaction {
        Goals.select { Goals.userId eq userId }
            .map { it.toGoal() }
    }

    override suspend fun updateGoal(goal: Goal): Boolean = transaction {
        Goals.update({ Goals.id eq goal.id }) {
            it[title] = goal.title
            it[description] = goal.description
            it[targetDate] = goal.targetDate
            it[status] = goal.status.name
            it[priority] = goal.priority.name
            it[updatedAt] = goal.updatedAt
        } > 0
    }

    override suspend fun deleteGoal(id: String): Boolean = transaction {
        Goals.deleteWhere { Goals.id eq id } > 0
    }
}
