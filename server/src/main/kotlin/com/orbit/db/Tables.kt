package com.orbit.db

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.datetime

object Users : Table("users") {
    val id = varchar("id", 50)
    val email = varchar("email", 255).uniqueIndex()
    val name = varchar("name", 255).nullable()
    val passwordHash = varchar("password_hash", 255)
    
    override val primaryKey = PrimaryKey(id)
}

object Goals : Table("goals") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val targetDate = varchar("target_date", 50).nullable()
    val status = varchar("status", 50)
    val priority = varchar("priority", 50)
    val createdAt = varchar("created_at", 50)
    val updatedAt = varchar("updated_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object Tasks : Table("tasks") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val goalId = varchar("goal_id", 50).references(Goals.id).nullable()
    val projectId = varchar("project_id", 50).nullable()
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val status = varchar("status", 50)
    val priority = varchar("priority", 50)
    val dueDate = varchar("due_date", 50).nullable()
    val estimatedDuration = integer("estimated_duration").nullable()
    val actualDuration = integer("actual_duration").nullable()
    val createdAt = varchar("created_at", 50)
    val updatedAt = varchar("updated_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object Roadmaps : Table("roadmaps") {
    val id = varchar("id", 50)
    val goalId = varchar("goal_id", 50).references(Goals.id)
    val title = varchar("title", 255)
    val createdAt = varchar("created_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object Milestones : Table("milestones") {
    val id = varchar("id", 50)
    val roadmapId = varchar("roadmap_id", 50).references(Roadmaps.id)
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val status = varchar("status", 50)
    val dueDate = varchar("due_date", 50).nullable()

    override val primaryKey = PrimaryKey(id)
}

object ScheduleBlocks : Table("schedule_blocks") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val taskId = varchar("task_id", 50).references(Tasks.id).nullable()
    val title = varchar("title", 255)
    val startTime = varchar("start_time", 50)
    val endTime = varchar("end_time", 50)
    val type = varchar("type", 50)

    override val primaryKey = PrimaryKey(id)
}

object Habits : Table("habits") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val title = varchar("title", 255)
    val frequency = varchar("frequency", 50)
    val createdAt = varchar("created_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object HabitEntries : Table("habit_entries") {
    val id = varchar("id", 50)
    val habitId = varchar("habit_id", 50) references Habits.id
    val date = varchar("date", 50)
    val completed = bool("completed")

    override val primaryKey = PrimaryKey(id)
}

object ProgressSnapshots : Table("progress_snapshots") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val goalId = varchar("goal_id", 50).references(Goals.id).nullable()
    val date = varchar("date", 50)
    val completionRate = double("completion_rate")
    val tasksCompleted = integer("tasks_completed")
    val habitsCompleted = integer("habits_completed")

    override val primaryKey = PrimaryKey(id)
}

object Insights : Table("insights") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val title = varchar("title", 255)
    val description = text("description")
    val type = varchar("type", 50)
    val createdAt = varchar("created_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object Conversations : Table("conversations") {
    val id = varchar("id", 50)
    val userId = varchar("user_id", 50) references Users.id
    val title = varchar("title", 255)
    val createdAt = varchar("created_at", 50)

    override val primaryKey = PrimaryKey(id)
}

object Messages : Table("messages") {
    val id = varchar("id", 50)
    val conversationId = varchar("conversation_id", 50) references Conversations.id
    val role = varchar("role", 20)
    val content = text("content")
    val createdAt = varchar("created_at", 50)

    override val primaryKey = PrimaryKey(id)
}
