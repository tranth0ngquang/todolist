import { useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Group, Priority } from '@/types';
import { appReducer, initialState } from './useAppReducer';
import { loadTasks, saveTasks, loadGroups, saveGroups } from '@/utils/storage';
import { toISOStringVN, getNowInVN } from '@/utils/date';
import { sortIncompleteTasks, sortCompletedTasks } from '@/utils/sorting';

export const useApp = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const tasks = loadTasks();
    const groups = loadGroups();
    
    dispatch({ type: 'SET_TASKS', payload: tasks });
    dispatch({ type: 'SET_GROUPS', payload: groups });
  }, []);

  // Save tasks to localStorage when tasks change
  useEffect(() => {
    if (state.tasks.length > 0 || loadTasks().length > 0) {
      saveTasks(state.tasks);
    }
  }, [state.tasks]);

  // Save groups to localStorage when groups change
  useEffect(() => {
    if (state.groups.length > 0 || loadGroups().length > 0) {
      saveGroups(state.groups);
    }
  }, [state.groups]);

  const createTask = (
    title: string,
    groupId: string,
    priority: Priority = 'BINH_THUONG',
    link?: string,
    deadline?: string
  ) => {
    const now = toISOStringVN(getNowInVN());
    const task: Task = {
      id: uuidv4(),
      title: title.trim(),
      link: link?.trim() || undefined,
      priority,
      groupId,
      createdAt: now,
      deadline: deadline || undefined,
      completed: false
    };

    dispatch({ type: 'ADD_TASK', payload: task });
    return task;
  };

  const createMultipleTasks = (tasks: Array<{
    title: string;
    link?: string;
    priority: Priority;
    groupId: string;
    deadline?: string;
  }>) => {
    const now = toISOStringVN(getNowInVN());
    const newTasks: Task[] = tasks.map(taskData => ({
      id: uuidv4(),
      title: taskData.title.trim(),
      link: taskData.link?.trim() || undefined,
      priority: taskData.priority,
      groupId: taskData.groupId,
      createdAt: now,
      deadline: taskData.deadline || undefined,
      completed: false
    }));

    // Add all tasks at once
    newTasks.forEach(task => {
      dispatch({ type: 'ADD_TASK', payload: task });
    });

    return newTasks;
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleTask = (taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  };

  const createGroup = (name: string) => {
    const trimmedName = name.trim();
    
    // Check if group already exists (case-insensitive)
    const existingGroup = state.groups.find(
      g => g.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingGroup) {
      return existingGroup;
    }

    const group: Group = {
      id: uuidv4(),
      name: trimmedName,
      createdAt: toISOStringVN(getNowInVN())
    };

    dispatch({ type: 'ADD_GROUP', payload: group });
    return group;
  };

  const deleteGroup = (groupId: string) => {
    dispatch({ type: 'DELETE_GROUP', payload: groupId });
  };

  const setSelectedGroup = (groupId: string | null) => {
    dispatch({ type: 'SET_SELECTED_GROUP', payload: groupId });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const importData = (tasks: Task[], groups: Group[]) => {
    dispatch({ type: 'IMPORT_DATA', payload: { tasks, groups } });
  };

  // Filter and sort tasks
  const filteredTasks = state.tasks.filter(task => {
    // Filter by group
    if (state.selectedGroupId && task.groupId !== state.selectedGroupId) {
      return false;
    }

    // Filter by search query
    if (state.searchQuery && !task.title.toLowerCase().includes(state.searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const incompleteTasks = sortIncompleteTasks(filteredTasks.filter(t => !t.completed));
  const completedTasks = sortCompletedTasks(filteredTasks.filter(t => t.completed));

  return {
    // State
    tasks: state.tasks,
    groups: state.groups,
    selectedGroupId: state.selectedGroupId,
    searchQuery: state.searchQuery,
    incompleteTasks,
    completedTasks,
    
    // Actions
    createTask,
    createMultipleTasks,
    updateTask,
    deleteTask,
    toggleTask,
    createGroup,
    deleteGroup,
    setSelectedGroup,
    setSearchQuery,
    importData
  };
};
