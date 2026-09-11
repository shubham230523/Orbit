package com.orbit.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.orbit.models.User
import com.orbit.repositories.UserRepository
import org.mindrot.jbcrypt.BCrypt
import java.util.*

class AuthService(
    private val userRepository: UserRepository,
    private val jwtSecret: String,
    private val jwtIssuer: String,
    private val jwtAudience: String
) {
    suspend fun signup(email: String, password: String, name: String?): User? {
        if (userRepository.getUserByEmail(email) != null) return null
        
        val passwordHash = BCrypt.hashpw(password, BCrypt.gensalt())
        val user = User(
            id = UUID.randomUUID().toString(),
            email = email,
            name = name,
            passwordHash = passwordHash
        )
        return userRepository.createUser(user)
    }

    suspend fun login(email: String, password: String): String? {
        val user = userRepository.getUserByEmail(email) ?: return null
        if (!BCrypt.checkpw(password, user.passwordHash)) return null
        
        return generateToken(user)
    }

    private fun generateToken(user: User): String {
        return JWT.create()
            .withAudience(jwtAudience)
            .withIssuer(jwtIssuer)
            .withClaim("userId", user.id)
            .withExpiresAt(Date(System.currentTimeMillis() + 3600000 * 24)) // 24 hours
            .sign(Algorithm.HMAC256(jwtSecret))
    }
}
