package com.orbit.ai

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.aiRoutes(goalWorkflow: GoalAnalysisWorkflow) {
    route("/ai") {
        post("/analyze-goal") {
            val request = call.receive<AnalyzeGoalRequest>()
            try {
                val analysis = goalWorkflow.analyzeGoal(request.title)
                call.respond(analysis)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, e.message ?: "AI Analysis failed")
            }
        }
    }
}

@kotlinx.serialization.Serializable
data class AnalyzeGoalRequest(val title: String)
