import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AppContext } from '../contexts/AppContext';
import { APP_VERSION, APP_NAME } from '../constants';
import { exportBackup } from '../utils/storage';
import { exportErrorLogs, getErrorLogCount, clearErrorLogs } from '../utils/errorLogger';
import ArchivePage from './ArchivePage';

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Settings must be used within AppProvider');
  }
  const { settings, updateSettings } = context;
  const [localSettings, setLocalSettings] = useState(settings);
  const [errorLogCount, setErrorLogCount] = useState(getErrorLogCount());
  const [showArchive, setShowArchive] = useState(false);

  // Update error log count when component mounts or comes into focus
  useEffect(() => {
    setErrorLogCount(getErrorLogCount());
  }, []);

  // If archive is shown, render the archive page
  if (showArchive) {
    return <ArchivePage onBack={() => setShowArchive(false)} />;
  }

  const breakDurations = [3, 5, 10, 15, 20, 25, 30];

  const handleShortBreakChange = (duration: number) => {
    const newSettings = { ...localSettings, shortBreakDuration: duration };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleLongBreakChange = (duration: number) => {
    const newSettings = { ...localSettings, longBreakDuration: duration };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleExportBackup = async () => {
    try {
      const backupJson = await exportBackup();
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        link.href = url;
        link.download = `pomodoro-way-backup-${dateString}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Backup exported successfully!');
      } else {
        // For Android and iOS, use expo-file-system and expo-sharing
        const dateString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const fileName = `pomodoro-way-backup-${dateString}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Write the JSON data to a file
        await FileSystem.writeAsStringAsync(fileUri, backupJson, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Backup',
            UTI: 'public.json',
          });
          Alert.alert('Success', 'Backup exported successfully!');
        } else {
          Alert.alert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup. Please try again.');
    }
  };

  const handleExportErrorLogs = async () => {
    try {
      const errorLogsJson = exportErrorLogs();
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([errorLogsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        link.href = url;
        link.download = `pomodoro-way-error-logs-${dateString}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Error logs exported successfully!');
      } else {
        // For Android and iOS, use expo-file-system and expo-sharing
        const dateString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const fileName = `pomodoro-way-error-logs-${dateString}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Write the JSON data to a file
        await FileSystem.writeAsStringAsync(fileUri, errorLogsJson, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Error Logs',
            UTI: 'public.json',
          });
          Alert.alert('Success', 'Error logs exported successfully!');
        } else {
          Alert.alert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export error logs. Please try again.');
    }
  };

  const handleClearErrorLogs = () => {
    Alert.alert(
      'Clear Error Logs',
      'Are you sure you want to clear all error logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearErrorLogs();
            setErrorLogCount(0);
            Alert.alert('Success', 'Error logs cleared successfully!');
          },
        },
      ]
    );
  };

  const handleImportBackup = async () => {
    // Future enhancement: Add file picker and use importBackup + reloadData
    // Example: await importBackup(fileContent); await reloadData();
    Alert.alert(
      'Import Backup',
      'Import functionality is coming soon. You can manually import by pasting JSON data.',
      [{ text: 'OK' }]
    );
  };

  const renderDurationOption = (duration: number, current: number, onSelect: (duration: number) => void) => (
    <TouchableOpacity
      key={duration}
      style={[styles.durationOption, duration === current && styles.durationOptionActive]}
      onPress={() => onSelect(duration)}
    >
      <Text style={[styles.durationText, duration === current && styles.durationTextActive]}>
        {duration} min
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="coffee" size={24} color="#27ae60" />
          <Text style={styles.sectionTitle}>Short Break Duration</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Break duration after each pomodoro session
        </Text>
        <View style={styles.durationGrid}>
          {breakDurations.map((duration) =>
            renderDurationOption(duration, localSettings.shortBreakDuration, handleShortBreakChange)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="free-breakfast" size={24} color="#e74c3c" />
          <Text style={styles.sectionTitle}>Long Break Duration</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Break duration after 4 pomodoro sessions
        </Text>
        <View style={styles.durationGrid}>
          {breakDurations.map((duration) =>
            renderDurationOption(duration, localSettings.longBreakDuration, handleLongBreakChange)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="archive" size={24} color="#16a085" />
          <Text style={styles.sectionTitle}>Archive</Text>
        </View>
        <Text style={styles.sectionDescription}>
          View completed and archived tasks
        </Text>
        <TouchableOpacity style={styles.archiveButton} onPress={() => setShowArchive(true)}>
          <MaterialIcons name="archive" size={20} color="#fff" />
          <Text style={styles.backupButtonText}>View Archive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="backup" size={24} color="#9b59b6" />
          <Text style={styles.sectionTitle}>Backup & Restore</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Export or import all your tasks, projects, tags, and settings
        </Text>
        <View style={styles.backupButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportBackup}>
            <MaterialIcons name="download" size={20} color="#fff" />
            <Text style={styles.backupButtonText}>Export Backup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.importButton} onPress={handleImportBackup}>
            <MaterialIcons name="upload" size={20} color="#fff" />
            <Text style={styles.backupButtonText}>Import Backup</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="bug-report" size={24} color="#e67e22" />
          <Text style={styles.sectionTitle}>Error Logs</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Download error logs for debugging and support ({errorLogCount} error{errorLogCount !== 1 ? 's' : ''})
        </Text>
        <View style={styles.backupButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportErrorLogs}>
            <MaterialIcons name="download" size={20} color="#fff" />
            <Text style={styles.backupButtonText}>Download Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearErrorLogs}>
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.backupButtonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={24} color="#3498db" />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Sync your data across devices (Coming soon)
        </Text>
        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.loginButton} disabled>
            <MaterialIcons name="login" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} disabled>
            <MaterialIcons name="person-add" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{APP_NAME} v{APP_VERSION}</Text>
        <Text style={styles.footerSubtext}>Focus & Productivity</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ecf0f1',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
    minWidth: 70,
    alignItems: 'center',
  },
  durationOptionActive: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  durationTextActive: {
    color: '#2980b9',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  backupButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a085',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  registerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
  },
});

export default Settings;
