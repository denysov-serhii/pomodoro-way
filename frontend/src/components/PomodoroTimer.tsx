import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useTimerState } from '../hooks/useTimerState';
import { useTimerControls } from '../hooks/useTimerControls';
import TimerDisplay from './timer/TimerDisplay';
import TimerControls from './timer/TimerControls';
import TaskSelector from './timer/TaskSelector';
import ConfirmDialog from './common/ConfirmDialog';
import { timerStyles as styles } from '../styles/timerStyles';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PomodoroTimer: React.FC = () => {
  const timerState = useTimerState();
  const { handleStart, handlePause, handleFinish } = useTimerControls(timerState);

  const {
    selectedDuration,
    timeLeft,
    isRunning,
    sessionType,
    completedPomodoros,
    confirmDialog,
    hideDialog,
    handleDurationChange,
    skipBreak,
  } = timerState;

  // Update document title for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const timeString = formatTime(timeLeft);
      const sessionName = sessionType === 'pomodoro' ? 'Pomodoro' : 
                         sessionType === 'shortBreak' ? 'Short Break' : 'Long Break';
      const statusIcon = isRunning ? '🔴' : '⏸️';
      document.title = `${statusIcon} ${timeString} - ${sessionName} | Pomodoro Way`;
    }
  }, [timeLeft, sessionType, isRunning]);

  return (
    <View style={styles.container}>
      <TimerDisplay
        timeLeft={timeLeft}
        selectedDuration={selectedDuration}
        isRunning={isRunning}
        sessionType={sessionType}
        completedPomodoros={completedPomodoros}
        onDurationChange={handleDurationChange}
      />

      {sessionType === 'pomodoro' && <TaskSelector />}

      <TimerControls
        isRunning={isRunning}
        sessionType={sessionType}
        onStart={handleStart}
        onPause={handlePause}
        onFinish={handleFinish}
        onSkipBreak={skipBreak}
      />

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm || hideDialog}
        onCancel={confirmDialog.onConfirm ? hideDialog : undefined}
        showCancel={!!confirmDialog.onConfirm}
        confirmText={confirmDialog.onConfirm ? 'Finish' : 'OK'}
      />
    </View>
  );
};

export default PomodoroTimer;
