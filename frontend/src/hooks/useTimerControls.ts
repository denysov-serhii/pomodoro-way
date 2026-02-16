import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { clearTimerState } from '../utils/storage';
import { playNotificationSound } from '../utils/audio';
import { sendPomodoroCompleteNotification, schedulePomodoroCompleteNotification, scheduleBreakCompleteNotification, cancelTimerNotification, dismissOngoingTimerNotification } from '../utils/notifications';
import { logError } from '../utils/errorLogger';

interface TimerState {
  selectedDuration: number;
  timeLeft: number;
  isRunning: boolean;
  initialDuration: number;
  sessionDuration: number;
  pausedDuration: number;
  pauseStartTime: number | null;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  setIsRunning: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setIsCompleted: (value: boolean) => void;
  setStartTime: (value: number | null) => void;
  setInitialDuration: (value: number) => void;
  setSessionDuration: (value: number) => void;
  setPausedDuration: (value: number) => void;
  setPauseStartTime: (value: number | null) => void;
  setSessionType: (value: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  setSelectedDuration: (value: number) => void;
  setCompletedPomodoros: (value: number) => void;
  showAlert: (title: string, message: string, onConfirm?: (() => void) | null) => void;
  hideDialog: () => void;
  skipBreak: () => void;
}

export const useTimerControls = (timerState: TimerState) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useTimerControls must be used within AppProvider');
  }
  const { currentTask, incrementTaskPomodoro, settings } = context;
  
  const {
    selectedDuration,
    timeLeft,
    isRunning,
    sessionDuration,
    pausedDuration,
    pauseStartTime,
    sessionType,
    completedPomodoros,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
    setSessionDuration,
    setPausedDuration,
    setPauseStartTime,
    setSessionType,
    setSelectedDuration,
    setCompletedPomodoros,
    showAlert,
    hideDialog,
    skipBreak,
  } = timerState;

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
    
    // If resuming from pause, accumulate the paused time
    if (pauseStartTime) {
      const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
      setPausedDuration(pausedDuration + pauseDuration);
      setPauseStartTime(null);
    }
    
    // Set startTime based on current timeLeft to handle resume after pause
    setStartTime(Date.now());
    setInitialDuration(timeLeft);
    // Set sessionDuration only on first start (not on resume)
    if (timeLeft === selectedDuration * 60) {
      setSessionDuration(timeLeft);
      setPausedDuration(0); // Reset paused duration for new session
    }

    // Schedule notification for when session completes
    if (sessionType === 'pomodoro') {
      schedulePomodoroCompleteNotification(timeLeft, currentTask?.title).catch(error => {
        logError('Failed to schedule pomodoro completion notification', 'useTimerControls.handleStart', error);
      });
    } else {
      // Schedule break completion notification
      const breakType = sessionType === 'longBreak' ? 'long' : 'short';
      scheduleBreakCompleteNotification(timeLeft, breakType).catch(error => {
        logError('Failed to schedule break completion notification', 'useTimerControls.handleStart', error);
      });
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    // Track when pause started
    setPauseStartTime(Date.now());
    // startTime will be recalculated on resume
    setStartTime(null);
    // Cancel any pending notification since timer is paused
    cancelTimerNotification().catch(error => {
      logError('Failed to cancel notification on pause', 'useTimerControls.handlePause', error);
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setInitialDuration(selectedDuration * 60);
    setSessionDuration(selectedDuration * 60);
    setPausedDuration(0);
    setPauseStartTime(null);
    setIsCompleted(false);
    setStartTime(null);
    clearTimerState();
    // Dismiss ongoing notification when resetting
    dismissOngoingTimerNotification().catch(error => {
      logError('Failed to dismiss ongoing notification on reset', 'useTimerControls.handleReset', error);
    });
  };

  const handleFinish = () => {
    if (!isRunning && timeLeft === selectedDuration * 60) {
      showAlert('Timer not started', 'Please start the timer first.');
      return;
    }

    // Calculate actual work time (excluding paused time)
    let currentPausedDuration = pausedDuration;
    if (pauseStartTime) {
      // If currently paused, add current pause duration
      const currentPauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
      currentPausedDuration += currentPauseDuration;
    }
    
    const timeSpentSeconds = sessionDuration - timeLeft - currentPausedDuration;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
    const timeSpentDisplay = timeSpentMinutes > 0 
      ? `${timeSpentMinutes} minute${timeSpentMinutes !== 1 ? 's' : ''}`
      : `${timeSpentSeconds} second${timeSpentSeconds !== 1 ? 's' : ''}`;

    if (sessionType === 'pomodoro') {
      showAlert(
        'Finish Early?',
        `You've worked for ${timeSpentDisplay}. ${currentTask ? 'This will count as a completed pomodoro for the task.' : 'Finish the session?'}`,
        () => {
          setIsRunning(false);
          setIsCompleted(true);
          if (currentTask) {
            const actualMinutes = Math.round(timeSpentSeconds / 60);
            incrementTaskPomodoro(currentTask.id, actualMinutes);
          }
          const newCompletedPomodoros = completedPomodoros + 1;
          setCompletedPomodoros(newCompletedPomodoros);
          setTimeLeft(0);
          clearTimerState();
          hideDialog();
          
          // Dismiss ongoing notification when finishing early
          dismissOngoingTimerNotification().catch(error => {
            logError('Failed to dismiss ongoing notification on finish', 'useTimerControls.handleFinish', error);
          });
          
          // Play notification sound and send notification
          playNotificationSound();
          sendPomodoroCompleteNotification(currentTask?.title).catch(error => {
            logError('Failed to send pomodoro completion notification', 'useTimerControls.handleFinish', error);
          });
          
          // Set up break in paused state (user must manually start)
          const isLongBreak = newCompletedPomodoros % 4 === 0;
          const breakType = isLongBreak ? 'longBreak' : 'shortBreak';
          const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
          
          setSessionType(breakType);
          setSelectedDuration(breakDuration);
          setTimeLeft(breakDuration * 60);
          setInitialDuration(breakDuration * 60);
          setSessionDuration(breakDuration * 60);
          setPausedDuration(0); // Reset paused duration for new session
          setPauseStartTime(null);
          setIsCompleted(false);
          setIsRunning(false); // Break is paused, user must start it
          setStartTime(null);
        }
      );
    } else {
      // Skip break
      skipBreak();
    }
  };

  return {
    handleStart,
    handlePause,
    handleReset,
    handleFinish,
  };
};
