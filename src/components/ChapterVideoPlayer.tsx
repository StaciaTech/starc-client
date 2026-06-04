import { useEffect, useState, useRef } from "react";
import {
  Play, Loader2, Film, RefreshCw,
  Volume2, AlertCircle, CheckCircle,
} from "lucide-react";
import { getChapterVideo, pollVideoStatus } from "@/services/ulearnService";

interface Props {
  courseId:       string;
  chapterId:      string;
  chapterTitle?:  string;
  chapterContent?: string;
}

const STATUS_STEPS = [
  { key: "generating_script",  label: "Script"   },
  { key: "generating_images",  label: "Images"   },
  { key: "generating_audio",   label: "Audio"    },
  { key: "stitching",          label: "Video"    },
  { key: "uploading",          label: "Upload"   },
];

const STATUS_MESSAGES: Record<string, string> = {
  pending:            "Queuing job…",
  generating_script:  "✍️ Writing script with AI…",
  generating_images:  "🎨 Generating visuals…",
  generating_audio:   "🎙️ Creating narration…",
  stitching:          "🎬 Stitching video…",
  uploading:          "☁️ Uploading to cloud…",
  completed:          "Ready",
  failed:             "Failed",
};

const GENERATING = [
  "pending","generating_script","generating_images",
  "generating_audio","stitching","uploading",
];

const ChapterVideoPlayer = ({
  courseId, chapterId, chapterTitle, chapterContent,
}: Props) => {
  const [status,    setStatus]    = useState("idle");
  const [videoUrl,  setVideoUrl]  = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoId,   setVideoId]   = useState("");
  const [duration,  setDuration]  = useState(0);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPoll = (vid: string) => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const res = await pollVideoStatus(vid);
        setStatus(res.status);
        if (res.status === "completed") {
          setVideoUrl(res.video.videoUrl);
          setThumbnail(res.video.thumbnailUrl);
          setDuration(res.video.durationSecs);
          stopPoll();
        }
        if (res.status === "failed") {
          setError(res.video.error || "Generation failed");
          stopPoll();
        }
      } catch { /* retry silently */ }
    }, 5000);
  };

  const trigger = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getChapterVideo(
        courseId, chapterId, chapterTitle, chapterContent
      );
      setVideoId(res.video._id);
      setStatus(res.status);

      if (res.status === "completed") {
        setVideoUrl(res.video.videoUrl);
        setThumbnail(res.video.thumbnailUrl);
        setDuration(res.video.durationSecs);
      } else if (res.status === "failed") {
        setError(res.video.error || "Generation failed");
      } else {
        startPoll(res.video._id);
      }
    } catch (err: any) {
      setError("Could not start video generation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => stopPoll(), []);

  const isGenerating = GENERATING.includes(status);
  const currStep     = STATUS_STEPS.findIndex(s => s.key === status);

  // ── IDLE ──
  if (status === "idle") return (
    <div className="bg-gradient-to-br from-[#8A63FF]/10 to-purple-50 rounded-[20px] p-8 text-center border border-[#8A63FF]/20">
      <div className="w-16 h-16 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-4">
        <Film className="w-8 h-8 text-[#8A63FF]" />
      </div>
      <h3 className="font-bold text-gray-900 mb-1 font-mont">AI Video Lesson</h3>
      <p className="text-sm text-gray-400 mb-5 font-mont">
        Generate a narrated video for <span className="font-semibold text-gray-600">{chapterTitle}</span>
      </p>
      <button
        onClick={trigger}
        disabled={loading}
        className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 font-mont"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
          : <><Play className="w-4 h-4" /> Generate Video</>}
      </button>
      <p className="text-xs text-gray-300 mt-3 font-mont">~2–3 min to generate · cached forever after</p>
    </div>
  );

  // ── GENERATING ──
  if (isGenerating) return (
    <div className="bg-white rounded-[20px] shadow-md p-8">
      {/* Spinner */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A63FF]" />
          <Film className="w-7 h-7 text-[#8A63FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="font-bold text-gray-900 font-mont">{STATUS_MESSAGES[status] || "Generating…"}</h3>
        <p className="text-sm text-gray-400 mt-1 font-mont">Your AI video is being created</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {STATUS_STEPS.map((step, idx) => {
          const done    = idx < currStep;
          const current = idx === currStep;
          return (
            <div key={step.key} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all font-mont ${
                done    ? "bg-[#8A63FF] text-white border-[#8A63FF]" :
                current ? "bg-[#8A63FF]/10 text-[#8A63FF] border-[#8A63FF]/40 animate-pulse" :
                          "bg-gray-50 text-gray-300 border-gray-200"
              }`}>
                {done    ? <CheckCircle className="w-3 h-3" />    :
                 current ? <Loader2 className="w-3 h-3 animate-spin" /> :
                           <span className="w-3 h-3 flex items-center justify-center">○</span>}
                {step.label}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`w-4 h-px ${idx < currStep ? "bg-[#8A63FF]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-300 mt-5 font-mont">
        This page will update automatically
      </p>
    </div>
  );

  // ── FAILED ──
  if (status === "failed") return (
    <div className="bg-red-50 border border-red-200 rounded-[20px] p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h3 className="font-semibold text-red-700 mb-1 font-mont">Video generation failed</h3>
      <p className="text-sm text-red-400 mb-5 font-mont">{error}</p>
      <button
        onClick={trigger}
        disabled={loading}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold mx-auto transition-colors disabled:opacity-50 font-mont"
      >
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  // ── COMPLETED ──
  return (
    <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnail}
          controls
          className="w-full h-full"
          preload="metadata"
          controlsList="nodownload"
        />
      </div>
      <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mont">
          <Volume2 className="w-3.5 h-3.5 text-[#8A63FF]" />
          <span>AI Narrated · {Math.round(duration)}s</span>
        </div>
        <button
          onClick={trigger}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#8A63FF] transition-colors font-mont disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3" />
          {loading ? "Starting…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
};

export default ChapterVideoPlayer;
