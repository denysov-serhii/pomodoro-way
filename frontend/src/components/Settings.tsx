import React, { useContext, useState } from 'react';
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
import { AppContext } from '../contexts/AppContext';
import { APP_VERSION, APP_NAME } from '../constants';
import { exportBackup, importBackup } from '../utils/storage';

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Settings must be used within AppProvider');
  }
  const { settings, updateSettings, reloadData } = context;
  const [localSettings, setLocalSettings] = useState(settings);

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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        link.href = url;
        link.download = `pomodoro-way-backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Backup exported successfully!');
      } else {
        // For mobile, we would need to use expo-file-system or expo-sharing
        // For now, just show the JSON in an alert (mobile implementation would need additional packages)
        Alert.alert(
          'Backup Data',
          'Mobile backup download requires additional setup. For now, you can copy this data:\n\n' + backupJson.substring(0, 200) + '...',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup. Please try again.');
      console.error('Export error:', error);
    }
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
