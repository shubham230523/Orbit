package com.orbit.ai

import kotlinx.serialization.Serializable

@Serializable
data class AIChatMessage(
    val role: String,
    val content: String
)

interface AIProvider {
    suspend fun generateResponse(messages: List<AIChatMessage>, responseSchema: String? = null): String
    suspend fun generateStructuredResponse(prompt: String, schema: String): String
}

class MockAIProvider : AIProvider {
    override suspend fun generateResponse(messages: List<AIChatMessage>, responseSchema: String?): String {
        return "This is a mock response."
    }

    override suspend fun generateStructuredResponse(prompt: String, schema: String): String {
        return "{ \"objective\": \"Mock Objective\" }"
    }
}
