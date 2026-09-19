# Orbit 🪐

Orbit is an offline-first, AI-powered life operating system built with React Native and Expo. It is designed to transform long-term strategic goals into actionable daily roadmaps, intelligent habits, and adaptive schedules, empowering users to execute their vision with clarity and focus.

---

## 🚀 Core Features

- 📅 **Adaptive Daily Planning (Today View)**: A dynamic, high-fidelity daily dashboard aggregating automated schedule blocks, pending tasks, and habit tracking in a single centralized space.
- 🎯 **Goal Management & AI Roadmaps**: Structured goal tracking with automated, AI-driven generation of milestones and sequential roadmaps to break down long-term objectives.
- 📋 **Granular Task Tracking**: Full-featured task management with custom priority levels, due dates, estimated durations, and direct contextual linkage to high-level goals.
- 🔄 **Habit Formation Engine**: Flexible routine tracking with streak management, daily checklist completions, and comprehensive historical logs.
- 📊 **AI Insights & Personalized Coaching**: Automated processing of execution metrics to deliver performance diagnostics, actionable summaries, and tailored behavioral coaching.
- ⏱️ **Focus Deep-Work Mode**: Integrated countdown timers and session monitors to maintain deep productivity and log work intervals.

---

## 🏗️ Technical Architecture & Stack

Orbit is engineered with a modern, high-performance mobile stack tailored for fluid performance and data durability:

- **Frontend & Navigation**: Built on **React Native** and **TypeScript**, leveraging **Expo SDK 57** and **Expo Router** for declarative, type-safe, file-based routing.
- **State Management**: Orchestrated via **Zustand**, providing lightweight, responsive local state coordination without the boilerplate of legacy frameworks.
- **AI Intelligence Layer**: Powered by a robust, multi-provider abstraction layer:
  - **Local On-Device AI**: Uses `llama.rn` for privacy-first, offline inference execution directly on the device hardware.
  - **Remote AI**: Configured with a low-latency remote endpoint wrapper for high-throughput operations.
  - **Model Management**: Integrated with an automated downloader, storage allocation monitor, and offline validation engine.
- **Persistence Engine**: Fully offline-first design utilizing local **SQLite** via `expo-sqlite`, running pre-compiled schemas for goals, tasks, habits, roadmaps, and calendar events.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **Package Manager**: npm (included with Node.js)
- **Mobile Development Environments**: Android Studio & JDK 17 (for Android compilation) or Xcode (for iOS compilation)

### Installation
Clone the repository and install all required dependencies:
```bash
git clone https://github.com/shubham230523/Orbit.git
cd Orbit
npm install
```

### Running the Application

Execute any of the following NPM scripts to start the project:

```bash
# Start the Expo development server
npm run start

# Launch the application on a connected Android device or emulator
npm run android

# Launch the application on an iOS simulator (macOS required)
npm run ios

# Run the project linting tool
npm run lint
```

### Executing Tests

Orbit includes an extensive test suite leveraging Jest and React Testing Library:
```bash
# Run unit and component level tests
npm test
```

---

## 🗂️ Project Structure

The codebase follows a modular design pattern cleanly separating UI, business logic, and database operations:

```text
src/
├── app/          # Expo Router navigation configuration and tab screens (Today, Goals, Tasks, Habits, Insights, Settings)
├── components/   # Atomic and molecular UI components (buttons, custom cards, bottom sheets, progress rings)
├── constants/    # Design system tokens, color palettes, and theme definitions
├── db/           # SQLite schema definitions, indexing setup, and client initializers
├── hooks/        # Reusable React hooks for themes, focus tracking, and timers
├── platform/     # Platform-specific interface abstractions
├── services/     # Business logic layer (AI orchestration, schedule automation, habit evaluation, notification delivery)
├── store/        # Zustand global state slices for authentication, UI configurations, and AI profiles
└── types/        # Centralized TypeScript domain types and API contracts
```
