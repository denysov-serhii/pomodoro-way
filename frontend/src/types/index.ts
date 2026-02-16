export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string | null;
  folderId?: string | null;
  tags?: string[];
  createdAt: string;
  completedPomodoros: number;
  totalMinutes: number; // Total actual time spent on this task in minutes
  isCompleted?: boolean; // Whether the task is completed/archived
  isStarred?: boolean; // Whether the task is starred (pinned to top)
  completedAt?: string; // When the task was completed
  deletedAt?: string; // When the task was deleted (soft delete for sync)
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  completedAt: string; // ISO date string when the pomodoro was completed
  durationMinutes: number; // Actual duration of the pomodoro session
  createdAt: string; // For consistency with other entities
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  deletedAt?: string; // When the project was deleted (soft delete for sync)
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId?: string | null; // For nested folders
  createdAt: string;
  deletedAt?: string; // When the folder was deleted (soft delete for sync)
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  deletedAt?: string; // When the tag was deleted (soft delete for sync)
}

export interface TimerState {
  isRunning: boolean;
  startTime: number;
  initialDuration: number;
  sessionDuration?: number; // Optional for backward compatibility
  pausedDuration?: number; // Total accumulated pause time in seconds
  pauseStartTime?: number; // Timestamp when pause started
  taskId: string | null;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
}

export interface DurationOption {
  label: string;
  value: number;
}

export interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}

export interface Settings {
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

export interface DailyPlanTask {
  taskId: string;
  plannedPomodoros: number;
}

export interface DailyPlan {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  tasks: DailyPlanTask[]; // Max 5 tasks
  createdAt: string;
}

export interface AppContextType {
  tasks: Task[];
  projects: Project[];
  folders: Folder[];
  tags: Tag[];
  pomodoroSessions: PomodoroSession[];
  dailyPlans: DailyPlan[];
  currentTask: Task | null;
  settings: Settings;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'totalMinutes'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  toggleStarTask: (taskId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Promise<void>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  incrementTaskPomodoro: (taskId: string, durationMinutes: number) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  addDailyPlan: (plan: Omit<DailyPlan, 'id' | 'createdAt'>) => Promise<void>;
  updateDailyPlan: (planId: string, updates: Partial<DailyPlan>) => Promise<void>;
  getTodayPlan: () => DailyPlan | null;
  reloadData: () => Promise<void>;
}
