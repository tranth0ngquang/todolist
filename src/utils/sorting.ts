import { Task, priorityOrder } from '@/types';
import { isDeadlineNear, getDaysUntilDeadline } from './date';

export const sortIncompleteTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // 1. Tasks with deadline within 2 days go to top, regardless of priority
    const aIsNear = a.deadline ? isDeadlineNear(a.deadline) : false;
    const bIsNear = b.deadline ? isDeadlineNear(b.deadline) : false;
    
    if (aIsNear && !bIsNear) return -1;
    if (!aIsNear && bIsNear) return 1;
    
    // 2. Sort by priority (GAP > BINH_THUONG > YEU)
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // 3. Sort by deadline (earlier first, no deadline last)
    if (a.deadline && b.deadline) {
      const aDaysUntil = getDaysUntilDeadline(a.deadline);
      const bDaysUntil = getDaysUntilDeadline(b.deadline);
      if (aDaysUntil !== bDaysUntil) return aDaysUntil - bDaysUntil;
    } else if (a.deadline && !b.deadline) {
      return -1;
    } else if (!a.deadline && b.deadline) {
      return 1;
    }
    
    // 4. Sort by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

export const sortCompletedTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Sort by completedAt descending (most recently completed first)
    const aCompleted = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bCompleted = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bCompleted - aCompleted;
  });
};
