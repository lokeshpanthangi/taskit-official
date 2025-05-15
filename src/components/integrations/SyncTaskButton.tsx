import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/contexts/GoogleCalendarContext';
import { Task } from '@/services/taskService';
import { Calendar, Loader2, Check } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface SyncTaskButtonProps {
  task: Task;
}

const SyncTaskButton: React.FC<SyncTaskButtonProps> = ({ task }) => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  
  const {
    isConnected,
    syncTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar
  } = useGoogleCalendar();
  
  // Check if task is already synced with Google Calendar
  useEffect(() => {
    // We'll store the event ID in localStorage for simplicity
    // In a real app, you might want to store this in your database
    const storedEventId = localStorage.getItem(`gcal_event_${task.id}`);
    if (storedEventId) {
      setEventId(storedEventId);
      setIsSynced(true);
    }
  }, [task.id]);
  
  const handleSyncTask = async () => {
    if (!isConnected) {
      toast.error('Please connect to Google Calendar first in Settings');
      return;
    }
    
    setIsSyncing(true);
    
    try {
      if (isSynced && eventId) {
        // Update existing event
        await updateTaskInCalendar(eventId, task);
        toast.success('Task updated in Google Calendar');
      } else {
        // Create new event
        const newEventId = await syncTaskToCalendar(task);
        if (newEventId) {
          setEventId(newEventId);
          setIsSynced(true);
          // Store the event ID in localStorage
          localStorage.setItem(`gcal_event_${task.id}`, newEventId);
        }
      }
    } catch (error) {
      console.error('Error syncing task with Google Calendar:', error);
      toast.error('Failed to sync task with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleRemoveSync = async () => {
    if (!isConnected || !eventId) {
      return;
    }
    
    setIsSyncing(true);
    
    try {
      await removeTaskFromCalendar(eventId);
      setEventId(null);
      setIsSynced(false);
      // Remove the event ID from localStorage
      localStorage.removeItem(`gcal_event_${task.id}`);
      toast.success('Task removed from Google Calendar');
    } catch (error) {
      console.error('Error removing task from Google Calendar:', error);
      toast.error('Failed to remove task from Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground"
        onClick={() => toast.info('Connect to Google Calendar in Settings')}
      >
        <Calendar className="h-4 w-4" />
        <span>Sync to Calendar</span>
      </Button>
    );
  }
  
  return (
    <>
      {isSynced ? (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
          onClick={handleSyncTask}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Synced to Calendar</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleSyncTask}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span>Sync to Calendar</span>
            </>
          )}
        </Button>
      )}
      
      {isSynced && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-destructive"
          onClick={handleRemoveSync}
          disabled={isSyncing}
        >
          Remove sync
        </Button>
      )}
    </>
  );
};

export default SyncTaskButton;
