import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { saveTasks, loadTasks, saveProjects, loadProjects, saveFolders, loadFolders, saveTags, loadTags, saveSettings, loadSettings, savePomodoroSessions, loadPomodoroSessions, saveDailyPlans, loadDailyPlans } from '../utils/storage';
import { Task, Project, Folder, Tag, AppContextType, Settings, PomodoroSession, DailyPlan } from '../types';

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
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
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
    const loadedPlans = await loadDailyPlans();
    const loadedSettings = await loadSettings();
    setTasks(loadedTasks);
    setProjects(loadedProjects);
    setFolders(loadedFolders);
    setTags(loadedTags);
    setPomodoroSessions(loadedSessions);
    setDailyPlans(loadedPlans);
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
    
    // Soft delete: mark task as deleted and save to Firestore
    const tasksWithDeleted = tasks.map(t => 
      t.id === taskId ? { ...t, deletedAt: new Date().toISOString() } : t
    );
    await saveTasks(tasksWithDeleted);
    
    // Remove from local state
    const updatedTasks = tasksWithDeleted.filter(t => !t.deletedAt);
    setTasks(updatedTasks);
    
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
    // Soft delete: mark project as deleted and save to Firestore
    const projectsWithDeleted = projects.map(p =>
      p.id === projectId ? { ...p, deletedAt: new Date().toISOString() } : p
    );
    await saveProjects(projectsWithDeleted);
    
    // Remove from local state
    const updatedProjects = projectsWithDeleted.filter(p => !p.deletedAt);
    setProjects(updatedProjects);
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

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    setFolders(updatedFolders);
    await saveFolders(updatedFolders);
  };

  const deleteFolder = async (folderId: string) => {
    // Remove folderId from tasks and child folders before deleting the folder
    const updatedTasks = tasks.map(task =>
      task.folderId === folderId ? { ...task, folderId: null } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    
    // Move child folders to the parent of the deleted folder
    const folderToDelete = folders.find(f => f.id === folderId);
    const parentFolderId = folderToDelete?.parentFolderId || null;
    const updatedFolders = folders.map(f =>
      f.parentFolderId === folderId ? { ...f, parentFolderId } : f
    );
    
    // Soft delete: mark folder as deleted and save to Firestore
    const foldersWithDeleted = updatedFolders.map(f =>
      f.id === folderId ? { ...f, deletedAt: new Date().toISOString() } : f
    );
    await saveFolders(foldersWithDeleted);
    
    // Remove from local state
    const finalFolders = foldersWithDeleted.filter(f => !f.deletedAt);
    setFolders(finalFolders);
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
    // Soft delete: mark tag as deleted and save to Firestore
    const tagsWithDeleted = tags.map(t =>
      t.id === tagId ? { ...t, deletedAt: new Date().toISOString() } : t
    );
    await saveTags(tagsWithDeleted);
    
    // Remove from local state
    const updatedTags = tagsWithDeleted.filter(t => !t.deletedAt);
    setTags(updatedTags);
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

  const addDailyPlan = async (plan: Omit<DailyPlan, 'id' | 'createdAt'>) => {
    const newPlan: DailyPlan = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...plan,
      createdAt: new Date().toISOString(),
    };
    const updatedPlans = [...dailyPlans, newPlan];
    setDailyPlans(updatedPlans);
    await saveDailyPlans(updatedPlans);
  };

  const updateDailyPlan = async (planId: string, updates: Partial<DailyPlan>) => {
    const updatedPlans = dailyPlans.map(plan =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setDailyPlans(updatedPlans);
    await saveDailyPlans(updatedPlans);
  };

  const getTodayPlan = (): DailyPlan | null => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return dailyPlans.find(plan => plan.date === today) || null;
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
        dailyPlans,
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
        updateFolder,
        deleteFolder,
        addTag,
        deleteTag,
        incrementTaskPomodoro,
        updateSettings,
        addDailyPlan,
        updateDailyPlan,
        getTodayPlan,
        reloadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
