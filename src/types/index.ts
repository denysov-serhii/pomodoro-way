export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string | null;
  tags?: string[];
  createdAt: string;
  completedPomodoros: number;
}

export interface Project {
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
  taskId: string | null;
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

export interface AppContextType {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  incrementTaskPomodoro: (taskId: string) => Promise<void>;
}
