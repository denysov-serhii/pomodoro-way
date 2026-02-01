import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppProvider } from './src/contexts/AppContext';
import PomodoroTimer from './src/components/PomodoroTimer';
import TaskList from './src/components/TaskList';
import AddTaskModal from './src/components/AddTaskModal';
import ProjectsManager from './src/components/ProjectsManager';
import TagsManager from './src/components/TagsManager';
import Statistics from './src/components/Statistics';

export default function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <PomodoroTimer />;
      case 'tasks':
        return <TaskList onAddTask={() => setShowAddTaskModal(true)} />;
      case 'projects':
        return <ProjectsManager />;
      case 'tags':
        return <TagsManager />;
      case 'stats':
        return <Statistics />;
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <AppProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pomodoro Way</Text>
          <Text style={styles.headerSubtitle}>Focus & Productivity</Text>
        </View>

        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('timer')}
          >
            <MaterialIcons
              name="timer"
              size={28}
              color={activeTab === 'timer' ? '#e74c3c' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'timer' && styles.tabLabelActive,
              ]}
            >
              Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('tasks')}
          >
            <MaterialIcons
              name="check-circle"
              size={28}
              color={activeTab === 'tasks' ? '#27ae60' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'tasks' && styles.tabLabelActive,
              ]}
            >
              Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('projects')}
          >
            <MaterialIcons
              name="folder"
              size={28}
              color={activeTab === 'projects' ? '#3498db' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'projects' && styles.tabLabelActive,
              ]}
            >
              Projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('tags')}
          >
            <MaterialIcons
              name="label"
              size={28}
              color={activeTab === 'tags' ? '#8e44ad' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'tags' && styles.tabLabelActive,
              ]}
            >
              Tags
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('stats')}
          >
            <MaterialIcons
              name="bar-chart"
              size={28}
              color={activeTab === 'stats' ? '#f39c12' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'stats' && styles.tabLabelActive,
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        <AddTaskModal
          visible={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
        />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingBottom: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#95a5a6',
  },
  tabLabelActive: {
    color: '#2c3e50',
    fontWeight: '600',
  },
});
