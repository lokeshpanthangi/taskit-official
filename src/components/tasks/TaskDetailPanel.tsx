import { Button } from "@/components/ui/button";
import { X, Star, Calendar, CheckCircle, Edit, Trash, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  fetchTask,
  fetchSubtasks, 
  updateSubtask, 
  createSubtask, 
  deleteSubtask,
  updateTask,
  deleteTask,
  TaskStatus,
  removeTaskFromParent,
  Subtask 
} from "@/services/taskService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  due_date?: string | null;
  project_id?: string;
  parent_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  projects?: {
    name?: string;
  };
  project?: string;
}

const TaskDetailPanel = ({ taskId, onClose }: TaskDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [childTasks, setChildTasks] = useState<TaskData[]>([]);
  const [editedTask, setEditedTask] = useState<Partial<TaskData>>({});
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch task details with React Query
  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => fetchTask(taskId!),
    enabled: !!taskId,
  });
  
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
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<TaskData> }) => 
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      setIsEditing(false);
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update task");
      console.error("Error updating task:", error);
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    }
  });
  
  // Remove parent mutation
  const removeParentMutation = useMutation({
    mutationFn: removeTaskFromParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast.success("Removed from parent task");
    }
  });
  
  useEffect(() => {
    // Initialize edited task when task data is loaded
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
      });
      
      if (task.due_date) {
        setDueDate(new Date(task.due_date));
      }
      
      // Fetch child tasks
      const fetchChildTasks = async () => {
        if (!taskId) return;
        
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', taskId);
          
          if (error) {
            console.error('Error fetching child tasks:', error);
            return;
          }
          
          if (data) {
            setChildTasks(data);
          }
        } catch (error) {
          console.error('Error fetching child tasks:', error);
        }
      };

      // Convert subtask to main task
      const convertToMainTask = async (subtaskId: string) => {
        try {
          // Update the subtask to remove parent_id
          const { error } = await supabase
            .from('subtasks')
            .update({ parent_id: null })
            .eq('id', subtaskId);

          if (error) throw error;
          
          // Create a new main task with the same title
          const subtask = subtasks?.find(s => s.id === subtaskId);
          if (!subtask) return;

          await createTask({
            title: subtask.title,
            status: 'Not Started',
            priority: task?.priority || 0,
            user_id: task?.user_id,
            project_id: task?.project_id
          });

          // Delete the subtask
          await deleteSubtask(subtaskId);
          
          queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          toast.success('Subtask converted to main task');
        } catch (error) {
          console.error("Error fetching child tasks:", error);
          toast.error("Error loading child tasks");
        }
      };
      
      fetchChildTasks();
    }
  }, [task, taskId]);
  
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
  
  const handleSaveChanges = () => {
    if (taskId) {
      // If due date was changed, format it
      let updatedTask = { ...editedTask };
      if (dueDate) {
        updatedTask.due_date = dueDate.toISOString();
      }
      
      updateTaskMutation.mutate({
        id: taskId,
        updates: updatedTask
      });
    }
  };
  
  const handleDeleteTask = () => {
    if (taskId) {
      deleteTaskMutation.mutate(taskId);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleRemoveFromParent = () => {
    if (taskId) {
      removeParentMutation.mutate(taskId);
    }
  };
  
  const calculateProgress = () => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / subtasks.length) * 100;
  };
  
  if (taskLoading) {
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
          {!isEditing ? (
            <span className={`priority-tag priority-${task.priority === 5 ? 'urgent' : task.priority >= 4 ? 'high' : task.priority >= 3 ? 'medium' : 'low'}`}>
              {task.priority === 5 ? 'Urgent' : task.priority === 4 ? 'High' : task.priority === 3 ? 'Medium' : task.priority === 2 ? 'Low' : 'Very Low'} Priority
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Editing Task</span>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!isEditing ? (
          <>
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
                {task.parent_id && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Parent Task</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveFromParent} 
                      className="text-xs p-0 h-auto hover:bg-transparent hover:text-destructive"
                    >
                      Remove from parent
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm">Title</Label>
              <Input 
                id="title" 
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea 
                id="description" 
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="priority" className="text-sm">Priority</Label>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button 
                    key={value}
                    type="button"
                    variant={(editedTask.priority || task.priority) === value ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setEditedTask({...editedTask, priority: value})}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="text-center text-xs text-muted-foreground mt-1">
                {(editedTask.priority || task.priority) === 1 && "Very Low"}
                {(editedTask.priority || task.priority) === 2 && "Low"}
                {(editedTask.priority || task.priority) === 3 && "Medium"}
                {(editedTask.priority || task.priority) === 4 && "High"}
                {(editedTask.priority || task.priority) === 5 && "Very High"}
              </div>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-sm">Status</Label>
              <select 
                id="status"
                value={editedTask.status || task.status}
                onChange={(e) => setEditedTask({...editedTask, status: e.target.value as TaskStatus})}
                className="w-full mt-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="dueDate" className="text-sm">Due Date</Label>
              <div className="mt-1">
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>No due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
          
        {/* Child Tasks */}
        {childTasks.length > 0 && !isEditing && (
          <div className="mt-6">
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
          
        {/* Subtasks - only shown when not editing */}
        {!isEditing && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Subtasks</h3>
            {subtasksLoading ? (
              <div className="py-4 flex justify-center">
                <span className="text-sm text-muted-foreground">Loading subtasks...</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {subtasks && subtasks.length > 0 ? (
                  subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center justify-between gap-2 group">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={subtask.completed} 
                          onChange={() => handleSubtaskToggle(subtask.id, !subtask.completed)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                          {subtask.title}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => convertToMainTask(subtask.id)}
                      >
                        <span className="text-xs">Move to Main</span>
                      </Button>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">No subtasks found</p>
                  </div>
                )}
              </ul>
            )}
            
            {/* Only show subtask input when not editing */}
            {!isEditing && (
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
            )}
          </div>
        )}
          
        {/* Action buttons */}
        <div className="flex gap-2 pt-6">
          {!isEditing ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this task?</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            This will permanently delete "{task.title}" and all its subtasks. 
            Any child tasks will be removed from this parent but not deleted.
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailPanel;
