import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { 
  fetchNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setupTaskNotificationListener,
  Notification 
} from "@/services/notificationService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { fetchTasks } from "@/services/taskService";
import { isToday, isTomorrow, format } from "date-fns";

interface NotificationHeaderProps {
  toggleDetailPanel: (taskId?: string) => void;
}

const NotificationHeader = ({ toggleDetailPanel }: NotificationHeaderProps) => {
  const { isAuthenticated, user: supabaseUser } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
  });
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    enabled: isAuthenticated,
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  
  // Mark all notifications as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    },
  });
  
  // Set up real-time notification listener
  useEffect(() => {
    if (isAuthenticated) {
      const channel = setupTaskNotificationListener();
      
      // Clean up the subscription when the component unmounts
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);
  
  // Find tasks due today or tomorrow
  const dueTasks = (tasks || []).filter(task => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    return isToday(due) || isTomorrow(due);
  });
  
  // Show toast for due tasks
  useEffect(() => {
    if (dueTasks.length > 0) {
      dueTasks.forEach(task => {
        const due = new Date(task.due_date);
        const when = isToday(due) ? "today" : "tomorrow";
        toast(
          `Task due ${when}: ${task.title}`,
          {
            description: `Task "${task.title}" is due ${when} (${format(due, "MMM d, yyyy")})`,
            duration: 8000,
          }
        );
      });
    }
  }, [dueTasks.length]);
  
  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.task_id) {
      toggleDetailPanel(notification.task_id);
    }
    
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <NotificationCenter 
      notifications={[...dueTasks.map(task => ({
        id: task.id,
        title: isToday(new Date(task.due_date)) ? "Task Due Today" : "Task Due Tomorrow",
        message: `Task \"${task.title}\" is due ${isToday(new Date(task.due_date)) ? "today" : "tomorrow"}.`,
        type: "task_due" as import("@/services/notificationService").NotificationType,
        read: false,
        date: task.due_date,
        task_id: task.id,
        priority: task.priority,
        user_id: task.user_id,
      })), ...notifications]}
      onNotificationRead={handleMarkAsRead}
      onAllRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationHeader;
