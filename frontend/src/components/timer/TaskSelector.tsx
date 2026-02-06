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
  const { currentTask, setCurrentTask, tasks, folders } = context;
  const [showTaskSelector, setShowTaskSelector] = useState<boolean>(false);

  // Group tasks by folder
  const groupedTasks: { folderId: string | null; folderName: string; tasks: typeof tasks }[] = [];
  
  // Get all unique folder IDs from tasks
  const folderIds = new Set<string | null>();
  tasks.forEach(task => {
    if (!task.isCompleted) {
      folderIds.add(task.folderId || null);
    }
  });

  // Create groups for each folder
  folderIds.forEach(folderId => {
    const folderTasks = tasks.filter(task => task.folderId === folderId && !task.isCompleted);
    if (folderTasks.length > 0) {
      const folder = folderId ? folders.find(f => f.id === folderId) : null;
      groupedTasks.push({
        folderId,
        folderName: folder ? folder.name : 'No Folder',
        tasks: folderTasks,
      });
    }
  });

  // Sort groups: folders first (alphabetically), then "No Folder"
  groupedTasks.sort((a, b) => {
    if (a.folderId === null) return 1;
    if (b.folderId === null) return -1;
    return a.folderName.localeCompare(b.folderName);
  });

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

            {tasks.filter(t => !t.isCompleted).length === 0 ? (
              <View style={styles.emptyTasksContainer}>
                <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
                <Text style={styles.emptyTasksText}>No tasks available</Text>
                <Text style={styles.emptyTasksSubtext}>
                  Go to Tasks tab to create one
                </Text>
              </View>
            ) : (
              <FlatList
                data={groupedTasks}
                keyExtractor={(group) => group.folderId || 'no-folder'}
                renderItem={({ item: group }) => (
                  <View>
                    <View style={styles.folderHeader}>
                      <MaterialIcons 
                        name={group.folderId ? "folder" : "inbox"} 
                        size={18} 
                        color={group.folderId ? "#f39c12" : "#95a5a6"} 
                      />
                      <Text style={styles.folderHeaderText}>{group.folderName}</Text>
                    </View>
                    {group.tasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          styles.taskOption,
                          currentTask?.id === task.id && styles.taskOptionSelected,
                        ]}
                        onPress={() => {
                          setCurrentTask(task);
                          setShowTaskSelector(false);
                        }}
                      >
                        <View style={styles.taskOptionContent}>
                          <View style={styles.taskOptionTitleRow}>
                            {task.isStarred && (
                              <MaterialIcons name="star" size={16} color="#f39c12" style={styles.starIcon} />
                            )}
                            <Text style={styles.taskOptionTitle}>{task.title}</Text>
                          </View>
                          {task.description && (
                            <Text style={styles.taskOptionDescription} numberOfLines={1}>
                              {task.description}
                            </Text>
                          )}
                          <Text style={styles.taskOptionPomodoros}>
                            {task.completedPomodoros || 0} pomodoros completed
                          </Text>
                        </View>
                        {currentTask?.id === task.id && (
                          <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
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
