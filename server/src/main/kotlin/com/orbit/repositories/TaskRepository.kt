package com.orbit.repositories

import com.orbit.models.Task
import com.orbit.models.TaskStatus
import com.orbit.models.Priority
import com.orbit.db.Tasks
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

interface TaskRepository {
    suspend fun createTask(task: Task): Task
    suspend fun getTask(id: String): Task?
    suspend fun getTasksByUser(userId: String): List<Task>
    suspend fun updateTask(task: Task): Boolean
    suspend fun deleteTask(id: String): Boolean
}

class ExposedTaskRepository : TaskRepository {
    private fun ResultRow.toTask() = Task(
        id = this[Tasks.id],
        userId = this[Tasks.userId],
        goalId = this[Tasks.goalId],
        projectId = this[Tasks.projectId],
        title = this[Tasks.title],
        description = this[Tasks.description],
        status = TaskStatus.valueOf(this[Tasks.status]),
        priority = Priority.valueOf(this[Tasks.priority]),
        dueDate = this[Tasks.dueDate],
        estimatedDuration = this[Tasks.estimatedDuration],
        actualDuration = this[Tasks.actualDuration],
        createdAt = this[Tasks.createdAt],
        updatedAt = this[Tasks.updatedAt]
    )

    override suspend fun createTask(task: Task): Task = transaction {
        Tasks.insert {
            it[id] = task.id
            it[userId] = task.userId
            it[goalId] = task.goalId
            it[projectId] = task.projectId
            it[title] = task.title
            it[description] = task.description
            it[status] = task.status.name
            it[priority] = task.priority.name
            it[dueDate] = task.dueDate
            it[estimatedDuration] = task.estimatedDuration
            it[actualDuration] = task.actualDuration
            it[createdAt] = task.createdAt
            it[updatedAt] = task.updatedAt
        }
        task
    }

    override suspend fun getTask(id: String): Task? = transaction {
        Tasks.select { Tasks.id eq id }
            .map { it.toTask() }
            .singleOrNull()
    }

    override suspend fun getTasksByUser(userId: String): List<Task> = transaction {
        Tasks.select { Tasks.userId eq userId }
            .map { it.toTask() }
    }

    override suspend fun updateTask(task: Task): Boolean = transaction {
        Tasks.update({ Tasks.id eq task.id }) {
            it[title] = task.title
            it[description] = task.description
            it[status] = task.status.name
            it[priority] = task.priority.name
            it[dueDate] = task.dueDate
            it[estimatedDuration] = task.estimatedDuration
            it[actualDuration] = task.actualDuration
            it[updatedAt] = task.updatedAt
        } > 0
    }

    override suspend fun deleteTask(id: String): Boolean = transaction {
        Tasks.deleteWhere { Tasks.id eq id } > 0
    }
}
