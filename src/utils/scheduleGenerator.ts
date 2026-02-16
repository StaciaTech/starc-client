import { addDays, addWeeks, format, parseISO } from "date-fns";
import scheduleData from "../data/scheduleData.json";

// Define the ScheduleItem type
export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  duration: string;
  type:
    | "class"
    | "mentoring"
    | "assignment"
    | "project"
    | "deadline"
    | "optional"
    | "interview"
    | "report"
    | "ceremony"
    | "quiz";
  date: string; // "DD-MM-YYYY"
}

export interface CourseScheduleConfig {
  title: string;
  startDate: string | Date; // "YYYY-MM-DD" or Date object
}

/**
 * Generates a dynamic schedule based on enrolled courses.
 *
 * Rules:
 * 1. Mentor Class: Every 2 weeks starting from startDate. Same day of week.
 * 2. Assignment Unlock: startDate + 7 days. Recurs every 2 weeks.
 * 3. Assignment Due: Unlock + 6 days. Recurs every 2 weeks.
 * 4. Merges with static scheduleData for other events (optional).
 *
 * @param courses Array of courses with start dates
 * @param durationMonths Number of months to generate
 */
export const generateSchedule = (
  courses: CourseScheduleConfig[] = [],
  durationMonths: number = 6,
): { classSchedule: ScheduleItem[] } => {
  const generatedEvents: ScheduleItem[] = [];

  // If no courses provided, use default generic schedule (fallback)
  if (courses.length === 0) {
    // Default fallback for demo if no courses enrolled
    courses = [{ title: "Course", startDate: "2026-02-16" }];
  }

  // Number of bi-weekly cycles to generate
  const cycles = Math.ceil((durationMonths * 4) / 2);

  courses.forEach((course) => {
    const startDate =
      typeof course.startDate === "string"
        ? parseISO(course.startDate as string)
        : course.startDate;

    // Prefix for titles to distinguish courses
    const prefix = courses.length > 1 ? `${course.title}: ` : "";

    for (let i = 0; i < cycles; i++) {
      // 1. Mentor Class (Bi-weekly from start)
      const mentorClassDate = addWeeks(startDate, i * 2);
      generatedEvents.push({
        date: format(mentorClassDate, "dd-MM-yyyy"),
        title: `${prefix}Mentor Class ${i + 1}`,
        description: `Live interactive session for ${course.title}.`,
        time: "10:00 AM", // Default time
        duration: "2 hours",
        type: "mentoring",
      });

      // 2. Assignment Unlock (Start + 7 days, then bi-weekly)
      const assignmentUnlockDate = addDays(addWeeks(startDate, i * 2), 7);
      generatedEvents.push({
        date: format(assignmentUnlockDate, "dd-MM-yyyy"),
        title: `${prefix}Assignment ${i + 1} Unlocked`,
        description: `New assignment for ${course.title} is now available.`,
        time: "09:00 AM",
        duration: "1 hour", // Just a marker
        type: "assignment",
      });

      // 3. Quiz Available (Immediately after Mentor Class)
      generatedEvents.push({
        date: format(mentorClassDate, "dd-MM-yyyy"),
        title: `${prefix}Quiz ${i + 1} Available`,
        description: `Complete the quiz after the mentor class.`,
        time: "01:00 PM",
        duration: "30 mins",
        type: "quiz",
      });

      // 4. Quiz Due (Day before next Mentor Class)
      const quizDueDate = addDays(mentorClassDate, 13);
      generatedEvents.push({
        date: format(quizDueDate, "dd-MM-yyyy"),
        title: `${prefix}Quiz ${i + 1} Due`,
        description: `Deadline to complete Quiz ${i + 1}.`,
        time: "11:59 PM",
        duration: "",
        type: "quiz",
      });

      // 5. Assignment Due (Unlock + 6 days => Start + 13 days)
      const assignmentDueDate = addDays(assignmentUnlockDate, 6);
      generatedEvents.push({
        date: format(assignmentDueDate, "dd-MM-yyyy"),
        title: `${prefix}Assignment ${i + 1} Due`,
        description: `Deadline to submit assignment for ${course.title}.`,
        time: "11:59 PM",
        duration: "",
        type: "deadline",
      });

      // 5. Capstone Project Reminder
      if (i === 2) {
        // After 4 weeks (approx 1 month)
        generatedEvents.push({
          date: format(addDays(startDate, 30), "dd-MM-yyyy"),
          title: `${prefix}Capstone Kickoff`,
          description: `Capstone Project initialization for ${course.title}.`,
          time: "02:00 PM",
          duration: "1.5 hours",
          type: "project",
        });
      }
    }
  });

  // Append static events (ensure types match)
  const staticEvents = (scheduleData.classSchedule || []).map((item: any) => ({
    ...item,
    type: item.type || "optional",
  })) as ScheduleItem[];

  // Merge and sort by date?
  // Sorting happens in component usually, but good to return mixed list.

  return {
    classSchedule: [...generatedEvents, ...staticEvents],
  };
};
