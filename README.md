# To-Do App - Ứng dụng quản lý công việc cá nhân

Ứng dụng To-Do được xây dựng hoàn toàn client-side với Next.js 14, TypeScript, Tailwind CSS và shadcn/ui. Dữ liệu được lưu trữ trong localStorage của trình duyệt.

## 🚀 Tính năng chính

### ✅ Quản lý Task
- **Hai tab**: "Chưa xong" và "Đã xong"
- **Tạo task** với các thông tin:
  - Tiêu đề (bắt buộc)
  - Link (tùy chọn, validate URL)
  - Độ ưu tiên: YẾU / BÌNH THƯỜNG / GẤP
  - Nhóm (bắt buộc, có thể tạo mới)
  - Deadline (tùy chọn)
- **Chỉnh sửa/Xóa** task inline
- **Hoàn thành/Khôi phục** task với checkbox

### 📊 Sắp xếp thông minh
**Tab "Chưa xong":**
1. Task có deadline trong vòng 2 ngày → lên đầu (bất kể ưu tiên)
2. Theo độ ưu tiên: GẤP > BÌNH THƯỜNG > YẾU
3. Theo deadline (gần hơn lên trước)
4. Theo thời gian tạo (cũ hơn lên trước)

**Tab "Đã xong":** Theo thời gian hoàn thành (mới nhất lên trước)

### 🏷️ Highlight và Badge
- **Task GẤP**: Badge "Gấp" màu đỏ
- **Cận deadline ≤ 2 ngày**: Badge "Sắp đến hạn" + border cam
- **Quá hạn**: Badge "Quá hạn" màu đỏ + border đỏ

### 🔍 Lọc và Tìm kiếm
- **Lọc theo nhóm** (dropdown)
- **Tìm kiếm** theo tiêu đề task
- Hiển thị số lượng task trong mỗi tab

### 💾 Sao lưu và Phục hồi
- **Xuất JSON**: Download backup file
- **Nhập JSON**: Phục hồi từ file backup

### 🌏 Timezone và Ngôn ngữ
- **Timezone**: Asia/Ho_Chi_Minh
- **Ngôn ngữ**: Tiếng Việt (UTF-8)
- **Format ngày**: dd/MM/yyyy

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: useReducer + useEffect
- **Storage**: localStorage
- **Date Handling**: date-fns + date-fns-tz
- **Icons**: Lucide React

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── FilterControls.tsx
│   ├── ImportExport.tsx
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   └── TaskList.tsx
├── hooks/
│   ├── useApp.ts
│   └── useAppReducer.ts
├── types/
│   └── index.ts
└── utils/
    ├── date.ts
    ├── sorting.ts
    └── storage.ts
```

## 🚀 Cài đặt và chạy

```bash
# Clone và cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📋 Data Model

```typescript
export type Priority = 'YEU' | 'BINH_THUONG' | 'GAP';

export interface Group {
  id: string;       // uuid
  name: string;     // unique (case-insensitive)
  createdAt: string;
}

export interface Task {
  id: string;             // uuid
  title: string;          // required
  link?: string;          // optional, validated URL
  priority: Priority;     // default 'BINH_THUONG'
  groupId: string;        // required
  createdAt: string;      // ISO string
  deadline?: string;      // ISO date string
  completed: boolean;     // default false
  completedAt?: string;   // set when completed=true
}
```

## 🔧 Tính năng kỹ thuật

- **100% Client-side**: Không cần backend
- **Responsive Design**: Tối ưu cho mobile và desktop
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized với React hooks
- **Accessibility**: Semantic HTML và ARIA labels
- **Data Persistence**: localStorage với error handling
- **Import/Export**: JSON backup và restore

## 📝 Ghi chú

- Dữ liệu được lưu trong localStorage của trình duyệt
- Không có giới hạn số lượng task hoặc nhóm
- Hỗ trợ URL validation cho link
- Deadline được tính theo múi giờ Asia/Ho_Chi_Minh
- Task có thể chuyển đổi trạng thái hoàn thành bất cứ lúc nào

## 🎯 Roadmap (Optional)

- [ ] Dark mode support
- [ ] Drag & drop để sắp xếp
- [ ] Thống kê và báo cáo
- [ ] Reminder notifications
- [ ] Tag system
- [ ] Calendar view
