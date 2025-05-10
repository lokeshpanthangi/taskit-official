
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
      notifications={notifications}
      onNotificationRead={handleMarkAsRead}
      onAllRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationHeader;
