package com.orbit.ai

import com.orbit.models.Goal
import com.orbit.models.Task
import com.orbit.models.Message
import kotlinx.serialization.Serializable

class CoachWorkflow(private val aiProvider: AIProvider) {
    suspend fun chat(
        history: List<Message>,
        userMessage: String,
        goals: List<Goal>,
        tasks: List<Task>
    ): String {
        val systemPrompt = """
            You are Orbit, an AI Life Operating System Coach. Your goal is to help users turn their goals into actions.
            You have access to the user's current goals and tasks to provide contextual advice.
            
            Current Goals: ${goals.joinToString { it.title }}
            Pending Tasks: ${tasks.filter { it.status != com.orbit.models.TaskStatus.COMPLETED }.joinToString { it.title }}
            
            Be supportive, actionable, and concise.
        """.trimIndent()

        val messages = mutableListOf(AIChatMessage("system", systemPrompt))
        messages.addAll(history.map { AIChatMessage(it.role, it.content) })
        messages.add(AIChatMessage("user", userMessage))

        return aiProvider.generateResponse(messages)
    }
}
