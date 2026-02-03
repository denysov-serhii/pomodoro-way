import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { saveTimerState, loadTimerState, clearTimerState } from '../utils/storage';
import { DurationOption, ConfirmDialogState } from '../types';
import { playNotificationSound, initializeAudio } from '../utils/audio';
import { sendPomodoroCompleteNotification, sendBreakCompleteNotification } from '../utils/notifications';

export const DURATION_OPTIONS: DurationOption[] = [

  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
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
        const elapsedMs = now - savedState.startTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const remainingTime = savedState.initialDuration - elapsedSeconds;

        if (savedState.isRunning && remainingTime > 0) {
          // Timer was running, restore it
          setSelectedDuration(Math.ceil(savedState.initialDuration / 60));
          setInitialDuration(remainingTime); // For sync calculation from current point
          setSessionDuration(savedState.sessionDuration || savedState.initialDuration); // Use saved sessionDuration or fall back to initialDuration
          setTimeLeft(remainingTime);
          setIsRunning(true);
          setStartTime(now); // Reset start time to now for accurate sync
          setSessionType(savedState.sessionType || 'pomodoro');
          setCompletedPomodoros(savedState.completedPomodoros || 0);
          if (savedState.taskId) {
            const task = tasks.find(t => t.id === savedState.taskId);
            if (task) setCurrentTask(task);
          }
        } else if (savedState.isRunning && remainingTime <= 0) {
          // Timer completed while away
          setIsCompleted(true);
          setTimeLeft(0);
          setSessionType(savedState.sessionType || 'pomodoro');
          setCompletedPomodoros(savedState.completedPomodoros || 0);
          setSessionDuration(savedState.sessionDuration || savedState.initialDuration); // Use saved sessionDuration or fall back
          if (savedState.taskId) {
            const task = tasks.find(t => t.id === savedState.taskId);
            if (task) {
              setCurrentTask(task);
              if (savedState.sessionType === 'pomodoro') {
                const sessionMinutes = Math.round((savedState.sessionDuration || savedState.initialDuration) / 60);
                incrementTaskPomodoro(task.id, sessionMinutes);
              }
            }
          }
          setTimeout(() => {
            const sessionName = savedState.sessionType === 'pomodoro' ? 'Pomodoro' : 'Break';
            showAlert(`${sessionName} Complete!`, 'Your timer finished while you were away. Great work!');
          }, 100);
          await clearTimerState();
        } else {
          await clearTimerState();
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
          
          if (sessionType === 'pomodoro') {
            // Pomodoro completed
            if (currentTask) {
              const sessionMinutes = Math.round(sessionDuration / 60);
              incrementTaskPomodoro(currentTask.id, sessionMinutes);
            }
            const newCompletedPomodoros = completedPomodoros + 1;
            setCompletedPomodoros(newCompletedPomodoros);
            
            // Play notification sound and send notification
            playNotificationSound();
            sendPomodoroCompleteNotification(currentTask?.title).catch(error => {
              console.error('Failed to send pomodoro completion notification:', error);
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
            setIsCompleted(false);
            setIsRunning(false); // Break is paused, user must start it
            setStartTime(null);

          } else {
            // Break completed
            playNotificationSound();
            const breakType = sessionType === 'longBreak' ? 'long' : 'short';
            sendBreakCompleteNotification(breakType).catch(error => {
              console.error('Failed to send break completion notification:', error);
            });
            showAlert('Break Complete!', 'Time to get back to work!');
            setSessionType('pomodoro');
            setSelectedDuration(25);
            setTimeLeft(25 * 60);
            setInitialDuration(25 * 60);
            setSessionDuration(25 * 60);
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
    if (hasLoadedState.current && isRunning) {
      const timerState = {
        isRunning,
        startTime: startTime || Date.now(),
        initialDuration,
        sessionDuration,
        taskId: currentTask?.id || null,
        sessionType,
        completedPomodoros,
      };
      saveTimerState(timerState);
      if (!startTime) {
        setStartTime(Date.now());
      }
    }
  }, [isRunning, currentTask, startTime, initialDuration, sessionDuration, sessionType, completedPomodoros]);

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
    setIsCompleted(false);
    setStartTime(null);
    clearTimerState();
    hideDialog();
  };

  return {
    selectedDuration,
    timeLeft,
    isRunning,
    isCompleted,
    startTime,
    initialDuration,
    sessionDuration,
    sessionType,
    completedPomodoros,
    confirmDialog,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
    setSessionDuration,
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
