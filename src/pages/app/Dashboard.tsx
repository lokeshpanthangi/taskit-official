
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Mock data for dashboard
const priorityTasks = [
  {
    id: "task-1",
    title: "Redesign landing page",
    dueDate: "2025-06-15",
    project: "Website Redesign",
    priority: "high",
  },
  {
    id: "task-2",
    title: "Create content plan for Q3",
    dueDate: "2025-06-10",
    project: "Marketing Campaign",
    priority: "urgent",
  },
  {
    id: "task-3",
    title: "Review product specifications",
    dueDate: "2025-06-05",
    project: "Product Launch",
    priority: "medium",
  },
  {
    id: "task-4",
    title: "Prepare investor presentation",
    dueDate: "2025-06-20",
    project: "Funding Round",
    priority: "high",
  },
  {
    id: "task-5",
    title: "Update team documentation",
    dueDate: "2025-06-22",
    project: "Team Onboarding",
    priority: "low",
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  
  // Calculate days remaining format
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days remaining`;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +4 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center space-x-2">
              <Progress value={52} className="h-2" />
              <div className="text-xs text-muted-foreground">52%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-priority-high" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Due within 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 in progress, 1 completed
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Priority Tasks */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Priority Tasks</CardTitle>
                <CardDescription>Tasks requiring your attention</CardDescription>
              </div>
              <Button size="sm">View all tasks</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityTasks.map((task) => (
                <div key={task.id} className="task-container flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {task.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-priority-urgent" />}
                      <h3 className="font-medium text-base">{task.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.project}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`priority-tag priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {getDaysRemaining(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
