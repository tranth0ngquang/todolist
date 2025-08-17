'use client';

import { Group } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterControlsProps {
  groups: Group[];
  selectedGroupId: string | null;
  searchQuery: string;
  onGroupChange: (groupId: string | null) => void;
  onSearchChange: (query: string) => void;
}

export const FilterControls = ({ 
  groups, 
  selectedGroupId, 
  searchQuery, 
  onGroupChange, 
  onSearchChange 
}: FilterControlsProps) => {
  return (
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
      
      <div className="w-full sm:w-64">
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
    </div>
  );
};
