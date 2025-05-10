
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, ChevronRight, ChevronDown, Check } from "lucide-react";
import { format, isAfter, isBefore, isToday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskItemProps {
  task: any;
  children?: React.ReactNode;
  level?: number;
  onSelect: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  isHighPriority?: boolean;
}

const TaskItem = ({ 
  task, 
  children, 
  level = 0, 
  onSelect, 
  onStatusChange,
  isHighPriority = false
}: TaskItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(children) && children.length > 0;
  
  // Calculate due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return "none";
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
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
  
  return (
    <div className="task-item-container">
      <div 
        className={cn(
          "task-container flex items-start gap-3 hover:bg-accent/5",
          isCompleted && "opacity-60",
          isHighPriority && "border-l-4 border-l-priority-high"
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
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {task.project}
              </span>
              
              <div className="flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            size={14}
                            className={value <= task.priority ? "text-priority-high fill-priority-high" : "text-muted"}
                          />
                        ))}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Priority: {task.priority}/5</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {task.dueDate && (
                <span 
                  className={cn(
                    "text-sm whitespace-nowrap px-2 py-0.5 rounded-full",
                    dueDateStatus === "overdue" && "bg-destructive/10 text-destructive",
                    dueDateStatus === "today" && "bg-priority-high/10 text-priority-high",
                    dueDateStatus === "soon" && "bg-priority-medium/10 text-priority-medium",
                    dueDateStatus === "future" && "bg-muted text-muted-foreground"
                  )}
                >
                  {format(new Date(task.dueDate), "MMM d")}
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
        <div className="children-container">
          {children}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
