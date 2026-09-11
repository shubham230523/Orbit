package com.orbit

import com.orbit.auth.AuthService
import com.orbit.auth.authRoutes
import com.orbit.goals.goalRoutes
import com.orbit.repositories.ExposedGoalRepository
import com.orbit.repositories.ExposedUserRepository
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
    val authService = AuthService(
        userRepository,
        jwtSecret = jwtSecret,
        jwtIssuer = jwtIssuer,
        jwtAudience = jwtAudience
    )

    routing {
        authRoutes(authService)
        goalRoutes(goalRepository)
        get("/") {
            io.ktor.server.response.respondText("Orbit API is running")
        }
    }
}
