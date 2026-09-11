package com.orbit.auth

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class SignupRequest(
    val email: String,
    val password: String,
    val name: String? = null
)

@Serializable
data class AuthResponse(
    val token: String,
    val userId: String,
    val email: String
)
