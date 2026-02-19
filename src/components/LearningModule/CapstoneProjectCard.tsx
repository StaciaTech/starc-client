import React from "react";
import { Lock, Rocket, Target } from "lucide-react";
import { format } from "date-fns";

interface CapstoneProjectCardProps {
  courseStructure: any;
  courseStartDate: Date | null;
  assignedCapstone: any; // Added prop
}

const CapstoneProjectCard: React.FC<CapstoneProjectCardProps> = ({
  courseStructure,
  courseStartDate,
  assignedCapstone,
}) => {
  console.log("DEBUG: assignedCapstone prop:", assignedCapstone);
  // Calculate Unlock Date: Last mentoring class (Last Chapter Start + 2 weeks?)
  
  let unlockDateStr = "TBD";
  let isUnlocked = false;

  if (courseStructure?.chapters && courseStartDate) {
    const totalChapters = courseStructure.chapters.length;
    if (totalChapters > 0) {
      const lastChapterIndex = totalChapters - 1;
      const weeksToUnlock = 2 * lastChapterIndex;
      
      const unlockDate = new Date(courseStartDate);
      unlockDate.setDate(unlockDate.getDate() + weeksToUnlock * 7);
      unlockDate.setHours(0, 0, 0, 0);

      const today = new Date();
      isUnlocked = today >= unlockDate;
      unlockDateStr = format(unlockDate, "MMMM do, yyyy");
    }
  }

  // If no capstone assigned yet, or structure not loaded
  if (!assignedCapstone) {
      // Show generic card or placeholder? OR still show "Capstone Project (Locked)"
      // Keeping it generic if no specific project assigned logic yet (e.g. user hasn't started)
      // But typically we assign at start.
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md mb-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-50 blur-xl"></div>
      
      <div className="relative flex items-center justify-between p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isUnlocked ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
            {isUnlocked ? <Rocket className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {assignedCapstone ? `Capstone: ${assignedCapstone.title}` : "Capstone Project"}
              {!isUnlocked && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  Locked
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              {isUnlocked && assignedCapstone 
                ? assignedCapstone.description.substring(0, 150) + "..." 
                : "Apply your skills in a final real-world project. This module unlocks during your last mentoring session."}
            </p>
            {!isUnlocked && (
              <p className="text-xs font-medium text-indigo-600 mt-2 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Available on {unlockDateStr}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            disabled={!isUnlocked}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isUnlocked
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isUnlocked ? "View Project Details" : "Locked"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapstoneProjectCard;
