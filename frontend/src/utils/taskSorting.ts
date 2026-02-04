import { Task } from '../types';

/**
 * Sorts tasks according to the following criteria:
 * 1. Starred tasks first
 * 2. Tasks with more pomodoro sessions
 * 3. Tasks with more tracked time
 * 4. Date of adding (newer first)
 * 
 * Starred tasks are also sorted by criteria 2-4 among themselves
 */
export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // 1. Starred tasks first
    const aStarred = a.isStarred ? 1 : 0;
    const bStarred = b.isStarred ? 1 : 0;
    if (aStarred !== bStarred) {
      return bStarred - aStarred; // Starred tasks first
    }

    // 2. Tasks with more pomodoro sessions
    const aPomodorosCount = a.completedPomodoros || 0;
    const bPomodorosCount = b.completedPomodoros || 0;
    if (aPomodorosCount !== bPomodorosCount) {
      return bPomodorosCount - aPomodorosCount; // More pomodoros first
    }

    // 3. Tasks with more tracked time
    const aTotalMinutes = a.totalMinutes || 0;
    const bTotalMinutes = b.totalMinutes || 0;
    if (aTotalMinutes !== bTotalMinutes) {
      return bTotalMinutes - aTotalMinutes; // More time first
    }

    // 4. Date of adding (newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};
