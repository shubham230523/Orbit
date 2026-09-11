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
