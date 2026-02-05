import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { saveTasks, loadTasks, saveProjects, loadProjects, saveFolders, loadFolders, saveTags, loadTags, saveSettings, loadSettings, savePomodoroSessions, loadPomodoroSessions } from '../utils/storage';
import { Task, Project, Folder, Tag, AppContextType, Settings, PomodoroSession } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [settings, setSettings] = useState<Settings>({
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTasks = await loadTasks();
    const loadedProjects = await loadProjects();
    const loadedFolders = await loadFolders();
    const loadedTags = await loadTags();
    const loadedSessions = await loadPomodoroSessions();
    const loadedSettings = await loadSettings();
    setTasks(loadedTasks);
    setProjects(loadedProjects);
    setFolders(loadedFolders);
    setTags(loadedTags);
    setPomodoroSessions(loadedSessions);
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'totalMinutes'>) => {
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...task,
      createdAt: new Date().toISOString(),
      completedPomodoros: 0,
      totalMinutes: 0,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    // Check if task has tracked time
    const task = tasks.find(t => t.id === taskId);
    if (task && (task.completedPomodoros > 0 || task.totalMinutes > 0)) {
      throw new Error('Cannot delete task with tracked time. Please complete/archive the task instead.');
    }
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }
  };

  const completeTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: true, completedAt: new Date().toISOString() } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }
  };

  const toggleStarTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, isStarred: !task.isStarred } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...project,
      createdAt: new Date().toISOString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const addFolder = async (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...folder,
      createdAt: new Date().toISOString(),
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    await saveFolders(updatedFolders);
  };

  const deleteFolder = async (folderId: string) => {
    // Remove folderId from tasks before deleting the folder
    const updatedTasks = tasks.map(task =>
      task.folderId === folderId ? { ...task, folderId: null } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    setFolders(updatedFolders);
    await saveFolders(updatedFolders);
  };

  const addTag = async (tag: Omit<Tag, 'id' | 'createdAt'>) => {
    const newTag: Tag = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...tag,
      createdAt: new Date().toISOString(),
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    await saveTags(updatedTags);
  };

  const deleteTag = async (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    await saveTags(updatedTags);
  };

  const incrementTaskPomodoro = async (taskId: string, durationMinutes: number) => {
    const now = new Date().toISOString();
    
    // Update task
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            completedPomodoros: (task.completedPomodoros || 0) + 1,
            totalMinutes: (task.totalMinutes || 0) + durationMinutes,
          }
        : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    
    // Create pomodoro session record with more robust ID
    const newSession: PomodoroSession = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`,
      taskId,
      completedAt: now,
      durationMinutes,
      createdAt: now,
    };
    const updatedSessions = [...pomodoroSessions, newSession];
    setPomodoroSessions(updatedSessions);
    await savePomodoroSessions(updatedSessions);
  };

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const reloadData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        folders,
        tags,
        pomodoroSessions,
        currentTask,
        settings,
        setCurrentTask,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        toggleStarTask,
        addProject,
        deleteProject,
        addFolder,
        deleteFolder,
        addTag,
        deleteTag,
        incrementTaskPomodoro,
        updateSettings,
        reloadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
