import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

export type TaskStatus = "Not Started" | "In Progress" | "Completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  due_date?: string;
  project_id?: string;
  parent_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  children?: Task[];
  priorityScore?: number;
  project?: string;
  tags?: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  task_id: string;
  created_at?: string;
}

export const fetchTasks = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  console.log("Fetching tasks for user:", user.id); // Debug log
  
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      projects(id, name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
  
  console.log("Fetched tasks count:", data?.length); // Debug log
  
  // Calculate priority scores
  const tasksWithScores = data?.map(task => {
    const projectName = task.projects?.name;
    
    // Calculate priority score
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    let priorityScore = task.priority || 3; // Default priority weight
    
    if (dueDate) {
      const daysUntilDue = differenceInDays(dueDate, new Date());
      if (daysUntilDue < 0) {
        // Overdue tasks get highest priority
        priorityScore = priorityScore * 10;
      } else {
        // Formula: weight * (10 / (daysUntilDue + 1)) - higher weight and fewer days = higher score
        priorityScore = priorityScore * (10 / (daysUntilDue + 1));
      }
    }
    
    return {
      ...task,
      project: projectName,
      priorityScore: Math.round(priorityScore * 10) / 10
    };
  }) || [];
  
  return tasksWithScores as Task[];
};

export const fetchTask = async (taskId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      projects(name)
    `)
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();
    
  if (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
  
  return {
    ...data,
    project: data.projects?.name
  } as Task;
};

export const createTask = async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...task,
      user_id: user.id,
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  
  return data as Task;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }
  
  return data as Task;
};

export const deleteTask = async (taskId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First, find any child tasks and update them to remove the parent_id
  const { data: childTasks, error: childrenError } = await supabase
    .from("tasks")
    .select("id")
    .eq("parent_id", taskId)
    .eq("user_id", user.id);
    
  if (childrenError) {
    console.error("Error finding child tasks:", childrenError);
    throw childrenError;
  }
  
  // Update all child tasks to remove parent_id reference
  if (childTasks && childTasks.length > 0) {
    const childIds = childTasks.map(task => task.id);
    
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ parent_id: null })
      .in("id", childIds);
      
    if (updateError) {
      console.error("Error updating child tasks:", updateError);
      throw updateError;
    }
  }
  
  // First verify the task belongs to the current user
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();
    
  if (taskError || !taskData) {
    console.error("Error verifying task ownership:", taskError);
    throw new Error("Task not found or not authorized");
  }
  
  // Delete all subtasks
  const { error: subtasksError } = await supabase
    .from("subtasks")
    .delete()
    .eq("task_id", taskId);
    
  if (subtasksError) {
    console.error("Error deleting subtasks:", subtasksError);
    throw subtasksError;
  }
  
  // Finally delete the task
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
  
  return true;
};

// Handle removing a task from being a subtask (but not deleting it)
export const removeTaskFromParent = async (taskId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("tasks")
    .update({
      parent_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select()
    .single();
    
  if (error) {
    console.error("Error removing task from parent:", error);
    throw error;
  }
  
  return data as Task;
};

// Subtasks management
export const fetchSubtasks = async (taskId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First verify the task belongs to the current user
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();
    
  if (taskError || !taskData) {
    console.error("Error verifying task ownership:", taskError);
    throw new Error("Task not found or not authorized");
  }
  
  const { data, error } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
    
  if (error) {
    console.error("Error fetching subtasks:", error);
    throw error;
  }
  
  return data as Subtask[];
};

export const createSubtask = async (subtask: Omit<Subtask, "id" | "created_at">) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First verify the task belongs to the current user
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", subtask.task_id)
    .eq("user_id", user.id)
    .single();
    
  if (taskError || !taskData) {
    console.error("Error verifying task ownership:", taskError);
    throw new Error("Task not found or not authorized");
  }
  
  const { data, error } = await supabase
    .from("subtasks")
    .insert(subtask)
    .select()
    .single();
    
  if (error) {
    console.error("Error creating subtask:", error);
    throw error;
  }
  
  return data as Subtask;
};

export const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First get the subtask to find its task_id
  const { data: subtaskData, error: subtaskError } = await supabase
    .from("subtasks")
    .select("task_id")
    .eq("id", subtaskId)
    .single();
    
  if (subtaskError || !subtaskData) {
    console.error("Error finding subtask:", subtaskError);
    throw new Error("Subtask not found");
  }
  
  // Then verify the task belongs to the current user
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", subtaskData.task_id)
    .eq("user_id", user.id)
    .single();
    
  if (taskError || !taskData) {
    console.error("Error verifying task ownership:", taskError);
    throw new Error("Task not found or not authorized");
  }
  
  const { data, error } = await supabase
    .from("subtasks")
    .update(updates)
    .eq("id", subtaskId)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating subtask:", error);
    throw error;
  }
  
  return data as Subtask;
};

export const deleteSubtask = async (subtaskId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  // First get the subtask to find its task_id
  const { data: subtaskData, error: subtaskError } = await supabase
    .from("subtasks")
    .select("task_id")
    .eq("id", subtaskId)
    .single();
    
  if (subtaskError || !subtaskData) {
    console.error("Error finding subtask:", subtaskError);
    throw new Error("Subtask not found");
  }
  
  // Then verify the task belongs to the current user
  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", subtaskData.task_id)
    .eq("user_id", user.id)
    .single();
    
  if (taskError || !taskData) {
    console.error("Error verifying task ownership:", taskError);
    throw new Error("Task not found or not authorized");
  }
  
  const { error } = await supabase
    .from("subtasks")
    .delete()
    .eq("id", subtaskId);
    
  if (error) {
    console.error("Error deleting subtask:", error);
    throw error;
  }
  
  return true;
};

export const fetchTasksByProject = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching project tasks:", error);
    throw error;
  }
  
  return data as Task[];
};

export const buildTaskHierarchy = (allTasks: Task[]) => {
  const taskMap = new Map<string, Task>();
  const rootTasks: Task[] = [];
  
  // First pass: Add all tasks to the map
  allTasks.forEach(task => {
    // Create a new object that will hold children
    taskMap.set(task.id, { ...task, children: [] });
  });
  
  // Second pass: Establish parent-child relationships
  allTasks.forEach(task => {
    const taskWithChildren = taskMap.get(task.id);
    
    if (taskWithChildren) {
      if (task.parent_id && taskMap.has(task.parent_id)) {
        // Add this task as a child to its parent
        const parent = taskMap.get(task.parent_id);
        if (parent && parent.children) {
          parent.children.push(taskWithChildren);
        }
      } else {
        // This is a root task (no parent)
        rootTasks.push(taskWithChildren);
      }
    }
  });
  
  return rootTasks;
};
