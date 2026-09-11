package com.orbit.habits

import com.orbit.models.Habit
import com.orbit.models.HabitEntry
import com.orbit.repositories.HabitRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.habitRoutes(habitRepository: HabitRepository) {
    authenticate {
        route("/habits") {
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val habits = habitRepository.getHabitsByUser(userId)
                call.respond(habits)
            }

            post {
                val habit = call.receive<Habit>()
                val createdHabit = habitRepository.createHabit(habit)
                call.respond(HttpStatusCode.Created, createdHabit)
            }

            post("/{id}/log") {
                val habitId = call.parameters["id"] ?: return@post call.respond(HttpStatusCode.BadRequest)
                val request = call.receive<HabitLogRequest>()
                val entry = HabitEntry(
                    id = UUID.randomUUID().toString(),
                    habitId = habitId,
                    date = request.date,
                    completed = request.completed
                )
                val loggedEntry = habitRepository.logHabit(entry)
                call.respond(HttpStatusCode.Created, loggedEntry)
            }
        }
    }
}

@kotlinx.serialization.Serializable
data class HabitLogRequest(val date: String, val completed: Boolean)
