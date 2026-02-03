import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Task } from '../types';

interface TaskListProps {
  onAddTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('TaskList must be used within AppProvider');
  }
  const { tasks, projects, tags, currentTask, setCurrentTask, deleteTask } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();

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
    showDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${taskTitle}"?`,
      confirmText: 'Delete',
      onConfirm: () => deleteTask(taskId),
    });
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
            <Text style={[styles.taskTitle, isSelected && styles.taskTitleSelected]}>
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id, item.title)}>
              <MaterialIcons name="delete" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          
          {item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}

          <View style={styles.taskMeta}>
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

          <View style={styles.pomodoroInfo}>
            <MaterialIcons name="timer" size={16} color="#e74c3c" />
            <Text style={styles.pomodoroText}>
              {item.completedPomodoros || 0} pomodoros
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first task</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
    marginBottom: 5,
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
    marginTop: 2,
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

export default TaskList;
