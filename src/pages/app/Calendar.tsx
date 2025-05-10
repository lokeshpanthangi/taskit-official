
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get day of week
const getDayOfWeek = (year: number, month: number, day: number) => {
  return new Date(year, month, day).getDay();
};

// Mock events data
const events = [
  {
    id: "event-1",
    title: "Design review",
    day: 12,
    color: "bg-primary",
  },
  {
    id: "event-2",
    title: "Team meeting",
    day: 15,
    color: "bg-priority-medium",
  },
  {
    id: "event-3",
    title: "Project deadline",
    day: 22,
    color: "bg-priority-urgent",
  },
  {
    id: "event-4",
    title: "Client call",
    day: 5,
    color: "bg-priority-high",
  },
  {
    id: "event-5",
    title: "Planning session",
    day: 18,
    color: "bg-accent",
  }
];

const Calendar = () => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  
  // Days of the week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Navigate to previous month
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getDayOfWeek(currentYear, currentMonth, 1);
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-border/50 bg-muted/20"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === currentDate.getDate() && 
        currentMonth === currentDate.getMonth() && 
        currentYear === currentDate.getFullYear();
      
      // Find events for this day
      const dayEvents = events.filter(event => event.day === day);
      
      days.push(
        <div 
          key={day}
          className={`p-2 border border-border/50 min-h-[100px] relative ${
            isToday ? "bg-primary/5 border-primary/30" : ""
          }`}
        >
          <span className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>
            {day}
          </span>
          
          {dayEvents.length > 0 && (
            <div className="mt-1 space-y-1">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className={`${event.color} text-white text-xs p-1 rounded truncate`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          
          <div className="text-sm font-medium">
            {monthNames[currentMonth]} {currentYear}
          </div>
          
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => {
            setCurrentMonth(currentDate.getMonth());
            setCurrentYear(currentDate.getFullYear());
          }}>
            Today
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle>Monthly View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-2 font-medium text-center text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {generateCalendarDays()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
