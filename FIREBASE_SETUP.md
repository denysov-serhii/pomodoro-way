# Firebase Setup Guide

This guide will help you set up Firebase for the Pomodoro Way application.

## Prerequisites

- A Google account
- Node.js and npm installed
- The Pomodoro Way frontend code

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "pomodoro-way")
4. Follow the setup wizard:
   - Choose whether to enable Google Analytics (optional)
   - Accept the terms and create the project

## Step 2: Register Your App

### Web App

1. In the Firebase Console, click on the web icon (`</>`) to add a web app
2. Register your app:
   - App nickname: "Pomodoro Way Web"
   - You don't need to set up Firebase Hosting (unless you want to)
3. Click "Register app"

### Android App (for Android builds)

1. In the Firebase Console, click on the Android icon to add an Android app
2. Register your Android app:
   - **Android package name**: `com.gaydara27sorganization.pomodoroway` (must match the package in app.json)
   - App nickname: "Pomodoro Way Android" (optional)
   - Debug signing certificate SHA-1 (optional, needed for Google Sign-In)
3. Click "Register app"
4. **Download the google-services.json file**
5. Place the downloaded `google-services.json` file in `frontend/misc/android/` directory
   - The path should be: `frontend/misc/android/google-services.json`
   - This file is already configured in `app.json` under `android.googleServicesFile`
   - **Important**: Do NOT commit this file to version control as it contains sensitive data
6. Click "Next" and skip the remaining steps (they are for native Android projects)

## Step 3: Get Your Firebase Configuration

After registering, you'll see your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Enable Firestore Database

1. In the Firebase Console sidebar, click on "Build" → "Firestore Database"
2. Click "Create database"
3. Choose a starting mode:
   - **Start in test mode** (recommended for development) - Allows read/write access for 30 days
   - **Start in production mode** - Denies all read/write access by default
4. Select a Firestore location (choose one closest to your users)
5. Click "Enable"

## Step 5: Configure Firestore Security Rules

For development, you can use test mode rules (valid for 30 days):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 15);
    }
  }
}
```

For production, you should implement proper security rules. Here's a basic example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    
    // Tags collection
    match /tags/{tagId} {
      allow read, write: if request.auth != null;
    }
    
    // Settings collection
    match /settings/{settingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** The production rules above require authentication. You'll need to implement Firebase Authentication if you want to use these rules.

## Step 6: Configure the App

### Web Configuration

1. In your `frontend` directory, copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase configuration values:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. Save the file

### Android Configuration

The Android app is already configured to use the `google-services.json` file placed in `frontend/misc/android/`. The configuration in `app.json` specifies:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./misc/android/google-services.json"
    }
  }
}
```

**For local builds**: Simply place your `google-services.json` file in `frontend/misc/android/` directory.

**For EAS Build (CI/CD)**: You should use EAS secrets to securely provide the file:

```bash
# Navigate to frontend directory
cd frontend

# Create a secret for google-services.json
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./misc/android/google-services.json
```

Then convert your `app.json` to `app.config.js` to use the environment variable:

```javascript
// app.config.js
module.exports = {
  expo: {
    // ... other expo config
    android: {
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./misc/android/google-services.json",
      // ... other android config
    }
  }
};
```

This approach keeps your Firebase credentials secure by not committing them to version control.

## Step 7: Test the Connection

1. Start the development server:
   ```bash
   npm start
   ```

2. Open the app in your browser or mobile device

3. Try creating a task, project, or tag

4. Go back to the Firebase Console → Firestore Database

5. You should see the data appearing in the collections

## Troubleshooting

### "Permission denied" errors

- Check that your Firestore security rules allow the operations you're trying to perform
- In test mode, make sure the expiration date hasn't passed
- For production rules with authentication, make sure users are signed in

### "Firebase: No Firebase App" errors

- Make sure your `.env` file is in the `frontend` directory
- Verify all environment variables are properly set
- Try restarting the development server

### Data not syncing

- Check your internet connection
- Verify your Firebase project is active in the Firebase Console
- Check the browser/app console for error messages

### Firebase not working on Android

The app is configured to use React Native-specific Firebase settings for better Android compatibility. If you're still experiencing issues:

- The app uses `experimentalForceLongPolling` for Firestore on Android/iOS for more reliable connections
- This setting is automatically applied when running on React Native (non-web platforms)
- If you see network errors, ensure your Android device/emulator has internet access
- Try clearing the app data and restarting the app
- Check that the `google-services.json` file is correctly placed in `frontend/misc/android/`

## Optional: Firebase Authentication

If you want to add user authentication (recommended for production):

1. In Firebase Console, go to "Build" → "Authentication"
2. Click "Get started"
3. Enable authentication providers (e.g., Email/Password, Google)
4. Update your app to include Firebase Auth
5. Update Firestore security rules to require authentication

## Next Steps

- Implement Firebase Authentication for user accounts
- Set up proper production security rules
- Consider adding Firebase Cloud Functions for server-side logic
- Implement offline persistence for better user experience
- Set up Firebase Analytics to track app usage

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Expo with Firebase](https://docs.expo.dev/guides/using-firebase/)
