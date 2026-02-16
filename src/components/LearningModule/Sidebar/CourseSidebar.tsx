import React from "react";
import {
  BookOpen,
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Eye,
  FileQuestion,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CourseStructure } from "@/services/courseStructureService";

interface CourseSidebarProps {
  courseStructure: CourseStructure | null;
  progress: number;
  unlockedSubchapters: Set<string>;
  expandedChapters: string[];
  toggleChapter: (id: string) => void;
  expandedSubchapters: string[];
  toggleSubchapter: (id: string) => void;
  completedSections: Set<string>;
  completedQuizzes: Set<string>;
  quizScores: { [quizId: string]: number };
  selectedSection: {
    title: string;
  } | null;
  isSubchapterUnlocked: (cIdx: number, sIdx: number) => boolean;
  isSectionAccessible: (cIdx: number, sIdx: number, secIdx: number) => boolean;
  onSelectSection: (cIdx: number, sIdx: number, secIdx: number) => void;
  onNavigateToQuiz: (quizId: string, subchapterId: string) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  courseStructure,
  progress,
  unlockedSubchapters,
  expandedChapters,
  toggleChapter,
  expandedSubchapters,
  toggleSubchapter,
  completedSections,
  completedQuizzes,
  quizScores,
  selectedSection,
  isSubchapterUnlocked,
  isSectionAccessible,
  onSelectSection,
  onNavigateToQuiz,
}) => {
  return (
    <Card className="sticky top-4 max-h-[calc(100vh-100px)] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Course Progress</CardTitle>
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{progress}% Completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="flex-1 overflow-scroll p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-4 mt-2">
            {courseStructure?.chapters.map((chapter, cIdx) => {
              const isUnlocked =
                cIdx === 0 ||
                unlockedSubchapters.has(
                  courseStructure.chapters[cIdx].subchapters[0]?._id,
                );
              const isExpanded = expandedChapters.includes(chapter._id);

              return (
                <div
                  key={chapter._id}
                  className="border rounded-lg overflow-hidden bg-white"
                >
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer ${
                      isUnlocked ? "hover:bg-gray-50" : "bg-gray-100"
                    }`}
                    onClick={() => isUnlocked && toggleChapter(chapter._id)}
                  >
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <BookOpen className="h-4 w-4 text-[#8A63FF]" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <span
                        className={`font-medium text-sm ${
                          isUnlocked ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {chapter.title}
                      </span>
                    </div>
                    {isUnlocked &&
                      (isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      ))}
                  </div>

                  {isExpanded && isUnlocked && (
                    <div className="border-t">
                      {chapter.subchapters.map((sub, sIdx) => {
                        const isSubUnlocked = isSubchapterUnlocked(cIdx, sIdx);
                        const isSubExpanded = expandedSubchapters.includes(
                          sub._id,
                        );

                        return (
                          <div
                            key={sub._id}
                            className="border-b last:border-b-0"
                          >
                            <div
                              className={`flex items-center justify-between p-2 pl-6 cursor-pointer ${
                                isSubUnlocked
                                  ? "bg-gray-50/50 hover:bg-gray-100"
                                  : "bg-gray-50"
                              }`}
                              onClick={() =>
                                isSubUnlocked && toggleSubchapter(sub._id)
                              }
                            >
                              <div className="flex items-center gap-2">
                                {isSubUnlocked ? (
                                  <div className="w-2 h-2 rounded-full bg-[#8A63FF]" />
                                ) : (
                                  <Lock className="h-3 w-3 text-gray-300" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    isSubUnlocked
                                      ? "text-gray-800"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {sub.title}
                                </span>
                              </div>
                              {isSubUnlocked &&
                                (isSubExpanded ? (
                                  <ChevronDown className="h-3 w-3 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-gray-400" />
                                ))}
                            </div>

                            {isSubExpanded && isSubUnlocked && (
                              <div className="bg-white">
                                {sub.sections.map((sec, secIdx) => {
                                  const secId = `${cIdx}-${sIdx}-${secIdx}`;
                                  const isSecDone =
                                    completedSections.has(secId);
                                  const isSecUnlocked = isSectionAccessible(
                                    cIdx,
                                    sIdx,
                                    secIdx,
                                  );
                                  return (
                                    <div
                                      key={sec._id}
                                      className={`flex items-center justify-between py-2 px-3 pl-10 border-l-2 ml-4 mb-1 ${
                                        selectedSection?.title === sec.title
                                          ? "border-[#8A63FF] bg-purple-50"
                                          : "border-transparent"
                                      } ${
                                        isSecUnlocked
                                          ? "cursor-pointer hover:bg-gray-50"
                                          : "cursor-not-allowed opacity-60"
                                      }`}
                                      onClick={() =>
                                        isSecUnlocked &&
                                        onSelectSection(cIdx, sIdx, secIdx)
                                      }
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        {isSecDone ? (
                                          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                        ) : (
                                          <div className="h-3 w-3 border rounded-full border-gray-300 shrink-0" />
                                        )}
                                        <span className="text-sm truncate">
                                          {sec.title}
                                        </span>
                                      </div>
                                      {isSecUnlocked && (
                                        <Eye className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                                      )}
                                    </div>
                                  );
                                })}

                                {/* --- QUIZ LOGIC --- */}
                                {sub.quiz &&
                                  (() => {
                                    const quizId =
                                      typeof sub.quiz === "string"
                                        ? sub.quiz
                                        : sub.quiz._id;
                                    const passed = completedQuizzes.has(quizId);
                                    const score = quizScores[quizId];
                                    const lastSecId = `${cIdx}-${sIdx}-${
                                      sub.sections.length - 1
                                    }`;
                                    const quizUnlocked =
                                      completedSections.has(lastSecId) ||
                                      sub.sections.length === 0;

                                    return (
                                      <div
                                        className={`mx-4 mb-2 mt-1 p-2 rounded border flex items-center justify-between ${
                                          quizUnlocked
                                            ? passed
                                              ? "bg-green-50 border-green-200 cursor-default"
                                              : "bg-purple-50 border-purple-200 cursor-pointer"
                                            : "bg-gray-100 opacity-60"
                                        }`}
                                        onClick={() => {
                                          if (passed) {
                                            toast.info("Test already taken.");
                                            return;
                                          }
                                          if (quizUnlocked)
                                            onNavigateToQuiz(quizId, sub._id);
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <FileQuestion
                                            className={`h-4 w-4 ${
                                              passed
                                                ? "text-green-600"
                                                : "text-[#8A63FF]"
                                            }`}
                                          />
                                          <span className="text-sm font-medium">
                                            {passed ? "Test Taken" : "Quiz"}
                                          </span>
                                        </div>
                                        {passed ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-green-100 text-green-700 border-green-200"
                                          >
                                            {score}%
                                          </Badge>
                                        ) : quizUnlocked ? (
                                          <ArrowRight className="h-3 w-3 text-purple-400" />
                                        ) : (
                                          <Lock className="h-3 w-3 text-gray-400" />
                                        )}
                                      </div>
                                    );
                                  })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CourseSidebar;
