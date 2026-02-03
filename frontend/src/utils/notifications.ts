import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logError } from './errorLogger';

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
 * @returns Promise<boolean> - true if permissions granted, false otherwise
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    
    return true;
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
