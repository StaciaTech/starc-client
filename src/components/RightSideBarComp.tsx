import React, { memo, useMemo, useState, useEffect } from 'react';
import scheduleData from '../data/scheduleData.json';

// Schedule data type
interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  duration: string;
  type?: string;
}

const RightSideBarComp: React.FC = memo(() => {
  // Get today's date in DD-MM-YYYY format from user's device
  const getTodayDateStr = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly'>('daily');
  
  // Format date to display in readable format
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get day of week from date string
  const getDayOfWeek = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Check if date is today
  const isToday = (dateStr: string) => {
    return dateStr === getTodayDateStr();
  };
  
  // Generate week days for the week selector
  const weekDays = useMemo(() => {
    // Get current selected date
    const [day, month, year] = selectedDate.split('-');
    const currentDate = new Date(`${year}-${month}-${day}`);
    
    // Get first day of week (Sunday)
    const firstDayOfWeek = new Date(currentDate);
    const diff = currentDate.getDay();
    firstDayOfWeek.setDate(currentDate.getDate() - diff);
    
    // Generate array of 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        date: formattedDate,
        fullDate: date,
        isSelected: formattedDate === selectedDate,
        isToday: formattedDate === getTodayDateStr()
      };
    });
  }, [selectedDate]);

  // Find today's events or upcoming events
  const getTodayOrUpcomingEvents = useMemo(() => {
    const todayStr = getTodayDateStr();
    
    // First check if there are events today
    const todayEvents = scheduleData.classSchedule.filter(item => item.date === todayStr);
    
    // If there are events today, return them
    if (todayEvents.length > 0) {
      return { events: todayEvents, isToday: true };
    }
    
    // Otherwise find the next upcoming event
    const today = new Date();
    const upcomingEvents = scheduleData.classSchedule
      .filter(event => {
        const [day, month, year] = event.date.split('-');
        const eventDate = new Date(`${year}-${month}-${day}`);
        return eventDate > today;
      })
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('-');
        const [dayB, monthB, yearB] = b.date.split('-');
        return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime();
      });
    
    // Return the next upcoming event if available
    if (upcomingEvents.length > 0) {
      return { events: [upcomingEvents[0]], isToday: false };
    }
    
    return { events: [], isToday: false };
  }, []);

  // Get schedule for the selected date
  const scheduleForSelectedDate = useMemo(() => {
    const items: ScheduleItem[] = [];
    const eventForDate = scheduleData.classSchedule.find(item => item.date === selectedDate);
    
    // Create time slots from 9 AM to 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      const timeStr = `${hour <= 12 ? hour : hour - 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
      
      // If there's an event at this time, add it
      if (eventForDate && eventForDate.time.includes(`${hour <= 12 ? hour : hour - 12}:`)) {
        items.push({
          time: timeStr,
          title: eventForDate.title,
          description: eventForDate.description,
          duration: `${eventForDate.time} - ${eventForDate.duration}`,
          type: eventForDate.type
        });
      } else {
        // Otherwise add empty slot
        items.push({
          time: timeStr,
          title: "",
          description: "",
          duration: ""
        });
      }
    }
    
    return items;
  }, [selectedDate]);

  // Check if there are any events for the selected date
  const hasEventsForSelectedDate = useMemo(() => {
    return scheduleForSelectedDate.some(item => item.title !== "");
  }, [scheduleForSelectedDate]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(e.target.value as 'daily' | 'weekly');
  };

  // Get current event type badge color
  const getEventTypeColor = (type?: string) => {
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

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md p-3 sm:p-4">
      {/* Today's Schedule Header */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold text-[#8A63FF] truncate">
          {getTodayOrUpcomingEvents.isToday ? "Today's Schedule" : "Upcoming Schedule"}
        </h2>
        <select 
          className="text-[#8A63FF] border border-[#8A63FF] rounded-md px-1 py-0.5 sm:px-2 sm:py-1 text-xs flex-shrink-0"
          value={selectedView}
          onChange={handleViewChange}
          aria-label="View schedule by"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Date */}
      <p className="text-gray-500 text-xs sm:text-sm mb-3">
        {isToday(selectedDate) ? (
          <span className="font-medium text-[#8A63FF]">Today - {formatDate(selectedDate)}</span>
        ) : (
          `${formatDate(selectedDate)} (${getDayOfWeek(selectedDate)})`
        )}
      </p>

      {/* Week day selector */}
      <div className="flex justify-between bg-gray-100 p-1 sm:p-2 rounded-md mb-4 overflow-hidden">
        {weekDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day.date)}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm cursor-pointer relative ${
              day.isSelected ? "bg-[#8A63FF] text-white" : day.isToday ? "border border-[#8A63FF]" : "hover:bg-gray-200"
            }`}
          >
            {day.day}
            {day.isToday && !day.isSelected && (
              <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#8A63FF]"></span>
            )}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-1 overflow-y-auto" style={{ 
        scrollbarWidth: 'thin',
        maxHeight: 'calc(100vh - 210px)'
      }}>
        {hasEventsForSelectedDate ? (
          scheduleForSelectedDate.map((item, index) => (
            <div key={index} className="flex items-start py-1">
              {/* Time */}
              <div className="w-12 sm:w-14 flex-shrink-0">
                <p className="text-xs sm:text-sm text-gray-700 font-medium">{item.time}</p>
              </div>
              
              {/* Timeline line */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute left-0 top-3 h-full w-px bg-gray-300"></div>
                
                {/* Event card - only show if there's an event */}
                {item.title && (
                  <div className="ml-3 mb-3 border border-[#8A63FF] rounded-lg p-2 sm:p-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{item.title}</h3>
                      {item.type && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getEventTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2">{item.description}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{item.duration}</p>
                  </div>
                )}
                
                {/* Empty time slot */}
                {!item.title && (
                  <div className="ml-3 h-6 sm:h-8"></div> 
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-gray-100 rounded-full p-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">No events scheduled</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
              There are no events scheduled for this day.
            </p>
          </div>
        )}
      </div>
      
      {/* Quick navigation to today if not already on today */}
      {!isToday(selectedDate) && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setSelectedDate(getTodayDateStr())}
            className="text-xs bg-[#8A63FF]/10 text-[#8A63FF] px-3 py-1 rounded-full hover:bg-[#8A63FF]/20 transition-colors"
          >
            Jump to Today
          </button>
        </div>
      )}
    </div>
  );
});

RightSideBarComp.displayName = 'RightSideBarComp';

export default RightSideBarComp;
