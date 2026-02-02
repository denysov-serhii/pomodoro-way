import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { clearTimerState } from '../utils/storage';

interface TimerState {
  selectedDuration: number;
  timeLeft: number;
  isRunning: boolean;
  initialDuration: number;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  setIsRunning: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setIsCompleted: (value: boolean) => void;
  setStartTime: (value: number | null) => void;
  setInitialDuration: (value: number) => void;
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
    initialDuration,
    sessionType,
    completedPomodoros,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
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
    setStartTime(Date.now());
    setInitialDuration(timeLeft);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setInitialDuration(selectedDuration * 60);
    setIsCompleted(false);
    setStartTime(null);
    clearTimerState();
  };

  const handleFinish = () => {
    if (!isRunning && timeLeft === selectedDuration * 60) {
      showAlert('Timer not started', 'Please start the timer first.');
      return;
    }

    const timeSpentSeconds = initialDuration - timeLeft;
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
            incrementTaskPomodoro(currentTask.id);
          }
          const newCompletedPomodoros = completedPomodoros + 1;
          setCompletedPomodoros(newCompletedPomodoros);
          setTimeLeft(0);
          clearTimerState();
          hideDialog();
          
          // Set up break in paused state (user must manually start)
          const isLongBreak = newCompletedPomodoros % 4 === 0;
          const breakType = isLongBreak ? 'longBreak' : 'shortBreak';
          const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
          
          setSessionType(breakType);
          setSelectedDuration(breakDuration);
          setTimeLeft(breakDuration * 60);
          setInitialDuration(breakDuration * 60);
          setIsCompleted(false);
          setIsRunning(false); // Break is paused, user must start it
          setStartTime(null);
          
          setTimeout(() => {
            showAlert(
              'Pomodoro Complete!',
              `Great work! Ready for a ${isLongBreak ? 'long break' : 'short break'} (${breakDuration} min). You've completed ${newCompletedPomodoros} Pomodoro${newCompletedPomodoros !== 1 ? 's' : ''}.`
            );
          }, 100);
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
