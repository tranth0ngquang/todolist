'use client';

import { useApp } from '@/hooks/useApp';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { FilterControls } from '@/components/FilterControls';
import { ImportExport } from '@/components/ImportExport';
import { QuickYouTubeAdd } from '@/components/QuickYouTubeAdd';
import { BulkYouTubeImport } from '@/components/BulkYouTubeImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const {
    groups,
    selectedGroupId,
    searchQuery,
    incompleteTasks,
    completedTasks,
    createTask,
    createMultipleTasks,
    updateTask,
    deleteTask,
    toggleTask,
    createGroup,
    setSelectedGroup,
    setSearchQuery,
    importData
  } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 To-Do App
          </h1>
          <p className="text-gray-600">
            Quản lý công việc cá nhân với việc phân loại nhóm và deadline
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form and Import/Export */}
          <div className="space-y-6">
            <QuickYouTubeAdd
              groups={groups}
              onSubmit={createTask}
              onCreateGroup={createGroup}
            />
            
            <TaskForm
              groups={groups}
              onSubmit={createTask}
              onCreateGroup={createGroup}
              selectedGroupId={selectedGroupId || undefined}
            />
            
            <BulkYouTubeImport
              groups={groups}
              onCreateTasks={createMultipleTasks}
              onCreateGroup={createGroup}
            />
            
            <ImportExport onImport={importData} />
          </div>

          {/* Right Column - Task Lists */}
          <div className="lg:col-span-2">
            <FilterControls
              groups={groups}
              selectedGroupId={selectedGroupId}
              searchQuery={searchQuery}
              onGroupChange={setSelectedGroup}
              onSearchChange={setSearchQuery}
            />

            <Tabs defaultValue="incomplete" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incomplete" className="relative">
                  Chưa xong
                  {incompleteTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {incompleteTasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="relative">
                  Đã xong
                  {completedTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {completedTasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incomplete" className="mt-6">
                <TaskList
                  tasks={incompleteTasks}
                  groups={groups}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <TaskList
                  tasks={completedTasks}
                  groups={groups}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            To-Do App - Tạo bởi Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
          </p>
          <p className="mt-1">
            Dữ liệu được lưu trữ trong localStorage của trình duyệt
          </p>
        </footer>
      </div>
    </div>
  );
}
