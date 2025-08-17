'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Youtube, Plus } from 'lucide-react';
import { Group, Priority } from '@/types';
import { fetchYouTubeTitle, isYouTubeUrl } from '@/utils/youtube';

interface QuickYouTubeAddProps {
  groups: Group[];
  onSubmit: (
    title: string,
    groupId: string,
    priority: Priority,
    link: string,
    deadline?: string
  ) => void;
  onCreateGroup: (name: string) => Group;
}

export const QuickYouTubeAdd = ({ groups, onSubmit, onCreateGroup }: QuickYouTubeAddProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [priority, setPriority] = useState<Priority>('BINH_THUONG');
  const [deadline, setDeadline] = useState('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [error, setError] = useState('');

  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    setError('');
    setVideoTitle('');

    if (url.trim() && isYouTubeUrl(url)) {
      setIsLoading(true);
      try {
        const info = await fetchYouTubeTitle(url);
        if (info) {
          setVideoTitle(info.title);
        }
      } catch (error) {
        setError('Không thể lấy thông tin video');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuickAdd = () => {
    if (!youtubeUrl.trim() || !isYouTubeUrl(youtubeUrl)) {
      setError('Vui lòng nhập URL YouTube hợp lệ');
      return;
    }

    if (!selectedGroupId && !newGroupName.trim()) {
      setError('Vui lòng chọn nhóm hoặc tạo nhóm mới');
      return;
    }

    let groupId = selectedGroupId;
    
    // Create new group if needed
    if (!groupId && newGroupName.trim()) {
      const newGroup = onCreateGroup(newGroupName.trim());
      groupId = newGroup.id;
    }

    if (!groupId) return;

    const title = videoTitle || 'Video YouTube';
    
    onSubmit(
      title,
      groupId,
      priority,
      youtubeUrl,
      deadline || undefined
    );

    // Reset form
    setYoutubeUrl('');
    setSelectedGroupId('');
    setNewGroupName('');
    setPriority('BINH_THUONG');
    setDeadline('');
    setIsCreatingNewGroup(false);
    setVideoTitle('');
    setError('');
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Youtube className="w-5 h-5" />
          Thêm nhanh YouTube
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="youtube-url">URL YouTube</Label>
          <div className="relative">
            <Input
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => handleYouTubeUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="pr-10"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            )}
          </div>
          
          {videoTitle && (
            <div className="mt-2 p-2 bg-white rounded border">
              <p className="text-sm font-medium text-gray-800">
                📺 {videoTitle}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label>Nhóm</Label>
            {!isCreatingNewGroup ? (
              <div className="flex gap-1">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1">
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
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreatingNewGroup(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Tên nhóm mới..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingNewGroup(false);
                    setNewGroupName('');
                  }}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Ưu tiên</Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YEU">📝 Yếu</SelectItem>
                <SelectItem value="BINH_THUONG">⚡ BT</SelectItem>
                <SelectItem value="GAP">🔥 Gấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="deadline-quick">Deadline (tùy chọn)</Label>
          <Input
            id="deadline-quick"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <Button 
          onClick={handleQuickAdd} 
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={isLoading || !youtubeUrl.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Youtube className="w-4 h-4 mr-2" />
              Thêm video YouTube
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
