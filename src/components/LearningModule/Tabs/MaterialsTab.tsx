import React from "react";
import { ShieldAlert, FileText, FileX, Maximize2, Lock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ExtendedChapter, ExtendedSubchapter } from "@/types/learning";
import { CourseStructure } from "@/services/courseStructureService";
import { format } from "date-fns";

interface MaterialsTabProps {
  courseStructure: CourseStructure | null;
  signedUrls: Map<string, string>;
  onViewDocument: (url: string, title: string) => void;
  isSubchapterUnlocked: (cIdx: number, sIdx: number) => boolean;
  courseStartDate: Date | null;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  courseStructure,
  signedUrls,
  onViewDocument,
  isSubchapterUnlocked,
  courseStartDate,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
        <ShieldAlert className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-900 text-sm">
            Secure Reading Mode
          </h4>
          <p className="text-xs text-blue-700 mt-1">
            Study materials are unlocked sequentially based on your batch schedule.
          </p>
        </div>
      </div>

      <Accordion
        type="multiple"
        className="w-full space-y-4"
        defaultValue={courseStructure?.chapters.map((c) => c._id)}
      >
        {courseStructure?.chapters.map((chapter: ExtendedChapter, index) => (
          <AccordionItem
            key={chapter._id}
            value={chapter._id}
            className="border rounded-lg bg-white px-0 overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
              <span className="font-medium text-gray-900">
                Chapter {index + 1}: {chapter.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {chapter.subchapters.length > 0 ? (
                chapter.subchapters.map((sub: ExtendedSubchapter, sIdx) => {
                  const isUnlocked = isSubchapterUnlocked(index, sIdx);
                  const materialUrl = sub.studyMaterialUrl
                    ? signedUrls.get(sub.studyMaterialUrl) ||
                      sub.studyMaterialUrl
                    : null;

                  // Calculate Unlock Date
                  let unlockDateStr = "";
                  if (!isUnlocked && courseStartDate) {
                    const weeksToUnlock = 2 * index;
                    const unlockDate = new Date(courseStartDate);
                    unlockDate.setDate(
                      unlockDate.getDate() + weeksToUnlock * 7,
                    );
                    unlockDate.setHours(0, 0, 0, 0);
                    unlockDateStr = format(unlockDate, "MMM do, yyyy");
                  }

                  return (
                    <div
                      key={sub._id}
                      className={`flex items-center justify-between p-4 border-t border-gray-100 ${
                        !isUnlocked ? "bg-gray-50 opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${
                            !isUnlocked
                              ? "bg-gray-200 text-gray-500"
                              : sub.studyMaterialUrl
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {!isUnlocked ? (
                            <Lock className="h-4 w-4" />
                          ) : sub.studyMaterialUrl ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <FileX className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h5
                            className={`font-medium text-sm ${
                              sub.studyMaterialUrl
                                ? "text-gray-800"
                                : "text-gray-400"
                            }`}
                          >
                            {sub.title}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {!isUnlocked
                              ? `Locked • Available ${unlockDateStr}`
                              : sub.studyMaterialUrl
                                ? "Secure Document"
                                : "No material uploaded"}
                          </p>
                        </div>
                      </div>
                      {isUnlocked && sub.studyMaterialUrl ? (
                        <Button
                          size="sm"
                          className="gap-2 bg-gray-900 text-white hover:bg-black"
                          onClick={() =>
                            onViewDocument(materialUrl!, sub.title)
                          }
                        >
                          <Maximize2 className="h-3 w-3" /> Read
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="text-gray-400"
                        >
                          {!isUnlocked ? "Locked" : "Unavailable"}
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-gray-400 italic">
                  No modules in this chapter.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default MaterialsTab;
