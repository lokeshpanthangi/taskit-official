# 🚀 TaskPal: Your Ultimate Task & Project Management App

Welcome to **TaskPal**! 🎉

TaskPal is a modern, full-featured task and project management application built for productivity, collaboration, and clarity. With a beautiful UI, robust backend, and real-time features, TaskPal helps you organize your work and life with ease.

![TaskPal Dashboard](https://i.imgur.com/example-image.png)

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Scope](#-project-scope)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Project Overview

TaskPal is designed to streamline task and project management for individuals and teams. The application provides an intuitive interface for creating, organizing, and tracking tasks, managing projects, and collaborating with team members. With real-time updates, detailed analytics, and customizable workflows, TaskPal adapts to your unique productivity needs.

## ✨ Features

### 👤 Authentication & User Management

- **Secure Authentication**: Email/password login with JWT tokens
- **User Profiles**: Customizable user profiles with avatars and preferences
- **Account Management**: Password reset, email verification, and account settings
- **Theme Switching**: Toggle between light and dark modes for comfortable viewing

### 📝 Task Management

- **Task Creation**: Create tasks with titles, descriptions, due dates, and priorities
- **Task Organization**: Organize tasks with labels, categories, and custom fields
- **Task Filtering**: Filter tasks by status, priority, due date, and assignee
- **Task Dependencies**: Set up task dependencies and prerequisites
- **Recurring Tasks**: Create recurring tasks with customizable schedules

### 📊 Project Management

- **Project Creation**: Create projects with descriptions, deadlines, and team members
- **Project Dashboard**: View project progress, task distribution, and timelines
- **Team Collaboration**: Invite team members, assign tasks, and track contributions
- **Progress Tracking**: Visual progress bars and completion statistics
- **Project Templates**: Save and reuse project structures for similar work

### 📅 Calendar & Scheduling

- **Calendar View**: View tasks and deadlines in a calendar interface
- **Deadline Tracking**: Get notifications for upcoming and overdue tasks
- **Time Blocking**: Schedule focused work sessions for specific tasks
- **Integration**: Sync with external calendars (Google, Outlook)

### 📊 Analytics & Reporting

- **Productivity Insights**: Track completion rates and productivity trends
- **Time Analytics**: Analyze time spent on different projects and tasks
- **Custom Reports**: Generate reports on project status, team performance, and more
- **Export Options**: Export data in various formats (CSV, PDF, Excel)

### 🔔 Notifications & Reminders

- **Real-time Notifications**: Get instant updates on task assignments and changes
- **Custom Reminders**: Set up custom reminders for important deadlines
- **Email Notifications**: Receive email digests of important updates
- **Notification Preferences**: Customize notification frequency and channels

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide Icons for consistent and beautiful iconography
- **Animations**: Framer Motion for smooth, physics-based animations

### State Management
- **Data Fetching**: React Query for server-state management
- **Local State**: React Context API for application state
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage for file uploads
- **Real-time**: Supabase Realtime for live updates

### Additional Libraries
- **Date Handling**: date-fns for date manipulation
- **UI Primitives**: Radix UI for accessible component primitives
- **Notifications**: Sonner for toast notifications
- **Charts**: Recharts for data visualization

## 🔭 Project Scope

TaskPal is designed to serve a wide range of users, from individuals managing personal tasks to teams collaborating on complex projects. The scope of the project includes:

### Target Users
- **Individuals**: Personal task management and productivity tracking
- **Small Teams**: Collaborative project management for teams of 2-10 people
- **Freelancers**: Client project management and time tracking
- **Students**: Assignment tracking and study planning

### Use Cases
- **Personal Productivity**: Managing daily tasks, habits, and personal goals
- **Team Collaboration**: Coordinating work across team members with clear ownership
- **Project Planning**: Breaking down projects into manageable tasks and milestones
- **Deadline Management**: Tracking important dates and ensuring timely completion
- **Resource Allocation**: Assigning tasks based on capacity and expertise

### Future Roadmap

1. **Mobile Applications**: Native iOS and Android apps for on-the-go task management
2. **Advanced Analytics**: Enhanced reporting with predictive analytics and burndown charts
3. **AI Assistance**: Task prioritization and scheduling recommendations
4. **Time Tracking**: Built-in time tracking for tasks and projects
5. **Integrations**: Connections with popular tools like Slack, GitHub, and Google Workspace
6. **Kanban Boards**: Visual task management with customizable workflows
7. **Public API**: Developer access for custom integrations and extensions

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskpal.git

# Navigate to the project directory
cd taskpal

# Install dependencies
npm install

# Set up environment variables (copy from example)
cp .env.example .env.local

# Start the development server
npm run dev
```

## 🖥️ Usage

1. **Registration**: Create an account with your email and password
2. **Dashboard**: View your tasks, projects, and upcoming deadlines
3. **Task Creation**: Add new tasks with all relevant details
4. **Project Management**: Create and manage projects with team members
5. **Calendar**: View your schedule and plan your work
6. **Settings**: Customize your experience and notification preferences

## 📚 API Documentation

TaskPal uses Supabase for backend services. The main API endpoints include:

- **Authentication**: `/auth/*` - User registration, login, and management
- **Tasks**: `/tasks/*` - CRUD operations for tasks
- **Projects**: `/projects/*` - Project management endpoints
- **Users**: `/users/*` - User profile and settings
- **Teams**: `/teams/*` - Team creation and management

Detailed API documentation is available in the [API docs](./docs/api.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

[Website](https://taskpal.example.com) | [Twitter](https://twitter.com/taskpal) | [Contact Us](mailto:info@taskpal.example.com)
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
- Theme toggle between light and dark modes (next-themes)
- Animated logo with size variants and theme-aware styling
- Responsive, accessible, and keyboard-friendly
- Modern, animated UI with shadcn/ui and Framer Motion

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

- **Animated Logo:** Modern, animated TaskPal logo with size variants and theme-aware styling.
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

> Made with ❤️ from Nani!
