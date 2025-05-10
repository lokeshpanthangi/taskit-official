
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import CalendarView, { CalendarEvent } from "@/components/calendar/CalendarView";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { format } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/services/taskService";

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Calendar = () => {
  const { isAuthenticated, user } = useSupabaseAuth();
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Use the useTasks hook instead of direct query
  const { tasks, isLoading } = useTasks();
  
  console.log("Calendar: Current user ID:", user?.id); // Debug log
  console.log("Calendar: Tasks count:", tasks?.length); // Debug log

  // Convert tasks to calendar events format
  const mapTasksToEvents = (tasks: Task[] | undefined): CalendarEvent[] => {
    if (!tasks) return [];

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.due_date || new Date().toISOString(),
      priority: task.priority || 3,
      status: task.status
    }));
  };

  const calendarEvents = mapTasksToEvents(tasks);

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

  // Handle task creation success
  const handleTaskCreated = () => {
    toast.success("Task created successfully");
    handleCloseCreateTaskModal();
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

  return (
    <div className="space-y-6 animate-fade-in h-full w-full max-w-full mx-auto overflow-x-auto pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          </div>
          <p className="text-muted-foreground">Schedule and manage your tasks visually</p>
        </div>
        
        <Button onClick={() => setIsCreateTaskModalOpen(true)} className="shadow-sm hover:shadow-md transition-all">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      {isLoading ? (
        <Card className="h-96 bg-card/60 backdrop-blur-sm border-primary/10">
          <CardContent className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
              <div className="h-4 w-32 rounded bg-primary/20"></div>
            </div>
          </CardContent>
        </Card>
      ) : calendarEvents.length === 0 ? (
        <Card className="h-96 bg-card/60 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              No scheduled tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 p-6">
            <p className="text-muted-foreground mb-6 text-center">
              Your calendar is empty. Create your first task to see it on the calendar.
            </p>
            <Button onClick={() => setIsCreateTaskModalOpen(true)} className="shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full h-[calc(100vh-20rem)] min-h-[650px] overflow-hidden rounded-xl shadow-sm border border-border/50">
          <CalendarView 
            events={calendarEvents} 
            onEventClick={handleEventClick} 
            onDateClick={handleDateClick}
          />
        </div>
      )}

      {/* Create Task Modal */}
      <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDate 
                ? `Create Task for ${format(selectedDate, 'PPP')}` 
                : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <div>
            <CreateTaskModal 
              isOpen={isCreateTaskModalOpen}
              onClose={handleCloseCreateTaskModal} 
              onSuccess={handleTaskCreated}
              defaultDate={selectedDate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
