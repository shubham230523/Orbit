package com.orbit.scheduling

import com.orbit.ai.SchedulerWorkflow
import com.orbit.models.ScheduleBlock
import com.orbit.repositories.ScheduleRepository
import com.orbit.repositories.TaskRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.scheduleRoutes(
    scheduleRepository: ScheduleRepository,
    taskRepository: TaskRepository,
    schedulerWorkflow: SchedulerWorkflow
) {
    authenticate {
        route("/schedule") {
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val blocks = scheduleRepository.getScheduleByUser(userId)
                call.respond(blocks)
            }

            post("/generate") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val tasks = taskRepository.getTasksByUser(userId).filter { it.status != com.orbit.models.TaskStatus.COMPLETED }
                
                try {
                    val aiResponse = schedulerWorkflow.suggestSchedule(tasks, "9 AM to 5 PM")
                    val blocks = aiResponse.schedule.map { 
                        ScheduleBlock(
                            id = UUID.randomUUID().toString(),
                            userId = userId,
                            taskId = it.taskId,
                            title = tasks.find { t -> t.id == it.taskId }?.title ?: "Scheduled Task",
                            startTime = it.startTime,
                            endTime = it.endTime
                        )
                    }
                    
                    scheduleRepository.clearSchedule(userId)
                    scheduleRepository.createSchedule(blocks)
                    call.respond(HttpStatusCode.Created, blocks)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, e.message ?: "Scheduling failed")
                }
            }
        }
    }
}
