import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../contexts/AppContext';
import { timerStyles as styles } from '../../styles/timerStyles';

const TaskSelector: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('TaskSelector must be used within AppProvider');
  }
  const { currentTask, setCurrentTask, tasks } = context;
  const [showTaskSelector, setShowTaskSelector] = useState<boolean>(false);

  return (
    <View>
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

export default TaskSelector;
