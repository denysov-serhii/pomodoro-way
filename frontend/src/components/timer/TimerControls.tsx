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
      {/* Show Start button during breaks when paused, hide Pause button during running breaks */}
      {(!isBreak || !isRunning) && (
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
