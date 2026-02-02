# Contributing to Pomodoro Way

Thank you for your interest in contributing to Pomodoro Way! This guide will help you get started with the monorepo structure.

## Monorepo Structure

This project uses a monorepo structure with two main components:

- **Frontend**: React Native (Expo) application located in `/frontend`
- **Backend**: Java Micronaut REST API located in `/backend`

## Development Setup

### Prerequisites

#### For Frontend Development
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (optional but recommended)

#### For Backend Development
- Java 17 or later
- Gradle (included via wrapper)
- GraalVM (optional, for native image compilation)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/denysov-serhii/pomodoro-way.git
   cd pomodoro-way
   ```

2. **Build using the build script**
   ```bash
   # Build everything
   ./build.sh all
   
   # Or build individually
   ./build.sh frontend
   ./build.sh backend
   ```

3. **Run the applications**
   ```bash
   # Backend
   ./build.sh run-backend
   
   # Frontend (in a new terminal)
   ./build.sh run-frontend
   ```

## Development Workflow

### Frontend Development

```bash
cd frontend
npm install
npm start
```

The frontend uses:
- React Native with Expo
- TypeScript
- AsyncStorage for local data persistence
- React Context API for state management

### Backend Development

```bash
cd backend
./gradlew run
```

The backend uses:
- Java 17
- Micronaut Framework
- In-memory data storage (ConcurrentHashMap)
- RESTful API design

### Running Tests

#### Backend Tests
```bash
cd backend
./gradlew test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## Code Style

### Frontend
- Follow the existing TypeScript/React Native conventions
- Use functional components with hooks
- Keep components focused and single-purpose

### Backend
- Follow standard Java naming conventions
- Use dependency injection via Micronaut's `@Singleton` and `@Inject`
- Keep controllers thin, business logic in services

## Submitting Changes

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push to your fork and submit a pull request

4. Ensure all tests pass and the build succeeds

## Pull Request Guidelines

- **Clear description**: Explain what changes you made and why
- **Single purpose**: Each PR should address one feature or fix
- **Tests**: Add tests for new functionality
- **Documentation**: Update relevant documentation
- **Build passes**: Ensure `./build.sh all` succeeds

## Building Native Image

To build the backend as a native image (requires GraalVM):

```bash
# Install GraalVM and native-image
sdk install java 17.0.8-graal  # Using SDKMAN
gu install native-image

# Build native image
./build.sh native

# Run native executable
./build.sh run-native
```

## API Development

When adding new endpoints to the backend:

1. Create domain models in `backend/src/main/java/com/pomodorowork/domain/`
2. Create controllers in `backend/src/main/java/com/pomodorowork/controller/`
3. Document the endpoints in the backend README
4. Update the frontend to consume the new endpoints if needed

## Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
cd backend
docker build -t pomodoro-way-backend .
docker run -p 8080:8080 pomodoro-way-backend
```

## Questions or Issues?

- Open an issue on GitHub
- Check existing issues and documentation first
- Provide clear reproduction steps for bugs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
