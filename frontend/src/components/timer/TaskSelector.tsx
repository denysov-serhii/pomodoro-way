import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../contexts/AppContext';
import { timerStyles as styles } from '../../styles/timerStyles';
import { Task } from '../../types';

interface TaskGroup {
  folderId: string | null;
  folderName: string;
  tasks: Task[];
}

const TaskSelector: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('TaskSelector must be used within AppProvider');
  }
  const { currentTask, setCurrentTask, tasks, folders } = context;
  const [showTaskSelector, setShowTaskSelector] = useState<boolean>(false);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  // Group tasks by folder using a single pass for better performance
  const groupedTasks: TaskGroup[] = React.useMemo(() => {
    const taskMap = new Map<string | null, Task[]>();
    
    // Group tasks by folderId in a single pass
    tasks.forEach(task => {
      if (!task.isCompleted) {
        const folderId = task.folderId || null;
        if (!taskMap.has(folderId)) {
          taskMap.set(folderId, []);
        }
        const taskList = taskMap.get(folderId);
        if (taskList) {
          taskList.push(task);
        }
      }
    });

    // Convert map to array and add folder names
    const groups: TaskGroup[] = [];
    taskMap.forEach((tasks, folderId) => {
      if (tasks.length > 0) {
        const folder = folderId ? folders.find(f => f.id === folderId) : null;
        groups.push({
          folderId,
          folderName: folder ? folder.name : 'No Folder',
          tasks,
        });
      }
    });

    // Sort groups: folders first (alphabetically), then "No Folder"
    groups.sort((a, b) => {
      if (a.folderId === null) return 1;
      if (b.folderId === null) return -1;
      return a.folderName.localeCompare(b.folderName);
    });

    return groups;
  }, [tasks, folders]);

  // Auto-expand the folder containing the current task when modal opens
  React.useEffect(() => {
    if (showTaskSelector && currentTask && expandedFolderId === null) {
      const currentTaskFolderId = currentTask.folderId || 'no-folder';
      setExpandedFolderId(currentTaskFolderId);
    } else if (!showTaskSelector) {
      // Reset expansion when modal closes
      setExpandedFolderId(null);
    }
  }, [showTaskSelector, currentTask, expandedFolderId]);

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
                renderItem={({ item: group }) => {
                  const folderId = group.folderId || 'no-folder';
                  const isExpanded = expandedFolderId === folderId;
                  
                  return (
                    <View>
                      <TouchableOpacity 
                        style={styles.folderHeader}
                        onPress={() => {
                          setExpandedFolderId(isExpanded ? null : folderId);
                        }}
                      >
                        <MaterialIcons 
                          name={group.folderId ? "folder" : "inbox"} 
                          size={18} 
                          color={group.folderId ? "#f39c12" : "#95a5a6"} 
                        />
                        <Text style={styles.folderHeaderText}>{group.folderName}</Text>
                        <Text style={styles.folderTaskCount}>({group.tasks.length})</Text>
                        <MaterialIcons 
                          name={isExpanded ? "expand-less" : "expand-more"} 
                          size={24} 
                          color="#7f8c8d" 
                          style={styles.expandIcon}
                        />
                      </TouchableOpacity>
                      {isExpanded && group.tasks.map((task) => (
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
                              <MaterialIcons 
                                name="star" 
                                size={16} 
                                color="#f39c12" 
                                style={styles.starIcon}
                                accessibilityLabel="Starred task"
                              />
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
                  );
                }}
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
