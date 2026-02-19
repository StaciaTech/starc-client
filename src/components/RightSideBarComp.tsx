import React, { memo, useMemo, useState } from "react";
import { generateSchedule, ScheduleItem } from "../utils/scheduleGenerator";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Calendar as CalendarIcon,
  Maximize2,
  X,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
  parse,
  isValid,
  startOfDay,
  setHours,
} from "date-fns";

type ViewType = "daily" | "weekly" | "monthly" | "agenda";

interface RightSideBarCompProps {
  enrolledCourses?: any[];
}

const RightSideBarComp: React.FC<RightSideBarCompProps> = memo(
  ({ enrolledCourses = [] }) => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the visible month/week
    const [selectedDate, setSelectedDate] = useState(new Date()); // Tracks the highlighted day
    const [view, setView] = useState<ViewType>("daily");
    const [isExpanded, setIsExpanded] = useState(false);

    // Process Schedule Data into a map for fast lookup
    // Process Schedule Data into a map for fast lookup
    const eventsMap = useMemo(() => {
      // Transform enrolledCourses to the config format expected by generator
      const courseConfigs = enrolledCourses.map((course) => ({
        title: course.title,
        startDate: course.startDate || course.lastAccessed || new Date(), // Fallback logic
      }));

      // Generate flexible schedule
      const { classSchedule } = generateSchedule(courseConfigs);

      const map = new Map<string, ScheduleItem[]>();
      classSchedule.forEach((item) => {
        if (!map.has(item.date)) {
          map.set(item.date, []);
        }
        map.get(item.date)?.push(item);
      });
      return map;
    }, [enrolledCourses]);

    // Helper: Get events for a specific Date object
    const getEventsForDate = (date: Date) => {
      const dateStr = format(date, "dd-MM-yyyy");
      return eventsMap.get(dateStr) || [];
    };

    // Navigation Handlers
    const handlePrev = () => {
      if (view === "monthly") setCurrentDate(subMonths(currentDate, 1));
      else if (view === "weekly") setCurrentDate(addDays(currentDate, -7));
      else setCurrentDate(addDays(currentDate, -1));
    };

    const handleNext = () => {
      if (view === "monthly") setCurrentDate(addMonths(currentDate, 1));
      else if (view === "weekly") setCurrentDate(addDays(currentDate, 7));
      else setCurrentDate(addDays(currentDate, 1));
    };

    const handleDayClick = (date: Date) => {
      setSelectedDate(date);
      if (view === "monthly") {
        // If clicking a day in another month (preview), switch current month
        if (!isSameMonth(date, currentDate)) {
          setCurrentDate(startOfMonth(date));
        }
      }
      // For monthly view, we stay in monthly view but show selected day's events below.
      // For weekly, we just highlight.
    };

    // --- VIEWS ---

    // 1. Month View
    const renderMonthView = () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      return (
        <div className="w-full flex flex-col h-full">
          {/* Calendar Grid */}
          <div className="flex-none">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {eachDayOfInterval({ start: startDate, end: endDate }).map(
                (dayItem) => {
                  const dateStr = format(dayItem, "d");
                  const isSelected = isSameDay(dayItem, selectedDate);
                  const isCurrentMonth = isSameMonth(dayItem, monthStart);
                  const dayEvents = getEventsForDate(dayItem);
                  const isTodayDate = isToday(dayItem);

                  // Extract unique event types for dots
                  const eventTypes = Array.from(
                    new Set(dayEvents.map((e) => e.type)),
                  );

                  return (
                    <div
                      key={dayItem.toString()}
                      className={`
                    aspect-square flex flex-col items-center justify-center rounded-full cursor-pointer transition-all relative
                    ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                    ${isSelected ? "bg-[#8A63FF] text-white shadow-md scale-105" : "hover:bg-gray-50"}
                    ${isTodayDate && !isSelected ? "border border-[#8A63FF] text-[#8A63FF] font-bold" : ""}
                  `}
                      onClick={() => handleDayClick(dayItem)}
                    >
                      <span className="text-xs sm:text-sm">{dateStr}</span>
                      {/* Event Dots */}
                      <div className="absolute bottom-1 flex gap-0.5">
                        {eventTypes.slice(0, 3).map((type, idx) => {
                          let dotColor = "bg-[#8A63FF]";
                          if (type === "class" || type === "mentoring")
                            dotColor = isSelected ? "bg-white" : "bg-blue-500";
                          else if (type === "assignment")
                            dotColor = isSelected
                              ? "bg-white"
                              : "bg-emerald-500";
                          else if (type === "deadline")
                            dotColor = isSelected ? "bg-white" : "bg-rose-500";
                          else if (type === "project")
                            dotColor = isSelected ? "bg-white" : "bg-amber-500";
                          else if (type === "quiz")
                            dotColor = isSelected
                              ? "bg-white"
                              : "bg-fuchsia-500";

                          return (
                            <span
                              key={idx}
                              className={`w-1 h-1 rounded-full ${dotColor}`}
                            ></span>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Selected Day Events Preview (Mini List below month) */}
          <div className="flex-1 mt-4 pt-3 border-t border-gray-100 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {format(selectedDate, "MMM d, yyyy")}
            </h3>
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event, idx) => (
                  <EventCard key={idx} event={event} compact />
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No events scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    };

    // 2. Week View (Horizontal Strip)
    const renderWeekView = () => {
      const weekStart = startOfWeek(currentDate);
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        addDays(weekStart, i),
      );

      return (
        <div className="w-full flex flex-col h-full">
          {/* Horizontal Week Strip */}
          <div className="flex-none flex justify-between bg-gray-50 p-1.5 rounded-xl mb-3">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const hasEvents = getEventsForDate(day).length > 0;

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                  flex flex-col items-center justify-center w-9 h-14 rounded-lg cursor-pointer transition-all
                  ${isSelected ? "bg-[#8A63FF] text-white shadow-md transform scale-105" : "hover:bg-gray-200"}
                  ${isTodayDate && !isSelected ? "border border-[#8A63FF] text-[#8A63FF]" : "text-gray-600"}
                `}
                >
                  <span
                    className={`text-[10px] font-medium mb-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}
                  >
                    {format(day, "EEE")}
                  </span>
                  <span className="text-sm font-bold">{format(day, "d")}</span>
                  {hasEvents && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-[#8A63FF] mt-1"></div>
                  )}
                  {hasEvents && isSelected && (
                    <div className="w-1 h-1 rounded-full bg-white mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events List for Selected Date */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {format(selectedDate, "EEEE, MMM d")}
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {getEventsForDate(selectedDate).length} Events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-3">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event, idx) => (
                  <EventCard key={idx} event={event} />
                ))
              ) : (
                <EmptyState message="No events scheduled." />
              )}
            </div>
          </div>
        </div>
      );
    };

    // 3. Daily View (Timeline)
    const renderDailyView = () => {
      const items = getEventsForDate(selectedDate);
      // Fill timeline 9 AM - 6 PM
      const startHour = 9;
      const endHour = 18;
      const hours = Array.from(
        { length: endHour - startHour + 1 },
        (_, i) => i + startHour,
      );

      return (
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <h3 className="text-sm font-bold text-gray-800 mb-4 sticky top-0 bg-white z-10 py-3 border-b border-gray-100 flex items-center gap-2">
            <CalendarIcon size={16} className="text-[#8A63FF]" />
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[3.25rem] top-2 bottom-0 w-px bg-gray-100"></div>

            {hours.map((hour) => {
              const timeLabel = format(setHours(new Date(), hour), "h a");

              // Filter events that start at this hour (simple check)
              // Ideally parse real times, but string matching "9:00 AM" works for this JSON structure
              const eventsAtHour = items.filter((ev) => {
                // Clean time string: "09:00 AM" -> 9
                // "2:00 PM" -> 14
                const [timePart, meridiem] = ev.time.split(" "); // ["9:00", "AM"]
                const [h, m] = timePart.split(":").map(Number);
                let evHour24 = h;
                if (meridiem === "PM" && h !== 12) evHour24 += 12;
                if (meridiem === "AM" && h === 12) evHour24 = 0;
                return evHour24 === hour;
              });

              return (
                <div key={hour} className="flex group min-h-[4rem]">
                  {/* Time Label */}
                  <div className="w-12 text-xs font-medium text-gray-400 pt-1 text-right pr-4 flex-none">
                    {timeLabel}
                  </div>

                  {/* Event Space */}
                  <div className="flex-1 pb-4 relative">
                    {/* Horizontal Line at hour mark */}
                    {/* <div className="absolute top-3 left-0 right-0 h-px bg-gray-50 group-hover:bg-gray-100"></div> */}

                    {eventsAtHour.length > 0 ? (
                      eventsAtHour.map((event, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <EventCard event={event} />
                        </div>
                      ))
                    ) : (
                      // Empty slot visual
                      <div className="h-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // 4. Agenda View (All upcoming events)
    const renderAgendaView = () => {
      const today = startOfDay(new Date());

      // Regenerate or reuse the memoized list?
      // Optimization: We can derive this from eventsMap or just call generator again (cheap).
      // Better: Use a memoized flattened list.
      // For simplicity here, I'll access the map values.

      const allEvents = Array.from(eventsMap.values())
        .flat()
        .map((ev) => ({
          ...ev,
          dateObj: parse(ev.date, "dd-MM-yyyy", new Date()),
        }))
        .filter((ev) => isValid(ev.dateObj))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      // Group by Month/Year or just list with headers
      let lastDateStr = "";

      return (
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {allEvents.length === 0 ? (
            <EmptyState message="No events found." />
          ) : (
            <div className="space-y-4 pb-4">
              {allEvents.map((event: any, idx: number) => {
                const dateStr = format(event.dateObj, "EEEE, MMMM d, yyyy");
                const showHeader = dateStr !== lastDateStr;
                lastDateStr = dateStr;
                const isTodayDate = isSameDay(event.dateObj, new Date());

                return (
                  <div
                    key={idx}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {showHeader && (
                      <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-gray-100 mb-2 flex items-center justify-between">
                        <h3
                          className={`text-sm font-bold ${isTodayDate ? "text-[#8A63FF]" : "text-gray-700"}`}
                        >
                          {dateStr}
                        </h3>
                        {isTodayDate && (
                          <span className="text-[10px] bg-[#8A63FF] text-white px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                    )}
                    <EventCard event={event} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    // --- SUB COMPONENTS ---

    const EventCard = ({
      event,
      compact = false,
    }: {
      event: any;
      compact?: boolean;
    }) => {
      // 🎨 Color Logic based on event type
      let borderColor = "border-l-[#8A63FF]";
      let badgeColor = "bg-gray-100 text-gray-600";

      switch (event.type) {
        case "mentoring":
        case "class":
          borderColor = "border-l-blue-500";
          badgeColor = "bg-blue-100 text-blue-700";
          break;
        case "assignment": // Unlock (Green/Teal)
          borderColor = "border-l-emerald-500";
          badgeColor = "bg-emerald-100 text-emerald-700";
          break;
        case "deadline": // Due (Red/Orange)
          borderColor = "border-l-rose-500";
          badgeColor = "bg-rose-100 text-rose-700";
          break;
        case "project":
          borderColor = "border-l-amber-500";
          badgeColor = "bg-amber-100 text-amber-700";
          break;
        case "quiz": // Quiz (Pink/Fuchsia)
          borderColor = "border-l-fuchsia-500";
          badgeColor = "bg-fuchsia-100 text-fuchsia-700";
          break;
        default:
          borderColor = "border-l-[#8A63FF]";
          badgeColor = "bg-purple-100 text-purple-700";
      }

      return (
        <div
          className={`
        bg-white border-l-[3px] rounded-r-lg border-gray-200 p-3 shadow-sm hover:shadow-md transition-all group
        ${borderColor}
      `}
        >
          <div className="flex justify-between items-start mb-1">
            <h4
              className={`font-semibold text-gray-800 ${compact ? "text-xs line-clamp-1" : "text-sm"}`}
            >
              {event.title}
            </h4>
            {!compact && event.type && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${badgeColor}`}
              >
                {event.type === "deadline" ? "Due Date" : event.type}
              </span>
            )}
          </div>

          {!compact && event.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex items-center text-xs text-gray-400 font-medium">
            <span className="flex items-center">
              {/* Clock Icon */}
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {event.time}
            </span>
            {event.duration && <span className="ml-2">• {event.duration}</span>}
          </div>
        </div>
      );
    };

    const EmptyState = ({ message }: { message: string }) => (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <CalendarIcon size={24} className="opacity-50" />
        </div>
        <p className="text-sm">{message}</p>
      </div>
    );

    return (
      <div className="w-full h-full bg-white rounded-xl shadow-none p-0 flex flex-col overflow-hidden">
        {/* Header Panel */}
        <div className="flex-none p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {view === "agenda"
                ? "Agenda"
                : view === "daily"
                  ? "Daily Schedule"
                  : format(
                      currentDate,
                      view === "monthly" ? "MMMM yyyy" : "MMMM yyyy",
                    )}
            </h2>

            <div className="flex items-center gap-2">
              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 text-gray-400 hover:text-[#8A63FF] hover:bg-purple-50 rounded-md transition-colors"
                title="Expand Calendar"
              >
                <Maximize2 size={18} />
              </button>

              {/* View Selector */}
              <select
                value={view}
                onChange={(e) => {
                  const newView = e.target.value as ViewType;
                  setView(newView);
                }}
                className="text-xs font-medium bg-gray-50 border-none text-gray-600 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#8A63FF]/20 cursor-pointer hover:bg-gray-100 hover:text-[#8A63FF] transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="agenda">Agenda</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls (Hidden in Agenda view if undesired) */}
          {view !== "agenda" && (
            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-lg">
              <button
                onClick={handlePrev}
                className="p-1 px-3 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-[#8A63FF]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-gray-600">
                {view === "weekly"
                  ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d")}`
                  : view === "daily"
                    ? format(currentDate, "MMMM d")
                    : "Change Month"}
              </span>
              <button
                onClick={handleNext}
                className="p-1 px-3 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-[#8A63FF]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col">
          {view === "monthly" && renderMonthView()}
          {view === "weekly" && renderWeekView()}
          {view === "daily" && renderDailyView()}
          {view === "agenda" && renderAgendaView()}
        </div>

        {/* EXPANDED MODAL */}
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CalendarIcon className="text-[#8A63FF]" />
                  Full Schedule
                </h2>
                <div className="flex items-center gap-3">
                  {/* View Selector in Modal */}
                  <select
                    value={view}
                    onChange={(e) => setView(e.target.value as ViewType)}
                    className="text-sm font-medium bg-gray-100 border-none text-gray-700 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#8A63FF]/20 cursor-pointer"
                  >
                    <option value="daily">Daily View</option>
                    <option value="weekly">Weekly View</option>
                    <option value="monthly">Monthly View</option>
                    <option value="agenda">Agenda View</option>
                  </select>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Controls (Navigation) */}
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
                <button
                  onClick={handlePrev}
                  className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-all"
                >
                  <ChevronLeft size={18} className="mr-1" /> Previous
                </button>
                <span className="text-lg font-semibold text-gray-700">
                  {view === "weekly"
                    ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
                    : view === "daily"
                      ? format(currentDate, "EEEE, MMMM d, yyyy")
                      : format(currentDate, "MMMM yyyy")}
                </span>
                <button
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-all"
                >
                  Next <ChevronRight size={18} className="ml-1" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden p-6 bg-gray-50/50 flex flex-col">
                <div className="bg-white rounded-xl shadow-sm border p-4 h-full overflow-hidden flex flex-col">
                  {view === "monthly" && renderMonthView()}
                  {view === "weekly" && renderWeekView()}
                  {view === "daily" && renderDailyView()}
                  {view === "agenda" && renderAgendaView()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

RightSideBarComp.displayName = "RightSideBarComp";

export default RightSideBarComp;
