export type Priority = 'YEU' | 'BINH_THUONG' | 'GAP';

export interface Group {
  id: string;       // uuid
  name: string;     // unique (case-insensitive) on client
  createdAt: string;
}

export interface Task {
  id: string;             // uuid
  title: string;          // required
  link?: string;          // optional
  priority: Priority;     // default 'BINH_THUONG'
  groupId: string;        // required
  createdAt: string;      // ISO string
  deadline?: string;      // ISO date string (no time) or full ISO; treat as end-of-day local
  completed: boolean;     // default false
  completedAt?: string;   // set when completed=true
}

export interface AppState {
  tasks: Task[];
  groups: Group[];
  selectedGroupId: string | null; // null means "Tất cả nhóm"
  searchQuery: string;
}

export type AppAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'SET_SELECTED_GROUP'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'IMPORT_DATA'; payload: { tasks: Task[]; groups: Group[] } };

export const priorityLabels: Record<Priority, string> = {
  YEU: 'Yếu',
  BINH_THUONG: 'Bình thường',
  GAP: 'Gấp'
};

export const priorityOrder: Record<Priority, number> = {
  GAP: 3,
  BINH_THUONG: 2,
  YEU: 1
};
