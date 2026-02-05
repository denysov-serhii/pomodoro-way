import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { timerStyles as styles } from '../../styles/timerStyles';
import { DURATION_OPTIONS } from '../../hooks/useTimerState';
import BreakScreen from './BreakScreen';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface TimerDisplayProps {
  timeLeft: number;
  selectedDuration: number;
  isRunning: boolean;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  onDurationChange: (duration: number) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  timeLeft, 
  selectedDuration, 
  isRunning, 
  sessionType, 
  completedPomodoros,
  onDurationChange 
}) => {
  const getSessionTitle = () => {
    switch (sessionType) {
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'shortBreak':
        return '#27ae60';
      case 'longBreak':
        return '#8e44ad';
      default:
        return '#e74c3c';
    }
  };

  const isBreak = sessionType === 'shortBreak' || sessionType === 'longBreak';

  return (
    <View style={styles.timerContainer}>
      {isBreak && <BreakScreen sessionType={sessionType} />}
      
      <View style={[styles.sessionBadge, { backgroundColor: getSessionColor() }]}>
        <Text style={styles.sessionBadgeText}>{getSessionTitle()}</Text>
      </View>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      
      {sessionType === 'pomodoro' && (
        <View style={styles.pomodoroCounter}>
          <Text style={styles.pomodoroCounterText}>
            Completed: {completedPomodoros} 🍅
          </Text>
        </View>
      )}
      
      {sessionType === 'pomodoro' && (
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
      )}
    </View>
  );
};

export default TimerDisplay;
