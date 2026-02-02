import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { timerStyles as styles } from '../../styles/timerStyles';

interface TimerControlsProps {
  isRunning: boolean;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onSkipBreak: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  sessionType, 
  onStart, 
  onPause, 
  onFinish, 
  onSkipBreak,
}) => {
  const isBreak = sessionType !== 'pomodoro';

  return (
    <View style={styles.controlsContainer}>
      {/* Only show Start/Pause button during pomodoro or when break is paused */}
      {!isBreak && (
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={isRunning ? onPause : onStart}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
      )}
      
      {isBreak ? (
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={onSkipBreak}
        >
          <Text style={styles.buttonText}>Skip Break</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.finishButton]}
          onPress={onFinish}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TimerControls;
