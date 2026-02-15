import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logError } from './errorLogger';

// Store notification identifiers for cancellation
let currentTimerNotificationId: string | null = null;

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * Only requests permissions once when status is 'undetermined' (first time).
 * Does not re-request if user has denied permissions to avoid repeated prompts.
 * @returns Promise<boolean> - true if permissions granted, false otherwise
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    // If already granted, return true
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Only request if we haven't asked yet (undetermined status)
    // Don't re-request if user has denied permissions to avoid repeated prompts
    if (existingStatus === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        return true;
      }
    }
    
    // Permissions not granted (either denied or undetermined after request)
    console.warn('Notification permissions not granted');
    return false;
  }
  
  // For non-Android platforms (iOS, web), return true as a no-op
  // Note: iOS notification permissions would need separate implementation if required
  return true;
};

/**
 * Schedule an immediate local notification
 * @param title - Notification title
 * @param body - Notification body
 */
export const sendLocalNotification = async (
  title: string,
  body: string
): Promise<void> => {
  try {
    // Only send notifications on Android (web/iOS can use other mechanisms)
    if (Platform.OS !== 'android') {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // null means immediate
    });
  } catch (error) {
    logError('Error sending notification', 'notifications.sendLocalNotification', error);
  }
};

/**
 * Sanitize and truncate task name for notification
 * @param taskName - Task name to sanitize
 * @returns Sanitized task name
 */
const sanitizeTaskName = (taskName: string): string => {
  // Truncate to 50 characters max
  const maxLength = 50;
  return taskName.length > maxLength 
    ? taskName.substring(0, maxLength) + '...' 
    : taskName;
};

/**
 * Send notification when pomodoro completes
 * @param taskName - Optional task name
 */
export const sendPomodoroCompleteNotification = async (
  taskName?: string
): Promise<void> => {
  const title = '🍅 Pomodoro Complete!';
  const body = taskName 
    ? `Great work on "${sanitizeTaskName(taskName)}"! Time for a break.`
    : 'Great work! Time for a break.';
  
  await sendLocalNotification(title, body);
};

/**
 * Send notification when break completes
 * @param breakType - Type of break (short or long)
 */
export const sendBreakCompleteNotification = async (
  breakType: 'short' | 'long'
): Promise<void> => {
  const title = breakType === 'long' ? '⏸️ Long Break Complete!' : '⏸️ Break Complete!';
  const body = 'Time to get back to work!';
  
  await sendLocalNotification(title, body);
};

/**
 * Schedule a notification to fire after a specified duration
 * This allows notifications to work even when the app is in the background
 * @param title - Notification title
 * @param body - Notification body
 * @param seconds - Number of seconds until notification should fire
 * @returns The notification identifier for potential cancellation
 * @note Android only - iOS requires different implementation with Background Tasks API,
 *       and web uses browser notifications which are not implemented in this app
 */
export const scheduleTimerNotification = async (
  title: string,
  body: string,
  seconds: number
): Promise<string | null> => {
  try {
    // Only schedule notifications on Android
    if (Platform.OS !== 'android') {
      return null;
    }

    // Cancel any existing timer notification
    await cancelTimerNotification();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds,
        channelId: 'timer-notifications',
      },
    });

    // Store the notification ID for potential cancellation
    currentTimerNotificationId = notificationId;
    return notificationId;
  } catch (error) {
    logError('Error scheduling notification', 'notifications.scheduleTimerNotification', error);
    return null;
  }
};

/**
 * Cancel any pending timer notification
 */
export const cancelTimerNotification = async (): Promise<void> => {
  try {
    if (currentTimerNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(currentTimerNotificationId);
      currentTimerNotificationId = null;
    }
  } catch (error) {
    logError('Error cancelling notification', 'notifications.cancelTimerNotification', error);
  }
};

/**
 * Schedule a notification for when pomodoro completes
 * @param durationSeconds - Duration in seconds until pomodoro completes
 * @param taskName - Optional task name
 * @returns The notification identifier for potential cancellation
 */
export const schedulePomodoroCompleteNotification = async (
  durationSeconds: number,
  taskName?: string
): Promise<string | null> => {
  const title = '🍅 Pomodoro Complete!';
  const body = taskName 
    ? `Great work on "${sanitizeTaskName(taskName)}"! Time for a break.`
    : 'Great work! Time for a break.';
  
  return await scheduleTimerNotification(title, body, durationSeconds);
};

/**
 * Schedule a notification for when break completes
 * @param durationSeconds - Duration in seconds until break completes
 * @param breakType - Type of break (short or long)
 * @returns The notification identifier for potential cancellation
 */
export const scheduleBreakCompleteNotification = async (
  durationSeconds: number,
  breakType: 'short' | 'long'
): Promise<string | null> => {
  const title = breakType === 'long' ? '⏸️ Long Break Complete!' : '⏸️ Break Complete!';
  const body = 'Time to get back to work!';
  
  return await scheduleTimerNotification(title, body, durationSeconds);
};
