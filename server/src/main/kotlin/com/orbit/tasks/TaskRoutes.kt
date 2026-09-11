package com.orbit.tasks

import com.orbit.models.Task
import com.orbit.repositories.TaskRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.taskRoutes(taskRepository: TaskRepository) {
    authenticate {
        route("/tasks") {
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val tasks = taskRepository.getTasksByUser(userId)
                call.respond(tasks)
            }

            post {
                val task = call.receive<Task>()
                val createdTask = taskRepository.createTask(task)
                call.respond(HttpStatusCode.Created, createdTask)
            }

            get("/{id}") {
                val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                val task = taskRepository.getTask(id)
                if (task != null) {
                    call.respond(task)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            put("/{id}") {
                val task = call.receive<Task>()
                if (taskRepository.updateTask(task)) {
                    call.respond(HttpStatusCode.OK)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            delete("/{id}") {
                val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest)
                if (taskRepository.deleteTask(id)) {
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }
}
