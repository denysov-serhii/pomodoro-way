import { db } from '../config/firebase';
import { collection, getDocs, setDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, Folder, Tag, TimerState, Settings, PomodoroSession } from '../types';
import { logError } from './errorLogger';

// Firestore collection names
const COLLECTIONS = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  FOLDERS: 'folders',
  TAGS: 'tags',
  SETTINGS: 'settings',
  POMODORO_SESSIONS: 'pomodoroSessions',
};

// AsyncStorage keys (used for timer state which is temporary)
const STORAGE_KEYS = {
  TIMER_STATE: '@pomodoro_way/timer_state',
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const tasksCollection = collection(db, COLLECTIONS.TASKS);
    
    // Get existing task IDs
    const snapshot = await getDocs(tasksCollection);
    const existingIds = new Set(snapshot.docs.map(doc => doc.id));
    const newIds = new Set(tasks.map(task => task.id));
    
    // Mark tasks as deleted that no longer exist (soft delete for sync)
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        const existingDoc = snapshot.docs.find(d => d.id === id);
        const existingTask = existingDoc?.data() as Task;
        // Only mark as deleted if not already deleted
        if (existingTask && !existingTask.deletedAt) {
          batch.set(doc(db, COLLECTIONS.TASKS, id), {
            ...existingTask,
            deletedAt: new Date().toISOString(),
          });
        }
      }
    });
    
    // Update or create tasks
    tasks.forEach(task => {
      batch.set(doc(db, COLLECTIONS.TASKS, task.id), task);
    });
    
    await batch.commit();
  } catch (error) {
    logError('Error saving tasks', 'storage.saveTasks', error);
  }
};

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const tasksCollection = collection(db, COLLECTIONS.TASKS);
    const q = query(tasksCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    // Filter out deleted tasks
    return snapshot.docs
      .map(doc => doc.data() as Task)
      .filter(task => !task.deletedAt);
  } catch (error) {
    logError('Error loading tasks', 'storage.loadTasks', error);
    return [];
  }
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
    
    // Get existing project IDs
    const snapshot = await getDocs(projectsCollection);
    const existingIds = new Set(snapshot.docs.map(doc => doc.id));
    const newIds = new Set(projects.map(project => project.id));
    
    // Mark projects as deleted that no longer exist (soft delete for sync)
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        const existingDoc = snapshot.docs.find(d => d.id === id);
        const existingProject = existingDoc?.data() as Project;
        // Only mark as deleted if not already deleted
        if (existingProject && !existingProject.deletedAt) {
          batch.set(doc(db, COLLECTIONS.PROJECTS, id), {
            ...existingProject,
            deletedAt: new Date().toISOString(),
          });
        }
      }
    });
    
    // Update or create projects
    projects.forEach(project => {
      batch.set(doc(db, COLLECTIONS.PROJECTS, project.id), project);
    });
    
    await batch.commit();
  } catch (error) {
    logError('Error saving projects', 'storage.saveProjects', error);
  }
};

export const loadProjects = async (): Promise<Project[]> => {
  try {
    const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    // Filter out deleted projects
    return snapshot.docs
      .map(doc => doc.data() as Project)
      .filter(project => !project.deletedAt);
  } catch (error) {
    logError('Error loading projects', 'storage.loadProjects', error);
    return [];
  }
};

export const saveTags = async (tags: Tag[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const tagsCollection = collection(db, COLLECTIONS.TAGS);
    
    // Get existing tag IDs
    const snapshot = await getDocs(tagsCollection);
    const existingIds = new Set(snapshot.docs.map(doc => doc.id));
    const newIds = new Set(tags.map(tag => tag.id));
    
    // Mark tags as deleted that no longer exist (soft delete for sync)
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        const existingDoc = snapshot.docs.find(d => d.id === id);
        const existingTag = existingDoc?.data() as Tag;
        // Only mark as deleted if not already deleted
        if (existingTag && !existingTag.deletedAt) {
          batch.set(doc(db, COLLECTIONS.TAGS, id), {
            ...existingTag,
            deletedAt: new Date().toISOString(),
          });
        }
      }
    });
    
    // Update or create tags
    tags.forEach(tag => {
      batch.set(doc(db, COLLECTIONS.TAGS, tag.id), tag);
    });
    
    await batch.commit();
  } catch (error) {
    logError('Error saving tags', 'storage.saveTags', error);
  }
};

