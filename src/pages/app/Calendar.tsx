
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import CalendarView, { CalendarEvent } from "@/components/calendar/CalendarView";
import { fetchTasks, Task } from "@/services/taskService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { format } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

type OutletContextType = {
  toggleDetailPanel: (taskId?: string) => void;
};

const Calendar = () => {
  const { isAuthenticated } = useSupabaseAuth();
  const { toggleDetailPanel } = useOutletContext<OutletContextType>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Fetch tasks with React Query
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: isAuthenticated,
  });

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

  return (
    <div className="space-y-6 animate-fade-in h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateTaskModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-32 rounded bg-primary/20"></div>
          </div>
        </div>
      ) : calendarEvents.length === 0 ? (
        <Card className="h-96">
          <CardHeader>
            <CardTitle>No scheduled tasks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Create your first task to see it on the calendar</p>
            <Button onClick={() => setIsCreateTaskModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="h-[calc(100%-5rem)]">
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
          <CreateTaskModal 
            onClose={handleCloseCreateTaskModal} 
            onSuccess={handleTaskCreated}
            defaultDate={selectedDate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
