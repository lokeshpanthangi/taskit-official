
import { useState, useEffect } from "react";
import NotificationCenter, { Notification } from "@/components/notifications/NotificationCenter";
import { toast } from "@/components/ui/sonner";

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "notification-1",
    title: "Task due today",
    message: "Website Redesign Project is due today",
    type: "task_due",
    read: false,
    date: new Date(),
    taskId: "task-1",
    priority: 5
  },
  {
    id: "notification-2",
    title: "Task reminder",
    message: "Q3 Marketing Campaign starts tomorrow",
    type: "task_reminder",
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 60),
    taskId: "task-2",
    priority: 4
  },
  {
    id: "notification-3",
    title: "Task updated",
    message: "Design new homepage layout was marked as completed",
    type: "info",
    read: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    taskId: "task-1-1"
  },
  {
    id: "notification-4",
    title: "Welcome to TaskPal",
    message: "Get started by creating your first task",
    type: "system",
    read: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

interface NotificationHeaderProps {
  toggleDetailPanel: (taskId?: string) => void;
}

const NotificationHeader = ({ toggleDetailPanel }: NotificationHeaderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success("All notifications marked as read");
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.taskId) {
      toggleDetailPanel(notification.taskId);
    }
  };

  return (
    <NotificationCenter
      notifications={notifications}
      onNotificationRead={handleMarkAsRead}
      onAllRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationHeader;
