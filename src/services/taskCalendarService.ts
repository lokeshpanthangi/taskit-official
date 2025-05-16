// Task Calendar Service - Handles integration between tasks and Google Calendar
import { Task, updateTask } from './taskService';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  checkGoogleSignInStatus
} from '@/integrations/google/googleCalendarService';
import { toast } from '@/components/ui/sonner';

// Store event IDs in localStorage for simplicity
// In a production app, you would store this in your database
const getEventIdForTask = (taskId: string): string | null => {
  return localStorage.getItem(`gcal_event_${taskId}`);
};

const setEventIdForTask = (taskId: string, eventId: string): void => {
  localStorage.setItem(`gcal_event_${taskId}`, eventId);
};

const removeEventIdForTask = (taskId: string): void => {
  localStorage.removeItem(`gcal_event_${taskId}`);
};

// Get sync settings from localStorage
const getSyncSettings = () => {
  const settingsJson = localStorage.getItem('googleCalendarSettings');
  if (!settingsJson) {
    return {
      syncNewTasks: false,
      syncTaskUpdates: false,
      syncTaskDeletions: false,
      notifyOnCalendarEvents: true
    };
  }
  
  return JSON.parse(settingsJson);
};

// Sync a task to Google Calendar
export const syncTaskToCalendar = async (task: Task): Promise<string | null> => {
  try {
    if (!checkGoogleSignInStatus()) {
      toast.error('Google Calendar not connected, skipping sync');
      console.log('Google Calendar not connected, skipping sync');
      return null;
    }
    const existingEventId = getEventIdForTask(task.id);
    if (existingEventId) {
      try {
        await updateCalendarEvent(existingEventId, task);
        console.log('Updated calendar event for task:', task.id);
        return existingEventId;
      } catch (error: any) {
        // If update fails with 404, remove the event ID and try to create a new event
        if (error.message && error.message.includes('Failed to update event')) {
          removeEventIdForTask(task.id);
          // Try to create a new event
          const eventId = await createCalendarEvent(task);
          if (eventId) {
            setEventIdForTask(task.id, eventId);
            console.log('Created calendar event for task after failed update:', task.id);
          }
          return eventId;
        } else {
          throw error;
        }
      }
    } else {
      const eventId = await createCalendarEvent(task);
      if (eventId) {
        setEventIdForTask(task.id, eventId);
        console.log('Created calendar event for task:', task.id);
      }
      return eventId;
    }
  } catch (error) {
    console.error('Error syncing task to calendar:', error);
    toast.error('Error syncing task to Google Calendar');
    return null;
  }
};

// Update a task in Google Calendar
export const updateTaskInCalendar = async (task: Task): Promise<void> => {
  try {
    const settings = getSyncSettings();
    if (!settings.syncTaskUpdates) {
      console.log('Task updates sync disabled, skipping');
      return;
    }
    
    // Check if Google Calendar is connected
    if (!checkGoogleSignInStatus()) {
      console.log('Google Calendar not connected, skipping update');
      return;
    }
    
    const eventId = getEventIdForTask(task.id);
    if (eventId) {
      await updateCalendarEvent(eventId, task);
      console.log('Updated calendar event for task:', task.id);
    }
  } catch (error) {
    console.error('Error updating task in calendar:', error);
  }
};

// Remove a task from Google Calendar
export const removeTaskFromCalendar = async (taskId: string): Promise<void> => {
  try {
    const settings = getSyncSettings();
    if (!settings.syncTaskDeletions) {
      console.log('Task deletions sync disabled, skipping');
      return;
    }
    
    // Check if Google Calendar is connected
    if (!checkGoogleSignInStatus()) {
      console.log('Google Calendar not connected, skipping removal');
      return;
    }
    
    const eventId = getEventIdForTask(taskId);
    if (eventId) {
      await deleteCalendarEvent(eventId);
      removeEventIdForTask(taskId);
      console.log('Removed calendar event for task:', taskId);
    }
  } catch (error) {
    console.error('Error removing task from calendar:', error);
  }
};

// Auto-sync a new task to Google Calendar if enabled in settings
export const autoSyncNewTask = async (task: Task): Promise<void> => {
  try {
    const settings = getSyncSettings();
    if (!settings.syncNewTasks) {
      console.log('New tasks sync disabled, skipping auto-sync');
      return;
    }
    const eventId = await syncTaskToCalendar(task);
    if (!eventId) {
      toast.error('Failed to sync new task to Google Calendar');
    }
  } catch (error) {
    console.error('Error auto-syncing new task:', error);
    toast.error('Error auto-syncing new task to Google Calendar');
  }
};

// Mark a task as synced with Google Calendar
export const markTaskAsSynced = async (taskId: string, eventId: string): Promise<void> => {
  try {
    setEventIdForTask(taskId, eventId);
    
    // You could also update the task in your database to store the event ID
    // For example:
    // await updateTask(taskId, { google_calendar_event_id: eventId });
  } catch (error) {
    console.error('Error marking task as synced:', error);
  }
};

// Check if a task is synced with Google Calendar
export const isTaskSynced = (taskId: string): boolean => {
  return !!getEventIdForTask(taskId);
};
