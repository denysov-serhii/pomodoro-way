import React, { createContext, useState, useEffect } from 'react';
import { saveTasks, loadTasks, saveProjects, loadProjects, saveTags, loadTags } from '../utils/storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTasks = await loadTasks();
    const loadedProjects = await loadProjects();
    const loadedTags = await loadTags();
    setTasks(loadedTasks);
    setProjects(loadedProjects);
    setTags(loadedTags);
  };

  const addTask = async (task) => {
    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...task,
      createdAt: new Date().toISOString(),
      completedPomodoros: 0,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const updateTask = async (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }
  };

  const addProject = async (project) => {
    const newProject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...project,
      createdAt: new Date().toISOString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const deleteProject = async (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const addTag = async (tag) => {
    const newTag = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...tag,
      createdAt: new Date().toISOString(),
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    await saveTags(updatedTags);
  };

  const deleteTag = async (tagId) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    await saveTags(updatedTags);
  };

  const incrementTaskPomodoro = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, completedPomodoros: (task.completedPomodoros || 0) + 1 }
        : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        tags,
        currentTask,
        setCurrentTask,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        deleteProject,
        addTag,
        deleteTag,
        incrementTaskPomodoro,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
