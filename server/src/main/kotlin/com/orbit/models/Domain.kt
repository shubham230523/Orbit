package com.orbit.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String? = null,
    val passwordHash: String
)

@Serializable
data class Goal(
    val id: String,
    val userId: String,
    val title: String,
    val description: String? = null,
    val targetDate: String? = null,
    val status: GoalStatus = GoalStatus.ACTIVE,
    val priority: Priority = Priority.MEDIUM,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
enum class GoalStatus {
    ACTIVE, COMPLETED, PAUSED, ARCHIVED
}

@Serializable
enum class Priority {
    LOW, MEDIUM, HIGH
}

@Serializable
data class Task(
    val id: String,
    val userId: String,
    val goalId: String? = null,
    val projectId: String? = null,
    val title: String,
    val description: String? = null,
    val status: TaskStatus = TaskStatus.TODO,
    val priority: Priority = Priority.MEDIUM,
    val dueDate: String? = null,
    val estimatedDuration: Int? = null,
    val actualDuration: Int? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
enum class TaskStatus {
    TODO, IN_PROGRESS, COMPLETED, BLOCKED
}

@Serializable
data class Roadmap(
    val id: String,
    val goalId: String,
    val title: String,
    val createdAt: String
)

@Serializable
data class Milestone(
    val id: String,
    val roadmapId: String,
    val title: String,
    val description: String? = null,
    val status: MilestoneStatus = MilestoneStatus.TODO,
    val dueDate: String? = null
)

@Serializable
enum class MilestoneStatus {
    TODO, COMPLETED
}

@Serializable
data class Project(
    val id: String,
    val userId: String,
    val goalId: String? = null,
    val title: String,
    val description: String? = null,
    val status: ProjectStatus = ProjectStatus.ACTIVE
)

@Serializable
enum class ProjectStatus {
    ACTIVE, COMPLETED, ARCHIVED
}

@Serializable
data class ScheduleBlock(
    val id: String,
    val userId: String,
    val taskId: String? = null,
    val title: String,
    val startTime: String,
    val endTime: String,
    val type: ScheduleBlockType = ScheduleBlockType.TASK
)

@Serializable
enum class ScheduleBlockType {
    TASK, EVENT, FOCUS, BREAK
}
