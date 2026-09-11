package com.orbit.scheduling

import com.orbit.models.ScheduleBlock
import com.orbit.models.Task

class ScheduleValidator {
    fun validate(blocks: List<ScheduleBlock>, tasks: List<Task>): List<ScheduleBlock> {
        // Simple validation: Ensure tasks exist and times are logical
        return blocks.filter { block ->
            val taskExists = block.taskId == null || tasks.any { it.id == block.taskId }
            val timeIsLogical = block.startTime < block.endTime
            taskExists && timeIsLogical
        }
    }
}
