
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, ChevronRight, ChevronDown, Check, GripVertical } from "lucide-react";
import { format, isAfter, isBefore, isToday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Task, TaskStatus, removeTaskFromParent } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

interface TaskItemProps {
  task: Task;
  children?: React.ReactNode;
  level?: number;
  onSelect: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isHighPriority?: boolean;
  onPriorityChange?: (taskId: string, priority: number) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, taskId: string) => void;
  selected?: boolean;
}

const TaskItem = ({ 
  task, 
  children, 
  level = 0, 
  onSelect, 
  onStatusChange,
  isHighPriority = false,
  onPriorityChange,
  onDragStart,
  onDragOver,
  onDrop,
  selected = false
}: TaskItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const hasChildren = Array.isArray(children) && children.length > 0;
  const queryClient = useQueryClient();
  
  // Remove from parent mutation
  const removeParentMutation = useMutation({
    mutationFn: removeTaskFromParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Removed from parent task");
    }
  });
  
  // Calculate due date status
  const getDueDateStatus = () => {
    if (!task.due_date) return "none";
    const today = new Date();
    const dueDate = new Date(task.due_date);
    
    if (isToday(dueDate)) return "today";
    if (isBefore(dueDate, today)) return "overdue";
    if (isAfter(dueDate, today) && isBefore(dueDate, new Date(today.setDate(today.getDate() + 3)))) {
      return "soon";
    }
    return "future";
  };
  
  const dueDateStatus = getDueDateStatus();
  const isCompleted = task.status === "Completed";
  
  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? "Completed" : "Not Started");
  };
  
  // Handle drag functions with visual feedback
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e, task.id);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    if (onDragOver) {
      onDragOver(e);
    }
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    if (onDrop) {
      onDrop(e, task.id);
    }
  };
  
  const handleRemoveFromParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeParentMutation.mutate(task.id);
  };
  
  // Map priority number to label
  const getPriorityLabel = (priority: number): string => {
    switch(priority) {
      case 5: return "Urgent";
      case 4: return "Very High";
      case 3: return "High";
      case 2: return "Medium";
      case 1: return "Low";
      default: return "Medium";
    }
  };

  return (
    <div 
      className="task-item-container"
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className={cn(
          "task-container flex items-start gap-3 hover:bg-accent/5 transition-all duration-200",
          isCompleted && "opacity-60",
          isHighPriority && "border-l-4 border-l-priority-high",
          selected && "bg-accent/20 ring-1 ring-accent",
          isDragging && "opacity-50",
          isDragOver && "bg-accent/10 border-dashed"
        )}
        style={{ marginLeft: `${level * 1.5}rem` }}
        onClick={() => onSelect(task.id)}
      >
        <div className="flex items-center gap-2 pt-1">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
          
          {hasChildren && (
            <button 
              onClick={handleExpandToggle}
              className="p-1 rounded-md hover:bg-accent/10"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="space-y-1">
              <h3 className={cn("font-medium text-base", isCompleted && "line-through")}>{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 pr-4">{task.description}</p>
              )}
              {task.parent_id && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Has parent</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 p-0 px-1 hover:bg-transparent hover:text-destructive" 
                    onClick={handleRemoveFromParent}
                  >
                    (remove)
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {task.project && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {task.project}
                </span>
              )}
              
              <div className="flex items-center">
                <div className="mr-2 cursor-move">
                  <GripVertical size={14} className="opacity-50 hover:opacity-100" />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            size={14}
                            className={value <= task.priority ? "text-priority-high fill-priority-high" : "text-muted"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPriorityChange && onPriorityChange(task.id, value);
                            }}
                          />
                        ))}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getPriorityLabel(task.priority)} Priority ({task.priority}/5)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {task.due_date && (
                <span 
                  className={cn(
                    "text-sm whitespace-nowrap px-2 py-0.5 rounded-full",
                    dueDateStatus === "overdue" && "bg-destructive/10 text-destructive",
                    dueDateStatus === "today" && "bg-priority-high/10 text-priority-high",
                    dueDateStatus === "soon" && "bg-priority-medium/10 text-priority-medium",
                    dueDateStatus === "future" && "bg-muted text-muted-foreground"
                  )}
                >
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              )}
              
              <span 
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  task.status === "Completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  task.status === "In Progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  task.status === "Not Started" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="children-container animate-accordion-down">
          {children}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
