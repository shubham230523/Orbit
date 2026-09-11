package com.orbit

import com.orbit.ai.*
import com.orbit.auth.AuthService
import com.orbit.auth.authRoutes
import com.orbit.goals.goalRoutes
import com.orbit.goals.roadmapRoutes
import com.orbit.tasks.taskRoutes
import com.orbit.scheduling.scheduleRoutes
import com.orbit.habits.habitRoutes
import com.orbit.calendar.MockCalendarProvider
import com.orbit.repositories.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import io.ktor.server.netty.*
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm

fun main(args: Array<String>): Unit = EngineMain.main(args)

fun Application.module() {
    val jwtSecret = "secret"
    val jwtIssuer = "orbit"
    val jwtAudience = "orbit"

    install(ContentNegotiation) {
        json()
    }

    install(Authentication) {
        jwt {
            realm = "Orbit Server"
            verifier(
                JWT.require(Algorithm.HMAC256(jwtSecret))
                    .withAudience(jwtAudience)
                    .withIssuer(jwtIssuer)
                    .build()
            )
            validate { credential ->
                if (credential.payload.audience.contains(jwtAudience)) {
                    JWTPrincipal(credential.payload)
                } else null
            }
        }
    }

    val userRepository = ExposedUserRepository()
    val goalRepository = ExposedGoalRepository()
    val roadmapRepository = ExposedRoadmapRepository()
    val taskRepository = ExposedTaskRepository()
    val scheduleRepository = ExposedScheduleRepository()
    val habitRepository = ExposedHabitRepository()
    val insightRepository = ExposedInsightRepository()
    val calendarProvider = MockCalendarProvider()
    
    val aiProvider = MockAIProvider() // Use GeminiProvider in production
    val goalWorkflow = GoalAnalysisWorkflow(aiProvider)
    val roadmapWorkflow = RoadmapWorkflow(aiProvider)
    val schedulerWorkflow = SchedulerWorkflow(aiProvider)
    val insightWorkflow = InsightWorkflow(aiProvider)
    val coachWorkflow = CoachWorkflow(aiProvider)
    val replanWorkflow = ReplanningWorkflow(aiProvider)
    
    val authService = AuthService(
        userRepository,
        jwtSecret = jwtSecret,
        jwtIssuer = jwtIssuer,
        jwtAudience = jwtAudience
    )

    routing {
        authRoutes(authService)
        goalRoutes(goalRepository)
        roadmapRoutes(roadmapRepository, goalRepository, roadmapWorkflow)
        taskRoutes(taskRepository)
        scheduleRoutes(scheduleRepository, taskRepository, calendarProvider, schedulerWorkflow)
        habitRoutes(habitRepository)
        aiRoutes(goalWorkflow)
        aiExtendedRoutes(
            insightWorkflow, 
            coachWorkflow, 
            replanWorkflow, 
            goalRepository, 
            taskRepository, 
            insightRepository
        )
        get("/") {
            io.ktor.server.response.respondText("Orbit API is running")
        }
    }
}
