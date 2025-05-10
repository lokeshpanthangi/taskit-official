
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter } from "lucide-react";
import { useOutletContext } from "react-router-dom";

// Mock data for tasks
const mockTasks = [
  {
    id: "task-1",
    title: "Redesign landing page",
    description: "Update the landing page with new branding and messaging",
    status: "In Progress",
    priority: "high",
    dueDate: "2025-06-15",
    project: "Website Redesign",
  },
  {
    id: "task-2",
    title: "Create content plan for Q3",
    description: "Develop content strategy and editorial calendar for Q3",
    status: "Not Started",
    priority: "urgent",
    dueDate: "2025-06-10",
    project: "Marketing Campaign",
  },
  {
    id: "task-3",
    title: "Review product specifications",
    description: "Review and approve final product specifications before development",
    status: "Not Started",
    priority: "medium",
    dueDate: "2025-06-05",
    project: "Product Launch",
  },
  {
    id: "task-4",
    title: "Prepare investor presentation",
    description: "Create slides and talking points for investor meeting",
    status: "In Progress",
    priority: "high",
    dueDate: "2025-06-20",
    project: "Funding Round",
  },
  {
    id: "task-5",
    title: "Update team documentation",
    description: "Review and update onboarding documentation for new hires",
    status: "Completed",
    priority: "low",
    dueDate: "2025-06-22",
    project: "Team Onboarding",
  },
  {
    id: "task-6",
    title: "Test new features",
    description: "Conduct user testing for new product features",
    status: "In Progress",
    priority: "medium",
    dueDate: "2025-06-25",
    project: "Product Launch",
  }
];

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Tasks = () => {
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter tasks based on search query
  const filteredTasks = mockTasks.filter(
    (task) => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">View and manage all your tasks</p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="py-3">
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="task-container cursor-pointer"
                    onClick={() => toggleDetailPanel(task.id)}
                  >
                    <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-base">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {task.project}
                        </span>
                        <span className={`priority-tag priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found. Try a different search term.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;
