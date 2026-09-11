package com.orbit.calendar

import kotlinx.serialization.Serializable

@Serializable
data class CalendarEvent(
    val id: String,
    val title: String,
    val startTime: String,
    val endTime: String,
    val location: String? = null
)

interface CalendarProvider {
    suspend fun getEvents(userId: String, startTime: String, endTime: String): List<CalendarEvent>
}

class MockCalendarProvider : CalendarProvider {
    override suspend fun getEvents(userId: String, startTime: String, endTime: String): List<CalendarEvent> {
        return listOf(
            CalendarEvent("1", "Meeting with Team", "2026-09-11T10:00:00", "2026-09-11T11:00:00"),
            CalendarEvent("2", "Lunch Break", "2026-09-11T13:00:00", "2026-09-11T14:00:00")
        )
    }
}
