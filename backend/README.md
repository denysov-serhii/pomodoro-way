# Pomodoro Way Backend

A Java Micronaut backend for the Pomodoro Way application, compiled to native image using GraalVM.

## Features

- **REST API**: RESTful endpoints for tasks, projects, tags, and pomodoro sessions
- **Native Image**: Compiled to native executable for fast startup and low memory footprint
- **CORS Support**: Configured for frontend integration
- **Health Checks**: Built-in health check endpoints

## Technology Stack

- Java 17
- Micronaut 4.4.2
- GraalVM Native Image
- Gradle 8.5

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{id}` - Get a task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get a project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/{id}` - Get a tag by ID
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/{id}` - Update a tag
- `DELETE /api/tags/{id}` - Delete a tag

### Pomodoro Sessions
- `GET /api/pomodoros` - List all pomodoro sessions (optional query param: `taskId`)
- `GET /api/pomodoros/{id}` - Get a pomodoro session by ID
- `POST /api/pomodoros` - Create a new pomodoro session
- `PUT /api/pomodoros/{id}` - Update a pomodoro session
- `DELETE /api/pomodoros/{id}` - Delete a pomodoro session

### Health
- `GET /api/health` - Health check endpoint

## Prerequisites

- Java 17 or later
- GraalVM (for native image compilation)

## Running the Application

### Standard JVM Mode

```bash
./gradlew run
```

### Building JAR

```bash
./gradlew build
java -jar build/libs/pomodoro-way-backend-0.1-all.jar
```

## Native Image Compilation

### Prerequisites for Native Image

1. Install GraalVM:
   ```bash
   # Download from https://www.graalvm.org/downloads/
   # Or use SDKMAN:
   sdk install java 17.0.8-graal
   ```

2. Install native-image tool:
   ```bash
   gu install native-image
   ```

### Build Native Image

```bash
./gradlew nativeCompile
```

The native executable will be located at:
```
build/native/nativeCompile/pomodoro-way-backend
```

### Run Native Image

```bash
./build/native/nativeCompile/pomodoro-way-backend
```

## Docker Build

Build and run using Docker with multi-stage native image compilation:

```bash
# Build the Docker image
docker build -t pomodoro-way-backend .

# Run the container
docker run -p 8080:8080 pomodoro-way-backend
```

## Configuration

Configuration is managed through `src/main/resources/application.yml`:

- Server port: 8080 (configurable)
- CORS: Enabled for localhost origins
- Health endpoints: Enabled

## Development

### Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/pomodorowork/
│   │   │   ├── Application.java
│   │   │   ├── controller/
│   │   │   │   ├── TaskController.java
│   │   │   │   ├── ProjectController.java
│   │   │   │   ├── TagController.java
│   │   │   │   ├── PomodoroController.java
│   │   │   │   └── HealthController.java
│   │   │   └── domain/
│   │   │       ├── Task.java
│   │   │       ├── Project.java
│   │   │       ├── Tag.java
│   │   │       └── PomodoroSession.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/pomodorowork/
│           └── ApplicationTest.java
├── build.gradle
├── settings.gradle
├── gradlew
└── Dockerfile
```

### Running Tests

```bash
./gradlew test
```

## Native Image Considerations

- The application uses Micronaut's AOT (Ahead-of-Time) compilation optimizations
- Reflection configuration is handled automatically by Micronaut
- Startup time is significantly faster compared to JVM mode
- Memory footprint is reduced

## License

MIT
