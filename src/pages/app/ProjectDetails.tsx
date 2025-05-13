import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProject, updateProject, Project } from "@/services/projectService";
import { fetchTasksByProject, Task, updateTask, createTask } from "@/services/taskService";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, ArrowLeft, Edit, Clock, CheckCircle } from "lucide-react";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: number;
    due_date: Date | null;
  }>({
    title: "",
    description: "",
    priority: 3,
    due_date: null,
  });
  
  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  });
  
  // Fetch project tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: () => fetchTasksByProject(projectId!),
    enabled: !!projectId,
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsAddTaskModalOpen(false);
      resetNewTaskForm();
      toast.success("Task added to project");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });
  
  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Task updated");
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    },
  });
  
  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: 3,
      due_date: null,
    });
  };
  
  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      due_date: newTask.due_date ? newTask.due_date.toISOString() : null,
      status: "Not Started",
      project_id: projectId,
    });
  };
  
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { status: newStatus },
    });
  };
  
  // Calculate project stats
  const calculateStats = () => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, progress: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === "Completed").length;
    const inProgress = tasks.filter(task => task.status === "In Progress").length;
    const notStarted = tasks.filter(task => task.status === "Not Started").length;
    
    // Calculate progress percentage based on completed tasks
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, notStarted, progress };
  };
  
  const stats = calculateStats();
  
  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 text-primary/50 animate-spin mb-4">Loading...</div>
          <div className="text-muted-foreground">Loading project details...</div>
        </div>
      </div>
    );
  }
  
  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with back button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/projects")}
              className="hover:shadow-neon-blue-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        <Button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="shadow-sm hover:shadow-neon-blue transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-neon-blue-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={stats.progress} className="h-2" />
              <div className="text-2xl font-bold">{stats.progress}%</div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="flex flex-col">
                  <span className="text-xl font-medium">{stats.total}</span>
                  <span className="text-muted-foreground">Total</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-medium">{stats.completed}</span>
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-medium">{stats.inProgress}</span>
                  <span className="text-muted-foreground">In Progress</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-blue-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Start Date</h4>
                  <div className="text-lg">{format(new Date(project.start_date), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h4>
                  <div className="text-lg">{format(new Date(project.due_date), 'MMM d, yyyy')}</div>
                </div>
              </div>
              
              {/* Calculate days remaining */}
              {(() => {
                const today = new Date();
                const dueDate = new Date(project.due_date);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Time Remaining</h4>
                    <div className={`text-lg font-medium ${diffDays < 0 ? 'text-destructive' : diffDays < 3 ? 'text-amber-500' : 'text-primary'}`}>
                      {diffDays < 0 ? `${Math.abs(diffDays)} days overdue` : diffDays === 0 ? 'Due today' : `${diffDays} days left`}
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-neon-blue-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Priority</h4>
                <div className="flex items-center">
                  <div className="text-lg">{project.priority}/5</div>
                  <div className={`ml-2 h-3 w-3 rounded-full ${project.priority >= 4 ? 'bg-destructive' : project.priority >= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                <div className="text-sm">{project.created_at ? format(new Date(project.created_at), 'MMM d, yyyy') : 'Unknown'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Project Tasks */}
      <Card className="hover:shadow-neon-blue-glow transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Manage tasks for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tasks ({stats.total})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="not-started">Not Started ({stats.notStarted})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {tasksLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleTaskStatusChange} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No tasks found for this project. Add your first task to get started.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {tasksLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : tasks && tasks.filter(t => t.status === "Completed").length > 0 ? (
                <div className="space-y-2">
                  {tasks
                    .filter(task => task.status === "Completed")
                    .map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onStatusChange={handleTaskStatusChange} 
                      />
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No completed tasks yet.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="in-progress" className="space-y-4">
              {tasksLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : tasks && tasks.filter(t => t.status === "In Progress").length > 0 ? (
                <div className="space-y-2">
                  {tasks
                    .filter(task => task.status === "In Progress")
                    .map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onStatusChange={handleTaskStatusChange} 
                      />
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No tasks in progress.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="not-started" className="space-y-4">
              {tasksLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : tasks && tasks.filter(t => t.status === "Not Started").length > 0 ? (
                <div className="space-y-2">
                  {tasks
                    .filter(task => task.status === "Not Started")
                    .map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onStatusChange={handleTaskStatusChange} 
                      />
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No tasks waiting to be started.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Task Modal */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task to Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="5"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTask.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.due_date ? format(newTask.due_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTask.due_date || undefined}
                    onSelect={(date) => setNewTask({ ...newTask, due_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ 
  task, 
  onStatusChange 
}: { 
  task: Task; 
  onStatusChange: (taskId: string, status: string) => void; 
}) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };
  
  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return "Urgent";
    if (priority >= 4) return "High";
    if (priority >= 3) return "Medium";
    if (priority >= 2) return "Low";
    return "Very Low";
  };
  
  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return "bg-red-500";
    if (priority >= 4) return "bg-orange-500";
    if (priority >= 3) return "bg-amber-500";
    if (priority >= 2) return "bg-emerald-500";
    return "bg-blue-500";
  };
  
  return (
    <div 
      className="p-4 border rounded-lg hover:shadow-neon-blue-sm transition-all cursor-pointer flex items-center justify-between gap-4"
      onClick={() => navigate(`/tasks?taskId=${task.id}`)}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
        <div className="flex-1">
          <h4 className="font-medium">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {task.due_date && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{format(new Date(task.due_date), "MMM d")}</span>
          </div>
        )}
        
        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
          {getPriorityLabel(task.priority)}
        </Badge>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, task.status === "Completed" ? "Not Started" : "Completed");
            }}
          >
            <CheckCircle className={`h-4 w-4 ${task.status === "Completed" ? "text-green-500" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
