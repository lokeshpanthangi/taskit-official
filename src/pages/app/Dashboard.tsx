import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Check, Calendar, List, Filter, Clock } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useTheme } from "next-themes";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { fetchTasks, Task } from "@/services/taskService";
import { fetchProjects } from "@/services/projectService";
import { createNotification } from "@/services/notificationService";
import { useQuery } from "@tanstack/react-query";

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
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  
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
  
  // Calculate dashboard stats
  const [stats, setStats] = useState<DashboardStats>({
    completedTasks: 0,
    totalTasks: 0,
    upcomingDeadlines: 0,
    overdueDeadlines: 0,
    projectProgress: 0,
    recentActivity: [],
  });
  
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Count completed and total tasks
      const completedTasks = tasks.filter(task => task.status === "Completed").length;
      const totalTasks = tasks.length;
      
      // Count upcoming and overdue deadlines
      const today = new Date();
      const upcomingDeadlines = tasks.filter(task => {
        if (!task.due_date || task.status === "Completed") return false;
        const dueDate = new Date(task.due_date);
        const diff = differenceInDays(dueDate, today);
        return diff >= 0 && diff <= 7;
      }).length;
      
      const overdueDeadlines = tasks.filter(task => {
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
      const recentActivity = tasks
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
    }
  }, [tasks, projects]);
  
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
        
        // Create notification for demo - fix the type issue
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
  
  if (authLoading || tasksLoading || projectsLoading) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center animate-pulse">
        <LayoutDashboard size={48} className="text-primary opacity-50" />
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
        
        {/* Quick Links */}
        <Card className="gradient-border animate-fade-in">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Frequently used tools and pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-primary/10 animate-scale-in quick-access-button"
                onClick={() => window.location.href = "/tasks"}
              >
                <List size={24} />
                <span>My Tasks</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-primary/10 animate-scale-in [animation-delay:100ms] quick-access-button"
                onClick={() => window.location.href = "/calendar"}
              >
                <Calendar size={24} />
                <span>Calendar</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-primary/10 animate-scale-in [animation-delay:200ms] quick-access-button"
                onClick={() => window.location.href = "/projects"}
              >
                <Filter size={24} />
                <span>Projects</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-primary/10 animate-scale-in [animation-delay:300ms] quick-access-button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun width={24} height={24} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon width={24} height={24} />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function Sun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function Moon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export default Dashboard;
