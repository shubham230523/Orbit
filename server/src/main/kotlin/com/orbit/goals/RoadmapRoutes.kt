package com.orbit.goals

import com.orbit.ai.RoadmapWorkflow
import com.orbit.models.Milestone
import com.orbit.models.MilestoneStatus
import com.orbit.models.Roadmap
import com.orbit.repositories.RoadmapRepository
import com.orbit.repositories.GoalRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.roadmapRoutes(
    roadmapRepository: RoadmapRepository,
    goalRepository: GoalRepository,
    roadmapWorkflow: RoadmapWorkflow
) {
    authenticate {
        route("/goals/{goalId}/roadmap") {
            get {
                val goalId = call.parameters["goalId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                val roadmap = roadmapRepository.getRoadmapByGoal(goalId)
                if (roadmap != null) {
                    val milestones = roadmapRepository.getMilestones(roadmap.id)
                    call.respond(mapOf("roadmap" to roadmap, "milestones" to milestones))
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            post("/generate") {
                val goalId = call.parameters["goalId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
                val goal = goalRepository.getGoal(goalId) ?: return@post call.respond(HttpStatusCode.NotFound)
                
                try {
                    val aiRoadmap = roadmapWorkflow.generateRoadmap(goal.title, goal.description)
                    val roadmapId = UUID.randomUUID().toString()
                    val roadmap = Roadmap(
                        id = roadmapId,
                        goalId = goalId,
                        title = "Roadmap for ${goal.title}",
                        createdAt = goal.createdAt // or current time
                    )
                    val milestones = aiRoadmap.milestones.map { 
                        Milestone(
                            id = UUID.randomUUID().toString(),
                            roadmapId = roadmapId,
                            title = it.title,
                            description = it.description,
                            status = MilestoneStatus.TODO,
                            dueDate = null // could be calculated from estimatedWeeks
                        )
                    }
                    
                    roadmapRepository.createRoadmap(roadmap, milestones)
                    call.respond(HttpStatusCode.Created, mapOf("roadmap" to roadmap, "milestones" to milestones))
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, e.message ?: "Roadmap generation failed")
                }
            }

            post("/save") {
                val goalId = call.parameters["goalId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
                val goal = goalRepository.getGoal(goalId) ?: return@post call.respond(HttpStatusCode.NotFound)
                val request = call.receive<com.orbit.ai.RoadmapAIResponse>()

                val roadmapId = UUID.randomUUID().toString()
                val roadmap = Roadmap(
                    id = roadmapId,
                    goalId = goalId,
                    title = "Roadmap for ${goal.title}",
                    createdAt = "2026-09-11T12:00:00" // Use actual time
                )
                val milestones = request.milestones.map {
                    Milestone(
                        id = UUID.randomUUID().toString(),
                        roadmapId = roadmapId,
                        title = it.title,
                        description = it.description,
                        status = MilestoneStatus.TODO,
                        dueDate = null
                    )
                }

                roadmapRepository.createRoadmap(roadmap, milestones)
                call.respond(HttpStatusCode.Created, mapOf("roadmap" to roadmap, "milestones" to milestones))
            }
        }
    }
}
