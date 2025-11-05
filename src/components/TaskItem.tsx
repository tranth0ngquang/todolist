'use client';

import { useState } from 'react';
import { Task, Group, Priority, priorityLabels } from '@/types';
import { getDeadlineStatus, formatDateVN, isValidUrl } from '@/utils/date';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Calendar } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  group: Group;
  groups: Group[];
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggle: (taskId: string) => void;
  index: number;
}

export const TaskItem = ({ task, group, groups, onUpdate, onDelete, onToggle, index }: TaskItemProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editLink, setEditLink] = useState(task.link || '');

  const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null;

  // Helper function to get priority badge variant and color
  const getPriorityBadgeProps = (priority: Priority) => {
    switch (priority) {
      case 'GAP':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-300' };
      case 'BINH_THUONG':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'YEU':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' };
      default:
        return { variant: 'outline' as const, className: '' };
    }
  };

  // Helper function to get group badge color
  const getGroupBadgeColor = (groupName: string) => {
    const colors = [
      'bg-green-100 text-green-800 border-green-300',
      'bg-purple-100 text-purple-800 border-purple-300', 
      'bg-yellow-100 text-yellow-800 border-yellow-300',
      'bg-pink-100 text-pink-800 border-pink-300',
      'bg-indigo-100 text-indigo-800 border-indigo-300',
      'bg-orange-100 text-orange-800 border-orange-300',
      'bg-teal-100 text-teal-800 border-teal-300',
    ];
    
    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
      hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Handle title save
  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdate({ ...task, title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  // Handle link save
  const handleLinkSave = () => {
    const newLink = editLink.trim();
    if (newLink !== (task.link || '')) {
      onUpdate({ ...task, link: newLink || undefined });
    }
    setIsEditingLink(false);
  };

  // Handle priority change
  const handlePriorityChange = (newPriority: Priority) => {
    onUpdate({ ...task, priority: newPriority });
  };

  // Handle group change
  const handleGroupChange = (newGroupId: string) => {
    onUpdate({ ...task, groupId: newGroupId });
  };

  // Handle deadline change
  const handleDeadlineChange = (newDeadline: string) => {
    onUpdate({ ...task, deadline: newDeadline || undefined });
  };

  // Handle key press for title editing
  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  // Handle key press for link editing
  const handleLinkKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLinkSave();
    } else if (e.key === 'Escape') {
      setEditLink(task.link || '');
      setIsEditingLink(false);
    }
  };

  const getBorderClass = () => {
    if (task.completed) return '';
    
    if (deadlineStatus?.status === 'overdue') {
      return 'border-red-500 border-2';
    }
    
    if (deadlineStatus?.status === 'near') {
      return 'border-orange-500 border-2';
    }
    
    return '';
  };

  return (
    <Card className={`${getBorderClass()} ${task.completed ? 'opacity-70' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Số thứ tự */}
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mt-1">
            {index}
          </div>
          
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {/* Title - Click to edit */}
              <div className="flex items-start justify-between">
                {isEditingTitle ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyPress}
                    className="text-base font-medium"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${task.completed ? 'line-through text-gray-500' : ''}`}
                    onClick={() => !task.completed && setIsEditingTitle(true)}
                    title="Click để chỉnh sửa tiêu đề"
                  >
                    {task.title}
                  </h3>
                )}
                
                {!task.completed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(task.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Badges - Click to change */}
              <div className="flex flex-wrap gap-2 text-sm">
                {/* Group Badge - Click to change */}
                <Select value={task.groupId} onValueChange={handleGroupChange} disabled={task.completed}>
                  <SelectTrigger className={`w-auto h-auto p-0 border-0 bg-transparent ${getGroupBadgeColor(group.name)} rounded-full px-2 py-1 text-xs font-medium`}>
                    <div className="flex items-center gap-1">
                      📁 {group.name}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        📁 {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Priority Badge - Click to change */}
                <Select value={task.priority} onValueChange={handlePriorityChange} disabled={task.completed}>
                  <SelectTrigger className={`w-auto h-auto p-0 border-0 bg-transparent ${getPriorityBadgeProps(task.priority).className} rounded-full px-2 py-1 text-xs font-medium`}>
                    <div className="flex items-center gap-1">
                      {task.priority === 'GAP' && '🔥'} 
                      {task.priority === 'BINH_THUONG' && '⚡'} 
                      {task.priority === 'YEU' && '📝'} 
                      {priorityLabels[task.priority]}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YEU">📝 Yếu</SelectItem>
                    <SelectItem value="BINH_THUONG">⚡ Bình thường</SelectItem>
                    <SelectItem value="GAP">🔥 Gấp</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Special badges */}
                {task.priority === 'GAP' && (
                  <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
                    🚨 Gấp
                  </Badge>
                )}
                
                {deadlineStatus && (
                  <Badge
                    variant={
                      deadlineStatus.status === 'overdue'
                        ? 'destructive'
                        : deadlineStatus.status === 'near'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      deadlineStatus.status === 'overdue'
                        ? 'bg-red-600 text-white border-red-600'
                        : deadlineStatus.status === 'near'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }
                  >
                    {deadlineStatus.status === 'overdue' ? '⚠️ Quá hạn' : 
                     deadlineStatus.status === 'near' ? '⏰ Sắp đến hạn' : 
                     `📅 ${deadlineStatus.text}`}
                  </Badge>
                )}
              </div>
              
              {/* Deadline - Click to change */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Deadline:</span>
                  <Input
                    type="datetime-local"
                    value={task.deadline || ''}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className="w-auto h-6 px-1 text-xs border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300"
                    disabled={task.completed}
                    title="Click để thay đổi deadline"
                  />
                  {task.deadline && (
                    <span>({deadlineStatus?.text})</span>
                  )}
                </div>
              </div>
              
              {/* Link - Click to edit */}
              {(task.link || isEditingLink) && (
                <div className="text-sm">
                  {isEditingLink ? (
                    <Input
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      onBlur={handleLinkSave}
                      onKeyDown={handleLinkKeyPress}
                      placeholder="https://example.com"
                      className="text-xs"
                      autoFocus
                    />
                  ) : task.link && isValidUrl(task.link) ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mở link
                      </a>
                      {!task.completed && (
                        <button
                          onClick={() => setIsEditingLink(true)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                          title="Click để chỉnh sửa link"
                        >
                          Sửa
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Add link button if no link */}
              {!task.link && !isEditingLink && !task.completed && (
                <button
                  onClick={() => setIsEditingLink(true)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  + Thêm link
                </button>
              )}
              
              <div className="text-xs text-gray-400">
                Tạo: {formatDateVN(task.createdAt)}
                {task.completed && task.completedAt && (
                  <span> • Hoàn thành: {formatDateVN(task.completedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
