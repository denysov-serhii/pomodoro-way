# Pomodoro Way

A React Native application for managing tasks and tracking productivity using the Pomodoro Technique with Firebase cloud storage.

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
- All data is stored in Firebase Firestore cloud database
- Data syncs across devices
- Real-time updates
- Secure and scalable cloud storage

## Quick Start

### Using the Build Script

The repository includes a convenient build script to manage the frontend:

```bash
# Build frontend (install dependencies)
./build.sh build

# Run frontend development server
./build.sh run
```

## Installation and Setup

### Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database in your project
   - Copy your Firebase configuration values

2. **Node.js and npm**
   - Install Node.js (v18 or later recommended)
   - npm comes bundled with Node.js

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values to `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. Start the application:
```bash
npm start
```

5. Run on your platform:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web

## Project Structure

```
pomodoro-way/
├── frontend/                    # React Native Expo application
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── AddTaskModal.tsx
│   │   │   ├── ProjectsManager.tsx
│   │   │   └── TagsManager.tsx
│   │   ├── contexts/
│   │   │   └── AppContext.tsx   # Global state management
│   │   ├── config/
│   │   │   └── firebase.ts      # Firebase configuration
│   │   └── utils/
│   │       └── storage.ts       # Firestore utilities
│   ├── App.tsx
│   ├── package.json
│   └── .env.example             # Environment variables template
├── build.sh                     # Build script
└── README.md
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

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain and runtime
- **TypeScript** - Type-safe JavaScript
- **Firebase Firestore** - Cloud NoSQL database for data persistence
- **React Context API** - State management
- **Expo Vector Icons** - UI icons
- **AsyncStorage** - Local temporary storage (timer state)

## Development

```bash
cd frontend
npm start
```

The development server will start and you can access the app on:
- Web browser (press `w`)
- Android device/emulator (press `a`)
- iOS device/simulator (press `i`, macOS only)

## Building for Production

Follow the [Expo build process](https://docs.expo.dev/build/setup/) for your target platform:

```bash
# For EAS Build
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## License

MIT