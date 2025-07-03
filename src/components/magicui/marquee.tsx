import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  reverse?: boolean;
  fade?: boolean;
  vertical?: boolean;
}

export const Marquee = ({
  children,
  className,
  pauseOnHover = false,
  reverse = false,
  fade = false,
  vertical = false,
  ...props
}: MarqueeProps) => {
  const [duration, setDuration] = useState<string>("30s");
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (marqueeRef.current) {
      const marqueeEl = marqueeRef.current;
      const customDuration = getComputedStyle(marqueeEl).getPropertyValue("--duration");
      if (customDuration) {
        setDuration(customDuration);
      }
    }
  }, []);

  return (
    <div
      ref={marqueeRef}
      className={cn(
        "flex overflow-hidden",
        vertical ? "flex-col h-full" : "flex-row w-full",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around gap-4",
          vertical ? "flex-col animate-marquee-vertical" : "flex-row animate-marquee",
          reverse && (vertical ? "animate-marquee-vertical-reverse" : "animate-marquee-reverse"),
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{ 
          animationDuration: duration,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 justify-around gap-4",
          vertical ? "flex-col animate-marquee-vertical" : "flex-row animate-marquee",
          reverse && (vertical ? "animate-marquee-vertical-reverse" : "animate-marquee-reverse"),
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{ 
          animationDuration: duration,
        }}
      >
        {children}
      </div>
      {fade && (
        <>
          <div className={cn(
            "pointer-events-none absolute",
            vertical 
              ? "inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent" 
              : "inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent"
          )} />
          <div className={cn(
            "pointer-events-none absolute",
            vertical 
              ? "inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" 
              : "inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"
          )} />
        </>
      )}
    </div>
  );
}; 