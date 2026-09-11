package com.orbit.repositories

import com.orbit.models.ScheduleBlock
import com.orbit.models.ScheduleBlockType
import com.orbit.db.ScheduleBlocks
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

interface ScheduleRepository {
    suspend fun createSchedule(blocks: List<ScheduleBlock>)
    suspend fun getScheduleByUser(userId: String): List<ScheduleBlock>
    suspend fun clearSchedule(userId: String)
}

class ExposedScheduleRepository : ScheduleRepository {
    private fun ResultRow.toBlock() = ScheduleBlock(
        id = this[ScheduleBlocks.id],
        userId = this[ScheduleBlocks.userId],
        taskId = this[ScheduleBlocks.taskId],
        title = this[ScheduleBlocks.title],
        startTime = this[ScheduleBlocks.startTime],
        endTime = this[ScheduleBlocks.endTime],
        type = ScheduleBlockType.valueOf(this[ScheduleBlocks.type])
    )

    override suspend fun createSchedule(blocks: List<ScheduleBlock>) = transaction {
        blocks.forEach { block ->
            ScheduleBlocks.insert {
                it[id] = block.id
                it[userId] = block.userId
                it[taskId] = block.taskId
                it[title] = block.title
                it[startTime] = block.startTime
                it[endTime] = block.endTime
                it[type] = block.type.name
            }
        }
    }

    override suspend fun getScheduleByUser(userId: String): List<ScheduleBlock> = transaction {
        ScheduleBlocks.select { ScheduleBlocks.userId eq userId }
            .map { it.toBlock() }
    }

    override suspend fun clearSchedule(userId: String) = transaction {
        ScheduleBlocks.deleteWhere { ScheduleBlocks.userId eq userId }
        Unit
    }
}
