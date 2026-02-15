import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { saveTimerState, loadTimerState, clearTimerState } from '../utils/storage';
import { DurationOption, ConfirmDialogState } from '../types';
import { playNotificationSound, initializeAudio } from '../utils/audio';
import { sendPomodoroCompleteNotification, sendBreakCompleteNotification, schedulePomodoroCompleteNotification, scheduleBreakCompleteNotification, cancelTimerNotification } from '../utils/notifications';
import { logError } from '../utils/errorLogger';

export const DURATION_OPTIONS: DurationOption[] = [

  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '35 min', value: 35 },
  { label: '40 min', value: 40 },
  { label: '45 min', value: 45 },
  { label: '50 min', value: 50 },
  { label: '1h', value: 60 },
];

export const useTimerState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useTimerState must be used within AppProvider');
  }
  const { currentTask, setCurrentTask, incrementTaskPomodoro, tasks, settings } = context;
  
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(25 * 60);
  const [sessionDuration, setSessionDuration] = useState<number>(25 * 60); // Track original session duration for task credit
  const [pausedDuration, setPausedDuration] = useState<number>(0); // Track total accumulated pause time in seconds
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null); // Track when pause started
  const [sessionType, setSessionType] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ 
    visible: false, 
    title: '', 
    message: '', 
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
  });
  const hasLoadedState = useRef<boolean>(false);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
  }, []);

  // Load timer state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      if (hasLoadedState.current) return;

      const savedState = await loadTimerState();
      if (savedState) {
        // Wait for tasks to be loaded if we have a taskId to restore
        if (savedState.taskId && tasks.length === 0) {
          return;
        }

        hasLoadedState.current = true;
        const now = Date.now();
        
        if (savedState.isRunning) {
          // Timer was running
          const elapsedMs = now - savedState.startTime;
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const remainingTime = savedState.initialDuration - elapsedSeconds;

          if (remainingTime > 0) {
            // Timer was running, restore it
            setSelectedDuration(Math.ceil(savedState.initialDuration / 60));
            setInitialDuration(remainingTime); // For sync calculation from current point
            setSessionDuration(savedState.sessionDuration || savedState.initialDuration); // Use saved sessionDuration or fall back to initialDuration
            setPausedDuration(savedState.pausedDuration || 0); // Restore paused duration
            setTimeLeft(remainingTime);
            setIsRunning(true);
            setStartTime(now); // Reset start time to now for accurate sync
            setSessionType(savedState.sessionType || 'pomodoro');
            setCompletedPomodoros(savedState.completedPomodoros || 0);
            
            // Find and set current task if it exists
            let restoredTask = null;
            if (savedState.taskId) {
              restoredTask = tasks.find(t => t.id === savedState.taskId);
              if (restoredTask) setCurrentTask(restoredTask);
            }

            // Schedule notification for remaining time
            if (savedState.sessionType === 'pomodoro') {
              schedulePomodoroCompleteNotification(remainingTime, restoredTask?.title).catch(error => {
                logError('Failed to schedule notification on restore', 'useTimerState.loadSavedState', error);
              });
            } else {
              const breakType = savedState.sessionType === 'longBreak' ? 'long' : 'short';
              scheduleBreakCompleteNotification(remainingTime, breakType).catch(error => {
                logError('Failed to schedule notification on restore', 'useTimerState.loadSavedState', error);
              });
            }
          } else {
            // Timer completed while away
            setIsCompleted(true);
            setTimeLeft(0);
            setSessionType(savedState.sessionType || 'pomodoro');
            setCompletedPomodoros(savedState.completedPomodoros || 0);
            setSessionDuration(savedState.sessionDuration || savedState.initialDuration); // Use saved sessionDuration or fall back
            setPausedDuration(savedState.pausedDuration || 0); // Restore paused duration
            if (savedState.taskId) {
              const task = tasks.find(t => t.id === savedState.taskId);
              if (task) {
                setCurrentTask(task);
                if (savedState.sessionType === 'pomodoro') {
                  // Use actual work time (session duration minus paused time)
                  const actualWorkSeconds = (savedState.sessionDuration || savedState.initialDuration) - (savedState.pausedDuration || 0);
                  const sessionMinutes = Math.round(actualWorkSeconds / 60);
                  incrementTaskPomodoro(task.id, sessionMinutes);
                }
              }
            }
            setTimeout(() => {
              const sessionName = savedState.sessionType === 'pomodoro' ? 'Pomodoro' : 'Break';
              showAlert(`${sessionName} Complete!`, 'Your timer finished while you were away. Great work!');
            }, 100);
            await clearTimerState();
          }
        } else {
          // Timer was paused, restore paused state
          setSelectedDuration(Math.ceil(savedState.initialDuration / 60));
          setInitialDuration(savedState.initialDuration);
          setSessionDuration(savedState.sessionDuration || savedState.initialDuration);
          setPausedDuration(savedState.pausedDuration || 0);
          setPauseStartTime(savedState.pauseStartTime || null);
          setTimeLeft(savedState.initialDuration);
          setIsRunning(false);
          setStartTime(null);
          setSessionType(savedState.sessionType || 'pomodoro');
          setCompletedPomodoros(savedState.completedPomodoros || 0);
          
          // Find and set current task if it exists
          if (savedState.taskId) {
            const restoredTask = tasks.find(t => t.id === savedState.taskId);
            if (restoredTask) setCurrentTask(restoredTask);
          }
        }
      } else {
        hasLoadedState.current = true;
      }
    };

    loadSavedState();
  }, [tasks, setCurrentTask, incrementTaskPomodoro]);

  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        // Calculate expected time based on actual elapsed time
        const now = Date.now();
        const elapsedMs = now - startTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const expectedTimeLeft = initialDuration - elapsedSeconds;
        
        if (expectedTimeLeft <= 0) {
          setTimeLeft(0);
          setIsRunning(false);
          setIsCompleted(true);
          
          // Cancel any pending notification since timer completed
          cancelTimerNotification().catch(error => {
            logError('Failed to cancel notification on complete', 'useTimerState.timerEffect', error);
          });
          
          if (sessionType === 'pomodoro') {
            // Pomodoro completed
            if (currentTask) {
              // Use actual work time (session duration minus paused time)
              const actualWorkSeconds = sessionDuration - pausedDuration;
              const sessionMinutes = Math.round(actualWorkSeconds / 60);
              incrementTaskPomodoro(currentTask.id, sessionMinutes);
            }
            const newCompletedPomodoros = completedPomodoros + 1;
            setCompletedPomodoros(newCompletedPomodoros);
            
            // Play notification sound and send notification
            playNotificationSound();
            sendPomodoroCompleteNotification(currentTask?.title).catch(error => {
              logError('Failed to send pomodoro completion notification', 'useTimerState.handleComplete', error);
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

          } else {
            // Break completed
            playNotificationSound();
            const breakType = sessionType === 'longBreak' ? 'long' : 'short';
            sendBreakCompleteNotification(breakType).catch(error => {
              logError('Failed to send break completion notification', 'useTimerState.handleComplete', error);
            });
            showAlert('Break Complete!', 'Time to get back to work!');
            setSessionType('pomodoro');
            setSelectedDuration(25);
            setTimeLeft(25 * 60);
            setInitialDuration(25 * 60);
            setSessionDuration(25 * 60);
            setPausedDuration(0); // Reset paused duration for new session
            setPauseStartTime(null);
          }
          
          clearTimerState();
        } else {
          // Synchronize timer with expected time
          setTimeLeft(expectedTimeLeft);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentTask, incrementTaskPomodoro, sessionType, completedPomodoros, settings, startTime, initialDuration, sessionDuration]);

  // Save timer state whenever it changes
  useEffect(() => {
    if (hasLoadedState.current) {
      // Save timer state for both running and paused timers (not just running)
      // Only save if there's meaningful state (not a fresh timer)
      if (isRunning || timeLeft !== selectedDuration * 60) {
        const timerState = {
          isRunning,
          startTime: startTime || Date.now(),
          initialDuration,
          sessionDuration,
          pausedDuration,
          pauseStartTime: pauseStartTime ?? undefined,
          taskId: currentTask?.id || null,
          sessionType,
          completedPomodoros,
        };
        saveTimerState(timerState);
        if (isRunning && !startTime) {
          setStartTime(Date.now());
        }
      }
    }
  }, [isRunning, currentTask, startTime, initialDuration, sessionDuration, pausedDuration, pauseStartTime, sessionType, completedPomodoros, timeLeft, selectedDuration]);

  const showAlert = (title: string, message: string, onConfirm: (() => void) | null = null) => {
    if (onConfirm) {
      setConfirmDialog({ visible: true, title, message, onConfirm, confirmText: 'OK', cancelText: 'Cancel', showCancel: true });
    } else {
      setConfirmDialog({ 
        visible: true, 
        title, 
        message, 
        onConfirm: () => setConfirmDialog({ visible: false, title: '', message: '', onConfirm: null, confirmText: 'OK', cancelText: 'Cancel', showCancel: true }),
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: true,
      });
    }
  };

  const hideDialog = () => {
    setConfirmDialog({ visible: false, title: '', message: '', onConfirm: null, confirmText: 'OK', cancelText: 'Cancel', showCancel: true });
  };

  const handleDurationChange = (duration: number) => {
    if (!isRunning && sessionType === 'pomodoro') {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
      setInitialDuration(duration * 60);
      setSessionDuration(duration * 60);
      setPausedDuration(0); // Reset paused duration for new session
      setPauseStartTime(null);
      setIsCompleted(false);
      setStartTime(null);
    }
  };

  const skipBreak = () => {
    setIsRunning(false);
    setSessionType('pomodoro');
    setSelectedDuration(25);
    setTimeLeft(25 * 60);
    setInitialDuration(25 * 60);
    setSessionDuration(25 * 60);
    setPausedDuration(0); // Reset paused duration for new session
    setPauseStartTime(null);
    setIsCompleted(false);
    setStartTime(null);
    clearTimerState();
    hideDialog();
    // Cancel any pending notification
    cancelTimerNotification().catch(error => {
      logError('Failed to cancel notification on skip break', 'useTimerState.skipBreak', error);
    });
  };

  return {
    selectedDuration,
    timeLeft,
    isRunning,
    isCompleted,
    startTime,
    initialDuration,
    sessionDuration,
    pausedDuration,
    pauseStartTime,
    sessionType,
    completedPomodoros,
    confirmDialog,
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
    setConfirmDialog,
    showAlert,
    hideDialog,
    handleDurationChange,
    skipBreak,
  };
};
