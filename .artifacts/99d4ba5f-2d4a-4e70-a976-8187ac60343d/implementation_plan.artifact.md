# Orbit Integration Testing System Plan

This plan outlines the creation of a comprehensive, device-free integration testing system for Orbit. The system will verify that multiple REAL application components (Goals, Tasks, Roadmap, Scheduler, AI Orchestration) work correctly together without requiring an emulator or network.

## User Review Required

> [!IMPORTANT]
> The integration tests will use a **stateful in-memory mock backend** for `apiClient`. This ensures that service-to-service interactions are tested against a consistent "database" state without a real server.

> [!NOTE]
> AI responses will be deterministic test doubles. The tests will verify that Orbit's **Deterministic Scheduler** remains the final authority for scheduling, as per requirements.

## Proposed Changes

### Integration Infrastructure

#### [NEW] [mock-backend.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/mock-backend.ts)
A stateful mock for `apiClient` that maintains in-memory stores for Goals, Roadmaps, Milestones, Tasks, and Schedules. It will handle CRUD operations and relationship integrity.

#### [NEW] [test-ai-provider.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/test-ai-provider.ts)
A deterministic `AIProvider` implementation for tests that returns predefined structured roadmaps, goals, and schedule proposals.

### Integration Tests

#### [NEW] [goal-to-task.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/goals/goal-to-task.test.ts)
Covers FLOW 1: Goal creation -> AI roadmap generation -> Conversion to Tasks -> Persistence.

#### [NEW] [scheduler-integration.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/scheduler/scheduler-integration.test.ts)
Covers FLOW 2: Real Scheduler integration with Tasks, Availability, and Calendar. Verifies deterministic results and capacity/deadline constraints.

#### [NEW] [replanning-integration.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/scheduler/replanning-integration.test.ts)
Covers FLOW 4: Missed task detection -> Replanning proposal -> Deterministic validation -> Updated Schedule.

#### [NEW] [ai-coach-integration.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/ai/ai-coach-integration.test.ts)
Covers FLOW 5: Context retrieval -> AI response -> Tool/Action proposal -> Validation.

#### [NEW] [offline-sync-integration.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/tests/integration/offline/offline-sync-integration.test.ts)
Covers FLOW 6: Offline changes -> Sync queue -> Reconnect -> Reconciliation.

### Configuration

#### [MODIFY] [package.json](file:///C:/Users/shubham/Documents/ReactNative/Orbit/package.json)
Add `test:integration` script: `jest --config jest.integration.config.js`.

#### [NEW] [jest.integration.config.js](file:///C:/Users/shubham/Documents/ReactNative/Orbit/jest.integration.config.js)
Special Jest configuration that isolates integration tests and ensures no platform leaks.

## Verification Plan

### Automated Tests
- `npm run test:integration` must pass 100%.
- `npm test` (unit tests) must still pass.
- No emulator or device should be detected/required during run.

### Manual Verification
- Verify that `Platform.OS` mocks work correctly in the integration environment.
- Verify that no external network calls are attempted (e.g., using `nock` or similar if needed, though `apiClient` mock should cover it).
