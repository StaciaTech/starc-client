import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import scheduleData from '../data/scheduleData.json';

// Interface for schedule events
interface ScheduleEvent {
  date: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  type: string;
}

const SchedulePage: React.FC = () => {
  // Get today's date in DD-MM-YYYY format from user's device
  const getTodayDateStr = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  };
  
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  
  // Format date string (DD-MM-YYYY) to Date object
  const formatDateStr = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };
  
  // Format Date object to date string (DD-MM-YYYY)
  const formatDateToStr = (date: Date): string => {
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };
  
  // Check if date is today
  const isToday = (dateStr: string) => {
    return dateStr === getTodayDateStr();
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate padding days from previous month
    const prevMonthPadding = firstDayOfWeek;
    
    // Calculate days from current month
    const daysInCurrentMonth = lastDayOfMonth.getDate();
    
    // Calculate padding days for next month (to make a complete grid)
    const totalCells = 35; // 5 rows x 7 days (more compact)
    const nextMonthPadding = Math.max(0, totalCells - prevMonthPadding - daysInCurrentMonth);
    
    // Generate calendar days array
    const calendarDays = [];
    
    // Add previous month padding days
    const prevMonth = new Date(year, month - 1, 1);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = prevMonthPadding - 1; i >= 0; i--) {
      const date = new Date(prevMonth);
      date.setDate(prevMonthLastDay - i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        dateStr: formatDateToStr(date),
        isToday: formatDateToStr(date) === getTodayDateStr()
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDateToStr(date);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === getTodayDateStr()
      });
    }
    
    // Add next month padding days
    const nextMonth = new Date(year, month + 1, 1);
    
    for (let i = 1; i <= nextMonthPadding; i++) {
      const date = new Date(nextMonth);
      date.setDate(i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        dateStr: formatDateToStr(date),
        isToday: false // Next month can't contain today
      });
    }
    
    return calendarDays;
  }, [currentMonth]);

  // Check if a date has events
  const hasEvent = (dateStr: string): boolean => {
    return scheduleData.classSchedule.some(event => event.date === dateStr);
  };

  // Get events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return scheduleData.classSchedule.filter(event => event.date === selectedDate);
  }, [selectedDate]);

  // Get appropriate badge color for event type
  const getEventTypeColor = (type: string): string => {
    switch(type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'mentoring': return 'bg-purple-100 text-purple-800';
      case 'assignment': return 'bg-orange-100 text-orange-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-indigo-100 text-indigo-800';
      case 'report': return 'bg-yellow-100 text-yellow-800';
      case 'ceremony': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get month year string
  const monthYearString = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentMonth]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = formatDateStr(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Course Schedule</h1>
          <p className="text-gray-600 mt-1">
            View your upcoming sessions, assignments, and important dates
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Compact Calendar */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
            {/* Calendar Header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[#8A63FF]" />
                <h2 className="text-base font-semibold">{monthYearString}</h2>
              </div>
              
              <div className="flex space-x-1">
                <button 
                  onClick={prevMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Calendar Grid - More Compact */}
            <div className="p-2">
              {/* Days of week header */}
              <div className="grid grid-cols-7 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days - More Compact */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`
                      p-0.5 relative cursor-pointer rounded-md flex items-center justify-center h-8
                      ${!day.isCurrentMonth ? 'opacity-40' : ''}
                      ${selectedDate === day.dateStr ? 'bg-[#8A63FF]/10 border border-[#8A63FF]' : day.isToday ? 'border border-[#8A63FF]/50' : 'hover:bg-gray-100'}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`
                        text-xs
                        ${selectedDate === day.dateStr ? 'font-bold text-[#8A63FF]' : day.isToday ? 'font-bold text-[#8A63FF]' : ''}
                      `}>
                        {day.date.getDate()}
                      </span>
                      
                      {/* Small dot indicator for events */}
                      {hasEvent(day.dateStr) && (
                        <div className="h-1 w-1 rounded-full bg-[#8A63FF]"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Today Jump Button */}
            {!isToday(selectedDate) && (
              <div className="p-2 border-t bg-gray-50 text-center">
                <button 
                  onClick={() => setSelectedDate(getTodayDateStr())}
                  className="text-xs bg-[#8A63FF]/10 text-[#8A63FF] px-3 py-1 rounded-full hover:bg-[#8A63FF]/20 transition-colors"
                >
                  Jump to Today
                </button>
              </div>
            )}
          </div>
          
          {/* Right column: Events & Upcoming Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events for selected date */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-3 border-b">
                <h3 className="font-medium text-gray-900">
                  {isToday(selectedDate) ? (
                    <span className="text-[#8A63FF]">Today's Events</span>
                  ) : (
                    `Events for ${formatDate(selectedDate)}`
                  )}
                </h3>
              </div>
              
              <div className="p-3">
                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {eventsForSelectedDate.map((event, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time} • {event.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <p className="text-gray-500">No events scheduled for this date</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Schedule Summary */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-3 border-b">
                <h3 className="font-medium text-gray-900">Upcoming Schedule</h3>
              </div>
              
              <div className="divide-y">
                {scheduleData.classSchedule
                  .filter(event => {
                    const eventDate = formatDateStr(event.date);
                    return eventDate >= new Date();
                  })
                  .sort((a, b) => {
                    const dateA = formatDateStr(a.date);
                    const dateB = formatDateStr(b.date);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .slice(0, 5) // Show only next 5 events
                  .map((event, index) => {
                    const eventDateObj = formatDateStr(event.date);
                    const isEventToday = isToday(event.date);
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedDate(event.date)}
                      >
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-[#8A63FF]">
                            {isEventToday ? 'Today' : event.date.split('-')[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                          <p className="text-xs text-gray-500">
                            {isEventToday ? 'Today' : eventDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)} mr-1`}>
                          {event.type}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SchedulePage;