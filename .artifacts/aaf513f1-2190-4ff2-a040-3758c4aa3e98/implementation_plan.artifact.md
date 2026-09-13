# Local-first Migration with SQLite

## Goal Description
Transition the Orbit app from a Client-Server architecture to a **Local-first architecture** using `expo-sqlite`. This removes the dependency on the Ktor/PostgreSQL backend, improves performance on lower-end devices, and ensures 100% offline capability by storing all user data, goals, tasks, and habits directly on the device.

## User Review Required

> [!IMPORTANT]
> **Data Persistence:** Data will be stored locally on the device's secure storage. Deleting the app will delete the data.
> [!NOTE]
> **Multi-device Sync:** This change removes the ability to sync data across multiple devices via the cloud. However, it significantly improves privacy and speed.
> [!WARNING]
> **Node.js Requirement:** As previously mentioned, ensure your Node.js is updated to `>=20.19.4` to avoid bundling hangs during this migration.

## Proposed Changes

---

### Database Infrastructure

#### [NEW] [schema.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/db/schema.ts)
Define the SQLite database schema including tables for `users`, `goals`, `tasks`, `habits`, `habit_entries`, `roadmaps`, and `milestones`.

#### [NEW] [client.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/db/client.ts)
Initialize the SQLite database connection using `expo-sqlite` and handle migrations/schema creation.

---

### Service Layer Migration

#### [MODIFY] [auth-service.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/auth-service.ts)
- Replace REST API calls with SQL queries against the local `users` table.
- Maintain `SecureStore` for session management but verify against the local DB.

#### [MODIFY] [goal-service.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/goal-service.ts)
- Replace `apiClient` CRUD operations with SQLite `INSERT`, `SELECT`, `UPDATE`, `DELETE`.
- Update `generateRoadmap` to store AI-generated results directly to the local database.

#### [MODIFY] [task-service.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/task-service.ts)
- Migrate task management to local storage.

#### [MODIFY] [habit-service.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/habit-service.ts)
- Migrate habits and completion tracking to local storage.

#### [MODIFY] [schedule-service.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/schedule-service.ts)
- Migrate daily schedule blocks to local storage.

---

### App Integration

#### [MODIFY] [_layout.tsx](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/app/_layout.tsx)
- Add a database initialization step to the `useEffect` hook to ensure tables are ready before the user interacts with the app.

---

## Verification Plan

### Automated Tests
- Update mocks in `src/services/__tests__` to simulate SQLite responses.
- Run `npm test` to verify logic integrity.

### Manual Verification
1. **Initial Setup:** Install `expo-sqlite` and verify the app builds without errors.
2. **Auth Check:** Sign up a new user and verify the session is created.
3. **Data Persistence:** Create a Goal and a few Tasks. Force close the app and reopen. Verify the data is still there.
4. **Offline Test:** Turn off all network connections. Verify that creating goals and generating roadmaps (via Local AI) works without interruption.
