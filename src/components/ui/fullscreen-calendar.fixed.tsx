"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Event {
  id: string
  name: string
  time: string
  datetime: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onEventClick?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onNewEventClick?: () => void
}

export function FullScreenCalendar({ 
  data, 
  onEventClick, 
  onDateClick,
  onNewEventClick 
}: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  
  // Ensure we're always using the current date as 'today'
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newToday = startOfToday()
      if (!isEqual(newToday, today)) {
        setCurrentMonth(format(newToday, "MMM-yyyy"))
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])
  
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Calculate days for the calendar grid
  const calendarDays = React.useMemo(() => {
    // Get the first day of the month
    const monthStart = firstDayCurrentMonth;
    // Get the last day of the month
    const monthEnd = endOfMonth(monthStart);
    // Get the start of the first week (Sunday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    // Get the end of the last week (Saturday)
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    // Generate all days in the calendar grid
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [firstDayCurrentMonth])
  
  // Ref for the calendar container to enable scrolling
  const calendarContainerRef = React.useRef<HTMLDivElement>(null)

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    if (onDateClick) {
      onDateClick(day)
    }
  }

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId)
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-1 p-2 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none sticky top-0 bg-background z-10">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-16 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button 
            className="w-full gap-2 md:w-auto"
            onClick={onNewEventClick}
          >
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-sm font-semibold leading-6 lg:flex-none sticky top-0 bg-background z-10">
          <div className="border-r py-2.5 font-medium">Sun</div>
          <div className="border-r py-2.5 font-medium">Mon</div>
          <div className="border-r py-2.5 font-medium">Tue</div>
          <div className="border-r py-2.5 font-medium">Wed</div>
          <div className="border-r py-2.5 font-medium">Thu</div>
          <div className="border-r py-2.5 font-medium">Fri</div>
          <div className="py-2.5 font-medium">Sat</div>
        </div>

        {/* Calendar Days */}
        <div ref={calendarContainerRef} className="flex text-sm leading-6 lg:flex-auto overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="isolate grid w-full grid-cols-7 gap-px">
            {calendarDays.map((day) => (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative min-h-[8rem] cursor-pointer border border-border/50 bg-background p-1 hover:bg-muted/50",
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "bg-muted/50",
                  !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-muted-foreground opacity-50"
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isToday(day) && !isEqual(day, selectedDay) &&
                      "bg-accent/50 text-accent-foreground font-bold"
                  )}
                >
                  {format(day, "d")}
                </time>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div className="mt-2 space-y-1 max-h-[6rem] overflow-y-auto">
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="space-y-1"
                        >
                          {date.events.map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event.id);
                              }}
                              className="text-xs p-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer shadow-neon-blue-sm"
                            >
                              <div className="font-medium truncate">{event.name}</div>
                              <div className="text-muted-foreground text-[10px]">{event.time}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
