import React from 'react';
import { View } from 'react-native';
import { useTimerState } from '../hooks/useTimerState';
import { useTimerControls } from '../hooks/useTimerControls';
import TimerDisplay from './timer/TimerDisplay';
import TimerControls from './timer/TimerControls';
import TaskSelector from './timer/TaskSelector';
import ConfirmDialog from './common/ConfirmDialog';
import { timerStyles as styles } from '../styles/timerStyles';

const PomodoroTimer: React.FC = () => {
  const timerState = useTimerState();
  const { handleStart, handlePause, handleReset, handleFinish } = useTimerControls(timerState);

  const {
    selectedDuration,
    timeLeft,
    isRunning,
    confirmDialog,
    hideDialog,
    handleDurationChange,
  } = timerState;

  return (
    <View style={styles.container}>
      <TimerDisplay
        timeLeft={timeLeft}
        selectedDuration={selectedDuration}
        isRunning={isRunning}
        onDurationChange={handleDurationChange}
      />

      <TaskSelector />

      <TimerControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onFinish={handleFinish}
        onReset={handleReset}
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
