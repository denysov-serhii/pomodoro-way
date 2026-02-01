import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { saveTimerState, loadTimerState, clearTimerState } from '../utils/storage';

export const DURATION_OPTIONS = [
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '35 min', value: 35 },
  { label: '40 min', value: 40 },
  { label: '45 min', value: 45 },
  { label: '50 min', value: 50 },
  { label: '1h', value: 60 },
];

export const useTimerState = () => {
  const { currentTask, setCurrentTask, incrementTaskPomodoro, tasks } = useContext(AppContext);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, title: '', message: '', onConfirm: null });
  const hasLoadedState = useRef(false);

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
          setInitialDuration(savedState.initialDuration);
          setTimeLeft(remainingTime);
          setIsRunning(true);
          setStartTime(savedState.startTime);
          if (savedState.taskId) {
            const task = tasks.find(t => t.id === savedState.taskId);
            if (task) setCurrentTask(task);
          }
        } else if (savedState.isRunning && remainingTime <= 0) {
          // Timer completed while away
          setIsCompleted(true);
          setTimeLeft(0);
          if (savedState.taskId) {
            const task = tasks.find(t => t.id === savedState.taskId);
            if (task) {
              setCurrentTask(task);
              incrementTaskPomodoro(task.id);
            }
          }
          setTimeout(() => {
            showAlert('Pomodoro Complete!', 'Your timer finished while you were away. Great work!');
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
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (currentTask) {
              incrementTaskPomodoro(currentTask.id);
            }
            showAlert('Pomodoro Complete!', 'Great work! Time for a break.');
            clearTimerState();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentTask, incrementTaskPomodoro]);

  // Save timer state whenever it changes
  useEffect(() => {
    if (hasLoadedState.current && isRunning) {
      const timerState = {
        isRunning,
        startTime: startTime || Date.now(),
        initialDuration,
        taskId: currentTask?.id || null,
      };
      saveTimerState(timerState);
      if (!startTime) {
        setStartTime(Date.now());
      }
    }
  }, [isRunning, currentTask, startTime, initialDuration]);

  const showAlert = (title, message, onConfirm = null) => {
    if (onConfirm) {
      setConfirmDialog({ visible: true, title, message, onConfirm });
    } else {
      setConfirmDialog({ 
        visible: true, 
        title, 
        message, 
        onConfirm: () => setConfirmDialog({ visible: false, title: '', message: '', onConfirm: null })
      });
    }
  };

  const handleDurationChange = (duration) => {
    if (!isRunning) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
      setInitialDuration(duration * 60);
      setIsCompleted(false);
      setStartTime(null);
    }
  };

  return {
    selectedDuration,
    timeLeft,
    isRunning,
    isCompleted,
    startTime,
    initialDuration,
    confirmDialog,
    setIsRunning,
    setTimeLeft,
    setIsCompleted,
    setStartTime,
    setInitialDuration,
    setConfirmDialog,
    showAlert,
    handleDurationChange,
  };
};
