'use client';

import { useRef, useState } from 'react';
import { Task, Group } from '@/types';
import { exportData, importData } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';

interface ImportExportProps {
  onImport: (tasks: Task[], groups: Group[]) => void;
}

export const ImportExport = ({ onImport }: ImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');

  const handleExport = () => {
    try {
      exportData();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const data = await importData(file);
      onImport(data.tasks, data.groups);
      setImportMessage(`Đã import thành công ${data.tasks.length} task và ${data.groups.length} nhóm!`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sao lưu & Phục hồi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExport} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Xuất dữ liệu
          </Button>
          
          <Button 
            onClick={handleImportClick} 
            variant="outline" 
            disabled={isImporting}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? 'Đang nhập...' : 'Nhập dữ liệu'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {importMessage && (
          <div className={`mt-3 p-2 rounded text-sm ${
            importMessage.includes('thành công') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {importMessage}
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          <p>• Xuất: Tải về file JSON chứa tất cả task và nhóm</p>
          <p>• Nhập: Chọn file JSON để phục hồi dữ liệu (sẽ ghi đè dữ liệu hiện tại)</p>
        </div>
      </CardContent>
    </Card>
  );
};
