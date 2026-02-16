import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { AppProvider } from './src/contexts/AppContext';
import PomodoroTimer from './src/components/PomodoroTimer';
import TasksPage from './src/components/TasksPage';
import Settings from './src/components/Settings';
import Statistics from './src/components/Statistics';
import { requestNotificationPermissions } from './src/utils/notifications';
import { logError } from './src/utils/errorLogger';

type Tab = 'timer' | 'tasks' | 'stats' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  // Request notification permissions on app startup
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Request permissions
        await requestNotificationPermissions();
        
        // Set up Android notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('timer-notifications', {
            name: 'Timer Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
            enableVibrate: true,
            enableLights: true,
            lightColor: '#e74c3c',
          });
        }
      } catch (error) {
        logError('Failed to setup notifications', 'App.setupNotifications', error);
      }
    };
    
    setupNotifications();
  }, []);

  // Render all tabs but only show the active one to prevent unmounting
  const renderContent = () => {
    return (
      <>
        <View style={{ display: activeTab === 'timer' ? 'flex' : 'none', flex: 1 }}>
          <PomodoroTimer />
        </View>
        <View style={{ display: activeTab === 'tasks' ? 'flex' : 'none', flex: 1 }}>
          <TasksPage onNavigateToTimer={() => setActiveTab('timer')} />
        </View>
        <View style={{ display: activeTab === 'stats' ? 'flex' : 'none', flex: 1 }}>
          <Statistics />
        </View>
        <View style={{ display: activeTab === 'settings' ? 'flex' : 'none', flex: 1 }}>
          <Settings />
        </View>
      </>
    );
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

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}
          >
            <MaterialIcons
              name="settings"
              size={28}
              color={activeTab === 'settings' ? '#3498db' : '#95a5a6'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'settings' && styles.tabLabelActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>
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
