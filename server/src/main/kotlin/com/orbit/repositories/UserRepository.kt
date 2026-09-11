package com.orbit.repositories

import com.orbit.models.User
import com.orbit.db.Users
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

interface UserRepository {
    suspend fun createUser(user: User): User
    suspend fun getUser(id: String): User?
    suspend fun getUserByEmail(email: String): User?
}

class ExposedUserRepository : UserRepository {
    private fun ResultRow.toUser() = User(
        id = this[Users.id],
        email = this[Users.email],
        name = this[Users.name],
        passwordHash = this[Users.passwordHash]
    )

    override suspend fun createUser(user: User): User = transaction {
        Users.insert {
            it[id] = user.id
            it[email] = user.email
            it[name] = user.name
            it[passwordHash] = user.passwordHash
        }
        user
    }

    override suspend fun getUser(id: String): User? = transaction {
        Users.select { Users.id eq id }
            .map { it.toUser() }
            .singleOrNull()
    }

    override suspend fun getUserByEmail(email: String): User? = transaction {
        Users.select { Users.email eq email }
            .map { it.toUser() }
            .singleOrNull()
    }
}
