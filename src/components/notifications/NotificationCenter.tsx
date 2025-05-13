
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Notification } from "@/services/notificationService";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  onAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationCenter = ({
  notifications,
  onNotificationRead,
  onAllRead,
  onNotificationClick,
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    
    if (!notification.read) {
      onNotificationRead(notification.id);
      // Invalidate the notifications query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    
    setIsOpen(false);
  };

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
      <DropdownMenuContent align="end" className="w-80 bg-background border shadow-md">
        <DropdownMenuLabel className="flex justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => {
                onAllRead();
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
              }}
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
                  "p-3 cursor-pointer flex flex-col items-start gap-1 hover:bg-background/80 hover:shadow-sm",
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

export default NotificationCenter;
