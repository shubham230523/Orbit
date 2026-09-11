package com.orbit.goals

import com.orbit.models.Goal
import com.orbit.repositories.GoalRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.goalRoutes(goalRepository: GoalRepository) {
    authenticate {
        route("/goals") {
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val goals = goalRepository.getGoalsByUser(userId)
                call.respond(goals)
            }

            post {
                val goal = call.receive<Goal>()
                val createdGoal = goalRepository.createGoal(goal)
                call.respond(HttpStatusCode.Created, createdGoal)
            }

            get("/{id}") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                val goal = goalRepository.getGoal(id)
                if (goal != null) {
                    call.respond(goal)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            put("/{id}") {
                val goal = call.receive<Goal>()
                if (goalRepository.updateGoal(goal)) {
                    call.respond(HttpStatusCode.OK)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            delete("/{id}") {
                val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest)
                if (goalRepository.deleteGoal(id)) {
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }
}
