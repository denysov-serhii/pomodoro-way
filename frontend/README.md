# Pomodoro Way Frontend

A React Native application for managing tasks and tracking productivity using the Pomodoro Technique.

## Features

### Pomodoro Timer
- Configurable timer durations: 25, 30, 35, 40, 45, 50, and 60 minutes
- Start, pause, and reset functionality
- Visual countdown display
- Links to tasks for tracking work sessions
- Automatic task completion counter

### Task Management
- Create and manage tasks
- Add descriptions to tasks
- Track completed pomodoros per task
- Delete tasks
- Select tasks to link with pomodoro timer

### Projects
- Create projects to organize related tasks
- Each task can belong to one project or no project
- View task count per project
- Prevent deletion of projects with active tasks

### Tags
- Create tags for categorizing tasks
- Tasks can have multiple tags
- View task count per tag
- Prevent deletion of tags in use

### Data Persistence
- All data is stored locally using AsyncStorage
- Data persists between app sessions

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

3. Run on your platform:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PomodoroTimer.tsx      # Timer component with duration options
│   │   ├── TaskList.tsx            # Task list display and management
│   │   ├── AddTaskModal.tsx        # Modal for creating tasks
│   │   ├── ProjectsManager.tsx     # Project management interface
│   │   └── TagsManager.tsx         # Tag management interface
│   ├── contexts/
│   │   └── AppContext.tsx          # Global state management
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── storage.ts              # AsyncStorage utilities
├── App.tsx                         # Main application component
└── package.json
```

## Usage

### Creating a Task
1. Navigate to the "Tasks" tab
2. Tap the "+" button
3. Enter task title (required)
4. Optionally add description, select project, and add tags
5. Tap "Save Task"

### Starting a Pomodoro
1. Navigate to the "Tasks" tab
2. Tap on a task to select it
3. Navigate to the "Timer" tab
4. Select your desired duration
5. Tap "Start" to begin the timer

### Managing Projects
1. Navigate to the "Projects" tab
2. Tap "+" to add a new project
3. Enter project name and tap "Add"

### Managing Tags
1. Navigate to the "Tags" tab
2. Tap "+" to add a new tag
3. Enter tag name and tap "Add"

## Technologies Used

- React Native
- Expo
- TypeScript
- AsyncStorage for data persistence
- React Context API for state management
- Expo Vector Icons for UI icons

## Backend Integration

The frontend can be configured to use the backend API instead of local storage. The backend provides:

- REST API for tasks, projects, tags, and pomodoro sessions
- Centralized data storage
- Multi-device synchronization

See the [backend README](../backend/README.md) for API documentation.

## License

MIT
