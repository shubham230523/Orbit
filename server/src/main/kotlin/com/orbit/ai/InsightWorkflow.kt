package com.orbit.ai

import com.orbit.models.Goal
import com.orbit.models.Task
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class InsightAI(
    val title: String,
    val description: String,
    val type: String
)

@Serializable
data class InsightAIResponse(
    val insights: List<InsightAI>
)

class InsightWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "insights": [
            {
              "title": "string",
              "description": "string",
              "type": "PRODUCTIVITY|GOAL|HABIT|WORKLOAD"
            }
          ]
        }
    """.trimIndent()

    suspend fun generateInsights(goals: List<Goal>, tasks: List<Task>): InsightAIResponse {
        val goalsJson = Json.encodeToString(goals)
        val tasksJson = Json.encodeToString(tasks)
        
        val prompt = """
            Analyze the following goals and task completion history to provide actionable insights for the user:
            Goals: $goalsJson
            Recent Tasks: $tasksJson
            
            Identify patterns, potential blockers, or improvements in productivity and goal alignment.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<InsightAIResponse>(jsonResponse)
    }
}
