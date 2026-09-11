package com.orbit.scheduling

import com.orbit.ai.SchedulerWorkflow
import com.orbit.calendar.CalendarProvider
import com.orbit.models.ScheduleBlock
import com.orbit.models.ScheduleBlockType
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
    calendarProvider: CalendarProvider,
    schedulerWorkflow: SchedulerWorkflow
) {
    val validator = ScheduleValidator()

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
                val calendarEvents = calendarProvider.getEvents(userId, "", "")
                
                try {
                    val aiResponse = schedulerWorkflow.suggestSchedule(tasks, "9 AM to 5 PM with calendar constraints")
                    val taskBlocks = aiResponse.schedule.map { 
                        ScheduleBlock(
                            id = UUID.randomUUID().toString(),
                            userId = userId,
                            taskId = it.taskId,
                            title = tasks.find { t -> t.id == it.taskId }?.title ?: "Scheduled Task",
                            startTime = it.startTime,
                            endTime = it.endTime,
                            type = ScheduleBlockType.TASK
                        )
                    }

                    val eventBlocks = calendarEvents.map {
                        ScheduleBlock(
                            id = UUID.randomUUID().toString(),
                            userId = userId,
                            title = it.title,
                            startTime = it.startTime,
                            endTime = it.endTime,
                            type = ScheduleBlockType.EVENT
                        )
                    }
                    
                    val allBlocks = (taskBlocks + eventBlocks).sortedBy { it.startTime }
                    
                    scheduleRepository.clearSchedule(userId)
                    scheduleRepository.createSchedule(allBlocks)
                    call.respond(HttpStatusCode.Created, allBlocks)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, e.message ?: "Scheduling failed")
                }
            }

            post("/save") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString() ?: ""
                val request = call.receive<com.orbit.ai.SchedulerAIResponse>()
                
                val tasks = taskRepository.getTasksByUser(userId)
                val rawBlocks = request.schedule.map { 
                    com.orbit.models.ScheduleBlock(
                        id = UUID.randomUUID().toString(),
                        userId = userId,
                        taskId = it.taskId,
                        title = tasks.find { t -> t.id == it.taskId }?.title ?: "Scheduled Task",
                        startTime = it.startTime,
                        endTime = it.endTime
                    )
                }

                val blocks = validator.validate(rawBlocks, tasks)

                scheduleRepository.clearSchedule(userId)
                scheduleRepository.createSchedule(blocks)
                call.respond(HttpStatusCode.Created, blocks)
            }
        }
    }
}
