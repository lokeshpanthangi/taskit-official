// Google Calendar Integration Service
import { Task } from "@/services/taskService";

// Google API configuration
const API_KEY = "AIzaSyAcuKgkBPQMCncJwCueHZXr8XEeLw1PTpE";
const CLIENT_ID = "132992067103-b06eq4u8npb8id5gmqk0elumvnregr1r.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar";

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use appropriate redirect URI based on environment
const REDIRECT_URI = isDevelopment 
  ? `${window.location.protocol}//${window.location.host}${window.location.pathname}` 
  : "https://taskit-official.onrender.com/";

// Type definitions
interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

interface GoogleAuthState {
  isSignedIn: boolean;
  user: any;
}

// 1. Remove all gapi.auth2 and gapi.client.init logic.
// 2. Add GIS script loader and token client initialization:
let accessToken = null;
let tokenClient = null;

// Store and retrieve access token and connection state from localStorage
const ACCESS_TOKEN_KEY = 'google_calendar_access_token';
const CONNECTED_FLAG_KEY = 'google_calendar_connected';

function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(CONNECTED_FLAG_KEY, 'true');
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(CONNECTED_FLAG_KEY);
  }
}

function getAccessToken() {
  if (accessToken) return accessToken;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) accessToken = token;
  return accessToken;
}

export const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
};

export const initTokenClient = () => {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) return;
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
    },
  });
};

export const signInToGoogle = async (prompt = 'consent') => {
  await loadGoogleIdentityServices();
  initTokenClient();
  return new Promise((resolve, reject) => {
    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        setAccessToken(tokenResponse.access_token);
        resolve({ isSignedIn: true, user: null });
      } else {
        setAccessToken(null);
        reject(new Error('Failed to get access token'));
      }
    };
    tokenClient.requestAccessToken({ prompt });
  });
};

export const trySilentSignIn = async (): Promise<{ isSignedIn: boolean, user: any }> => {
  await loadGoogleIdentityServices();
  initTokenClient();
  return new Promise((resolve, reject) => {
    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        setAccessToken(tokenResponse.access_token);
        resolve({ isSignedIn: true, user: null });
      } else {
        setAccessToken(null);
        resolve({ isSignedIn: false, user: null });
      }
    };
    tokenClient.requestAccessToken({ prompt: 'none' });
  });
};

export const signOutFromGoogle = async () => {
  setAccessToken(null);
};

export const checkGoogleSignInStatus = () => {
  return !!getAccessToken() && localStorage.getItem(CONNECTED_FLAG_KEY) === 'true';
};

// Update all calendar API calls to use fetch with the accessToken
export const createCalendarEvent = async (task) => {
  if (!getAccessToken()) await signInToGoogle();
  const event = taskToCalendarEvent(task);
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to create event');
  return data.id;
};

export const updateCalendarEvent = async (eventId, task) => {
  if (!accessToken) await signInToGoogle();
  const event = taskToCalendarEvent(task);
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error('Failed to update event');
};

export const deleteCalendarEvent = async (eventId) => {
  if (!accessToken) await signInToGoogle();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete event');
};

export const getCalendarEvents = async (timeMin, timeMax) => {
  if (!accessToken) await signInToGoogle();
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    timeMin: (timeMin || now).toISOString(),
    timeMax: (timeMax || thirtyDaysLater).toISOString(),
    showDeleted: 'false',
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch events');
  return data.items;
};

// Convert a task to a Google Calendar event
export const taskToCalendarEvent = (task: Task): GoogleCalendarEvent => {
  // Default duration for tasks without specific times (1 hour)
  const defaultDuration = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Set start time to the due date at 9 AM if only date is provided
  const dueDate = task.due_date ? new Date(task.due_date) : new Date();
  if (!task.due_date) {
    // If no due date, set to tomorrow at 9 AM
    dueDate.setDate(dueDate.getDate() + 1);
  }
  
  // Set time to 9 AM if not specified
  if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
    dueDate.setHours(9, 0, 0, 0);
  }
  
  // Calculate end time (start time + 1 hour by default)
  const endDate = new Date(dueDate.getTime() + defaultDuration);
  
  // Get user's timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    summary: task.title,
    description: task.description || `Task priority: ${task.priority}`,
    start: {
      dateTime: dueDate.toISOString(),
      timeZone: timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 24 * 60 }, // 1 day before
      ],
    },
  };
};

// Declare gapi in the window object
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
