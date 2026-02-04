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
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number;
  initialDuration: number;
  sessionDuration?: number; // Optional for backward compatibility
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

export interface AppContextType {
  tasks: Task[];
  projects: Project[];
  folders: Folder[];
  tags: Tag[];
  currentTask: Task | null;
  settings: Settings;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'totalMinutes'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  incrementTaskPomodoro: (taskId: string, durationMinutes: number) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  reloadData: () => Promise<void>;
}
