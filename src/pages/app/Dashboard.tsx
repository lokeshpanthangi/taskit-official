
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Check, Calendar, List, Filter, Clock } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useTheme } from "next-themes";

// Mock data - in a real app, this would come from your backend
const mockStats = {
  completedTasks: 24,
  totalTasks: 36,
  upcomingDeadlines: 5,
  overdueDeadlines: 2,
  projectProgress: 67,
  recentActivity: [
    { id: 1, action: "Completed task", item: "Design new homepage layout", time: "2 hours ago" },
    { id: 2, action: "Created task", item: "Q3 Marketing Campaign", time: "5 hours ago" },
    { id: 3, action: "Updated task", item: "Mobile layout optimization", time: "Yesterday" },
    { id: 4, action: "Commented on", item: "Content migration", time: "2 days ago" },
  ]
};

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Dashboard = () => {
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const calculateCompletion = () => {
    return Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100);
  };
  
  const handleQuickAction = (action: string) => {
    toast.success(`Action triggered: ${action}`);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center animate-pulse">
        <LayoutDashboard size={48} className="text-primary opacity-50" />
        <h2 className="text-2xl font-semibold text-muted-foreground">Loading dashboard...</h2>
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
              {mockStats.completedTasks}/{mockStats.totalTasks}
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
            <div className="text-2xl font-bold">{mockStats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Next: Website Redesign (3 days)
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
              {mockStats.overdueDeadlines}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Oldest: Content Migration (2 days)
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-lift animate-slide-in [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.projectProgress}%</div>
            <Progress value={mockStats.projectProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Website Redesign Project
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
              {mockStats.recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-accent/5 cursor-pointer
                    ${index === 0 ? 'animate-pop [animation-delay:100ms]' : ''}
                    ${index === 1 ? 'animate-pop [animation-delay:200ms]' : ''}
                    ${index === 2 ? 'animate-pop [animation-delay:300ms]' : ''}
                    ${index === 3 ? 'animate-pop [animation-delay:400ms]' : ''}
                  `}
                  onClick={() => toggleDetailPanel("task-1")}
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}: <span className="text-primary">{activity.item}</span></p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-accent/10">
                    View
                  </Button>
                </div>
              ))}
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
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-accent/10 animate-scale-in"
                onClick={() => window.location.href = "/tasks"}
              >
                <List size={24} />
                <span>My Tasks</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-accent/10 animate-scale-in [animation-delay:100ms]"
                onClick={() => window.location.href = "/calendar"}
              >
                <Calendar size={24} />
                <span>Calendar</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-accent/10 animate-scale-in [animation-delay:200ms]"
                onClick={() => window.location.href = "/projects"}
              >
                <Filter size={24} />
                <span>Projects</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2 hover:bg-accent/10 animate-scale-in [animation-delay:300ms]"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={24} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={24} />
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

// Add Sun and Moon icons at the end of the file
function Sun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
      width="24"
      height="24"
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
