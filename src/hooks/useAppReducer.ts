import { AppState, AppAction } from '@/types';
import { toISOStringVN, getNowInVN } from '@/utils/date';

export const initialState: AppState = {
  tasks: [],
  groups: [],
  selectedGroupId: null,
  searchQuery: ''
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload) {
            const now = toISOStringVN(getNowInVN());
            return {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? now : undefined
            };
          }
          return task;
        })
      };
    
    case 'SET_GROUPS':
      return {
        ...state,
        groups: action.payload
      };
    
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.payload]
      };
    
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        tasks: state.tasks.filter(task => task.groupId !== action.payload),
        selectedGroupId: state.selectedGroupId === action.payload ? null : state.selectedGroupId
      };
    
    case 'SET_SELECTED_GROUP':
      return {
        ...state,
        selectedGroupId: action.payload
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case 'IMPORT_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        groups: action.payload.groups
      };
    
    default:
      return state;
  }
};
