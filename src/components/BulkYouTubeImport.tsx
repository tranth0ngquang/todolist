'use client';

import { useState } from 'react';
import { Priority, Group } from '@/types';
import { fetchYouTubeTitle, isYouTubeUrl } from '@/utils/youtube';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Youtube, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BulkYouTubeImportProps {
  groups: Group[];
  onCreateTasks: (tasks: Array<{
    title: string;
    link: string;
    priority: Priority;
    groupId: string;
  }>) => void;
  onCreateGroup: (name: string) => Group;
}

interface ProcessedLink {
  url: string;
  title: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export const BulkYouTubeImport = ({ groups, onCreateTasks, onCreateGroup }: BulkYouTubeImportProps) => {
  const [linksText, setLinksText] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [priority, setPriority] = useState<Priority>('BINH_THUONG');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  const parseLinks = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && isYouTubeUrl(line));
  };

  const handleProcess = async () => {
    if (!linksText.trim()) return;

    const links = parseLinks(linksText);
    if (links.length === 0) {
      alert('Không tìm thấy YouTube link hợp lệ nào!');
      return;
    }

    // Determine group
    let groupId = selectedGroupId;
    if (!groupId && newGroupName.trim()) {
      const newGroup = onCreateGroup(newGroupName.trim());
      groupId = newGroup.id;
    }

    if (!groupId) {
      alert('Vui lòng chọn nhóm hoặc tạo nhóm mới!');
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);
    
    // Initialize processed links
    const initialProcessed: ProcessedLink[] = links.map(url => ({
      url,
      title: '',
      status: 'pending'
    }));
    setProcessedLinks(initialProcessed);

    const successfulTasks: Array<{
      title: string;
      link: string;
      priority: Priority;
      groupId: string;
    }> = [];

    // Process each link
    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      
      // Update status to processing
      setProcessedLinks(prev => prev.map((item, index) => 
        index === i ? { ...item, status: 'processing' } : item
      ));

      try {
        const info = await fetchYouTubeTitle(url);
        
        if (info && info.title) {
          // Success
          setProcessedLinks(prev => prev.map((item, index) => 
            index === i ? { 
              ...item, 
              title: info.title, 
              status: 'success' 
            } : item
          ));

          successfulTasks.push({
            title: info.title,
            link: url,
            priority,
            groupId
          });
        } else {
          // Failed to get title, use fallback
          const fallbackTitle = `YouTube Video ${i + 1}`;
          setProcessedLinks(prev => prev.map((item, index) => 
            index === i ? { 
              ...item, 
              title: fallbackTitle, 
              status: 'success' 
            } : item
          ));

          successfulTasks.push({
            title: fallbackTitle,
            link: url,
            priority,
            groupId
          });
        }
      } catch (error) {
        // Error
        setProcessedLinks(prev => prev.map((item, index) => 
          index === i ? { 
            ...item, 
            status: 'error',
            error: 'Không thể lấy tiêu đề'
          } : item
        ));
      }

      // Update progress
      setCurrentProgress(((i + 1) / links.length) * 100);
      
      // Small delay to avoid rate limiting
      if (i < links.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Create all successful tasks
    if (successfulTasks.length > 0) {
      onCreateTasks(successfulTasks);
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setLinksText('');
    setProcessedLinks([]);
    setCurrentProgress(0);
    setNewGroupName('');
    setIsCreatingNewGroup(false);
  };

  const links = parseLinks(linksText);
  const validLinksCount = links.length;
  const successCount = processedLinks.filter(l => l.status === 'success').length;
  const errorCount = processedLinks.filter(l => l.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          Import Nhiều YouTube Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Links */}
        <div>
          <Label htmlFor="links">YouTube Links (mỗi link một dòng)</Label>
          <Textarea
            id="links"
            value={linksText}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLinksText(e.target.value)}
            placeholder="Paste YouTube links vào đây, mỗi link một dòng:&#10;https://www.youtube.com/watch?v=abc123&#10;https://www.youtube.com/watch?v=def456&#10;..."
            rows={6}
            disabled={isProcessing}
          />
          {validLinksCount > 0 && (
            <div className="mt-2">
              <Badge variant="outline">
                {validLinksCount} YouTube link hợp lệ
              </Badge>
            </div>
          )}
        </div>

        {/* Group Selection */}
        <div>
          <Label>Nhóm *</Label>
          <div className="space-y-2">
            {!isCreatingNewGroup ? (
              <div className="flex gap-2">
                <Select 
                  value={selectedGroupId} 
                  onValueChange={setSelectedGroupId}
                  disabled={isProcessing}
                >
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
                  variant="outline"
                  onClick={() => setIsCreatingNewGroup(true)}
                  disabled={isProcessing}
                >
                  Tạo mới
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Tên nhóm mới..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  disabled={isProcessing}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingNewGroup(false);
                    setNewGroupName('');
                  }}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <Label>Độ ưu tiên</Label>
          <Select 
            value={priority} 
            onValueChange={(value: Priority) => setPriority(value)}
            disabled={isProcessing}
          >
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

        {/* Process Button */}
        <div className="flex gap-2">
          <Button 
            onClick={handleProcess}
            disabled={!validLinksCount || isProcessing || (!selectedGroupId && !newGroupName.trim())}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {validLinksCount} Links
              </>
            )}
          </Button>
          
          {processedLinks.length > 0 && (
            <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
              Reset
            </Button>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={currentProgress} className="w-full" />
            <div className="text-sm text-gray-600 text-center">
              {Math.round(currentProgress)}% hoàn thành
            </div>
          </div>
        )}

        {/* Results */}
        {processedLinks.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Thành công: {successCount}
              </Badge>
              {errorCount > 0 && (
                <Badge variant="outline" className="bg-red-50">
                  <XCircle className="w-3 h-3 mr-1" />
                  Lỗi: {errorCount}
                </Badge>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {processedLinks.map((link, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border text-sm ${
                    link.status === 'success' ? 'bg-green-50 border-green-200' :
                    link.status === 'error' ? 'bg-red-50 border-red-200' :
                    link.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {link.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {link.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                    {link.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    {link.status === 'pending' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                    <span className="font-medium">
                      {link.title || 'Đang lấy tiêu đề...'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {link.url}
                  </div>
                  {link.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {link.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Hướng dẫn sử dụng:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Copy nhiều YouTube links, mỗi link một dòng</li>
            <li>Chọn nhóm hoặc tạo nhóm mới</li>
            <li>Chọn độ ưu tiên chung cho tất cả tasks</li>
            <li>Click &quot;Import&quot; để tự động tạo tasks với tiêu đề từ YouTube</li>
            <li>Hệ thống sẽ tự động lấy tiêu đề video và tạo tasks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
