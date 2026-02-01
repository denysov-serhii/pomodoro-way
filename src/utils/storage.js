import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TASKS: '@pomodoro_way/tasks',
  PROJECTS: '@pomodoro_way/projects',
  TAGS: '@pomodoro_way/tags',
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveProjects = async (projects) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

export const loadProjects = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

export const saveTags = async (tags) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tags:', error);
  }
};

export const loadTags = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
};
