import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  GestureResponderEvent,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { Task, Folder } from '../types';
import { sortTasks } from '../utils/taskSorting';

const DOUBLE_CLICK_DELAY = 300; // milliseconds

type ListItem = 
  | { type: 'subfolder'; data: Folder }
  | { type: 'task'; data: Task };

interface FolderDetailPageProps {
  folderId: string;
  onBack: () => void;
  onNavigateToTimer?: () => void;
}

const FolderDetailPage: React.FC<FolderDetailPageProps> = ({ folderId, onBack, onNavigateToTimer }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('FolderDetailPage must be used within AppProvider');
  }
  const { tasks, projects, folders, tags, currentTask, setCurrentTask, deleteTask, completeTask, toggleStarTask, addFolder, deleteFolder } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [lastTappedTaskId, setLastTappedTaskId] = useState<string | null>(null);
  const [isAddingSubfolder, setIsAddingSubfolder] = useState<boolean>(false);
  const [newSubfolderName, setNewSubfolderName] = useState<string>('');
  const [selectedSubfolderId, setSelectedSubfolderId] = useState<string | null>(null);

  // If a subfolder is selected, show its detail page recursively
  if (selectedSubfolderId) {
    return (
      <FolderDetailPage
        folderId={selectedSubfolderId}
        onBack={() => setSelectedSubfolderId(null)}
        onNavigateToTimer={onNavigateToTimer}
      />
    );
  }

  const folder = folders.find(f => f.id === folderId);
  const folderTasks = sortTasks(tasks.filter(task => task.folderId === folderId && !task.isCompleted));
  const subfolders = folders.filter(f => f.parentFolderId === folderId);

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

  const handleAddSubfolder = () => {
    if (!newSubfolderName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a subfolder name',
        showCancel: false,
      });
      return;
    }

    addFolder({ 
      name: newSubfolderName.trim(),
      parentFolderId: folderId,
    });
    setNewSubfolderName('');
    setIsAddingSubfolder(false);
  };

  const handleDeleteSubfolder = (subfolderId: string, subfolderName: string) => {
    showDialog({
      title: 'Delete Subfolder',
      message: `Are you sure you want to delete "${subfolderName}"? Tasks in this folder will be moved to no folder. Child folders will become subfolders of the current folder.`,
      confirmText: 'Delete',
      onConfirm: () => deleteFolder(subfolderId),
    });
  };

  // Note: This recursive counting is acceptable for typical task management use cases
  // where folder nesting depth is shallow. For deeply nested structures, consider memoization.
  const getSubfolderTaskCount = (subfolderId: string, recursive: boolean = false): number => {
    let count = tasks.filter((task) => task.folderId === subfolderId).length;
    
    if (recursive) {
      const childFolders = folders.filter(f => f.parentFolderId === subfolderId);
      childFolders.forEach(childFolder => {
        count += getSubfolderTaskCount(childFolder.id, true);
      });
    }
    
    return count;
  };

  const renderSubfolder = (subfolder: Folder) => {
    const taskCount = getSubfolderTaskCount(subfolder.id, false);
    const totalTaskCount = getSubfolderTaskCount(subfolder.id, true);

    return (
      <TouchableOpacity 
        key={subfolder.id}
        style={styles.subfolderItem}
        onPress={() => setSelectedSubfolderId(subfolder.id)}
      >
        <View style={styles.subfolderContent}>
          <MaterialIcons name="folder" size={24} color="#f39c12" />
          <View style={styles.subfolderInfo}>
            <Text style={styles.subfolderName}>{subfolder.name}</Text>
            <Text style={styles.subfolderTaskCount}>
              {taskCount} task(s){totalTaskCount > taskCount ? ` (${totalTaskCount} total)` : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation();
            handleDeleteSubfolder(subfolder.id, subfolder.name);
          }}
          style={styles.subfolderDeleteButton}
        >
          <MaterialIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'subfolder') {
      return renderSubfolder(item.data);
    } else {
      return renderTask({ item: item.data });
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
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
            if (onNavigateToTimer) {
              onNavigateToTimer();
            }
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
          <Text style={styles.taskCount}>{folderTasks.length} task(s), {subfolders.length} subfolder(s)</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addSubfolderButton} 
            onPress={() => setIsAddingSubfolder(!isAddingSubfolder)}
          >
            <MaterialIcons name="create-new-folder" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddTaskModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {isAddingSubfolder && (
        <View style={styles.addSubfolderContainer}>
          <TextInput
            style={styles.input}
            value={newSubfolderName}
            onChangeText={setNewSubfolderName}
            placeholder="Subfolder name"
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddSubfolder}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setIsAddingSubfolder(false);
              setNewSubfolderName('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {folderTasks.length === 0 && subfolders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tasks or subfolders</Text>
          <Text style={styles.emptySubtext}>Tap + to create a task or the folder icon to create a subfolder</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...subfolders.map(subfolder => ({ type: 'subfolder' as const, data: subfolder })),
            ...folderTasks.map(task => ({ type: 'task' as const, data: task })),
          ]}
          renderItem={renderItem}
          keyExtractor={(item) => item.type === 'subfolder' ? `subfolder-${item.data.id}` : `task-${item.data.id}`}
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
    marginLeft: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSubfolderButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSubfolderContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subfolderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  subfolderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subfolderInfo: {
    marginLeft: 12,
  },
  subfolderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  subfolderTaskCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  subfolderDeleteButton: {
    padding: 4,
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
