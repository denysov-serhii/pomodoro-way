import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { clearTimerState } from '../utils/storage';

export const useTimerControls = (timerState) => {
  const { currentTask, incrementTaskPomodoro } = useContext(AppContext);
  const {
    selectedDuration,
    timeLeft,
    isRunning,
    initialDuration,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
    showAlert,
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
        timerState.setConfirmDialog({ visible: false, title: '', message: '', onConfirm: null });
        setTimeout(() => {
          showAlert('Session Complete!', `You worked for ${timeSpentDisplay}. Great job!`);
        }, 100);
      }
    );
  };

  return {
    handleStart,
    handlePause,
    handleReset,
    handleFinish,
  };
};
