package com.orbit.repositories

import com.orbit.models.Insight
import com.orbit.models.InsightType
import com.orbit.db.Insights
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

interface InsightRepository {
    suspend fun createInsight(insight: Insight): Insight
    suspend fun getInsightsByUser(userId: String): List<Insight>
}

class ExposedInsightRepository : InsightRepository {
    private fun ResultRow.toInsight() = Insight(
        id = this[Insights.id],
        userId = this[Insights.userId],
        title = this[Insights.title],
        description = this[Insights.description],
        type = InsightType.valueOf(this[Insights.type]),
        createdAt = this[Insights.createdAt]
    )

    override suspend fun createInsight(insight: Insight): Insight = transaction {
        Insights.insert {
            it[id] = insight.id
            it[userId] = insight.userId
            it[title] = insight.title
            it[description] = insight.description
            it[type] = insight.type.name
            it[createdAt] = insight.createdAt
        }
        insight
    }

    override suspend fun getInsightsByUser(userId: String): List<Insight> = transaction {
        Insights.select { Insights.userId eq userId }
            .map { it.toInsight() }
    }
}
