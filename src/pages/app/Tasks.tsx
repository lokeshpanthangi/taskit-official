
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Sun, Moon, List, Calendar as CalendarIcon } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskItem from "@/components/tasks/TaskItem";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/sonner";
import CalendarView, { CalendarEvent } from "@/components/calendar/CalendarView";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { 
  createTask, 
  updateTask,
  buildTaskHierarchy,
  TaskStatus,
  Task
} from "@/services/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "@/hooks/useTasks";

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Tasks = () => {
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [topUrgentTasks, setTopUrgentTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "priority">("all");
  const { isAuthenticated, isLoading: authLoading, user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  // Task drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedPriorityIndex, setDraggedPriorityIndex] = useState<number | null>(null);
  
  // Fetch tasks with useTasks hook
  const { tasks, isLoading: tasksLoading } = useTasks();
  
  console.log("Tasks page - Current user ID:", user?.id); // Debug log
  console.log("Tasks page - Tasks count:", tasks?.length || 0); // Debug log

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateModalOpen(false);
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
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
  
  // Calculate priority scores for all tasks and set top urgent tasks
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Sort by priority score and get top 5
      const sortedByPriority = [...tasks].sort((a, b) => 
        (b.priorityScore || 0) - (a.priorityScore || 0)
      );
      setTopUrgentTasks(sortedByPriority.slice(0, 5));
    }
  }, [tasks]);
  
  // Apply search filter and status filter
  const filterTasks = (allTasks: Task[]) => {
    if (!allTasks) return [];
    
    return allTasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.project && task.project.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "active" && task.status !== "Completed") ||
        (filterStatus === "completed" && task.status === "Completed");
        
      return matchesSearch && matchesStatus;
    });
  };
  
  const handleAddTask = (newTask: any) => {
    createTaskMutation.mutate(newTask);
  };
  
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { status }
    });
  };
  
  const handlePriorityChange = (taskId: string, priority: number) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { priority }
    });
    
    toast.success(`Priority updated to ${priority}`);
  };
  
  // Convert tasks to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    if (!tasks) return [];
    
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.due_date || "",
      priority: task.priority,
      status: task.status,
    }));
  };
  
  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    toggleDetailPanel(taskId);
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;
    
    // Find the dragged task
    const draggedTask = tasks?.find(t => t.id === draggedTaskId);
    const targetTask = tasks?.find(t => t.id === targetTaskId);
    
    // Prevent circular references
    if (targetTask?.parent_id === draggedTaskId) {
      toast.error("Cannot create circular reference");
      setDraggedTaskId(null);
      return;
    }
    
    if (draggedTask) {
      // Update the parent ID of the dragged task to be the target task's ID
      updateTaskMutation.mutate({
        id: draggedTaskId,
        updates: { parent_id: targetTaskId }
      });
      
      toast.success("Task moved successfully");
    }
    
    setDraggedTaskId(null);
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
  
  // Get filtered flat list of tasks
  const filteredTasks = filterTasks(tasks || []);
  
  // Build hierarchy from filtered tasks
  const hierarchicalTasks = buildTaskHierarchy(filteredTasks);
  
  // Recursively render tasks and their children
  const renderTaskHierarchy = (taskList: Task[], level = 0) => {
    return taskList.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        level={level}
        onSelect={handleTaskSelect}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        isHighPriority={topUrgentTasks.some(urgent => urgent.id === task.id)}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        selected={selectedTaskId === task.id}
        showPriorityScore={true}
      >
        {task.children && task.children.length > 0 && renderTaskHierarchy(task.children, level + 1)}
      </TaskItem>
    ));
  };
  
  if (authLoading || tasksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">Loading tasks...</h2>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center">
        <h2 className="text-2xl font-semibold">Please log in to view your tasks</h2>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">View and manage all your tasks</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} variant="outline" size="icon">
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "outline"} size="icon">
            <List className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">List View</span>
          </Button>
          
          <Button onClick={() => setViewMode("calendar")} variant={viewMode === "calendar" ? "default" : "outline"} size="icon">
            <CalendarIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Calendar View</span>
          </Button>
          
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
      
      {/* Tasks heading */}
      <div className="border-b pb-2">
        <h2 className="text-xl font-semibold">All Tasks</h2>
      </div>
      
      <div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Input 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6">
            {viewMode === "list" ? (
              <Card className="gradient-border bg-card">
                <CardHeader className="py-3">
                  <CardTitle>Task Hierarchy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tasks && tasks.length > 0 && hierarchicalTasks.length === 0 && searchQuery ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No tasks found matching "{searchQuery}". Try a different search term.</p>
                      </div>
                    ) : tasks && tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No tasks found. Create a new task to get started.</p>
                      </div>
                    ) : hierarchicalTasks.length > 0 ? (
                      renderTaskHierarchy(hierarchicalTasks)
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading tasks...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CalendarView
                events={getCalendarEvents()}
                onEventClick={handleTaskSelect}
                onDateClick={() => setIsCreateModalOpen(true)}
              />
            )}
          </div>
      </div>
      
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddTask}
      />
    </div>
  );
};

export default Tasks;
