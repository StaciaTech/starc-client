import React from "react";
import { Video, Card } from "lucide-react";
import { getEmbedUrl } from "@/utils/videoUtils";
import { ExtendedChapter } from "@/types/learning";
import { CourseStructure } from "@/services/courseStructureService";

interface VideosTabProps {
  courseStructure: CourseStructure | null;
  signedUrls: Map<string, string>;
}

const VideosTab: React.FC<VideosTabProps> = ({
  courseStructure,
  signedUrls,
}) => {
  return (
    <div className="space-y-8">
      {courseStructure?.chapters.map((chapter: ExtendedChapter, index) => {
        const videoSrc = chapter.videoUrl
          ? signedUrls.get(chapter.videoUrl) || getEmbedUrl(chapter.videoUrl)
          : null;

        return (
          <div key={chapter._id} className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">
                Chapter {index + 1}
              </span>
              {chapter.title}
            </h3>

            {chapter.videoUrl ? (
              <div className="rounded-xl overflow-hidden bg-black shadow-sm border border-gray-200">
                {videoSrc?.includes("drive.google") ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={videoSrc}
                      className="w-full h-full"
                      allowFullScreen
                      title={chapter.title}
                    />
                  </div>
                ) : (
                  <video
                    src={videoSrc || ""}
                    controls
                    className="w-full h-auto aspect-video"
                    controlsList="nodownload"
                    preload="metadata"
                  />
                )}
                <div className="p-4 bg-white border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900">
                    {chapter.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Video Lecture</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6">
                <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-100 p-3 rounded-full mb-2">
                    <Video className="h-8 w-8 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium">
                    No Video Available
                  </span>
                  <span className="text-xs">
                    This chapter does not have a video lecture yet.
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VideosTab;
