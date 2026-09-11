package com.orbit.ai

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class GoalAnalysis(
    val objective: String,
    val constraints: List<String>,
    val measurableOutcomes: List<String>,
    val estimatedDurationWeeks: Int,
    val category: String
)

class GoalAnalysisWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "objective": "string",
          "constraints": ["string"],
          "measurableOutcomes": ["string"],
          "estimatedDurationWeeks": "number",
          "category": "string"
        }
    """.trimIndent()

    suspend fun analyzeGoal(goalTitle: String): GoalAnalysis {
        val prompt = """
            Analyze the following goal: "$goalTitle"
            Extract the primary objective, identifying any constraints, measurable outcomes, estimated duration in weeks, and a relevant category.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<GoalAnalysis>(jsonResponse)
    }
}
