import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client"; // Add missing import

interface NotificationHeaderProps {
  toggleDetailPanel: (taskId?: string) => void;
}

const NotificationHeader = ({ toggleDetailPanel }: NotificationHeaderProps) => {
  const { isAuthenticated } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications
  const { data: notifications } = useQuery({
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
    
    setIsOpen(false);
  };
  
  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-3 cursor-pointer flex flex-col items-start gap-1",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.date), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {!notification.read && (
                  <Badge variant="secondary" className="mt-1">New</Badge>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationHeader;
