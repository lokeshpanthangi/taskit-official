
import { Button } from "@/components/ui/button";
import { X, Star, Calendar, CheckCircle, Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface SubtaskType {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

// Mock task data
const mockTasks = [
  {
    id: "task-1",
    title: "Website Redesign Project",
    description: "Complete overhaul of the company website with new branding, messaging, and improved user experience.",
    status: "In Progress",
    priority: 5,
    dueDate: "2025-06-15",
    project: "Website Redesign",
    assignedTo: "Demo User",
    subtasks: [
      { id: "sub-1", title: "Create wireframes", completed: true },
      { id: "sub-2", title: "Get design approval", completed: false },
      { id: "sub-3", title: "Implement HTML/CSS", completed: false },
      { id: "sub-4", title: "Test responsiveness", completed: false },
    ],
    parentId: null
  },
  {
    id: "task-1-1",
    title: "Design new homepage layout",
    description: "Create wireframes and mockups for the new homepage based on company brand guidelines",
    status: "Completed",
    priority: 4,
    dueDate: "2025-06-01",
    project: "Website Redesign",
    assignedTo: "Demo User",
    subtasks: [
      { id: "sub-5", title: "Research competitors", completed: true },
      { id: "sub-6", title: "Create wireframe", completed: true },
      { id: "sub-7", title: "Design mockup", completed: true },
    ],
    parentId: "task-1"
  },
  // ... add more tasks matching the structure in the Tasks.tsx component
];

const TaskDetailPanel = ({ taskId, onClose }: TaskDetailPanelProps) => {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subtasks, setSubtasks] = useState<SubtaskType[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [childTasks, setChildTasks] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch the task data from an API
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const foundTask = mockTasks.find(t => t.id === taskId);
        setTask(foundTask || null);
        
        if (foundTask?.subtasks) {
          setSubtasks(foundTask.subtasks);
        }
        
        // Find child tasks
        const children = mockTasks.filter(t => t.parentId === taskId);
        setChildTasks(children);
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

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks(prev =>
      prev.map(subtask =>
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed } 
          : subtask
      )
    );
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskItem = {
        id: `sub-${Date.now()}`,
        title: newSubtask.trim(),
        completed: false
      };
      setSubtasks([...subtasks, newSubtaskItem]);
      setNewSubtask("");
    }
  };

  const calculateProgress = () => {
    if (!subtasks.length) return 0;
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / subtasks.length) * 100;
  };

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
          <span className={`priority-tag priority-${task.priority === 5 ? 'urgent' : task.priority >= 4 ? 'high' : task.priority >= 3 ? 'medium' : 'low'}`}>
            {task.priority === 5 ? 'Urgent' : task.priority === 4 ? 'High' : task.priority === 3 ? 'Medium' : task.priority === 2 ? 'Low' : 'Very Low'} Priority
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-medium mb-2">{task.title}</h2>
        
        <div className="space-y-6">
          {/* Priority stars */}
          <div className="flex">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={value <= task.priority ? "text-priority-high fill-priority-high" : "text-muted"}
              />
            ))}
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
            <p className="text-sm">{task.description}</p>
          </div>
          
          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {/* Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${task.status === "Completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                  task.status === "In Progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : 
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
              >
                {task.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date set"}
              </span>
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
          
          {/* Child Tasks */}
          {childTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Child Tasks</h3>
              <ul className="space-y-2">
                {childTasks.map(childTask => (
                  <li key={childTask.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <CheckCircle 
                      className={`h-4 w-4 ${childTask.status === "Completed" ? "text-green-500" : "text-muted-foreground"}`}
                      fill={childTask.status === "Completed" ? "currentColor" : "none"}
                    />
                    <span className={`text-sm ${childTask.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                      {childTask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Subtasks */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Subtasks</h3>
            <ul className="space-y-2">
              {subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={subtask.completed} 
                    onChange={() => handleSubtaskToggle(subtask.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={handleAddSubtask} size="sm">Add</Button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" className="flex-1">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
