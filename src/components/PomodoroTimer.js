import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppContext } from '../contexts/AppContext';

const DURATION_OPTIONS = [
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '35 min', value: 35 },
  { label: '40 min', value: 40 },
  { label: '45 min', value: 45 },
  { label: '50 min', value: 50 },
  { label: '1h', value: 60 },
];

const PomodoroTimer = () => {
  const { currentTask, incrementTaskPomodoro } = useContext(AppContext);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
            Alert.alert('Pomodoro Complete!', 'Great work! Time for a break.');
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!currentTask) {
      Alert.alert('No Task Selected', 'Please select a task to start the timer.');
      return;
    }
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setIsCompleted(false);
  };

  const handleDurationChange = (duration) => {
    if (!isRunning) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
      setIsCompleted(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        {currentTask && (
          <View style={styles.taskInfo}>
            <Text style={styles.currentTaskLabel}>Current Task:</Text>
            <Text style={styles.currentTaskText}>{currentTask.title}</Text>
            <Text style={styles.pomodoroCount}>
              Pomodoros: {currentTask.completedPomodoros || 0}
            </Text>
          </View>
        )}
        {!currentTask && (
          <Text style={styles.noTaskText}>Select a task to begin</Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={isRunning ? handlePause : handleStart}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.durationLabel}>Select Duration:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.durationButton,
                selectedDuration === option.value && styles.durationButtonSelected,
                isRunning && styles.durationButtonDisabled,
              ]}
              onPress={() => handleDurationChange(option.value)}
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
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  taskInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  currentTaskLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  currentTaskText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  pomodoroCount: {
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 8,
    fontWeight: '500',
  },
  noTaskText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationContainer: {
    marginTop: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
  },
  durationButtonSelected: {
    backgroundColor: '#3498db',
  },
  durationButtonDisabled: {
    opacity: 0.5,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  durationButtonTextSelected: {
    color: '#fff',
  },
});

export default PomodoroTimer;
