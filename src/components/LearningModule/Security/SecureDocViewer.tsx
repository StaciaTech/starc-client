import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Minimize2 } from "lucide-react";

interface SecureDocViewerProps {
  url: string;
  title: string;
  userId: string;
  onClose: () => void;
}

const SecureDocViewer: React.FC<SecureDocViewerProps> = ({
  url,
  title,
  userId,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enter fullscreen on mount
  useEffect(() => {
    const elem = containerRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.error(err));
    }
  }, []);

  // Security: block keyboard shortcuts for download/print
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "p" || e.key === "s")) ||
        (e.metaKey && (e.key === "p" || e.key === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("Download/Print disabled.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={
        {
          userSelect: "none",
          WebkitTouchCallout: "none",
        } as React.CSSProperties
      }
    >
      {/* Header Bar */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 h-5 w-5" />
          <span className="font-mono text-sm text-gray-300">
            SECURE VIEWER MODE
          </span>
        </div>
        <h2 className="font-bold text-lg hidden md:block">{title}</h2>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            onClose();
          }}
        >
          <Minimize2 className="mr-2 h-4 w-4" /> Exit
        </Button>
      </div>

      {/* Document Area */}
      <div className="flex-1 relative bg-gray-800 overflow-hidden">
        {/* Watermark overlay - pointer-events-none so scrolling works through it */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-10 flex flex-wrap content-center justify-center gap-24 rotate-12 select-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="text-white text-2xl font-bold whitespace-nowrap"
            >
              {userId} • DO NOT SHARE
            </div>
          ))}
        </div>

        {/* PDF iframe - z-10 so it's above background but below watermark, scrollable */}
        <iframe
          src={url}
          className="w-full h-full border-0 bg-white relative z-10"
          title="Secure Document"
          onContextMenu={(e) => e.preventDefault()}
          style={{ pointerEvents: "auto" }}
        />
      </div>
    </div>
  );
};

export default SecureDocViewer;
