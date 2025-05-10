
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

// Mock task data
const mockTask = {
  id: "task-1",
  title: "Redesign landing page",
  description: "Update the landing page with new branding and messaging",
  status: "In Progress",
  priority: "high",
  dueDate: "2025-06-15",
  project: "Website Redesign",
  assignedTo: "Demo User",
  subtasks: [
    { id: "sub-1", title: "Create wireframes", completed: true },
    { id: "sub-2", title: "Get design approval", completed: false },
    { id: "sub-3", title: "Implement HTML/CSS", completed: false },
  ]
};

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

const TaskDetailPanel = ({ taskId, onClose }: TaskDetailPanelProps) => {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch the task data from an API
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setTask(mockTask);
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="w-96 border-l overflow-y-auto p-6 bg-background">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-24 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-96 border-l overflow-y-auto p-6 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Task Not Found</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">The requested task could not be found.</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l overflow-y-auto bg-background">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <span className={`priority-tag priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-medium mb-2">{task.title}</h2>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
            <p className="text-sm">{task.description}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">{task.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Project</span>
              <span className="text-sm font-medium">{task.project}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Assigned To</span>
              <span className="text-sm font-medium">{task.assignedTo}</span>
            </div>
          </div>
          
          {/* Subtasks */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Subtasks</h3>
            <ul className="space-y-2">
              {task.subtasks.map((subtask: any) => (
                <li key={subtask.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={subtask.completed} 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{subtask.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
