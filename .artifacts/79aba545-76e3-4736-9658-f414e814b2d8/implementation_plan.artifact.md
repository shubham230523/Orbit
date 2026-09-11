# Orbit Unit Test Coverage Improvement Plan

This plan aims to increase Orbit's unit test coverage from ~24% to >=80%, focusing on critical business logic, scheduler, AI boundaries, and state management.

## User Review Required

> [!IMPORTANT]
> - I will be adding a significant number of test files.
> - Existing tests that are currently failing will be fixed.
> - I will use `jest` and `@testing-library/react-native` as per the existing project structure.

## Open Questions

- Are there any specific edge cases in the scheduler that are known to be problematic?
- Should I prioritize any specific AI provider (Local vs Remote) for more extensive error-path testing?

## Proposed Changes

### [Component Name] Services (P0)

Focus on the core business logic in `src/services/`.

#### [NEW] [goal-service.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/__tests__/goal-service.test.ts)
- Test goal creation, validation, and decomposition.
- Mock AI responses for roadmap generation.

#### [NEW] [schedule-service.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/__tests__/schedule-service.test.ts)
- **CRITICAL**: Test deterministic scheduling logic.
- Cover capacity, duration, priority, deadlines, and dependencies.
- Test conflict detection and missed-task detection.

#### [NEW] [task-service.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/__tests__/task-service.test.ts)
- Test task CRUD and validation.
- Test dependency management.

#### [NEW] [auth-service.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/__tests__/auth-service.test.ts)
- Test authentication flows and secure storage.

---

### [Component Name] AI Layer (P0)

Improve coverage for AI providers and model management.

#### [MODIFY] [model-manager.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/ai/__tests__/model-manager.test.ts)
- Fix the `TypeError` by providing `ModelDownloader` mock.
- Add tests for download failure, verification failure, and progress reporting.

#### [NEW] [remote-ai-provider.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/ai/__tests__/remote-ai-provider.test.ts)
- Test API interaction, error handling, and response parsing.

#### [NEW] [model-downloader.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/ai/__tests__/model-downloader.test.ts)
- Test file system interactions and download cancellation.

---

### [Component Name] State Management (P0/P1)

#### [NEW] [use-auth-store.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/store/__tests__/use-auth-store.test.ts)
- Test state transitions for authentication.

---

### [Component Name] Utilities and Other Services (P1/P2)

#### [NEW] [habit-service.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/services/__tests__/habit-service.test.ts)
- Test habit logic, recurrence, and streaks.

#### [NEW] [id.test.ts](file:///C:/Users/shubham/Documents/ReactNative/Orbit/src/utils/__tests__/id.test.ts)
- Test UUID generation.

## Verification Plan

### Automated Tests
- Run `npm test -- --coverage` after each task group.
- Ensure all new and existing tests pass.
- Target: >=80% Statements and Lines.

### Manual Verification
- Verify that the app still builds and runs correctly after changes (though only tests are being added/modified, it's good practice to ensure no unintended side effects if production code is touched to fix bugs).
