import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { timerStyles as styles } from '../../styles/timerStyles';

const TimerControls = ({ isRunning, onStart, onPause, onFinish, onReset }) => {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={[styles.button, styles.startButton]}
        onPress={isRunning ? onPause : onStart}
      >
        <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.finishButton]}
        onPress={onFinish}
      >
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconButton, styles.resetButton]}
        onPress={onReset}
      >
        <MaterialIcons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default TimerControls;
