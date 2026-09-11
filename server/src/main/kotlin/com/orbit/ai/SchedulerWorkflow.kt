package com.orbit.ai

import com.orbit.models.Task
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class ScheduledTaskAI(
    val taskId: String,
    val startTime: String,
    val endTime: String,
    val reason: String
)

@Serializable
data class SchedulerAIResponse(
    val schedule: List<ScheduledTaskAI>
)

class SchedulerWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "schedule": [
            {
              "taskId": "string",
              "startTime": "string",
              "endTime": "string",
              "reason": "string"
            }
          ]
        }
    """.trimIndent()

    suspend fun suggestSchedule(tasks: List<Task>, availability: String): SchedulerAIResponse {
        val tasksJson = Json.encodeToString(tasks)
        val prompt = """
            Given the following tasks and my availability for today, suggest an optimal schedule:
            Availability: "$availability"
            Tasks: $tasksJson
            
            Prioritize urgent tasks and group similar work together.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<SchedulerAIResponse>(jsonResponse)
    }
}
