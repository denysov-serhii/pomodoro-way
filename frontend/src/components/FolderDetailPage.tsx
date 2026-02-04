import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { Task } from '../types';
import { sortTasks } from '../utils/taskSorting';

interface FolderDetailPageProps {
  folderId: string;
  onBack: () => void;
}

const FolderDetailPage: React.FC<FolderDetailPageProps> = ({ folderId, onBack }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('FolderDetailPage must be used within AppProvider');
  }
  const { tasks, projects, folders, tags, currentTask, setCurrentTask, deleteTask, completeTask, toggleStarTask } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const folder = folders.find(f => f.id === folderId);
  const folderTasks = sortTasks(tasks.filter(task => task.folderId === folderId && !task.isCompleted));

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

  const renderTask = ({ item }: { item: Task }) => {
    const isSelected = currentTask?.id === item.id;
    const projectName = getProjectName(item.projectId);
    const tagNames = getTagNames(item.tags);

    return (
      <TouchableOpacity
        style={[styles.taskItem, isSelected && styles.taskItemSelected]}
        onPress={() => setCurrentTask(item)}
      >
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
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
            <Text style={[styles.taskTitle, isSelected && styles.taskTitleSelected]}>
              {item.title}
            </Text>
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
          </View>
          
          {item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}

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

  if (!folder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Folder Not Found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>{folder.name}</Text>
          <Text style={styles.taskCount}>{folderTasks.length} task(s)</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddTaskModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {folderTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tasks in this folder</Text>
          <Text style={styles.emptySubtext}>Tap + to create a task</Text>
        </View>
      ) : (
        <FlatList
          data={folderTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <AddTaskModal
        visible={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        defaultFolderId={folderId}
      />

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
  backButton: {
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  taskCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#27ae60',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
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
});

export default FolderDetailPage;
