'use client';

import { Task, Group } from '@/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  groups: Group[];
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}

export const TaskList = ({ tasks, groups, onUpdate, onDelete, onToggle }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có task nào
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => {
        const group = groups.find(g => g.id === task.groupId);
        if (!group) return null;
        
        return (
          <TaskItem
            key={task.id}
            task={task}
            group={group}
            groups={groups}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggle={onToggle}
            index={index + 1}
          />
        );
      })}
    </div>
  );
};
