
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  priority: number;
  status: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onDateClick?: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] = useState<CalendarEvent[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(date, eventDate);
    });
  };

  // Get the days of the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Custom day renderer for calendar
  const renderDay = (date: Date, index: number) => {
    const eventsForDate = getEventsForDate(date);
    const hasEvents = eventsForDate.length > 0;
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelectedDay = selectedDate ? isSameDay(date, selectedDate) : false;
    const isTodayDate = isToday(date);
    const isHovered = hoveredDateIndex === index;

    return (
      <div 
        className={`
          relative w-full transition-all duration-300 overflow-hidden
          ${isCurrentMonth ? '' : 'opacity-40'}
          ${isSelectedDay ? 'bg-primary/20' : ''}
          ${isTodayDate ? 'font-bold' : ''}
          ${isHovered ? 'h-auto max-h-40' : 'h-16'} 
          hover:bg-muted/40 cursor-pointer
        `}
        onClick={() => handleDateClick(date)}
        onMouseEnter={(e) => {
          setHoveredDateIndex(index);
          if (hasEvents) {
            setTooltipContent(eventsForDate);
            setTooltipPosition({ 
              x: e.currentTarget.getBoundingClientRect().x + 20,
              y: e.currentTarget.getBoundingClientRect().y - 10
            });
            setIsTooltipVisible(true);
          }
        }}
        onMouseLeave={() => {
          setHoveredDateIndex(null);
          setIsTooltipVisible(false);
        }}
      >
        <div className="absolute top-1 left-2 text-xs">
          {date.getDate()}
        </div>

        <div className={`mt-5 flex flex-col gap-1 overflow-y-auto calendar-day ${isHovered ? 'max-h-32' : 'max-h-6'}`}>
          {eventsForDate.map((event, idx) => (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event.id);
              }}
              className={`
                text-xs px-1 py-0.5 truncate w-full
                ${event.status === 'Completed' ? 'bg-green-500/20' : 
                  event.priority >= 4 ? 'bg-red-500/20' : 
                  event.priority === 3 ? 'bg-yellow-500/20' : 'bg-blue-500/20'}
                ${event.status === 'Completed' ? 'line-through' : ''}
                rounded transition-all animate-fade-in
              `}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-2 overflow-auto">
        <div className="grid grid-cols-7 gap-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-medium text-sm">
              {day}
            </div>
          ))}
          
          {daysInMonth.map((day, i) => (
            <div 
              key={i} 
              className="border border-border/20"
            >
              {renderDay(day, i)}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip for events */}
      {isTooltipVisible && tooltipContent.length > 0 && (
        <div 
          className="absolute z-50 bg-popover text-popover-foreground p-3 rounded-md shadow-lg min-w-56 max-w-80 animate-fade-in"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="text-sm font-medium mb-2">
            {format(new Date(tooltipContent[0].date), 'MMMM d, yyyy')}
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {tooltipContent.map(event => (
              <Card 
                key={event.id} 
                className="p-2 cursor-pointer hover:bg-accent/50 animate-scale-in"
                onClick={() => onEventClick(event.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm ${event.status === 'Completed' ? 'line-through' : ''}`}>
                    {event.title}
                  </span>
                  <Badge 
                    variant={event.status === 'Completed' ? 'outline' : 
                            event.priority >= 4 ? 'destructive' : 
                            event.priority === 3 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {event.status === 'Completed' ? 'Done' : `P${event.priority}`}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
