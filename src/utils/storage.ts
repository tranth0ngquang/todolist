import { Task, Group } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'todo-app-tasks',
  GROUPS: 'todo-app-groups'
} as const;

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

export const loadTasks = (): Task[] => {
  return loadFromStorage(STORAGE_KEYS.TASKS, []);
};

export const saveTasks = (tasks: Task[]): void => {
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
};

export const loadGroups = (): Group[] => {
  return loadFromStorage(STORAGE_KEYS.GROUPS, []);
};

export const saveGroups = (groups: Group[]): void => {
  saveToStorage(STORAGE_KEYS.GROUPS, groups);
};

export const exportData = () => {
  const tasks = loadTasks();
  const groups = loadGroups();
  
  const data = {
    tasks,
    groups,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<{ tasks: Task[]; groups: Group[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data structure
        if (!data.tasks || !data.groups || !Array.isArray(data.tasks) || !Array.isArray(data.groups)) {
          throw new Error('Định dạng file không hợp lệ');
        }
        
        resolve({
          tasks: data.tasks,
          groups: data.groups
        });
      } catch (error) {
        reject(new Error('Không thể đọc file. Vui lòng kiểm tra định dạng file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Lỗi đọc file'));
    };
    
    reader.readAsText(file);
  });
};
