import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { TaskStatus } from "@/services/taskService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/taskService";

interface CreateTaskModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (task: any) => void;
  onSuccess?: () => void;
  defaultDate?: Date | null;
}

const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onSuccess,
  defaultDate
}: CreateTaskModalProps) => {
  const { user } = useSupabaseAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(defaultDate || undefined);
  const [weight, setWeight] = useState<number>(3); // Default weight is 3 (medium)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  
  // Fetch all tasks for the dropdown
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: fetchTasks,
    enabled: !!user?.id,
  });
  
  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setTitle("");
      setDescription("");
      setDueDate(defaultDate || undefined);
      setWeight(3);
      setParentId(null);
    }
  }, [isOpen, defaultDate]);
  
  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate ? dueDate.toISOString() : null,
        priority: weight, // Changed from weight to priority to match the Task type
        user_id: user?.id,
        status: "Not Started" as TaskStatus, // Using proper TaskStatus type
        parent_id: parentId || null,
      };
      
      if (onSave) {
        onSave(taskData);
      }
      
      toast.success("Task created successfully");
      
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Task title"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Task description (optional)"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <div className="col-span-3">
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
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Priority
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={weight === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeight(value)}
                  className={cn(
                    "flex-1",
                    weight === value && "border-primary"
                  )}
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="col-span-4 text-center text-sm text-muted-foreground mt-1">
              {weight === 1 && "Very Low"}
              {weight === 2 && "Low"}
              {weight === 3 && "Medium"}
              {weight === 4 && "High"}
              {weight === 5 && "Very High"}
            </div>
          </div>
          
          {/* Parent Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parent" className="text-right">
              Parent
            </Label>
            <select
              id="parent"
              className="col-span-3 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={parentId || ""}
              onChange={e => setParentId(e.target.value || null)}
              disabled={tasksLoading}
            >
              <option value="">None</option>
              {tasks && tasks.length > 0 && tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
