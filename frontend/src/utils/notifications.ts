import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logError } from './errorLogger';

// Store notification identifiers for cancellation
let currentTimerNotificationId: string | null = null;
let ongoingTimerNotificationId: string | null = null;

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
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    // If already granted, return true
    if (existingStatus === 'granted') {
      return true;
    }
    
    // Only request if we haven't asked yet (undetermined status)
    // Don't re-request if user has denied permissions to avoid repeated prompts
    if (existingStatus === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      if (status === 'granted') {
        return true;
      }
    }
    
    // Permissions not granted (either previously denied, or user just denied the request)
    console.warn('Notification permissions not granted');
    return false;
  } catch (error) {
    logError('Error requesting notification permissions', 'notifications.requestNotificationPermissions', error);
    return false;
  }
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
 * This allows notifications to work even when the app is in the background or closed
 * @param title - Notification title
 * @param body - Notification body
 * @param seconds - Number of seconds until notification should fire
 * @returns The notification identifier for potential cancellation
 */
export const scheduleTimerNotification = async (
  title: string,
  body: string,
  seconds: number
): Promise<string | null> => {
  try {
    // Cancel any existing timer notification
    await cancelTimerNotification();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: Platform.OS === 'android' 
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            channelId: 'timer-notifications',
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
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

/**
 * Format seconds into MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Show or update an ongoing notification displaying the timer countdown
 * This notification persists even when the app is in the background
 * @param timeLeft - Remaining time in seconds
 * @param sessionType - Type of session (pomodoro, shortBreak, or longBreak)
 * @param taskName - Optional task name
 */
export const showOngoingTimerNotification = async (
  timeLeft: number,
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak',
  taskName?: string
): Promise<void> => {
  try {
    // Only show ongoing notifications on Android
    if (Platform.OS !== 'android') {
      return;
    }

    const sessionEmoji = sessionType === 'pomodoro' ? '🍅' : '☕';
    const sessionName = sessionType === 'pomodoro' 
      ? 'Pomodoro' 
      : sessionType === 'longBreak' 
        ? 'Long Break' 
        : 'Break';
    
    const title = `${sessionEmoji} ${sessionName} - ${formatTime(timeLeft)}`;
    const body = taskName 
      ? `Working on: ${sanitizeTaskName(taskName)}`
      : `${sessionName} in progress`;

    // Dismiss previous notification and present the updated one
    if (ongoingTimerNotificationId) {
      await Notifications.dismissNotificationAsync(ongoingTimerNotificationId);
    }
    
    ongoingTimerNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: false, // No sound for ongoing updates
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        sticky: true, // Keeps notification in ongoing section
        autoDismiss: false,
        categoryIdentifier: 'timer',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        channelId: 'ongoing-timer',
        seconds: 1, // Schedule for immediate display
      },
    });
  } catch (error) {
    logError('Error showing ongoing timer notification', 'notifications.showOngoingTimerNotification', error);
  }
};

/**
 * Dismiss the ongoing timer notification
 */
export const dismissOngoingTimerNotification = async (): Promise<void> => {
  try {
    if (Platform.OS !== 'android') {
      return;
    }

    if (ongoingTimerNotificationId) {
      await Notifications.dismissNotificationAsync(ongoingTimerNotificationId);
      ongoingTimerNotificationId = null;
    }
  } catch (error) {
    logError('Error dismissing ongoing notification', 'notifications.dismissOngoingTimerNotification', error);
  }
};
