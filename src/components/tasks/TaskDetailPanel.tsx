
import { Button } from "@/components/ui/button";
import { X, Star, Calendar, CheckCircle, Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { fetchSubtasks, updateSubtask, createSubtask, Subtask } from "@/services/taskService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

const TaskDetailPanel = ({ taskId, onClose }: TaskDetailPanelProps) => {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubtask, setNewSubtask] = useState("");
  const [childTasks, setChildTasks] = useState<any[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch subtasks with React Query
  const { data: subtasks, isLoading: subtasksLoading } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => fetchSubtasks(taskId!),
    enabled: !!taskId,
  });
  
  // Create subtask mutation
  const createSubtaskMutation = useMutation({
    mutationFn: createSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      setNewSubtask("");
      toast.success("Subtask added");
    },
  });
  
  // Update subtask mutation
  const updateSubtaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Subtask> }) => 
      updateSubtask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });
  
  useEffect(() => {
    // Fetch task details
    const fetchTaskDetails = async () => {
      if (!taskId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch the task
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select(`
            *,
            projects(name)
          `)
          .eq("id", taskId)
          .single();
          
        if (taskError) throw taskError;
        
        // Fetch child tasks
        const { data: childTasksData, error: childError } = await supabase
          .from("tasks")
          .select("*")
          .eq("parent_id", taskId);
          
        if (childError) throw childError;
        
        // Process task data
        const processedTask = {
          ...taskData,
          project: taskData.projects?.name,
        };
        
        setTask(processedTask);
        setChildTasks(childTasksData || []);
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Error loading task details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [taskId]);
  
  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    updateSubtaskMutation.mutate({
      id: subtaskId,
      updates: { completed }
    });
  };
  
  const handleAddSubtask = () => {
    if (taskId && newSubtask.trim()) {
      createSubtaskMutation.mutate({
        task_id: taskId,
        title: newSubtask.trim(),
        completed: false
      });
    }
  };
  
  const calculateProgress = () => {
    if (!subtasks || subtasks.length === 0) return 0;
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
            <p className="text-sm">{task.description || "No description provided"}</p>
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
                {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "No date set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Project</span>
              <span className="text-sm font-medium">{task.project || "No project"}</span>
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
            {subtasksLoading ? (
              <div className="py-4 flex justify-center">
                <span className="text-sm text-muted-foreground">Loading subtasks...</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {subtasks && subtasks.length > 0 ? (
                  subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={subtask.completed} 
                        onChange={() => handleSubtaskToggle(subtask.id, !subtask.completed)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                        {subtask.title}
                      </span>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">No subtasks found</p>
                  </div>
                )}
              </ul>
            )}
            
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={handleAddSubtask} size="sm" disabled={!newSubtask.trim()}>Add</Button>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => toast.info("Edit functionality coming soon")}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => toast.info("Delete functionality coming soon")}>
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
