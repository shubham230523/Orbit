package com.orbit.ai

import com.orbit.repositories.GoalRepository
import com.orbit.repositories.TaskRepository
import com.orbit.repositories.InsightRepository
import com.orbit.models.Insight
import com.orbit.models.InsightType
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.aiExtendedRoutes(
    insightWorkflow: InsightWorkflow,
    coachWorkflow: CoachWorkflow,
    replanWorkflow: ReplanningWorkflow,
    goalRepository: GoalRepository,
    taskRepository: TaskRepository,
    insightRepository: InsightRepository
) {
    authenticate {
        route("/ai") {
            post("/generate-insights") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val goals = goalRepository.getGoalsByUser(userId)
                val tasks = taskRepository.getTasksByUser(userId)
                
                try {
                    val aiResponse = insightWorkflow.generateInsights(goals, tasks)
                    val insights = aiResponse.insights.map { 
                        Insight(
                            id = UUID.randomUUID().toString(),
                            userId = userId,
                            title = it.title,
                            description = it.description,
                            type = InsightType.valueOf(it.type),
                            createdAt = "2026-09-11T12:00:00" // Use actual time
                        )
                    }
                    // For now just return, later persist
                    call.respond(insights)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, e.message ?: "Failed to generate insights")
                }
            }

            post("/chat") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val request = call.receive<ChatRequest>()
                val goals = goalRepository.getGoalsByUser(userId)
                val tasks = taskRepository.getTasksByUser(userId)
                
                try {
                    val response = coachWorkflow.chat(emptyList(), request.message, goals, tasks)
                    call.respond(ChatResponse(response))
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, e.message ?: "Coach failed")
                }
            }
        }
    }
}

@kotlinx.serialization.Serializable
data class ChatRequest(val message: String)

@kotlinx.serialization.Serializable
data class ChatResponse(val reply: String)
