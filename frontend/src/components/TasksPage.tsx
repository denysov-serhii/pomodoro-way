import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import TaskList from './TaskList';
import ProjectsManager from './ProjectsManager';
import TagsManager from './TagsManager';
import FoldersManager from './FoldersManager';
import AddTaskModal from './AddTaskModal';

type TasksTab = 'tasks' | 'projects' | 'tags' | 'folders';

interface TasksPageProps {
  onNavigateToTimer: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ onNavigateToTimer }) => {
  const [activeTab, setActiveTab] = useState<TasksTab>('tasks');
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskList onAddTask={() => setShowAddTaskModal(true)} onNavigateToTimer={onNavigateToTimer} />;
      case 'projects':
        return <ProjectsManager onNavigateToTimer={onNavigateToTimer} />;
      case 'tags':
        return <TagsManager />;
      case 'folders':
        return <FoldersManager />;
      default:
        return <TaskList onAddTask={() => setShowAddTaskModal(true)} onNavigateToTimer={onNavigateToTimer} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
            Projects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'folders' && styles.tabActive]}
          onPress={() => setActiveTab('folders')}
        >
          <Text style={[styles.tabText, activeTab === 'folders' && styles.tabTextActive]}>
            Folders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tags' && styles.tabActive]}
          onPress={() => setActiveTab('tags')}
        >
          <Text style={[styles.tabText, activeTab === 'tags' && styles.tabTextActive]}>
            Tags
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>

      <AddTaskModal
        visible={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#ecf0f1',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#95a5a6',
  },
  tabTextActive: {
    color: '#2c3e50',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});

export default TasksPage;