export const loadTags = async (): Promise<Tag[]> => {
  try {
    const tagsCollection = collection(db, COLLECTIONS.TAGS);
    const q = query(tagsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    // Filter out deleted tags
    return snapshot.docs
      .map(doc => doc.data() as Tag)
      .filter(tag => !tag.deletedAt);
  } catch (error) {
    logError('Error loading tags', 'storage.loadTags', error);
    return [];
  }
};

export const saveFolders = async (folders: Folder[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const foldersCollection = collection(db, COLLECTIONS.FOLDERS);
    
    // Get existing folder IDs
    const snapshot = await getDocs(foldersCollection);
    const existingIds = new Set(snapshot.docs.map(doc => doc.id));
    const newIds = new Set(folders.map(folder => folder.id));
    
    // Mark folders as deleted that no longer exist (soft delete for sync)
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        const existingDoc = snapshot.docs.find(d => d.id === id);
        const existingFolder = existingDoc?.data() as Folder;
        // Only mark as deleted if not already deleted
        if (existingFolder && !existingFolder.deletedAt) {
          batch.set(doc(db, COLLECTIONS.FOLDERS, id), {
            ...existingFolder,
            deletedAt: new Date().toISOString(),
          });
        }
      }
    });
    
    // Update or create folders
    folders.forEach(folder => {
      batch.set(doc(db, COLLECTIONS.FOLDERS, folder.id), folder);
    });
    
    await batch.commit();
  } catch (error) {
    logError('Error saving folders', 'storage.saveFolders', error);
  }
};

export const loadFolders = async (): Promise<Folder[]> => {
  try {
    const foldersCollection = collection(db, COLLECTIONS.FOLDERS);
    const q = query(foldersCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    // Filter out deleted folders
    return snapshot.docs
      .map(doc => doc.data() as Folder)
      .filter(folder => !folder.deletedAt);
  } catch (error) {
    logError('Error loading folders', 'storage.loadFolders', error);
    return [];
  }
};

export const saveTimerState = async (timerState: TimerState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(timerState));
  } catch (error) {
    logError('Error saving timer state', 'storage.saveTimerState', error);
  }
};

export const loadTimerState = async (): Promise<TimerState | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError('Error loading timer state', 'storage.loadTimerState', error);
    return null;
  }
};

export const clearTimerState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (error) {
    logError('Error clearing timer state', 'storage.clearTimerState', error);
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'user_settings'), settings);
  } catch (error) {
    logError('Error saving settings', 'storage.saveSettings', error);
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
    logError('Error loading settings', 'storage.loadSettings', error);
    return null;
  }
};

export const savePomodoroSessions = async (sessions: PomodoroSession[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Update or create sessions
    sessions.forEach(session => {
      batch.set(doc(db, COLLECTIONS.POMODORO_SESSIONS, session.id), session);
    });
    
    await batch.commit();
  } catch (error) {
    logError('Error saving pomodoro sessions', 'storage.savePomodoroSessions', error);
  }
};

export const loadPomodoroSessions = async (): Promise<PomodoroSession[]> => {
  try {
    const sessionsCollection = collection(db, COLLECTIONS.POMODORO_SESSIONS);
    const q = query(sessionsCollection, orderBy('completedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as PomodoroSession);
  } catch (error) {
    logError('Error loading pomodoro sessions', 'storage.loadPomodoroSessions', error);
    return [];
  }
};

export interface BackupData {
  version: string;
  exportDate: string;
  tasks: Task[];
  projects: Project[];
  folders: Folder[];
  tags: Tag[];
  pomodoroSessions: PomodoroSession[];
  settings: Settings | null;
}

export const exportBackup = async (): Promise<string> => {
  try {
    const tasks = await loadTasks();
    const projects = await loadProjects();
    const folders = await loadFolders();
    const tags = await loadTags();
    const pomodoroSessions = await loadPomodoroSessions();
    const settings = await loadSettings();
    
    const backupData: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks,
      projects,
      folders,
      tags,
      pomodoroSessions,
      settings,
    };
    
    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    logError('Error exporting backup', 'storage.exportBackup', error);
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
    if (backupData.folders) {
      await saveFolders(backupData.folders);
    }
    await saveTags(backupData.tags);
    if (backupData.pomodoroSessions) {
      await savePomodoroSessions(backupData.pomodoroSessions);
    }
    if (backupData.settings) {
      await saveSettings(backupData.settings);
    }
  } catch (error) {
    logError('Error importing backup', 'storage.importBackup', error);
    throw error;
  }
};
