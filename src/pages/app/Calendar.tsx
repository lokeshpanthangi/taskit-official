
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { CalendarEvent } from "@/components/calendar/CalendarView";
import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useTasks } from "@/hooks/useTasks";
import { Task, createTask } from "@/services/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Calendar = () => {
  const { isAuthenticated, user } = useSupabaseAuth();
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use the useTasks hook instead of direct query
  const { tasks, isLoading } = useTasks();
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateTaskModalOpen(false);
      toast.success("Task created successfully!");
      setSelectedDate(null);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    },
  });

  // Define the types for the calendar data
  type CalendarDataItem = {
    day: Date;
    events: Array<{
      id: string;
      name: string;
      time: string;
      datetime: string;
    }>;
  };

  // Convert tasks to calendar events format
  const mapTasksToEvents = (tasks: Task[] | undefined): { calendarEvents: CalendarEvent[], calendarData: CalendarDataItem[] } => {
    if (!tasks) return { calendarEvents: [], calendarData: [] };
    
    // For the original CalendarView component
    const calendarEvents: CalendarEvent[] = tasks
      .filter(task => task.due_date) // Only include tasks with due dates
      .map(task => ({
        id: task.id,
        title: task.title,
        date: task.due_date!,
        priority: task.priority || 0,
        status: task.status || 'Not Started'
      }));
  
    // For the FullScreenCalendar component
    const calendarData = tasks.reduce<CalendarDataItem[]>((acc, task) => {
      if (!task.due_date) return acc;
      
      // Ensure we're working with a proper Date object
      const dueDate = new Date(task.due_date);
      
      // Skip invalid dates
      if (isNaN(dueDate.getTime())) return acc;
      
      const dateKey = format(dueDate, 'yyyy-MM-dd');
      
      // Find if we already have an entry for this date
      const existingDateIndex = acc.findIndex(item => 
        format(item.day, 'yyyy-MM-dd') === dateKey
      );
      
      const eventItem = {
        id: task.id,
        name: task.title,
        time: format(dueDate, 'h:mm a'),
        datetime: task.due_date
      };
      
      if (existingDateIndex >= 0) {
        // Add to existing date entry
        acc[existingDateIndex].events.push(eventItem);
      } else {
        // Create new date entry
        acc.push({
          day: dueDate,
          events: [eventItem]
        });
      }
      
      return acc;
    }, []);
    
    return { calendarEvents, calendarData };
  };
  
  // Add the calendarEvents and calendarData variables
  const { calendarEvents, calendarData } = mapTasksToEvents(tasks);

  // Handle clicking on an event
  const handleEventClick = (eventId: string) => {
    toggleDetailPanel(eventId);
  };

  // Handle clicking on a date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateTaskModalOpen(true);
  };

  // Handle closing the create task modal
  const handleCloseCreateTaskModal = () => {
    setSelectedDate(null);
    setIsCreateTaskModalOpen(false);
  };

  // Handle task creation
  const handleCreateTask = (newTask: any) => {
    createTaskMutation.mutate(newTask);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center">
        <h2 className="text-2xl font-semibold">Please log in to view your calendar</h2>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }

  // Get upcoming tasks for the next 7 days
  const getUpcomingTasks = () => {
    if (!tasks) return [];
    
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    }).sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  };
  
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-4 animate-fade-in h-full w-full max-w-full mx-auto pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          </div>
          <p className="text-muted-foreground">Schedule and manage your tasks visually</p>
        </div>
        
        <Button onClick={() => setIsCreateTaskModalOpen(true)} className="shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primary to-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <div className="w-full">
        {isLoading ? (
          <Card className="h-[calc(100vh-300px)] bg-card/60 backdrop-blur-sm border-primary/10">
            <CardContent className="flex items-center justify-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-primary/50 animate-spin mb-4" />
                <div className="text-muted-foreground">Loading your calendar...</div>
              </div>
            </CardContent>
          </Card>
        ) : calendarEvents.length === 0 ? (
          <Card className="h-[calc(100vh-300px)] bg-card/60 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                No scheduled tasks
              </CardTitle>
              <CardDescription>
                Your calendar is currently empty
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <div className="bg-muted/50 rounded-full p-8 mb-6">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Your calendar is empty. Create your first task with a due date to see it on the calendar.
              </p>
              <Button onClick={() => setIsCreateTaskModalOpen(true)} className="shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primary to-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border border-border/50 shadow-sm h-[calc(100vh-300px)]">
            <div className="w-full h-full overflow-hidden">
              <FullScreenCalendar 
                data={calendarData}
                onEventClick={handleEventClick} 
                onDateClick={handleDateClick}
                onNewEventClick={() => setIsCreateTaskModalOpen(true)}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate 
                ? `Create Task for ${format(selectedDate, 'PPP')}` 
                : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              Add a new task to your calendar
            </DialogDescription>
          </DialogHeader>
          <div>
            <CreateTaskModal 
              isOpen={isCreateTaskModalOpen}
              onClose={handleCloseCreateTaskModal} 
              onSave={handleCreateTask}
              defaultDate={selectedDate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
