# GitHub Actions - Android APK Build

This workflow automatically builds an Android APK for the Pomodoro Way application using Expo Application Services (EAS).

## Setup Instructions

### 1. Create an Expo Account
If you don't have one already, create an account at [expo.dev](https://expo.dev).

### 2. Generate Expo Access Token
1. Go to [https://expo.dev/accounts/[username]/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the generated token

### 3. Add Token to GitHub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste the Expo access token you copied
6. Click **Add secret**

## How It Works

### Trigger Events
The workflow runs on:
- **Push** to `main` or `master` branch
- **Pull requests** to `main` or `master` branch
- **Manual trigger** via GitHub Actions UI (workflow_dispatch)

### Build Process
1. **Checkout code** - Gets the latest code from the repository
2. **Setup Node.js** - Installs Node.js 20 with npm caching
3. **Install dependencies** - Runs `npm ci` to install project dependencies
4. **Setup Expo** - Configures Expo CLI with your access token
5. **Setup EAS CLI** - Installs Expo Application Services CLI
6. **Create eas.json** - Generates build configuration if not present
7. **Build APK** - Submits build to Expo's cloud service

### Build Profiles
The workflow uses the **preview** profile which:
- Creates an APK file (not AAB)
- Uses internal distribution
- Suitable for testing and distribution outside the Play Store

## Getting Your APK

After the workflow completes:

1. **Via Expo Dashboard**:
   - Go to [https://expo.dev](https://expo.dev)
   - Navigate to your project
   - Click on "Builds"
   - Download the APK when ready

2. **Via Email**:
   - Expo will send you an email with the build link
   - Click the link to download the APK

3. **Via EAS CLI** (local):
   ```bash
   npx eas-cli build:list
   ```

## Build Configuration (eas.json)

The project includes three build profiles:

### Development
```json
"development": {
  "developmentClient": true,
  "distribution": "internal"
}
```
For development builds with dev client.

### Preview
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
For testing and internal distribution (used by workflow).

### Production
```json
"production": {
  "android": {
    "buildType": "apk"
  }
}
```
For production-ready builds.

## Manual Build

You can also trigger builds manually:

### Using GitHub Actions UI
1. Go to **Actions** tab in your repository
2. Select **Build Android APK** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Using EAS CLI locally
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile preview
```

## Troubleshooting

### Build Fails with Authentication Error
- Verify `EXPO_TOKEN` is correctly set in GitHub secrets
- Make sure the token hasn't expired
- Generate a new token if needed

### Build Takes Too Long
- EAS builds typically take 5-15 minutes
- Check build status at [expo.dev](https://expo.dev)
- The workflow submits the build but doesn't wait for completion

### Package Name Conflicts
- The app uses package: `com.pomodoroway.app`
- Change in `app.json` if you need a different identifier

## Additional Resources

- [Expo Application Services Documentation](https://docs.expo.dev/eas/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Notes

- The workflow uses `--no-wait` flag, so it submits the build but doesn't wait for completion
- Build artifacts are stored in Expo's cloud, not GitHub Actions
- Free Expo accounts have limited build minutes; consider upgrading for more builds
- APK files can be distributed directly to users without going through Play Store
