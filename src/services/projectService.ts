
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  start_date: string;
  due_date: string;
  user_id: string;
  tags: string[];
  created_at?: string;
  priority: number;
}

export const fetchProjects = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
  
  return data as Project[];
};

export const fetchProject = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
    
  if (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
  
  return data as Project;
};

export const createProject = async (project: Omit<Project, "id" | "user_id" | "created_at" | "progress">) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...project,
      progress: 0,
      user_id: user.id,
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }
  
  return data as Project;
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating project:", error);
    throw error;
  }
  
  return data as Project;
};

export const deleteProject = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First, verify project ownership
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
    
  if (projectError || !projectData) {
    console.error("Error verifying project ownership:", projectError);
    throw new Error("Project not found or not authorized");
  }
  
  // Delete all tasks associated with this project
  const { error: tasksError } = await supabase
    .from("tasks")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", user.id);
    
  if (tasksError) {
    console.error("Error deleting project tasks:", tasksError);
    throw tasksError;
  }
  
  // Then delete the project
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
  
  return true;
};

export const calculateProjectProgress = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First, verify project ownership
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();
    
  if (projectError || !projectData) {
    console.error("Error verifying project ownership:", projectError);
    throw new Error("Project not found or not authorized");
  }
  
  // Get tasks for this project
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId)
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error calculating project progress:", error);
    throw error;
  }
  
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === "Completed").length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  
  // Update project progress
  await updateProject(projectId, { progress });
  
  return progress;
};
