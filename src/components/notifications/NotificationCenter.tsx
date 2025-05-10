
import { useState } from "react";
import { Bell, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/services/notificationService";

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
  onNotificationClick
}: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "tasks") return notification.type === 'task_due' || notification.type === 'task_reminder';
    if (activeTab === "system") return notification.type === 'system' || notification.type === 'info';
    return true;
  });
  
  // Mark notification as read when clicked
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onNotificationRead(notification.id);
    }
    onNotificationClick(notification);
    setOpen(false); // Close the popover after clicking
  };
  
  // Get appropriate icon and color for notification type
  const getNotificationStyle = (type: string, priority?: number) => {
    if (type === 'task_due') {
      if (priority === 5) return { color: 'bg-priority-urgent text-white' };
      if (priority === 4) return { color: 'bg-priority-high text-white' };
      if (priority === 3) return { color: 'bg-priority-medium text-white' };
      return { color: 'bg-blue-500 text-white' };
    }
    
    if (type === 'task_reminder') return { color: 'bg-amber-500 text-white' };
    if (type === 'system') return { color: 'bg-violet-600 text-white' };
    
    return { color: 'bg-accent text-accent-foreground' };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 md:w-96" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs px-2 py-1"
              onClick={onAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Unread
                {unreadCount > 0 && <Badge className="ml-1 bg-primary">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                System
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="m-0 max-h-[300px]">
            <ScrollArea className="max-h-[300px]">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => {
                  const style = getNotificationStyle(notification.type, notification.priority);
                  
                  return (
                    <div 
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 border-b p-4 cursor-pointer transition-colors",
                        !notification.read ? "bg-muted/50" : "",
                        "hover:bg-accent/10"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={cn(
                        "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                        style.color
                      )}>
                        {notification.type === 'task_due' && <Bell className="h-4 w-4" />}
                        {notification.type === 'task_reminder' && <Bell className="h-4 w-4" />}
                        {notification.type === 'system' && <Check className="h-4 w-4" />}
                        {notification.type === 'info' && <Check className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p>No notifications</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
