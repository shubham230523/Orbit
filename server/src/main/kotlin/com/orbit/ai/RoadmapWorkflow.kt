package com.orbit.ai

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class RoadmapMilestoneAI(
    val title: String,
    val description: String,
    val estimatedWeeks: Int
)

@Serializable
data class RoadmapAIResponse(
    val milestones: List<RoadmapMilestoneAI>
)

class RoadmapWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "milestones": [
            {
              "title": "string",
              "description": "string",
              "estimatedWeeks": "number"
            }
          ]
        }
    """.trimIndent()

    suspend fun generateRoadmap(goalTitle: String, goalDescription: String?): RoadmapAIResponse {
        val prompt = """
            Create a detailed step-by-step roadmap for the following goal:
            Title: "$goalTitle"
            Description: "${goalDescription ?: "No description provided"}"
            
            Break it down into 3-7 logical milestones. For each milestone, provide a title, a brief description of what needs to be achieved, and an estimated duration in weeks.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<RoadmapAIResponse>(jsonResponse)
    }
}
