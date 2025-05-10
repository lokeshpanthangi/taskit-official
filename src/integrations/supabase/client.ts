
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bndpgmsiabrvnlsplvqr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHBnbXNpYWJydm5sc3BsdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4OTUxNTUsImV4cCI6MjA2MjQ3MTE1NX0.6xPxG2KVpBbNOpt0_JHDl6RAmBA89OXkCI5A8e-Cpmo";

// Define generic types for our database tables
export type Tables = {
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  projects: {
    id: string;
    name: string;
    description: string | null;
    progress: number;
    start_date: string;
    due_date: string;
    user_id: string;
    tags: string[];
    created_at: string;
  };
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: number;
    due_date: string | null;
    project_id: string | null;
    parent_id: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
    task_id: string;
    created_at: string;
  };
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    date: string;
    task_id: string | null;
    priority: number | null;
    user_id: string;
  };
};

// Create client with generic types
export const supabase = createClient<{
  schema: {
    public: {
      Tables: {
        profiles: {
          Row: Tables['profiles'];
          Insert: Partial<Tables['profiles']>;
          Update: Partial<Tables['profiles']>;
        };
        projects: {
          Row: Tables['projects'];
          Insert: Partial<Tables['projects']>;
          Update: Partial<Tables['projects']>;
        };
        tasks: {
          Row: Tables['tasks'];
          Insert: Partial<Tables['tasks']>;
          Update: Partial<Tables['tasks']>;
        };
        subtasks: {
          Row: Tables['subtasks'];
          Insert: Partial<Tables['subtasks']>;
          Update: Partial<Tables['subtasks']>;
        };
        notifications: {
          Row: Tables['notifications'];
          Insert: Partial<Tables['notifications']>;
          Update: Partial<Tables['notifications']>;
        };
      };
    };
  };
}>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
