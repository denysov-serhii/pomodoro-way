import { db } from '../config/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, Tag, TimerState, Settings } from '../types';

// Firestore collection names
const COLLECTIONS = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  TAGS: 'tags',
  SETTINGS: 'settings',
};

// AsyncStorage keys (used for timer state which is temporary)
const STORAGE_KEYS = {
  TIMER_STATE: '@pomodoro_way/timer_state',
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    // Save each task to Firestore
    const tasksCollection = collection(db, COLLECTIONS.TASKS);
    
    // Clear existing tasks and save new ones
    const snapshot = await getDocs(tasksCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Save new tasks
    const savePromises = tasks.map(task => 
      setDoc(doc(db, COLLECTIONS.TASKS, task.id), task)
    );
    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const tasksCollection = collection(db, COLLECTIONS.TASKS);
    const q = query(tasksCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Task);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
  try {
    const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
    
    // Clear existing projects and save new ones
    const snapshot = await getDocs(projectsCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Save new projects
    const savePromises = projects.map(project => 
      setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project)
    );
    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

export const loadProjects = async (): Promise<Project[]> => {
  try {
    const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Project);
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveTags = async (tags: Tag[]): Promise<void> => {
  try {
    const tagsCollection = collection(db, COLLECTIONS.TAGS);
    
    // Clear existing tags and save new ones
    const snapshot = await getDocs(tagsCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Save new tags
    const savePromises = tags.map(tag => 
      setDoc(doc(db, COLLECTIONS.TAGS, tag.id), tag)
    );
    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving tags:', error);
  }
};

export const loadTags = async (): Promise<Tag[]> => {
  try {
    const tagsCollection = collection(db, COLLECTIONS.TAGS);
    const q = query(tagsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Tag);
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
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'user_settings'), settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async (): Promise<Settings | null> => {
  try {
    const settingsCollection = collection(db, COLLECTIONS.SETTINGS);
    const snapshot = await getDocs(settingsCollection);
    if (snapshot.docs.length > 0) {
      return snapshot.docs[0].data() as Settings;
    }
    return null;
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
