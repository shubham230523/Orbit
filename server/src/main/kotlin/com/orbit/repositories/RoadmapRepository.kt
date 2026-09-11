package com.orbit.repositories

import com.orbit.models.Roadmap
import com.orbit.models.Milestone
import com.orbit.models.MilestoneStatus
import com.orbit.db.Roadmaps
import com.orbit.db.Milestones
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

interface RoadmapRepository {
    suspend fun createRoadmap(roadmap: Roadmap, milestones: List<Milestone>): Roadmap
    suspend fun getRoadmapByGoal(goalId: String): Roadmap?
    suspend fun getMilestones(roadmapId: String): List<Milestone>
}

class ExposedRoadmapRepository : RoadmapRepository {
    private fun ResultRow.toRoadmap() = Roadmap(
        id = this[Roadmaps.id],
        goalId = this[Roadmaps.goalId],
        title = this[Roadmaps.title],
        createdAt = this[Roadmaps.createdAt]
    )

    private fun ResultRow.toMilestone() = Milestone(
        id = this[Milestones.id],
        roadmapId = this[Milestones.roadmapId],
        title = this[Milestones.title],
        description = this[Milestones.description],
        status = MilestoneStatus.valueOf(this[Milestones.status]),
        dueDate = this[Milestones.dueDate]
    )

    override suspend fun createRoadmap(roadmap: Roadmap, milestones: List<Milestone>): Roadmap = transaction {
        Roadmaps.insert {
            it[id] = roadmap.id
            it[goalId] = roadmap.goalId
            it[title] = roadmap.title
            it[createdAt] = roadmap.createdAt
        }
        milestones.forEach { milestone ->
            Milestones.insert {
                it[id] = milestone.id
                it[roadmapId] = milestone.roadmapId
                it[title] = milestone.title
                it[description] = milestone.description
                it[status] = milestone.status.name
                it[dueDate] = milestone.dueDate
            }
        }
        roadmap
    }

    override suspend fun getRoadmapByGoal(goalId: String): Roadmap? = transaction {
        Roadmaps.select { Roadmaps.goalId eq goalId }
            .map { it.toRoadmap() }
            .singleOrNull()
    }

    override suspend fun getMilestones(roadmapId: String): List<Milestone> = transaction {
        Milestones.select { Milestones.roadmapId eq roadmapId }
            .map { it.toMilestone() }
    }
}
