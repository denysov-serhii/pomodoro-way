import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  GestureResponderEvent,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import FolderDetailPage from './FolderDetailPage';
import EditTaskModal from './EditTaskModal';
import { Task, Folder } from '../types';
import { sortTasks } from '../utils/taskSorting';

const DOUBLE_CLICK_DELAY = 300; // milliseconds

interface TaskListProps {
  onAddTask: () => void;
  onNavigateToTimer: () => void;
}

type ListItem = 
  | { type: 'folder'; data: Folder }
  | { type: 'task'; data: Task };

const TaskList: React.FC<TaskListProps> = ({ onAddTask, onNavigateToTimer }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('TaskList must be used within AppProvider');
  }
  const { tasks, projects, folders, tags, currentTask, setCurrentTask, deleteTask, completeTask, toggleStarTask, addFolder, deleteFolder } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [expandedStarredTaskId, setExpandedStarredTaskId] = useState<string | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [lastTappedTaskId, setLastTappedTaskId] = useState<string | null>(null);

  // If a folder is selected, show folder detail page
  if (selectedFolderId) {
    return (
      <FolderDetailPage
        folderId={selectedFolderId}
        onBack={() => setSelectedFolderId(null)}
      />
    );
  }

  const getProjectName = (projectId?: string | null): string | null => {
    if (!projectId) return null;
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : null;
  };

  const getTagNames = (tagIds?: string[]): string[] => {
    if (!tagIds || tagIds.length === 0) return [];
    return tagIds.map((tagId) => {
      const tag = tags.find((t) => t.id === tagId);
      return tag ? tag.name : null;
    }).filter((name): name is string => name !== null);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Check if task has tracked time
    if (task && (task.completedPomodoros > 0 || task.totalMinutes > 0)) {
      showDialog({
        title: 'Cannot Delete Task',
        message: `This task has tracked time and cannot be deleted. Would you like to complete/archive it instead?`,
        confirmText: 'Archive',
        onConfirm: () => completeTask(taskId),
      });
      return;
    }

    showDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${taskTitle}"?`,
      confirmText: 'Delete',
      onConfirm: () => deleteTask(taskId),
    });
  };

  const handleCompleteTask = (taskId: string, taskTitle: string) => {
    showDialog({
      title: 'Complete Task',
      message: `Mark "${taskTitle}" as complete? It will be moved to the archive.`,
      confirmText: 'Complete',
      onConfirm: () => completeTask(taskId),
    });
  };

  const handleToggleStar = (taskId: string) => {
    toggleStarTask(taskId);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    showDialog({
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}"? Tasks in this folder will be moved to no folder.`,
      confirmText: 'Delete',
      onConfirm: () => deleteFolder(folderId),
    });
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a folder name',
        showCancel: false,
      });
      return;
    }

    addFolder({ name: newFolderName.trim() });
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const getFolderTaskCount = (folderId: string): number => {
    return tasks.filter((task) => task.folderId === folderId && !task.isCompleted).length;
  };

  // Get starred tasks from all folders (not completed)
  const starredTasks = sortTasks(tasks.filter(task => task.isStarred && !task.isCompleted));

  // Get tasks that are not in any folder and not completed
  const tasksWithoutFolder = sortTasks(tasks.filter(task => !task.folderId && !task.isCompleted));

  // Create combined list: folders first, then tasks without folders
  const listItems: ListItem[] = [
    ...folders.map(folder => ({ type: 'folder' as const, data: folder })),
    ...tasksWithoutFolder.map(task => ({ type: 'task' as const, data: task })),
  ];

  const renderStarredTask = (item: Task) => {
    const isSelected = currentTask?.id === item.id;
    const isExpanded = expandedStarredTaskId === item.id;
    const projectName = getProjectName(item.projectId);
    const tagNames = getTagNames(item.tags);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isSelected && styles.taskItemSelected, isExpanded && styles.taskItemExpanded]}
        onPress={() => {
          const now = Date.now();
          
          // Check for double-click
          if (lastTappedTaskId === item.id && now - lastTapTime < DOUBLE_CLICK_DELAY) {
            // Double-click detected - navigate to timer
            setCurrentTask(item);
            onNavigateToTimer();
            setLastTapTime(0);
            setLastTappedTaskId(null);
          } else {
            // Single click - update tracking and expand/collapse
            setLastTapTime(now);
            setLastTappedTaskId(item.id);
            
            // Always set current task on single click
            setCurrentTask(item);
            
            // Toggle expansion for starred section
            const willBeExpanded = !isExpanded;
            setExpandedStarredTaskId(willBeExpanded ? item.id : null);
          }
        }}
      >
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            {(isExpanded || item.isStarred) && (
              <TouchableOpacity 
                onPress={(e: GestureResponderEvent) => {
                  e.stopPropagation();
                  handleToggleStar(item.id);
                }}
                style={styles.starButton}
              >
                <MaterialIcons 
                  name={item.isStarred ? "star" : "star-border"} 
                  size={24} 
                  color={item.isStarred ? "#f39c12" : "#95a5a6"} 
                />
              </TouchableOpacity>
            )}
            <Text style={[styles.taskTitle, isSelected && styles.taskTitleSelected]}>
              {item.title}
            </Text>
            {isExpanded && (
              <View style={styles.taskActions}>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    setEditingTask(item);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="edit" size={24} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    handleCompleteTask(item.id, item.title);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    handleDeleteTask(item.id, item.title);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.taskDescription}>{item.description || ""}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.pomodoroInfo}>
              <MaterialIcons name="timer" size={16} color="#e74c3c" />
              <Text 
                style={styles.pomodoroText}
                accessibilityLabel={`${item.completedPomodoros || 0} pomodoros`}
              >
                {item.completedPomodoros || 0}
              </Text>
            </View>

            {projectName && (
              <View style={styles.projectBadge}>
                <MaterialIcons name="folder" size={14} color="#3498db" />
                <Text style={styles.projectText}>{projectName}</Text>
              </View>
            )}
            
            {tagNames.length > 0 && (
              <View style={styles.tagsContainer}>
                {tagNames.map((tagName, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>#{tagName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTask = (item: Task) => {
    const isSelected = currentTask?.id === item.id;
    const isExpanded = expandedTaskId === item.id;
    const projectName = getProjectName(item.projectId);
    const tagNames = getTagNames(item.tags);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isSelected && styles.taskItemSelected, isExpanded && styles.taskItemExpanded]}
        onPress={() => {
          const now = Date.now();
          
          // Check for double-click
          if (lastTappedTaskId === item.id && now - lastTapTime < DOUBLE_CLICK_DELAY) {
            // Double-click detected - navigate to timer
            setCurrentTask(item);
            onNavigateToTimer();
            setLastTapTime(0);
            setLastTappedTaskId(null);
          } else {
            // Single click - update tracking and expand/collapse
            setLastTapTime(now);
            setLastTappedTaskId(item.id);
            
            // Always set current task on single click
            setCurrentTask(item);
            
            // Toggle expansion
            const willBeExpanded = !isExpanded;
            setExpandedTaskId(willBeExpanded ? item.id : null);
          }
        }}
      >
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            {(isExpanded || item.isStarred) && (
              <TouchableOpacity 
                onPress={(e: GestureResponderEvent) => {
                  e.stopPropagation();
                  handleToggleStar(item.id);
                }}
                style={styles.starButton}
              >
                <MaterialIcons 
                  name={item.isStarred ? "star" : "star-border"} 
                  size={24} 
                  color={item.isStarred ? "#f39c12" : "#95a5a6"} 
                />
              </TouchableOpacity>
            )}
            <Text style={[styles.taskTitle, isSelected && styles.taskTitleSelected]}>
              {item.title}
            </Text>
            {isExpanded && (
              <View style={styles.taskActions}>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    setEditingTask(item);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="edit" size={24} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    handleCompleteTask(item.id, item.title);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e: GestureResponderEvent) => {
                    e.stopPropagation();
                    handleDeleteTask(item.id, item.title);
                  }}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.taskDescription}>{item.description || ""}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.pomodoroInfo}>
              <MaterialIcons name="timer" size={16} color="#e74c3c" />
              <Text 
                style={styles.pomodoroText}
                accessibilityLabel={`${item.completedPomodoros || 0} pomodoros`}
              >
                {item.completedPomodoros || 0}
              </Text>
            </View>

            {projectName && (
              <View style={styles.projectBadge}>
                <MaterialIcons name="folder" size={14} color="#3498db" />
                <Text style={styles.projectText}>{projectName}</Text>
              </View>
            )}
            
            {tagNames.length > 0 && (
              <View style={styles.tagsContainer}>
                {tagNames.map((tagName, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>#{tagName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFolder = (folder: Folder) => {
    const taskCount = getFolderTaskCount(folder.id);

    return (
      <TouchableOpacity
        style={styles.folderItem}
        onPress={() => setSelectedFolderId(folder.id)}
      >
        <View style={styles.folderContent}>
          <MaterialIcons name="folder" size={32} color="#f39c12" />
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>{folder.name}</Text>
            <Text style={styles.folderTaskCount}>{taskCount} task(s)</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#95a5a6" />
        </View>
        <TouchableOpacity 
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation();
            handleDeleteFolder(folder.id, folder.name);
          }}
          style={styles.folderDeleteButton}
        >
          <MaterialIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'folder') {
      return renderFolder(item.data);
    } else {
      return renderTask(item.data);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addFolderButton} 
            onPress={() => setIsAddingFolder(!isAddingFolder)}
          >
            <MaterialIcons name="create-new-folder" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {isAddingFolder && (
        <View style={styles.addFolderContainer}>
          <TextInput
            style={styles.input}
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Folder name"
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddFolder}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setIsAddingFolder(false);
              setNewFolderName('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {starredTasks.length > 0 && (
        <View style={styles.starredSection}>
          <View style={styles.starredHeader}>
            <MaterialIcons name="star" size={20} color="#f39c12" />
            <Text style={styles.starredHeaderText}>Starred Tasks</Text>
          </View>
          <ScrollView 
            style={styles.starredTasksContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {starredTasks.map((task) => (
              <View key={task.id}>
                {renderStarredTask(task)}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {listItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tasks or folders yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create a task or folder icon to create a folder</Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.type === 'folder' ? `folder-${item.data.id}` : `task-${item.data.id}`}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {editingTask && (
        <EditTaskModal
          visible={true}
          onClose={() => setEditingTask(null)}
          task={editingTask}
        />
      )}

      <ConfirmDialog
        visible={dialogState.visible}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        showCancel={dialogState.showCancel}
        onConfirm={handleConfirm}
        onCancel={hideDialog}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#27ae60',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFolderButton: {
    backgroundColor: '#f39c12',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFolderContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  folderTaskCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  folderDeleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  taskItemSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  taskItemExpanded: {
    paddingVertical: 15,
    borderColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  starButton: {
    marginRight: 8,
    padding: 2,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  taskTitleSelected: {
    color: '#2980b9',
  },
  taskDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  folderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 3,
  },
  folderText: {
    fontSize: 12,
    color: '#f39c12',
    marginLeft: 4,
    fontWeight: '600',
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 3,
  },
  projectText: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 4,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: '#f4ecf7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 3,
  },
  tagText: {
    fontSize: 12,
    color: '#8e44ad',
    fontWeight: '600',
  },
  pomodoroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 3,
  },
  pomodoroText: {
    fontSize: 13,
    color: '#e74c3c',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#95a5a6',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  starredSection: {
    backgroundColor: '#fffbf0',
    borderWidth: 2,
    borderColor: '#f39c12',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    marginBottom: 5,
    maxHeight: 300,
  },
  starredTasksContainer: {
    maxHeight: 250,
  },
  starredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f39c12',
  },
  starredHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 8,
  },
});

export default TaskList;
