import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import { Task, DailyPlanTask } from '../types';

const DailyPlanManager: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('DailyPlanManager must be used within AppProvider');
  }
  
  const { tasks, pomodoroSessions, getTodayPlan, addDailyPlan, updateDailyPlan } = context;
  const [showModal, setShowModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<DailyPlanTask[]>([]);
  
  const todayPlan = getTodayPlan();
  const today = new Date().toISOString().split('T')[0];

  // Get active tasks (not completed, not deleted)
  const activeTasks = tasks.filter(task => !task.isCompleted && !task.deletedAt);

  const handleOpenModal = () => {
    if (todayPlan) {
      setSelectedTasks([...todayPlan.tasks]);
    } else {
      setSelectedTasks([]);
    }
    setShowModal(true);
  };

  const handleToggleTask = (taskId: string) => {
    const existingIndex = selectedTasks.findIndex(t => t.taskId === taskId);
    
    if (existingIndex >= 0) {
      // Remove task
      setSelectedTasks(selectedTasks.filter(t => t.taskId !== taskId));
    } else {
      // Add task (max 5)
      if (selectedTasks.length >= 5) {
        return; // Max limit reached
      }
      setSelectedTasks([...selectedTasks, { taskId, plannedPomodoros: 1 }]);
    }
  };

  const handleUpdatePlannedPomodoros = (taskId: string, value: number) => {
    setSelectedTasks(selectedTasks.map(t => 
      t.taskId === taskId ? { ...t, plannedPomodoros: Math.max(1, value) } : t
    ));
  };

  const handleSavePlan = async () => {
    if (todayPlan) {
      await updateDailyPlan(todayPlan.id, { tasks: selectedTasks });
    } else {
      await addDailyPlan({ date: today, tasks: selectedTasks });
    }
    setShowModal(false);
  };

  // Calculate progress for each task in today's plan
  const getTaskProgress = (taskId: string, plannedPomodoros: number) => {
    const todaySessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
      return session.taskId === taskId && sessionDate === today;
    });
    const completedToday = todaySessions.length;
    return { completed: completedToday, planned: plannedPomodoros };
  };

  const renderTaskInModal = ({ item }: { item: Task }) => {
    const isSelected = selectedTasks.some(t => t.taskId === item.id);
    const selectedTask = selectedTasks.find(t => t.taskId === item.id);

    return (
      <View style={styles.modalTaskItem}>
        <TouchableOpacity 
          style={styles.modalTaskCheckbox}
          onPress={() => handleToggleTask(item.id)}
        >
          <MaterialIcons 
            name={isSelected ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={isSelected ? '#3498db' : '#95a5a6'} 
          />
          <Text style={styles.modalTaskTitle}>{item.title}</Text>
        </TouchableOpacity>
        {isSelected && (
          <View style={styles.pomodoroInput}>
            <TouchableOpacity 
              onPress={() => handleUpdatePlannedPomodoros(item.id, (selectedTask?.plannedPomodoros || 1) - 1)}
            >
              <MaterialIcons name="remove-circle-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
            <Text style={styles.pomodoroText}>{selectedTask?.plannedPomodoros || 1}</Text>
            <TouchableOpacity 
              onPress={() => handleUpdatePlannedPomodoros(item.id, (selectedTask?.plannedPomodoros || 1) + 1)}
            >
              <MaterialIcons name="add-circle-outline" size={24} color="#27ae60" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderPlanTask = (planTask: DailyPlanTask) => {
    const task = tasks.find(t => t.id === planTask.taskId);
    if (!task) return null;

    const { completed, planned } = getTaskProgress(planTask.taskId, planTask.plannedPomodoros);
    const progress = Math.min(completed / planned, 1);
    const isComplete = completed >= planned;

    return (
      <View key={planTask.taskId} style={styles.planTaskItem}>
        <View style={styles.planTaskInfo}>
          <MaterialIcons 
            name={isComplete ? 'check-circle' : 'radio-button-unchecked'} 
            size={20} 
            color={isComplete ? '#27ae60' : '#95a5a6'} 
          />
          <Text style={[styles.planTaskTitle, isComplete && styles.planTaskTitleComplete]}>
            {task.title}
          </Text>
        </View>
        <View style={styles.planTaskProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.planTaskCount}>{completed}/{planned}</Text>
          <MaterialIcons name="timer" size={16} color="#95a5a6" />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createPlanButton} onPress={handleOpenModal}>
        <MaterialIcons name="playlist-add-check" size={24} color="#fff" />
        <Text style={styles.createPlanButtonText}>
          {todayPlan ? 'Edit Today\'s Plan' : 'Create a Plan'}
        </Text>
      </TouchableOpacity>

      {todayPlan && todayPlan.tasks.length > 0 && (
        <View style={styles.planContainer}>
          <Text style={styles.planTitle}>Today's Plan</Text>
          {todayPlan.tasks.map(renderPlanTask)}
        </View>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Daily Plan</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={28} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Select up to 5 tasks ({selectedTasks.length}/5)
            </Text>

            <ScrollView style={styles.modalTaskList}>
              {activeTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No active tasks</Text>
                </View>
              ) : (
                activeTasks.map(task => (
                  <View key={task.id}>
                    {renderTaskInModal({ item: task })}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, selectedTasks.length === 0 && styles.saveButtonDisabled]}
                onPress={handleSavePlan}
                disabled={selectedTasks.length === 0}
              >
                <Text style={styles.saveButtonText}>Save Plan</Text>
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
    marginTop: 20,
  },
  createPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    gap: 10,
  },
  createPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  planContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  planTaskItem: {
    marginBottom: 12,
  },
  planTaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  planTaskTitle: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  planTaskTitleComplete: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  planTaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 3,
  },
  planTaskCount: {
    fontSize: 14,
    color: '#7f8c8d',
    minWidth: 40,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  modalTaskList: {
    maxHeight: 400,
  },
  modalTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTaskCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  modalTaskTitle: {
    fontSize: 16,
    color: '#2c3e50',
  },
  pomodoroInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pomodoroText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 30,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyPlanManager;
