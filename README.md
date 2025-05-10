# 🚀 TaskPal: Your Ultimate Task & Project Management App

Welcome to **TaskPal**! 🎉

TaskPal is a modern, full-featured task and project management application built for productivity, collaboration, and clarity. With a beautiful UI, robust backend, and real-time features, TaskPal helps you organize your work and life with ease.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui, Tailwind CSS, Lucide Icons
- **State/Data:** React Query, React Context
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **Other:** date-fns, Zod, Radix UI, Sonner (toasts)

---

## 🚦 Features & Functionality

### 👤 Authentication
- Secure sign up & login (email/password)
- First & last name captured at registration
- Password reset & email confirmation

### 📝 Task Management
- Create, edit, delete, and view tasks
- Set title, description, due date, and priority (1-5)
- **Task Hierarchy:** Nest tasks as subtasks (parent/child)
- Drag & drop support for task reordering (if enabled)
- Mark tasks as completed

### 📅 Calendar & Deadlines
- Visual calendar view for all tasks
- Due date picker with date-fns formatting
- Filter and search tasks by date, priority, or status

### 📊 Projects
- Create and manage projects
- Assign tasks to projects
- Recent projects sidebar

### 🏷️ Priorities & Status
- Five-level priority system (Very Low → Urgent)
- Status: Not Started, In Progress, Completed
- Visual priority tags and status badges

### 🔔 Notifications & Reminders
- **Notification Bell:** See all notifications in a dropdown
- **Due Date Alerts:** Automatic notifications for tasks due today/tomorrow
- **In-App Toasts:** Real-time toast popups for due/overdue tasks
- Mark notifications as read/unread
- Real-time updates via Supabase

### 🌗 Theming & UX
- Dark mode by default (next-themes)
- Responsive, accessible, and keyboard-friendly
- Modern, animated UI with shadcn/ui

---

## 🏗️ Project Structure

```
├── src/
│   ├── components/         # Reusable UI & app components
│   ├── pages/              # Route-based pages (Dashboard, Tasks, Auth, etc.)
│   ├── layouts/            # App and Auth layouts
│   ├── services/           # API & business logic (tasks, auth, notifications)
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context providers (Auth, etc.)
│   ├── lib/                # Utilities and helpers
│   └── integrations/       # Supabase client setup
├── public/                 # Static assets
├── supabase/               # Supabase config
├── tailwind.config.ts      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── ...
```

---

## ⚡ Getting Started

### 1. Clone & Install
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Environment Setup
- Configure your Supabase project and copy the API keys to `.env` if needed.
- Update any other environment variables as required.

### 3. Run the App
```sh
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) 🚀

---

## 🧩 Key Components

- **Task Creation Modal:** Add tasks with title, description, due date, priority, and parent task.
- **Task Hierarchy:** Visualize and manage nested tasks.
- **Notification Center:** Bell icon with dropdown for all notifications (due, reminders, system).
- **In-App Toasts:** Real-time popups for important events (task due, completed, etc.).
- **Sidebar:** Navigation, recent projects, and personalized welcome message.
- **Auth Pages:** Login, Register (with name), Forgot/Reset Password.

---

## 🔔 Notifications Logic
- Tasks due today/tomorrow trigger both a notification and a toast.
- Notifications are shown in the bell dropdown and can be marked as read.
- Real-time updates via Supabase channel subscriptions.

---

## 🔒 Security & Best Practices
- All API calls are authenticated via Supabase Auth.
- User data is isolated and secure.
- Input validation with Zod and form-level checks.

---

## 🛠️ Customization
- Easily extend with new features (e.g., tags, comments, file uploads)
- Theming via Tailwind and next-themes
- Modular, maintainable codebase

---

## 🤝 Contributing
PRs and issues are welcome! Please open an issue for bugs or feature requests.

---

## 📄 License
MIT

---

## 🙏 Acknowledgements
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

> Made with ❤️ for productivity!
