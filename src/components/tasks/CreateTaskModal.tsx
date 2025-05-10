
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { fetchProjects } from "@/services/projectService";
import { fetchTasks } from "@/services/taskService";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
}

const CreateTaskModal = ({ isOpen, onClose, onSave }: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [weight, setWeight] = useState(3);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [parentTaskId, setParentTaskId] = useState<string | undefined>(undefined);
  const [priorityScore, setPriorityScore] = useState<number | null>(null);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const { isAuthenticated } = useSupabaseAuth();
  
  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: isAuthenticated && isOpen,
  });
  
  // Fetch tasks for parent task selection
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: isAuthenticated && isOpen,
  });
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setWeight(3);
      setProjectId(undefined);
      setParentTaskId(undefined);
      setPriorityScore(null);
    }
  }, [isOpen]);
  
  // Calculate priority score based on weight and days until due
  useEffect(() => {
    if (dueDate && weight) {
      const daysUntilDue = differenceInDays(dueDate, new Date());
      // Formula: weight * (10 / (daysUntilDue + 1)) - higher weight and fewer days = higher score
      let score: number;
      if (daysUntilDue < 0) {
        // Overdue tasks get highest priority
        score = weight * 10;
      } else {
        score = weight * (10 / (daysUntilDue + 1));
      }
      // Round to 1 decimal place
      setPriorityScore(Math.round(score * 10) / 10);
    } else {
      setPriorityScore(null);
    }
  }, [dueDate, weight]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const newTask = {
      title,
      description,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
      weight,
      priorityScore: priorityScore || weight, // Default to weight if no due date
      project: projectId,
      parentId: parentTaskId,
    };
    
    onSave(newTask);
  };
  
  // Helper function to get priority class based on score
  const getPriorityClass = (score: number | null) => {
    if (score === null) return "bg-gray-200";
    if (score >= 8) return "bg-priority-urgent text-white";
    if (score >= 5) return "bg-priority-high text-white";
    if (score >= 3) return "bg-priority-medium";
    return "bg-priority-low";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task. Title is required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Title <span className="text-destructive">*</span>
            </label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full"
              autoFocus
            />
          </div>
          
          {/* Description input */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="resize-none min-h-[100px]"
            />
          </div>
          
          {/* Parent task selection */}
          <div className="space-y-2">
            <label htmlFor="parentTask" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Parent Task (Optional)
            </label>
            <select
              id="parentTask"
              value={parentTaskId || ""}
              onChange={(e) => setParentTaskId(e.target.value || undefined)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None (Top-level task)</option>
              {tasks && tasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
          
          {/* Due date picker */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Weight selector with slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Priority (1-5)
              </label>
              <div className="flex items-center text-sm font-medium">
                {weight === 5 && <span className="text-priority-urgent">Urgent</span>}
                {weight === 4 && <span className="text-priority-veryhigh">Very High</span>}
                {weight === 3 && <span className="text-priority-high">High</span>}
                {weight === 2 && <span className="text-priority-medium">Medium</span>}
                {weight === 1 && <span className="text-priority-low">Low</span>}
              </div>
            </div>
            <Slider
              value={[weight]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setWeight(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lowest</span>
              <span>Highest</span>
            </div>
          </div>
          
          {/* Priority Score display */}
          {priorityScore !== null && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Priority Score (Calculated)
              </label>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  getPriorityClass(priorityScore)
                )}>
                  {priorityScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Based on priority and due date
                </div>
              </div>
            </div>
          )}
          
          {/* Project selection */}
          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Project
            </label>
            <select
              id="project"
              value={projectId || ""}
              onChange={(e) => setProjectId(e.target.value || undefined)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No Project</option>
              {projects && projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
