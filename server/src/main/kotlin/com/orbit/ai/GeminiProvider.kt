package com.orbit.ai

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class GeminiProvider(
    private val apiKey: String,
    private val model: String = "gemini-1.5-pro"
) : AIProvider {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    override suspend fun generateResponse(messages: List<AIChatMessage>, responseSchema: String?): String {
        val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
        
        val contents = messages.map { msg ->
            GeminiContent(role = if (msg.role == "user") "user" else "model", parts = listOf(GeminiPart(text = msg.content)))
        }

        val request = GeminiRequest(contents = contents)
        
        val response: GeminiResponse = client.post(url) {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

        return response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: ""
    }

    override suspend fun generateStructuredResponse(prompt: String, schema: String): String {
        // Simple prompt engineering for now, Gemini 1.5 supports responseMimeType: application/json
        // but for simplicity we'll just add it to the prompt.
        val structuredPrompt = "$prompt\n\nReturn the response strictly in JSON format according to this schema: $schema"
        return generateResponse(listOf(AIChatMessage("user", structuredPrompt)))
    }
}

@Serializable
data class GeminiRequest(val contents: List<GeminiContent>)

@Serializable
data class GeminiContent(val role: String, val parts: List<GeminiPart>)

@Serializable
data class GeminiPart(val text: String)

@Serializable
data class GeminiResponse(val candidates: List<GeminiCandidate>)

@Serializable
data class GeminiCandidate(val content: GeminiContent)
