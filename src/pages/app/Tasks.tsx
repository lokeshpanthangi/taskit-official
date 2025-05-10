
import { useState } from "react";
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

// Mock data for tasks with hierarchical structure
const initialTasks = [
  {
    id: "task-1",
    title: "Website Redesign Project",
    description: "Complete overhaul of the company website",
    status: "In Progress",
    priority: 5,
    dueDate: "2025-06-15",
    project: "Website Redesign",
    parentId: null,
  },
  {
    id: "task-1-1",
    title: "Design new homepage layout",
    description: "Create wireframes and mockups for the new homepage",
    status: "Completed",
    priority: 4,
    dueDate: "2025-06-01",
    project: "Website Redesign",
    parentId: "task-1",
  },
  {
    id: "task-1-2",
    title: "Implement responsive design",
    description: "Ensure the website works on all device sizes",
    status: "In Progress",
    priority: 4,
    dueDate: "2025-06-10",
    project: "Website Redesign",
    parentId: "task-1",
  },
  {
    id: "task-1-2-1",
    title: "Mobile layout optimization",
    description: "Fine-tune the layout for mobile devices",
    status: "Not Started",
    priority: 3,
    dueDate: "2025-06-08",
    project: "Website Redesign",
    parentId: "task-1-2",
  },
  {
    id: "task-1-3",
    title: "Content migration",
    description: "Move content from old site to new design",
    status: "Not Started",
    priority: 3,
    dueDate: "2025-06-12",
    project: "Website Redesign",
    parentId: "task-1",
  },
  {
    id: "task-2",
    title: "Q3 Marketing Campaign",
    description: "Plan and execute marketing campaign for Q3",
    status: "Not Started",
    priority: 5,
    dueDate: "2025-06-20",
    project: "Marketing Campaign",
    parentId: null,
  },
  {
    id: "task-2-1",
    title: "Define target audience",
    description: "Research and document primary customer segments",
    status: "In Progress",
    priority: 4,
    dueDate: "2025-06-05",
    project: "Marketing Campaign",
    parentId: "task-2",
  },
  {
    id: "task-2-2",
    title: "Create content calendar",
    description: "Schedule all content releases for the campaign",
    status: "Not Started",
    priority: 4,
    dueDate: "2025-06-10",
    project: "Marketing Campaign",
    parentId: "task-2",
  },
  {
    id: "task-3",
    title: "New Product Launch Preparation",
    description: "Prepare for upcoming product launch next quarter",
    status: "Not Started",
    priority: 5,
    dueDate: "2025-07-15",
    project: "Product Launch",
    parentId: null,
  }
];

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Tasks = () => {
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Organize tasks into hierarchy
  const buildTaskHierarchy = (allTasks: any[]) => {
    const taskMap = new Map();
    const rootTasks: any[] = [];
    
    // First pass: Add all tasks to the map
    allTasks.forEach(task => {
      // Create a new object that will hold children
      taskMap.set(task.id, { ...task, children: [] });
    });
    
    // Second pass: Establish parent-child relationships
    allTasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id);
      
      if (task.parentId && taskMap.has(task.parentId)) {
        // Add this task as a child to its parent
        const parent = taskMap.get(task.parentId);
        parent.children.push(taskWithChildren);
      } else {
        // This is a root task (no parent)
        rootTasks.push(taskWithChildren);
      }
    });
    
    return rootTasks;
  };
  
  // Apply search filter and status filter
  const filterTasks = (allTasks: any[]) => {
    return allTasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "active" && task.status !== "Completed") ||
        (filterStatus === "completed" && task.status === "Completed");
        
      return matchesSearch && matchesStatus;
    });
  };
  
  const handleAddTask = (newTask: any) => {
    setTasks([...tasks, newTask]);
    toast.success("Task created successfully!");
  };
  
  const handleStatusChange = (taskId: string, status: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    );
    setTasks(updatedTasks);
    toast.info(`Task marked as ${status}`);
  };
  
  // Convert tasks to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.dueDate,
      priority: task.priority,
      status: task.status,
    }));
  };
  
  // Get filtered flat list of tasks
  const filteredTasks = filterTasks(tasks);
  
  // Build hierarchy from filtered tasks
  const hierarchicalTasks = buildTaskHierarchy(filteredTasks);
  
  // Recursively render tasks and their children
  const renderTaskHierarchy = (taskList: any[], level = 0) => {
    return taskList.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        level={level}
        onSelect={(taskId) => toggleDetailPanel(taskId)}
        onStatusChange={handleStatusChange}
      >
        {task.children && task.children.length > 0 && renderTaskHierarchy(task.children, level + 1)}
      </TaskItem>
    ));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-semibold tracking-tight">Tasks</h1>
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
          <Card>
            <CardHeader className="py-3">
              <CardTitle>Task Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hierarchicalTasks.length > 0 ? (
                  renderTaskHierarchy(hierarchicalTasks)
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tasks found. Try a different search term or create a new task.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <CalendarView
            events={getCalendarEvents()}
            onEventClick={(eventId) => toggleDetailPanel(eventId)}
            onDateClick={() => setIsCreateModalOpen(true)}
          />
        )}
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
