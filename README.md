# Pomodoro Way

A full-stack monorepo for managing tasks and tracking productivity using the Pomodoro Technique.

## Monorepo Structure

This repository contains:

- **Frontend**: React Native application (Expo) for mobile and web
- **Backend**: Java Micronaut REST API with native image compilation support

```
pomodoro-way/
├── frontend/          # React Native Expo application
│   ├── src/
│   ├── App.tsx
│   └── package.json
├── backend/           # Java Micronaut REST API
│   ├── src/
│   ├── build.gradle
│   └── Dockerfile
└── README.md         # This file
```

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

## Quick Start

### Using the Build Script

The repository includes a convenient build script to manage both frontend and backend:

```bash
# Build everything
./build.sh all

# Build backend only (JVM)
./build.sh backend

# Build native image (requires GraalVM)
./build.sh native

# Run backend
./build.sh run-backend

# Run frontend
./build.sh run-frontend
```

## Installation and Setup

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Run on your platform:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the application (JVM mode):
```bash
./gradlew run
```

3. Build native image (requires GraalVM):
```bash
./gradlew nativeCompile
./build/native/nativeCompile/pomodoro-way-backend
```

For detailed backend setup and native image compilation, see [backend/README.md](backend/README.md).

## Quick Start with Docker (Backend)

```bash
# Build and run using Docker Compose
docker-compose up --build

# Or build manually
cd backend
docker build -t pomodoro-way-backend .
docker run -p 8080:8080 pomodoro-way-backend
```

## Project Structure

### Frontend Structure

### Frontend Structure

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
│   └── utils/
│       └── storage.ts              # AsyncStorage utilities
├── App.tsx                         # Main application component
└── package.json
```

### Backend Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/pomodorowork/
│   │   │   ├── Application.java
│   │   │   ├── controller/        # REST API controllers
│   │   │   └── domain/            # Domain models
│   │   └── resources/
│   │       └── application.yml    # Micronaut configuration
│   └── test/                      # Unit tests
├── build.gradle                    # Gradle build script with native image support
├── gradlew                         # Gradle wrapper
└── Dockerfile                      # Multi-stage native image build
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

### Frontend
- React Native
- Expo
- TypeScript
- AsyncStorage for data persistence
- React Context API for state management
- Expo Vector Icons for UI icons

### Backend
- Java 17
- Micronaut Framework 4.4.2
- GraalVM Native Image
- Gradle 8.5
- RESTful API design

## API Integration

The backend provides REST API endpoints that can be integrated with the frontend:

- **Tasks API**: `/api/tasks`
- **Projects API**: `/api/projects`
- **Tags API**: `/api/tags`
- **Pomodoro Sessions API**: `/api/pomodoros`
- **Health Check**: `/api/health`

See [backend/README.md](backend/README.md) for complete API documentation.

## Development

### Frontend Development
```bash
cd frontend
npm start
```

### Backend Development
```bash
cd backend
./gradlew run
```

The backend will be available at `http://localhost:8080`.

## Building for Production

### Frontend
Follow the Expo build process for your target platform.

### Backend Native Image
```bash
cd backend
./gradlew nativeCompile
```

This creates a standalone native executable with:
- Fast startup time (~0.1s vs several seconds for JVM)
- Low memory footprint (~50MB vs several hundred MB)
- No JVM required for deployment

## License

MIT