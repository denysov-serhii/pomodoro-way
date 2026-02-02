import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Settings must be used within AppProvider');
  }
  const { settings, updateSettings } = context;
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
        <Text style={styles.footerText}>Pomodoro Way v1.0.0</Text>
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
