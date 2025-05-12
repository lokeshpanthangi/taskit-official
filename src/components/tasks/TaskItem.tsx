
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Task, TaskStatus } from "@/services/taskService";

interface TaskItemProps {
  task: Task;
  level: number;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPriorityChange?: (id: string, priority: number) => void;
  isHighPriority?: boolean;
  children?: React.ReactNode;
  selected?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, taskId: string) => void;
  showPriorityScore?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  level,
  onSelect,
  onStatusChange,
  onPriorityChange,
  isHighPriority,
  children,
  selected,
  onDragStart,
  onDragOver,
  onDrop,
  showPriorityScore = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = React.Children.count(children) > 0;
  
  const handleStatusChange = () => {
    const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
    onStatusChange(task.id, newStatus);
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 5: return "text-red-500";
      case 4: return "text-orange-500";
      case 3: return "text-yellow-500";
      case 2: return "text-green-500";
      case 1: return "text-blue-500";
      default: return "text-gray-500";
    }
  };
  
  const getStatusClass = () => {
    if (task.status === "Completed") return "line-through opacity-60";
    if (isHighPriority) return "font-semibold";
    return "";
  };

  return (
    <div>
      <div 
        className={`
          relative flex items-center p-2 rounded-md mb-1
          ${selected ? "bg-accent/20" : "hover:bg-accent/10"}
          ${level > 0 ? "ml-4 pl-4 border-l border-border/60" : ""}
          ${task.status === "Completed" ? "bg-muted/30" : ""}
        `}
        style={{ marginLeft: `${level * 1.5}rem` }}
        onDragOver={(e) => onDragOver && onDragOver(e)}
        onDrop={(e) => onDrop && onDrop(e, task.id)}
      >
        {hasChildren && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-1 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        )}
        
        <div 
          className={`flex items-center justify-between w-full ${hasChildren ? "ml-1" : "ml-7"}`} 
          draggable
          onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
        >
          <div className="flex items-center flex-1">
            <Checkbox 
              checked={task.status === "Completed"} 
              onCheckedChange={handleStatusChange}
              className="mr-2"
            />
            <div className="flex flex-col">
              <span 
                className={`text-sm cursor-pointer ${getStatusClass()}`}
                onClick={() => onSelect(task.id)}
              >
                {task.title}
              </span>
              
              <div className="flex items-center gap-2 mt-1">
                {task.due_date && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
                
                {task.project && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {task.project}
                  </Badge>
                )}
                
                <Badge variant="outline" className={`text-xs px-1 py-0 ${getPriorityColor()}`}>
                  P{task.priority || 3}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {showPriorityScore && task.priorityScore !== undefined && (
              <Badge variant="outline" className="ml-2 bg-primary/10">
                Score: {task.priorityScore?.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
