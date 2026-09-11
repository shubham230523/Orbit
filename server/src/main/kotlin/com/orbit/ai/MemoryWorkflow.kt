package com.orbit.ai

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class MemoryAI(
    val fact: String,
    val importance: Int
)

@Serializable
data class MemoryAIResponse(
    val memories: List<MemoryAI>
)

class MemoryWorkflow(private val aiProvider: AIProvider) {
    private val schema = """
        {
          "memories": [
            {
              "fact": "string",
              "importance": "number (1-5)"
            }
          ]
        }
    """.trimIndent()

    suspend fun extractMemories(interaction: String): MemoryAIResponse {
        val prompt = """
            Extract key durable information from the following interaction that would be useful to remember for the user's future planning:
            Interaction: "$interaction"
            
            Focus on preferences, patterns, recurring blockers, or important life events.
        """.trimIndent()

        val jsonResponse = aiProvider.generateStructuredResponse(prompt, schema)
        return Json.decodeFromString<MemoryAIResponse>(jsonResponse)
    }
}
