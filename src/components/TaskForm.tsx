'use client';

import { useState, useEffect } from 'react';
import { Priority, Group } from '@/types';
import { isValidUrl } from '@/utils/date';
import { fetchYouTubeTitle, isYouTubeUrl, YouTubeVideoInfo } from '@/utils/youtube';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Youtube, Download } from 'lucide-react';

interface TaskFormProps {
  groups: Group[];
  onSubmit: (
    title: string,
    groupId: string,
    priority: Priority,
    link?: string,
    deadline?: string
  ) => void;
  onCreateGroup: (name: string) => Group;
  selectedGroupId?: string; // Thêm prop để pre-select group
}

export const TaskForm = ({ groups, onSubmit, onCreateGroup, selectedGroupId }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [priority, setPriority] = useState<Priority>('BINH_THUONG');
  const [selectedGroupId_, setSelectedGroupId] = useState<string>(selectedGroupId || '');
  const [newGroupName, setNewGroupName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // YouTube related states
  const [isLoadingYouTube, setIsLoadingYouTube] = useState(false);
  const [youTubeInfo, setYouTubeInfo] = useState<YouTubeVideoInfo | null>(null);

  // Cập nhật groupId khi selectedGroupId prop thay đổi
  useEffect(() => {
    if (selectedGroupId) {
      setSelectedGroupId(selectedGroupId);
    }
  }, [selectedGroupId]);

  // Xử lý khi link thay đổi - tự động lấy title YouTube
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (link.trim() && isYouTubeUrl(link)) {
        setIsLoadingYouTube(true);
        setYouTubeInfo(null);
        
        try {
          const info = await fetchYouTubeTitle(link);
          if (info) {
            setYouTubeInfo(info);
            // Tự động điền tiêu đề nếu chưa có hoặc trống
            if (!title.trim()) {
              setTitle(info.title);
            }
          }
        } catch (error) {
          console.error('Error fetching YouTube info:', error);
        } finally {
          setIsLoadingYouTube(false);
        }
      } else {
        setYouTubeInfo(null);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [link, title]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (link && !isValidUrl(link)) {
      newErrors.link = 'URL không hợp lệ (phải có http:// hoặc https://)';
    }

    if (!selectedGroupId_ && !newGroupName.trim()) {
      newErrors.group = 'Vui lòng chọn nhóm hoặc tạo nhóm mới';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    let groupId = selectedGroupId_;
    
    // Create new group if needed
    if (!groupId && newGroupName.trim()) {
      const newGroup = onCreateGroup(newGroupName.trim());
      groupId = newGroup.id;
    }

    if (!groupId) return;

    onSubmit(
      title.trim(),
      groupId,
      priority,
      link.trim() || undefined,
      deadline || undefined
    );

    // Reset form
    setTitle('');
    setLink('');
    setPriority('BINH_THUONG');
    setSelectedGroupId('');
    setNewGroupName('');
    setDeadline('');
    setIsCreatingNewGroup(false);
    setErrors({});
    setYouTubeInfo(null);
  };

  const handleUseSuggestedTitle = () => {
    if (youTubeInfo) {
      setTitle(youTubeInfo.title);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo task mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="link">Link (tùy chọn)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com hoặc https://youtube.com/watch?v=..."
                  className={errors.link ? 'border-red-500' : ''}
                />
                {isLoadingYouTube && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
              
              {youTubeInfo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Youtube className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Video YouTube được tìm thấy:
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {youTubeInfo.title}
                      </p>
                      {title !== youTubeInfo.title && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleUseSuggestedTitle}
                          className="mt-2 h-7 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Sử dụng tiêu đề này
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {errors.link && <p className="text-red-500 text-sm">{errors.link}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề task..."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="priority">Độ ưu tiên</Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEU">📝 Yếu</SelectItem>
                <SelectItem value="BINH_THUONG">⚡ Bình thường</SelectItem>
                <SelectItem value="GAP">🔥 Gấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="group">Nhóm *</Label>
            <div className="space-y-2">
              {!isCreatingNewGroup ? (
                <div className="flex gap-2">
                  <Select value={selectedGroupId_} onValueChange={setSelectedGroupId}>
                    <SelectTrigger className={`flex-1 ${errors.group ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Chọn nhóm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNewGroup(true)}
                  >
                    Tạo mới
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Tên nhóm mới..."
                    className={`flex-1 ${errors.group ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNewGroup(false);
                      setNewGroupName('');
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </div>
            {errors.group && <p className="text-red-500 text-sm mt-1">{errors.group}</p>}
          </div>

          <div>
            <Label htmlFor="deadline">Deadline (tùy chọn)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {isLoadingYouTube ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải thông tin...
              </>
            ) : (
              'Tạo task'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
