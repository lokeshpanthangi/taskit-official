import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '@/services/taskService';
import {
  loadGoogleIdentityServices,
  checkGoogleSignInStatus,
  signInToGoogle,
  signOutFromGoogle,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  trySilentSignIn
} from '@/integrations/google/googleCalendarService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './AuthContext';

interface GoogleCalendarContextType {
  isConnected: boolean;
  isLoading: boolean;
  connectToGoogleCalendar: () => Promise<void>;
  disconnectFromGoogleCalendar: () => Promise<void>;
  syncTaskToCalendar: (task: Task) => Promise<string | null>;
  updateTaskInCalendar: (eventId: string, task: Task) => Promise<void>;
  removeTaskFromCalendar: (eventId: string) => Promise<void>;
  calendarEvents: any[];
  refreshCalendarEvents: () => Promise<void>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (context === undefined) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};

interface GoogleCalendarProviderProps {
  children: ReactNode;
}

export const GoogleCalendarProvider: React.FC<GoogleCalendarProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
  // Initialize Google API client and check connection status
  useEffect(() => {
    const initGoogleCalendar = async () => {
      setIsLoading(true);
      let timeoutId: NodeJS.Timeout | null = null;
      try {
        // Set a 5-second timeout to force loading to false if not resolved
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Google Calendar connection timed out')), 5000);
        });
        await loadGoogleIdentityServices();
        const result: { isSignedIn: boolean, user: any } = await Promise.race([
          trySilentSignIn(),
          timeoutPromise
        ]);
        setIsConnected(result.isSignedIn);
        if (result.isSignedIn) {
          await refreshCalendarEvents();
        } else {
          localStorage.removeItem('google_calendar_connected');
        }
      } catch (error) {
        console.error('Google Calendar silent sign-in failed:', error);
        setIsConnected(false);
        localStorage.removeItem('google_calendar_connected');
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };
    initGoogleCalendar();
  }, []); // Only on mount, not on user change
  
  // Connect to Google Calendar
  const connectToGoogleCalendar = async () => {
    try {
      setIsLoading(true);
      
      // First load the Google API client
      await loadGoogleIdentityServices();
      
      // Then attempt to sign in
      const { isSignedIn } = await signInToGoogle();
      setIsConnected(isSignedIn);
      
      if (isSignedIn) {
        toast.success('Successfully connected to Google Calendar');
        await refreshCalendarEvents();
      } else {
        // This shouldn't happen if sign-in was successful, but just in case
        throw new Error('Failed to connect to Google Calendar: Sign-in status is false');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      
      // Provide more specific error messages based on the error
      if (error.message?.includes('popup_closed_by_user') || error.message?.includes('popup was closed')) {
        toast.error('Connection canceled: The authentication popup was closed');
      } else if (error.message?.includes('access_denied')) {
        toast.error('Connection failed: Calendar access was denied');
      } else if (error.message?.includes('network')) {
        toast.error('Connection failed: Please check your internet connection');
      } else {
        toast.error(`Failed to connect to Google Calendar: ${error.message || 'Unknown error'}`);
      }
      
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect from Google Calendar
  const disconnectFromGoogleCalendar = async () => {
    try {
      setIsLoading(true);
      await signOutFromGoogle();
      setIsConnected(false);
      setCalendarEvents([]);
      toast.success('Disconnected from Google Calendar');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error('Failed to disconnect from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sync a task to Google Calendar
  const syncTaskToCalendar = async (task: Task): Promise<string | null> => {
    if (!isConnected) {
      toast.error('Please connect to Google Calendar first');
      return null;
    }
    
    try {
      const eventId = await createCalendarEvent(task);
      toast.success('Task synced to Google Calendar');
      await refreshCalendarEvents();
      return eventId;
    } catch (error) {
      console.error('Error syncing task to calendar:', error);
      toast.error('Failed to sync task to Google Calendar');
      return null;
    }
  };
  
  // Update a task in Google Calendar
  const updateTaskInCalendar = async (eventId: string, task: Task) => {
    if (!isConnected) {
      toast.error('Please connect to Google Calendar first');
      return;
    }
    
    try {
      await updateCalendarEvent(eventId, task);
      toast.success('Calendar event updated');
      await refreshCalendarEvents();
    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast.error('Failed to update calendar event');
    }
  };
  
  // Remove a task from Google Calendar
  const removeTaskFromCalendar = async (eventId: string) => {
    if (!isConnected) {
      toast.error('Please connect to Google Calendar first');
      return;
    }
    
    try {
      await deleteCalendarEvent(eventId);
      toast.success('Calendar event removed');
      await refreshCalendarEvents();
    } catch (error) {
      console.error('Error removing calendar event:', error);
      toast.error('Failed to remove calendar event');
    }
  };
  
  // Refresh calendar events
  const refreshCalendarEvents = async () => {
    if (!isConnected) {
      return;
    }
    
    try {
      const events = await getCalendarEvents();
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };
  
  const value = {
    isConnected,
    isLoading,
    connectToGoogleCalendar,
    disconnectFromGoogleCalendar,
    syncTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar,
    calendarEvents,
    refreshCalendarEvents,
  };
  
  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};
