# Orbit 🪐

**AI-Powered Life Operating System. Turn your goals into actions.**

Orbit transforms long-term goals into actionable roadmaps, tasks, and adaptive daily plans. Unlike static planners, Orbit continuously observes your progress and replans based on reality.

---

## ✨ Core Features

- 🎯 **Intelligent Goals**: Extract objectives, constraints, and success criteria from natural language.
- 🗺️ **AI Roadmaps**: Structured milestones and projects with estimated effort and outcomes.
- 🧠 **Adaptive Planning**: Continuous evaluation of completed vs. skipped work to update your schedule.
- 📅 **Dynamic Scheduling**: Realistic time blocks considering priorities, working hours, and routine.
- ⏱️ **Focus Mode**: Integrated Pomodoro timer linked to tasks for actual time tracking.
- 📊 **AI Insights**: Evidence-based patterns on your productivity and consistency.

---

## 🏗️ Technical Stack

- **Frontend**: React Native, TypeScript, Expo Router, Zustand, TanStack Query.
- **Backend**: Kotlin, Ktor (located in `/server`).
- **AI**: Local LLM integration (Qwen/Llama) via `llama.rn`.
- **Database**: Local SQLite (Expo SQLite).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- Android Studio & JDK 17

### Installation
```bash
git clone https://github.com/shubham230523/Orbit.git
cd Orbit
npm install
```

### Running the App
```bash
# Start Expo server
npx expo start

# Run on Android
npx expo run:android
```

---

## 📦 Build & Release

### Local Build
To generate a signed debug APK:
```bash
cd android
./gradlew assembleRelease
```
APK Location: `android/app/build/outputs/apk/release/app-release.apk`

### Automated Releases
Pushing a tag (e.g., `v1.0.0`) triggers a GitHub Action that builds the APK and creates a GitHub Release.
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 🗂️ Project Structure
- `src/app`: Navigation and screens.
- `src/services`: AI providers, Database logic, API clients.
- `src/components`: UI components and Design System.
- `android/`: Native Android project.
- `server/`: Kotlin/Ktor backend source.
- `tests/`: Unit and integration tests.
