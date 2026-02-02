import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, Tag, TimerState, Settings } from '../types';

const STORAGE_KEYS = {
  TASKS: '@pomodoro_way/tasks',
  PROJECTS: '@pomodoro_way/projects',
  TAGS: '@pomodoro_way/tags',
  TIMER_STATE: '@pomodoro_way/timer_state',
  SETTINGS: '@pomodoro_way/settings',
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

export const loadProjects = async (): Promise<Project[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveTags = async (tags: Tag[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tags:', error);
  }
};

export const loadTags = async (): Promise<Tag[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
};

export const saveTimerState = async (timerState: TimerState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(timerState));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
};

export const loadTimerState = async (): Promise<TimerState | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading timer state:', error);
    return null;
  }
};

export const clearTimerState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (error) {
    console.error('Error clearing timer state:', error);
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async (): Promise<Settings | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

export interface BackupData {
  version: string;
  exportDate: string;
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  settings: Settings | null;
}

export const exportBackup = async (): Promise<string> => {
  try {
    const tasks = await loadTasks();
    const projects = await loadProjects();
    const tags = await loadTags();
    const settings = await loadSettings();
    
    const backupData: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks,
      projects,
      tags,
      settings,
    };
    
    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error('Error exporting backup:', error);
    throw error;
  }
};

export const importBackup = async (backupJson: string): Promise<void> => {
  try {
    const backupData: BackupData = JSON.parse(backupJson);
    
    // Validate backup data structure
    if (!backupData.version || !backupData.tasks || !backupData.projects || !backupData.tags) {
      throw new Error('Invalid backup file: missing required fields (version, tasks, projects, or tags)');
    }
    
    // Save all data
    await saveTasks(backupData.tasks);
    await saveProjects(backupData.projects);
    await saveTags(backupData.tags);
    if (backupData.settings) {
      await saveSettings(backupData.settings);
    }
  } catch (error) {
    console.error('Error importing backup:', error);
    throw error;
  }
};
