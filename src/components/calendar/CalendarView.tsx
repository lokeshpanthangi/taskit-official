
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for events/tasks in calendar
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  priority: number;
  status: string;
  color?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

const CalendarView = ({ events, onEventClick, onDateClick }: CalendarViewProps) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  
  // Month navigation
  const goToPreviousMonth = () => {
    if (viewMode === "month") {
      setSelectedDate(prev => subMonths(prev, 1));
    } else if (viewMode === "week") {
      setSelectedDate(prev => addDays(prev, -7));
    } else {
      setSelectedDate(prev => addDays(prev, -1));
    }
  };
  
  const goToNextMonth = () => {
    if (viewMode === "month") {
      setSelectedDate(prev => addMonths(prev, 1));
    } else if (viewMode === "week") {
      setSelectedDate(prev => addDays(prev, 7));
    } else {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Week view helpers
  const startOfCurrentWeek = startOfWeek(selectedDate);
  const endOfCurrentWeek = endOfWeek(selectedDate);
  
  // Generate days for week view
  const weekDays = [];
  let day = startOfCurrentWeek;
  while (day <= endOfCurrentWeek) {
    weekDays.push(new Date(day));
    day = addDays(day, 1);
  }
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Month view: Generate calendar days with proper empty cells for the month
  const generateMonthCalendarDays = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-border/50 bg-background/80 h-full min-h-[85px] rounded-md m-[1px]"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      
      const isCurrentDay = isToday(date);
      
      days.push(
        <div 
          key={day}
          onClick={() => onDateClick && onDateClick(date)}
          className={cn(
            "p-2 border border-border/50 h-full min-h-[85px] relative cursor-pointer hover:bg-accent/10 transition-colors rounded-md m-[1px]",
            isCurrentDay ? "bg-primary/10 border-primary/50 shadow-sm" : "bg-card/80"
          )}
        >
          <span className={cn(
            "text-sm absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full font-medium",
            isCurrentDay ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40"
          )}>
            {day}
          </span>
          
          {dayEvents.length > 0 && (
            <div className="mt-6 space-y-1">
              {dayEvents.map(event => {
                // Determine color based on priority or status
                let colorClass = "";
                if (event.color) {
                  colorClass = event.color;
                } else if (event.priority === 5) {
                  colorClass = "bg-priority-urgent";
                } else if (event.priority === 4) {
                  colorClass = "bg-priority-high";
                } else if (event.priority === 3) {
                  colorClass = "bg-priority-medium";
                } else if (event.status === "Completed") {
                  colorClass = "bg-green-500";
                } else {
                  colorClass = "bg-accent";
                }
                
                return (
                  <div 
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event.id);
                    }}
                    className={cn(
                      `${colorClass} text-white text-xs p-1 rounded truncate hover:opacity-80`,
                      event.status === "Completed" ? "opacity-60" : ""
                    )}
                  >
                    {event.title}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <Card className="w-full h-full flex flex-col border-primary/10 bg-gradient-to-b from-background to-background/95 shadow-md overflow-hidden">
      <CardHeader className="pb-0 flex-shrink-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <span>{format(selectedDate, 'MMMM yyyy')}</span>
            <div className="text-xs bg-primary/10 px-2 py-1 rounded-full">
              {viewMode === "month" ? "Month View" : viewMode === "week" ? "Week View" : "Day View"}
            </div>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-lg">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              
              <Button variant="outline" onClick={goToToday} className="h-8 text-xs px-2">
                Today
              </Button>
              
              <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs defaultValue="month" value={viewMode} onValueChange={(value) => setViewMode(value as "month" | "week" | "day")} className="w-full">
              <TabsList className="bg-primary/10 p-1 rounded-lg">
                <TabsTrigger value="month" className="text-xs px-3 py-1">Month</TabsTrigger>
                <TabsTrigger value="week" className="text-xs px-3 py-1">Week</TabsTrigger>
                <TabsTrigger value="day" className="text-xs px-3 py-1">Day</TabsTrigger>
              </TabsList>
              
              <div className="mb-4 flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="bg-priority-urgent">Urgent</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Priority 5</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="bg-priority-high">High</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Priority 4</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="bg-priority-medium">Medium</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Priority 3</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <TabsContent value="month" className="mt-0 h-full">
                <div className="grid grid-cols-7 gap-2 h-full p-2">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-semibold text-sm mb-1 text-foreground/80">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {generateMonthCalendarDays()}
                </div>
              </TabsContent>
              
              <TabsContent value="week" className="mt-0">
                <div className="grid grid-cols-7 gap-1">
                  {/* Week day headers */}
                  {weekDays.map(day => (
                    <div key={day.toString()} className="text-center p-2">
                      <div className={cn(
                        "font-medium", 
                        isToday(day) ? "text-primary" : ""
                      )}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={cn(
                        "text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                        isToday(day) ? "bg-primary text-primary-foreground" : ""
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                  
                  {/* Week view events */}
                  {weekDays.map(day => {
                    const dayEvents = getEventsForDate(day);
                    return (
                      <div 
                        key={day.toString() + '-events'} 
                        className={cn(
                          "border border-border/50 min-h-[200px] p-2",
                          isToday(day) ? "bg-primary/5" : ""
                        )}
                      >
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            onClick={() => onEventClick(event.id)}
                            className={cn(
                              "mb-1.5 p-2 rounded-md text-sm cursor-pointer border border-transparent transition-all hover:translate-y-[-1px] shadow-sm",
                              event.priority === 5 ? "bg-red-500/90 text-white hover:bg-red-500 hover:shadow-md" :
                              event.priority === 4 ? "bg-orange-500/90 text-white hover:bg-orange-500 hover:shadow-md" :
                              event.priority === 3 ? "bg-yellow-500/90 text-white hover:bg-yellow-500 hover:shadow-md" :
                              event.status === "Completed" ? "bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30" :
                              "bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30"
                            )}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="day" className="mt-0">
                <div className="flex flex-col">
                  <div className="text-center mb-4">
                    <div className="text-xl font-medium">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    {isToday(selectedDate) && (
                      <Badge className="bg-primary">Today</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map(event => (
                        <div 
                          key={event.id}
                          onClick={() => onEventClick(event.id)}
                          className={cn(
                            "p-3 border rounded-md cursor-pointer hover:bg-accent/5",
                            event.status === "Completed" ? "opacity-60" : ""
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                            </div>
                            <Badge className={cn(
                              event.priority === 5 ? "bg-priority-urgent" :
                              event.priority === 4 ? "bg-priority-high" :
                              event.priority === 3 ? "bg-priority-medium" :
                              event.status === "Completed" ? "bg-green-500" :
                              "bg-accent"
                            )}>
                              {event.priority === 5 ? "Urgent" :
                               event.priority === 4 ? "High" :
                               event.priority === 3 ? "Medium" :
                               event.priority === 2 ? "Low" : "Normal"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No events scheduled for this day
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button variant="outline" size="icon" onClick={onDateClick && (() => onDateClick(new Date()))}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add event</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto p-0">
        {/* Content is controlled by TabsContent components above */}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
