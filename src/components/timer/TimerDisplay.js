import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { timerStyles as styles } from '../../styles/timerStyles';
import { DURATION_OPTIONS } from '../../hooks/useTimerState';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimerDisplay = ({ timeLeft, selectedDuration, isRunning, onDurationChange }) => {
  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      
      <View style={styles.durationContainer}>
        <Text style={styles.durationLabel}>Duration:</Text>
        <View style={styles.durationOptionsWrapper}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.durationButton,
                selectedDuration === option.value && styles.durationButtonSelected,
                isRunning && styles.durationButtonDisabled,
              ]}
              onPress={() => onDurationChange(option.value)}
              disabled={isRunning}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  selectedDuration === option.value && styles.durationButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TimerDisplay;
