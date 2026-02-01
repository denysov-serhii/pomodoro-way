import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import { saveTimerState, loadTimerState, clearTimerState } from '../utils/storage';

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
  const { currentTask, setCurrentTask, incrementTaskPomodoro, tasks } = useContext(AppContext);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const hasLoadedState = useRef(false);

  // Load timer state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      if (hasLoadedState.current) return;
      hasLoadedState.current = true;

      const savedState = await loadTimerState();
      if (savedState) {
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
          Alert.alert('Pomodoro Complete!', 'Your timer finished while you were away. Great work!');
          await clearTimerState();
        } else {
          // Timer was paused or reset
          await clearTimerState();
        }
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
            Alert.alert('Pomodoro Complete!', 'Great work! Time for a break.');
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      Alert.alert('Timer not started', 'Please start the timer first.');
      return;
    }

    const timeSpentSeconds = initialDuration - timeLeft;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
    const timeSpentDisplay = timeSpentMinutes > 0 
      ? `${timeSpentMinutes} minute${timeSpentMinutes !== 1 ? 's' : ''}`
      : `${timeSpentSeconds} second${timeSpentSeconds !== 1 ? 's' : ''}`;

    Alert.alert(
      'Finish Early?',
      `You've worked for ${timeSpentDisplay}. ${currentTask ? 'This will count as a completed pomodoro for the task.' : 'Finish the session?'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            setIsRunning(false);
            setIsCompleted(true);
            if (currentTask) {
              incrementTaskPomodoro(currentTask.id);
            }
            setTimeLeft(0);
            clearTimerState();
            Alert.alert('Session Complete!', `You worked for ${timeSpentDisplay}. Great job!`);
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        
        {/* Duration options directly under timer */}
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
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.taskSelectorButton}
          onPress={() => setShowTaskSelector(true)}
        >
          {currentTask ? (
            <View style={styles.taskInfo}>
              <Text style={styles.currentTaskLabel}>Current Task:</Text>
              <View style={styles.taskTitleRow}>
                <Text style={styles.currentTaskText}>{currentTask.title}</Text>
                <TouchableOpacity 
                  onPress={() => setCurrentTask(null)}
                  style={styles.clearTaskButton}
                >
                  <MaterialIcons name="close" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
              <Text style={styles.pomodoroCount}>
                Pomodoros: {currentTask.completedPomodoros || 0}
              </Text>
            </View>
          ) : (
            <View style={styles.noTaskContainer}>
              <MaterialIcons name="add-circle-outline" size={24} color="#3498db" />
              <Text style={styles.noTaskText}>Tap to select a task (optional)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={isRunning ? handlePause : handleStart}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.finishButton]}
          onPress={handleFinish}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.resetButton]}
          onPress={handleReset}
        >
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTaskSelector}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Task</Text>
              <TouchableOpacity onPress={() => setShowTaskSelector(false)}>
                <MaterialIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {tasks.length === 0 ? (
              <View style={styles.emptyTasksContainer}>
                <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
                <Text style={styles.emptyTasksText}>No tasks available</Text>
                <Text style={styles.emptyTasksSubtext}>
                  Go to Tasks tab to create one
                </Text>
              </View>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.taskOption,
                      currentTask?.id === item.id && styles.taskOptionSelected,
                    ]}
                    onPress={() => {
                      setCurrentTask(item);
                      setShowTaskSelector(false);
                    }}
                  >
                    <View style={styles.taskOptionContent}>
                      <Text style={styles.taskOptionTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.taskOptionDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                      <Text style={styles.taskOptionPomodoros}>
                        {item.completedPomodoros || 0} pomodoros completed
                      </Text>
                    </View>
                    {currentTask?.id === item.id && (
                      <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearSelectionButton}
                onPress={() => {
                  setCurrentTask(null);
                  setShowTaskSelector(false);
                }}
              >
                <Text style={styles.clearSelectionText}>Clear Selection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  finishButton: {
    backgroundColor: '#3498db',
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
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  durationOptionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 350,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    margin: 4,
  },
  durationButtonSelected: {
    backgroundColor: '#3498db',
  },
  durationButtonDisabled: {
    opacity: 0.5,
  },
  durationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  durationButtonTextSelected: {
    color: '#fff',
  },
  taskSelectorButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    minWidth: 280,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearTaskButton: {
    marginLeft: 10,
    padding: 4,
  },
  noTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emptyTasksContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#95a5a6',
    marginTop: 15,
  },
  emptyTasksSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  taskOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  taskOptionSelected: {
    backgroundColor: '#ebf5fb',
  },
  taskOptionContent: {
    flex: 1,
  },
  taskOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskOptionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  taskOptionPomodoros: {
    fontSize: 12,
    color: '#e74c3c',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  clearSelectionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
  },
  clearSelectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default PomodoroTimer;
