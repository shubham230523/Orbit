export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    targetDate TEXT,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    goalId TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    dueDate TEXT,
    estimatedDuration INTEGER,
    actualDuration INTEGER,
    priority TEXT DEFAULT 'medium',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (goalId) REFERENCES goals(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    frequency TEXT DEFAULT 'DAILY',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habit_entries (
    id TEXT PRIMARY KEY,
    habitId TEXT NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    UNIQUE(habitId, date),
    FOREIGN KEY (habitId) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    goalId TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (goalId) REFERENCES goals(id)
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    roadmapId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    dueDate TEXT,
    FOREIGN KEY (roadmapId) REFERENCES roadmaps(id)
  );

  CREATE TABLE IF NOT EXISTS schedule_blocks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    taskId TEXT,
    habitId TEXT,
    title TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    type TEXT DEFAULT 'TASK',
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (habitId) REFERENCES habits(id)
  );
`;
