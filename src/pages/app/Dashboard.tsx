
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Calendar, List, Filter, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { fetchTasks, Task, updateTask } from "@/services/taskService";
import { fetchProjects } from "@/services/projectService";
import { createNotification } from "@/services/notificationService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

interface DashboardStats {
  completedTasks: number;
  totalTasks: number;
  upcomingDeadlines: number;
  overdueDeadlines: number;
  projectProgress: number;
  recentActivity: {
    id: string;
    action: string;
    item: string;
    time: string;
  }[];
}

const Dashboard = () => {
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  // State for top priority tasks drag-and-drop
  const [topUrgentTasks, setTopUrgentTasks] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedPriorityIndex, setDraggedPriorityIndex] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Fetch tasks with React Query
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: isAuthenticated,
  });
  
  // Fetch projects with React Query
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: isAuthenticated,
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) => 
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });
  
  // Calculate dashboard stats
  const [stats, setStats] = useState<DashboardStats>({
    completedTasks: 0,
    totalTasks: 0,
    upcomingDeadlines: 0,
    overdueDeadlines: 0,
    projectProgress: 0,
    recentActivity: [],
  });

  // Extract all available tags from tasks
  const allTags = React.useMemo(() => {
    if (!tasks) return [];
    const tagSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => tag && tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet);
  }, [tasks]);
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Filter tasks based on selected tags if any
      const filteredTasks = selectedTags.length > 0
        ? tasks.filter(task => 
            task.tags && 
            Array.isArray(task.tags) && 
            selectedTags.some(tag => task.tags?.includes(tag))
          )
        : tasks;
      
      // Count completed and total tasks
      const completedTasks = filteredTasks.filter(task => task.status === "Completed").length;
      const totalTasks = filteredTasks.length;
      
      // Count upcoming and overdue deadlines
      const today = new Date();
      const upcomingDeadlines = filteredTasks.filter(task => {
        if (!task.due_date || task.status === "Completed") return false;
        const dueDate = new Date(task.due_date);
        const diff = differenceInDays(dueDate, today);
        return diff >= 0 && diff <= 7;
      }).length;
      
      const overdueDeadlines = filteredTasks.filter(task => {
        if (!task.due_date || task.status === "Completed") return false;
        const dueDate = new Date(task.due_date);
        return differenceInDays(dueDate, today) < 0;
      }).length;
      
      // Calculate project progress
      let projectProgress = 0;
      if (projects && projects.length > 0) {
        const projectWithMostTasks = projects.reduce((prev, current) => {
          const prevTaskCount = tasks.filter(t => t.project_id === prev.id).length;
          const currentTaskCount = tasks.filter(t => t.project_id === current.id).length;
          return currentTaskCount > prevTaskCount ? current : prev;
        });
        
        projectProgress = projectWithMostTasks.progress || 0;
      }
      
      // Recent activity based on task updates
      const recentActivity = filteredTasks
        .sort((a, b) => new Date(b.updated_at || "").getTime() - new Date(a.updated_at || "").getTime())
        .slice(0, 4)
        .map(task => ({
          id: task.id,
          action: task.status === "Completed" ? "Completed task" : (task.created_at === task.updated_at ? "Created task" : "Updated task"),
          item: task.title,
          time: formatTimeAgo(new Date(task.updated_at || task.created_at || "")),
        }));
      
      setStats({
        completedTasks,
        totalTasks,
        upcomingDeadlines,
        overdueDeadlines,
        projectProgress,
        recentActivity,
      });
      
      // Sort tasks by priority score and get top 5 for Top Priority Tasks section
      const sortedByPriority = [...filteredTasks].sort((a, b) => 
        (b.priorityScore || 0) - (a.priorityScore || 0)
      );
      setTopUrgentTasks(sortedByPriority.slice(0, 5));
    }
  }, [tasks, projects, selectedTags]);
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };
  
  const calculateCompletion = () => {
    return stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  };
  
  const handleQuickAction = async (action: string) => {
    try {
      if (action === "Add Task") {
        toggleDetailPanel();
        
        // Create notification for demo
        await createNotification({
          title: "Quick task created",
          message: "You've created a task from the dashboard",
          type: "info",
          date: new Date().toISOString(),
          task_id: null,
          priority: 1
        });
      }
      toast.success(`Action triggered: ${action}`);
    } catch (error) {
      console.error("Error in quick action:", error);
      toast.error("Error performing action");
    }
  };
  
  // Priority list drag handlers
  const handlePriorityDragStart = (e: React.DragEvent, index: number, taskId: string) => {
    setDraggedPriorityIndex(index);
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handlePriorityDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handlePriorityDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedPriorityIndex === null || draggedPriorityIndex === index) return;
    
    // Reorder top priority tasks
    const reorderedTasks = [...topUrgentTasks];
    const [movedTask] = reorderedTasks.splice(draggedPriorityIndex, 1);
    reorderedTasks.splice(index, 0, movedTask);
    
    // Update priorities based on new positions (5 = highest, 1 = lowest for top 5)
    const updatedTasks = reorderedTasks.map((task, idx) => {
      // Priority is inverse of position (first item has highest priority)
      const newPriority = 5 - idx;
      
      // Only update if priority changed
      if (task.priority !== newPriority) {
        updateTaskMutation.mutate({
          id: task.id,
          updates: { priority: newPriority }
        });
        // Update local state as well
        return {...task, priority: newPriority};
      }
      return task;
    });
    
    setTopUrgentTasks(updatedTasks);
    setDraggedPriorityIndex(null);
    setDraggedTaskId(null);
    
    toast.success("Task priority updated");
  };
  
  if (authLoading || tasksLoading || projectsLoading) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center animate-pulse">
        <List size={48} className="text-primary opacity-50" />
        <h2 className="text-2xl font-semibold text-muted-foreground">Loading dashboard...</h2>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center">
        <h2 className="text-2xl font-semibold">Please log in to view your dashboard</h2>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold tracking-tight">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Here's your productivity overview for today</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => handleQuickAction("Add Task")} className="animate-scale-in hover-scale">
            <Check className="mr-2 h-4 w-4" />
            Quick Task
          </Button>
        </div>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedTags.includes(tag) ? 'animate-pop' : ''
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && <span className="ml-1">✓</span>}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift animate-slide-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <Progress value={calculateCompletion()} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {calculateCompletion()}% complete
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift animate-slide-in [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Next 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift animate-slide-in [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.overdueDeadlines}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tasks past their due date
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift animate-slide-in [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectProgress}%</div>
            <Progress value={stats.projectProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {projects && projects[0]?.name || "Active Project"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Priority Tasks */}
        <Card className="gradient-border animate-fade-in">
          <CardHeader>
            <CardTitle>Top Priority Tasks</CardTitle>
            <CardDescription>Your highest priority tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topUrgentTasks.length > 0 ? (
                topUrgentTasks.map((task, index) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-md bg-secondary/20 cursor-pointer hover:bg-secondary/30"
                    onClick={() => toggleDetailPanel(task.id)}
                    draggable
                    onDragStart={(e) => handlePriorityDragStart(e, index, task.id)}
                    onDragOver={(e) => handlePriorityDragOver(e, index)}
                    onDrop={(e) => handlePriorityDrop(e, index)}
                    style={{ opacity: draggedPriorityIndex === index ? 0.5 : 1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className="rounded-full px-2.5 py-0.5"
                      >
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-muted-foreground">
                        {task.due_date ? format(new Date(task.due_date), 'MMM d') : "No due date"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No tasks found. Create your first task to see it here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="gradient-border animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-center justify-between p-2 rounded-md hover:bg-accent/5 cursor-pointer
                      ${index === 0 ? 'animate-pop [animation-delay:100ms]' : ''}
                      ${index === 1 ? 'animate-pop [animation-delay:200ms]' : ''}
                      ${index === 2 ? 'animate-pop [animation-delay:300ms]' : ''}
                      ${index === 3 ? 'animate-pop [animation-delay:400ms]' : ''}
                    `}
                    onClick={() => toggleDetailPanel(activity.id)}
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.action}: <span className="text-primary">{activity.item}</span></p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
