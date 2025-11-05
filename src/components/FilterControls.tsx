'use client';

import { Group } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface FilterControlsProps {
  groups: Group[];
  selectedGroupId: string | null;
  searchQuery: string;
  onGroupChange: (groupId: string | null) => void;
  onSearchChange: (query: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const FilterControls = ({ 
  groups, 
  selectedGroupId, 
  searchQuery, 
  onGroupChange, 
  onSearchChange,
  onDeleteGroup
}: FilterControlsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const handleDeleteClick = () => {
    const group = groups.find(g => g.id === selectedGroupId);
    if (group) {
      setGroupToDelete(group);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.id);
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm task..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 sm:w-64">
            <Select 
              value={selectedGroupId || 'all'} 
              onValueChange={(value) => onGroupChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedGroupId && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDeleteClick}
              title="Xóa nhóm này"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhóm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhóm <strong>{groupToDelete?.name}</strong>?
              <br />
              <span className="text-red-500 font-semibold">
                Tất cả các task trong nhóm này cũng sẽ bị xóa!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
