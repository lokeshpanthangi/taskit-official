
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter } from "date-fns";

export type NotificationType = "task_due" | "task_reminder" | "system" | "info";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  task_id: string | null;
  priority: number | null;
  user_id: string;
}

// Fetch all notifications for the current user
export const fetchNotifications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
    
  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
  
  return data as Notification[];
};

// Create a new notification
export const createNotification = async (notification: Omit<Notification, "id" | "user_id" | "read">) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      date: notification.date || new Date().toISOString(),
      title: notification.title,
      type: notification.type,
      priority: notification.priority,
      task_id: notification.task_id,
      message: notification.message,
      read: false
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
  
  return data as Notification;
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .select()
    .single();
    
  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
  
  return data as Notification;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
    
  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
  
  return true;
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);
    
  if (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
  
  return true;
};

// Create a due date notification for a task
export const createTaskDueNotification = async (taskId: string, taskTitle: string, dueDate: string, priority: number) => {
  // Calculate if due date is today or approaching soon
  const now = new Date();
  const due = new Date(dueDate);
  let message = "";
  let title = "";
  
  if (isAfter(now, due)) {
    // Task is overdue
    title = "Task Overdue";
    message = `Your task "${taskTitle}" was due on ${format(due, "MMM d")}.`;
  } else if (format(due, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
    // Task is due today
    title = "Task Due Today";
    message = `Your task "${taskTitle}" is due today.`;
  } else {
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) {
      // Task is due soon
      title = "Task Due Soon";
      message = `Your task "${taskTitle}" is due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}.`;
    }
  }
  
  if (title && message) {
    return await createNotification({
      title,
      message,
      type: "task_due",
      date: now.toISOString(),
      task_id: taskId,
      priority
    });
  }
  
  return null;
};

// Set up a subscription to listen for task changes and create notifications
export const setupTaskNotificationListener = () => {
  const channel = supabase
    .channel('tasks-channel')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'tasks' 
    }, (payload) => {
      // New task created
      const newTask = payload.new;
      
      if (newTask.due_date) {
        createTaskDueNotification(
          newTask.id, 
          newTask.title, 
          newTask.due_date, 
          newTask.priority || 3
        ).catch(err => console.error("Error creating notification:", err));
      }
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tasks'
    }, (payload) => {
      const updatedTask = payload.new;
      const oldTask = payload.old;
      
      // If status changed to completed
      if (updatedTask.status === 'Completed' && oldTask.status !== 'Completed') {
        createNotification({
          title: "Task Completed",
          message: `You've completed "${updatedTask.title}". Great job!`,
          type: "info",
          date: new Date().toISOString(),
          task_id: updatedTask.id,
          priority: 1 // Low priority - informational only
        }).catch(err => console.error("Error creating notification:", err));
      }
      
      // If due date changed and is now approaching
      if (updatedTask.due_date && (!oldTask.due_date || oldTask.due_date !== updatedTask.due_date)) {
        createTaskDueNotification(
          updatedTask.id, 
          updatedTask.title, 
          updatedTask.due_date, 
          updatedTask.priority || 3
        ).catch(err => console.error("Error creating notification:", err));
      }
    })
    .subscribe();
  
  return channel;
};
