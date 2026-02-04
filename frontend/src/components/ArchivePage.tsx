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
import { Task } from '../types';
import { sortTasks } from '../utils/taskSorting';

interface ArchivePageProps {
  onBack: () => void;
}

const ArchivePage: React.FC<ArchivePageProps> = ({ onBack }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('ArchivePage must be used within AppProvider');
  }
  const { tasks, projects, tags } = context;

  // Filter and sort completed tasks
  const completedTasks = sortTasks(tasks.filter(task => task.isCompleted));

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

  const renderTask = ({ item }: { item: Task }) => {
    const projectName = getProjectName(item.projectId);
    const tagNames = getTagNames(item.tags);

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            {item.isStarred && (
              <MaterialIcons 
                name="star" 
                size={20} 
                color="#f39c12" 
                style={styles.starIcon}
              />
            )}
            <Text style={styles.taskTitle}>
              {item.title}
            </Text>
            <MaterialIcons name="check-circle" size={24} color="#27ae60" />
          </View>
          
          {item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}

          <View style={styles.taskMeta}>
            <View style={styles.pomodoroInfo}>
              <MaterialIcons name="timer" size={16} color="#e74c3c" />
              <Text style={styles.pomodoroText}>
                {item.completedPomodoros || 0}
              </Text>
            </View>

            <View style={styles.timeInfo}>
              <MaterialIcons name="access-time" size={16} color="#3498db" />
              <Text style={styles.timeText}>
                {Math.floor((item.totalMinutes || 0) / 60)}h {(item.totalMinutes || 0) % 60}m
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

          {item.completedAt && (
            <Text style={styles.completedDate}>
              Completed: {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Archive</Text>
        <View style={styles.placeholder} />
      </View>

      {completedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="archive" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No completed tasks yet</Text>
          <Text style={styles.emptySubtext}>
            Completed tasks will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    padding: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 34, // Same width as back button to center the title
  },
  listContainer: {
    padding: 10,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d5d8dc',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  starIcon: {
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
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
    marginBottom: 6,
  },
  pomodoroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 3,
  },
  pomodoroText: {
    fontSize: 13,
    color: '#e74c3c',
    marginLeft: 4,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 3,
  },
  timeText: {
    fontSize: 13,
    color: '#3498db',
    marginLeft: 4,
    fontWeight: '500',
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
  completedDate: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ArchivePage;
