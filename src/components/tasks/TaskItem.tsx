
import React from "react";
import { format } from "date-fns";
import { Task, TaskStatus } from "@/services/taskService";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Calendar, CheckSquare, HelpCircle, Circle, LucideIcon, MoreVertical, Clock, Tag, Layers, Calculator } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  onToggleSubtasks?: () => void;
  showSubtasks?: boolean;
  isChild?: boolean;
  level?: number;
}

const StatusIcons: Record<TaskStatus, LucideIcon> = {
  "Not Started": Circle,
  "In Progress": HelpCircle,
  "Completed": CheckSquare,
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onClick,
  onStatusChange,
  onToggleSubtasks,
  showSubtasks,
  isChild = false,
  level = 0,
}) => {
  const StatusIcon = StatusIcons[task.status] || Circle;
  const hasChildren = task.children && task.children.length > 0;
  
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
      onStatusChange(task, newStatus);
    }
  };
  
  const handleSubtasksToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSubtasks) {
      onToggleSubtasks();
    }
  };
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the menu
  };
  
  return (
    <Card 
      className={cn(
        "w-full mb-2 relative transition-all",
        isChild ? "ml-4" : "",
        task.status === "Completed" ? "opacity-80" : "hover:shadow-md",
      )}
      style={{ marginLeft: isChild ? `${level * 1}rem` : "0" }}
      onClick={onClick}
    >
      <div className="px-4 py-3 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="flex-shrink-0"
            onClick={handleStatusToggle}
          >
            <Checkbox 
              checked={task.status === "Completed"}
              onCheckedChange={() => {}}
              className="pointer-events-none"
            />
          </div>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium text-sm sm:text-base truncate",
                task.status === "Completed" ? "line-through text-muted-foreground" : ""
              )}>
                {task.title}
              </span>
              
              {task.project && (
                <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-xs">
                  <Layers className="h-3 w-3" />
                  <span className="truncate">{task.project}</span>
                </Badge>
              )}

              {task.tags && Array.isArray(task.tags) && task.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 flex-wrap">
                  {task.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{task.tags.length - 2}</Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              {task.due_date && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              )}
              {task.status === "In Progress" && (
                <Badge variant="secondary" className="text-xs">In Progress</Badge>
              )}
              {hasChildren && (
                <span className="text-xs flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {task.children?.length} subtasks
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "hidden sm:flex",
            task.priority >= 4 ? "bg-red-500" : 
            task.priority === 3 ? "bg-yellow-500" : 
            "bg-blue-500"
          )}>
            P{task.priority}
          </Badge>
          
          {/* Priority Score Badge */}
          {task.priorityScore !== undefined && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Calculator className="h-3 w-3" />
              {task.priorityScore.toFixed(1)}
            </Badge>
          )}
          
          {hasChildren && (
            <Button
              onClick={handleSubtasksToggle}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={showSubtasks ? "Hide subtasks" : "Show subtasks"}
            >
              {showSubtasks ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(task, "Not Started");
                }
              }}>
                Mark as Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(task, "In Progress");
                }
              }}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(task, "Completed");
                }
              }}>
                Mark as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

// Need to define Button component as it seems to be missing from the imports
const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };
  
  return (
    <button 
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default TaskItem;
