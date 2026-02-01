import React, { useState, useEffect, useContext } from 'react';
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
