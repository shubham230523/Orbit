package com.orbit.auth

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.authRoutes(authService: AuthService) {
    post("/auth/signup") {
        val request = call.receive<SignupRequest>()
        val user = authService.signup(request.email, request.password, request.name)
        if (user != null) {
            val token = authService.login(request.email, request.password) ?: ""
            call.respond(AuthResponse(token, user.id, user.email))
        } else {
            call.respond(HttpStatusCode.Conflict, "User already exists")
        }
    }

    post("/auth/login") {
        val request = call.receive<LoginRequest>()
        val token = authService.login(request.email, request.password)
        if (token != null) {
            // In a real app, we'd fetch the user to get the ID/Email
            call.respond(AuthResponse(token, "", request.email))
        } else {
            call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
        }
    }
}
