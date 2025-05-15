import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGoogleCalendar } from '@/contexts/GoogleCalendarContext';
import { Loader2, Calendar, Check, X } from 'lucide-react';

const GoogleCalendarSettings: React.FC = () => {
  const {
    isConnected,
    isLoading,
    connectToGoogleCalendar,
    disconnectFromGoogleCalendar,
    calendarEvents
  } = useGoogleCalendar();
  
  const [syncNewTasks, setSyncNewTasks] = React.useState<boolean>(false);
  const [syncTaskUpdates, setSyncTaskUpdates] = React.useState<boolean>(false);
  const [syncTaskDeletions, setSyncTaskDeletions] = React.useState<boolean>(false);
  const [notifyOnCalendarEvents, setNotifyOnCalendarEvents] = React.useState<boolean>(true);
  
  const handleSaveSettings = () => {
    // Save settings to local storage or database
    const settings = {
      syncNewTasks,
      syncTaskUpdates,
      syncTaskDeletions,
      notifyOnCalendarEvents
    };
    
    localStorage.setItem('googleCalendarSettings', JSON.stringify(settings));
  };
  
  // Load settings from local storage
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('googleCalendarSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSyncNewTasks(settings.syncNewTasks);
      setSyncTaskUpdates(settings.syncTaskUpdates);
      setSyncTaskDeletions(settings.syncTaskDeletions);
      setNotifyOnCalendarEvents(settings.notifyOnCalendarEvents);
    }
  }, []);
  
  return (
    <Card style={{ boxShadow: '0 4px 24px 0 #1F51FF22' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your tasks with Google Calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Connection Status</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? 'Your account is connected to Google Calendar' 
                : 'Connect your account to Google Calendar to sync tasks'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-500">
                <Check className="h-4 w-4" />
                Connected
              </div>
            )}
            
            {!isConnected && !isLoading && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-500">
                <X className="h-4 w-4" />
                Not connected
              </div>
            )}
            
            <Button 
              variant={isConnected ? "outline" : "default"}
              onClick={isConnected ? disconnectFromGoogleCalendar : connectToGoogleCalendar}
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
        
        {isConnected && (
          <>
            <div className="pt-2">
              <h3 className="text-base font-medium mb-3">Sync Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-new-tasks">Automatically sync new tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync newly created tasks to Google Calendar
                    </p>
                  </div>
                  <Switch 
                    id="sync-new-tasks" 
                    checked={syncNewTasks} 
                    onCheckedChange={setSyncNewTasks} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-task-updates">Sync task updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Update Google Calendar events when tasks are modified
                    </p>
                  </div>
                  <Switch 
                    id="sync-task-updates" 
                    checked={syncTaskUpdates} 
                    onCheckedChange={setSyncTaskUpdates} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-task-deletions">Sync task deletions</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove events from Google Calendar when tasks are deleted
                    </p>
                  </div>
                  <Switch 
                    id="sync-task-deletions" 
                    checked={syncTaskDeletions} 
                    onCheckedChange={setSyncTaskDeletions} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-calendar-events">Calendar notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for Google Calendar events
                    </p>
                  </div>
                  <Switch 
                    id="notify-calendar-events" 
                    checked={notifyOnCalendarEvents} 
                    onCheckedChange={setNotifyOnCalendarEvents} 
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-base font-medium mb-2">Calendar Summary</h3>
              <p className="text-sm text-muted-foreground">
                {calendarEvents.length > 0 
                  ? `You have ${calendarEvents.length} upcoming events in your calendar`
                  : 'No upcoming events in your calendar'}
              </p>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSaveSettings} disabled={!isConnected}>
          Save settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarSettings;
