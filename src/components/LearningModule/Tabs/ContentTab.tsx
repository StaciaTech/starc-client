import React from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, Lock, ArrowRight, FileQuestion, Trophy } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getEmbedUrl } from "@/utils/videoUtils";
import { ExtendedChapter, ExtendedSubchapter } from "@/types/learning";
import { CourseStructure } from "@/services/courseStructureService";

interface ContentTabProps {
  courseStructure: CourseStructure | null;
  unlockedSubchapters: Set<string>;
  completedQuizzes: Set<string>;
  completedSections: Set<string>; // Not used directly in this render but maybe needed?
  // Actually checking logic was: isSubUnlocked?

  selectedSection: {
    chapterIndex: number;
    subchapterIndex: number;
    sectionIndex: number;
    title: string;
    content: string;
    videoUrl?: string;
  } | null;

  signedUrls: Map<string, string>;

  onSelectSection: (cIdx: number, sIdx: number, secIdx: number) => void;
  onTakeQuiz: (quizId: string, subchapterId: string) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({
  courseStructure,
  unlockedSubchapters,
  completedQuizzes,
  selectedSection,
  signedUrls,
  onSelectSection,
  onTakeQuiz,
}) => {
  if (!selectedSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-[#8A63FF]" />
          <h2 className="text-xl font-bold text-gray-900">Course Overview</h2>
        </div>
        <p className="text-sm text-gray-500">
          Select a section from below or from the sidebar to start learning.
        </p>

        <Accordion
          type="multiple"
          className="w-full space-y-3"
          defaultValue={courseStructure?.chapters.map((c) => c._id)}
        >
          {courseStructure?.chapters
            .map((c, idx) => c as ExtendedChapter)
            .map((chapter, cIdx) => {
              const isChapterUnlocked =
                cIdx === 0 ||
                unlockedSubchapters.has(
                  courseStructure!.chapters[cIdx].subchapters[0]?._id,
                );

              return (
                <AccordionItem
                  key={chapter._id}
                  value={chapter._id}
                  className="border rounded-lg bg-white overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#8A63FF] text-white h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {cIdx + 1}
                      </span>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 text-sm">
                          {chapter.title}
                        </span>
                        {chapter.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      {!isChapterUnlocked && (
                        <Lock className="h-4 w-4 text-gray-400 ml-auto mr-2" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {chapter.subchapters.map(
                        (sub: ExtendedSubchapter, sIdx) => {
                          const isSubUnlocked =
                            cIdx === 0 && sIdx === 0
                              ? true
                              : unlockedSubchapters.has(sub._id);
                          const quizId = sub.quiz
                            ? typeof sub.quiz === "string"
                              ? sub.quiz
                              : sub.quiz._id
                            : null;
                          const quizPassed = quizId
                            ? completedQuizzes.has(quizId)
                            : false;

                          return (
                            <div
                              key={sub._id}
                              className={`flex items-center justify-between px-4 py-3 ${
                                isSubUnlocked
                                  ? "hover:bg-purple-50 cursor-pointer"
                                  : "opacity-60"
                              }`}
                              onClick={() => {
                                if (isSubUnlocked && sub.sections?.length > 0) {
                                  onSelectSection(cIdx, sIdx, 0);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded min-w-[2rem] text-center">
                                  {cIdx + 1}.{sIdx + 1}
                                </span>
                                <div>
                                  <p
                                    className={`text-sm font-medium ${
                                      isSubUnlocked
                                        ? "text-gray-800"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {sub.title}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {sub.sections?.length || 0} sections
                                    {sub.quiz && " • Has Quiz"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {quizPassed && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    ✓ Passed
                                  </span>
                                )}
                                {isSubUnlocked ? (
                                  <ArrowRight className="h-4 w-4 text-[#8A63FF]" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </div>
    );
  }

  const videoSrc = selectedSection.videoUrl
    ? signedUrls.get(selectedSection.videoUrl) ||
      getEmbedUrl(selectedSection.videoUrl)
    : null;

  return (
    <div className="space-y-4">
      {selectedSection.videoUrl && (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          {videoSrc?.includes("drive.google") ? (
            <iframe
              src={videoSrc}
              className="w-full h-full"
              allowFullScreen
              title={selectedSection.title}
            />
          ) : (
            <video
              src={videoSrc || ""}
              controls
              className="w-full h-full"
              controlsList="nodownload"
            />
          )}
        </div>
      )}
      <div className="prose max-w-none p-4 bg-white rounded-lg border">
        <ReactMarkdown>{selectedSection.content}</ReactMarkdown>
      </div>

      {/* QUIZ BUTTON IN CONTENT AREA */}
      {(() => {
        const currSub =
          courseStructure?.chapters[selectedSection.chapterIndex]?.subchapters[
            selectedSection.subchapterIndex
          ];
        const isLastSec =
          currSub &&
          selectedSection.sectionIndex === currSub.sections.length - 1;

        if (isLastSec && currSub?.quiz) {
          const quizId =
            typeof currSub.quiz === "string" ? currSub.quiz : currSub.quiz._id;
          const isPassed = completedQuizzes.has(quizId);

          return (
            <div className="flex justify-end mt-4">
              {isPassed ? (
                <Button
                  disabled
                  className="bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                >
                  <Trophy className="mr-2 h-4 w-4" /> Quiz Passed
                </Button>
              ) : (
                <Button
                  onClick={() => onTakeQuiz(quizId, currSub._id)}
                  className="bg-[#8A63FF] hover:bg-[#7a52e6] text-white"
                >
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Take Quiz: {currSub.quiz.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          );
        }
      })()}
    </div>
  );
};

export default ContentTab;
