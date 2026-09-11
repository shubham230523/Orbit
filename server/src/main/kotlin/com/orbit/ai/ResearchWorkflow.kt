package com.orbit.ai

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class ResearchResultAI(
    val title: String,
    val summary: String,
    val resources: List<String>,
    val actionableSteps: List<String>
)

class ResearchWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "title": "string",
          "summary": "string",
          "resources": ["string"],
          "actionableSteps": ["string"]
        }
    """.trimIndent()

    suspend fun research(topic: String): ResearchResultAI {
        val prompt = """
            Research the following topic to provide actionable information for a user's goal:
            Topic: "$topic"
            
            Identify key concepts, trustworthy resources (URLs if possible), and a list of actionable steps.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<ResearchResultAI>(jsonResponse)
    }
}
