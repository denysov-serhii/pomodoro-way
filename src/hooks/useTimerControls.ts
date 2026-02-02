import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { clearTimerState } from '../utils/storage';

interface TimerState {
  selectedDuration: number;
  timeLeft: number;
  isRunning: boolean;
  initialDuration: number;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  setIsRunning: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setIsCompleted: (value: boolean) => void;
  setStartTime: (value: number | null) => void;
  setInitialDuration: (value: number) => void;
  showAlert: (title: string, message: string, onConfirm?: (() => void) | null) => void;
  hideDialog: () => void;
  skipBreak: () => void;
}

export const useTimerControls = (timerState: TimerState) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useTimerControls must be used within AppProvider');
  }
  const { currentTask, incrementTaskPomodoro } = context;
  
  const {
    selectedDuration,
    timeLeft,
    isRunning,
    initialDuration,
    sessionType,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
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
          setTimeLeft(0);
          clearTimerState();
          hideDialog();
          setTimeout(() => {
            showAlert('Session Complete!', `You worked for ${timeSpentDisplay}. Great job!`);
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
