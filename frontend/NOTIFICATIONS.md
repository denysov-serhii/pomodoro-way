# Notification System Documentation

## Overview

The Pomodoro Way app uses `expo-notifications` to provide timer notifications that work even when the app is in the background or completely closed.

## Features

### 1. Scheduled Notifications (Background-Compatible)

The app schedules notifications to fire when a pomodoro or break session completes. These notifications **work even when the app is completely closed** because they use the device's native notification scheduling system.

**Implementation:**
- When a timer starts, a notification is scheduled for the exact completion time
- The notification persists in the device's notification system
- When the timer completes, the notification fires regardless of app state

**Platforms:**
- ✅ **Android**: Fully supported
- ✅ **iOS**: Fully supported (requires user permission)
- ⚠️ **Web**: Limited support (browser must be open)

### 2. Ongoing Timer Notifications (Foreground Only)

The app shows an ongoing notification that updates every second with the remaining time. This notification **only works while the app is running** (foreground or background).

**Why it stops when app is closed:**
- Updating every second requires active JavaScript execution
- Without a background service, the app cannot run code when fully closed
- This is a platform limitation, not a bug

**Platforms:**
- ✅ **Android**: Works in foreground and background
- ❌ **iOS**: Limited (notifications don't update in background)
- ❌ **Web**: Not supported

### 3. Notification Responses

When users tap on a notification, the app:
- Opens to the timer tab
- Restores the timer state if it was running

## How It Works

### Notification Flow

1. **Timer Starts**:
   ```typescript
   schedulePomodoroCompleteNotification(timeLeft, taskName)
   ```
   - Schedules a notification to fire after `timeLeft` seconds
   - Uses native scheduling (persists through app closure)
   - Notification stored with unique ID for cancellation

2. **Timer Running**:
   ```typescript
   showOngoingTimerNotification(timeLeft, sessionType, taskName)
   ```
   - Updates every second while app is active
   - Shows in notification shade on Android
   - Dismissed when timer is paused or completed

3. **Timer Completes**:
   - Scheduled notification fires (even if app is closed)
   - If app is open: plays sound, shows alert, updates task
   - If app is closed: notification appears, user can tap to open app
   - When app reopens: detects completed timer and updates task

4. **Timer Paused**:
   - Cancels scheduled notification (no alert when paused)
   - Dismisses ongoing notification
   - Timer state saved to storage for restoration

### State Restoration

The app handles three scenarios when reopened:

1. **Timer was running and not completed**:
   - Calculates elapsed time
   - Restores timer with remaining time
   - Re-schedules completion notification

2. **Timer completed while app was closed**:
   - Detects completion based on saved state
   - Credits pomodoro to task
   - Shows "Timer finished while you were away" message

3. **Timer was paused**:
   - Restores paused state
   - No notification scheduled

## Platform-Specific Details

### Android

**Permissions Required:**
```json
{
  "permissions": [
    "POST_NOTIFICATIONS",        // Android 13+ notification permission
    "RECEIVE_BOOT_COMPLETED",    // Restore timers after device restart
    "VIBRATE"                    // Vibration for notifications
  ]
}
```

**Notification Channels:**
- `timer-notifications`: HIGH priority, with sound and vibration
- `ongoing-timer`: LOW priority, silent updates

**Behavior:**
- ✅ Scheduled notifications work when app is closed
- ✅ Ongoing notifications visible in foreground and background
- ⚠️ Ongoing notifications stop when app is force-closed

### iOS

**Permissions Required:**
- Alert notifications
- Sound
- Badge

**Behavior:**
- ✅ Scheduled notifications work when app is closed
- ⚠️ iOS requires user permission grant (requested on first app launch)
- ⚠️ Ongoing notifications have limitations in background
- ❌ Cannot update notifications every second in background

**Note:** Local scheduled notifications on iOS do not require any special background modes. They work natively through the iOS notification system.

### Web

**Behavior:**
- ⚠️ Limited notification support
- Browser must grant permission
- Tab must be open for ongoing notifications
- Scheduled notifications may not work if browser is closed

## Limitations

### Cannot Implement Without Native Code

1. **Persistent Ongoing Notifications (when app is closed)**:
   - Would require native foreground service (Android)
   - Would require background app refresh (iOS)
   - Not possible with Expo Go; requires custom dev client or bare workflow

2. **Background Task Updates**:
   - `expo-background-fetch` has strict OS limitations
   - Cannot run every second
   - iOS restricts to ~15 minutes minimum intervals
   - Not suitable for live timer updates

3. **Platform Differences**:
   - Android and iOS have different background execution models
   - Each platform has different notification capabilities
   - No unified solution for all platforms

## Best Practices

### For Users

1. **Grant notification permissions** when prompted
2. **Don't force-close the app** if you want ongoing notifications
3. **Check notification settings** if alerts don't appear
4. **Keep app in background** instead of closing for best experience

### For Developers

1. **Always schedule notifications** when timer starts
2. **Cancel scheduled notifications** when timer is paused/reset
3. **Save timer state** to handle app closure gracefully
4. **Restore state** when app reopens
5. **Test on real devices**, not just simulators

## Troubleshooting

### Notifications Not Appearing

1. **Check permissions**:
   ```typescript
   const permissions = await Notifications.getPermissionsAsync();
   console.log('Notification permissions:', permissions);
   ```

2. **Verify notification channels** (Android):
   - Open device Settings → Apps → Pomodoro Way → Notifications
   - Ensure "Timer Notifications" channel is enabled

3. **Check Do Not Disturb** (iOS):
   - Notifications may be silent during Do Not Disturb
   - Configure notification delivery in iOS settings

4. **Test scheduled notifications**:
   ```typescript
   // Schedule a test notification in 10 seconds
   await schedulePomodoroCompleteNotification(10, "Test Task");
   ```

### Ongoing Notifications Stop

This is **expected behavior** when the app is completely closed. To keep ongoing notifications:
- Keep app in background instead of force-closing
- Use the scheduled notification for completion alerts

### iOS Notifications Not Working

1. Check Info.plist includes `UIBackgroundModes`
2. Verify user granted notification permissions
3. Test on real device (simulator has limitations)
4. Check iOS notification settings for the app

## Future Enhancements

Possible improvements (require additional development):

1. **Configurable notification sounds** per session type
2. **Custom notification actions** (pause, skip, finish)
3. **Notification history** to track missed notifications
4. **Smart notification timing** based on user preferences
5. **Grouped notifications** for multiple completed sessions

For these enhancements, consider:
- Custom development build (not Expo Go)
- Native modules for advanced features
- Platform-specific implementations
