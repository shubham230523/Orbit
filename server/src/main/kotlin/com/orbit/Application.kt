package com.orbit

import com.orbit.auth.AuthService
import com.orbit.auth.authRoutes
import com.orbit.repositories.ExposedUserRepository
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import io.ktor.server.netty.*
import org.jetbrains.exposed.sql.Database

fun main(args: Array<String>): Unit = EngineMain.main(args)

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }

    // Database initialization (will be handled by a DB utility later)
    // Database.connect("jdbc:postgresql://localhost:5432/orbit", driver = "org.postgresql.Driver", user = "orbit", password = "password")

    val userRepository = ExposedUserRepository()
    val authService = AuthService(
        userRepository,
        jwtSecret = "secret", // Should be from env
        jwtIssuer = "orbit",
        jwtAudience = "orbit"
    )

    routing {
        authRoutes(authService)
        get("/") {
            io.ktor.server.response.respondText("Orbit API is running")
        }
    }
}
