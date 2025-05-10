
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_due' | 'task_reminder' | 'system' | 'info';
  read: boolean;
  date: string;
  task_id?: string;
  priority?: number;
  user_id: string;
}

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

export const createNotification = async (notification: Omit<Notification, "id" | "user_id" | "date">) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notification,
      user_id: user.id,
      date: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
  
  return data as Notification;
};

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

export const markAllNotificationsAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { error } = await supabase
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
