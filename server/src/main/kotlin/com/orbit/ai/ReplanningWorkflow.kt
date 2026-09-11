package com.orbit.ai

import com.orbit.models.Goal
import com.orbit.models.Task
import com.orbit.models.ScheduleBlock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class ReplanAction(
    val type: String, // "RESCHEDULE", "SPLIT", "DROP"
    val taskId: String,
    val newStartTime: String? = null,
    val newEndTime: String? = null,
    val explanation: String
)

@Serializable
data class ReplanAIResponse(
    val actions: List<ReplanAction>,
    val generalExplanation: String
)

class ReplanningWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "actions": [
            {
              "type": "RESCHEDULE|SPLIT|DROP",
              "taskId": "string",
              "newStartTime": "string?",
              "newEndTime": "string?",
              "explanation": "string"
            }
          ],
          "generalExplanation": "string"
        }
    """.trimIndent()

    suspend fun replan(
        missedTasks: List<Task>,
        remainingCapacity: String,
        currentSchedule: List<ScheduleBlock>
    ): ReplanAIResponse {
        val tasksJson = Json.encodeToString(missedTasks)
        val scheduleJson = Json.encodeToString(currentSchedule)

        val prompt = """
            The user has missed the following tasks:
            $tasksJson
            
            Current Schedule:
            $scheduleJson
            
            Remaining Capacity for Today: "$remainingCapacity"
            
            Suggest a new plan. You can reschedule tasks to later today, split them into smaller parts, or recommend dropping low-priority tasks if capacity is exceeded.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<ReplanAIResponse>(jsonResponse)
    }
}
