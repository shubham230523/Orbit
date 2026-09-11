package com.orbit

import com.orbit.ai.AIRoutes
import com.orbit.ai.GoalAnalysisWorkflow
import com.orbit.ai.RoadmapWorkflow
import com.orbit.ai.MockAIProvider
import com.orbit.auth.AuthService
import com.orbit.auth.authRoutes
import com.orbit.goals.goalRoutes
import com.orbit.goals.roadmapRoutes
import com.orbit.tasks.taskRoutes
import com.orbit.scheduling.scheduleRoutes
import com.orbit.repositories.ExposedGoalRepository
import com.orbit.repositories.ExposedUserRepository
import com.orbit.repositories.ExposedRoadmapRepository
import com.orbit.repositories.ExposedTaskRepository
import com.orbit.repositories.ExposedScheduleRepository
import com.orbit.ai.SchedulerWorkflow
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
    
    val aiProvider = MockAIProvider() // Use GeminiProvider in production
    val goalWorkflow = GoalAnalysisWorkflow(aiProvider)
    val roadmapWorkflow = RoadmapWorkflow(aiProvider)
    val schedulerWorkflow = SchedulerWorkflow(aiProvider)
    
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
        scheduleRoutes(scheduleRepository, taskRepository, schedulerWorkflow)
        com.orbit.ai.aiRoutes(goalWorkflow)
        get("/") {
            io.ktor.server.response.respondText("Orbit API is running")
        }
    }
}
