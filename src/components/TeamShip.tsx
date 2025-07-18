// import { useRef, useState, useEffect } from "react";
// import aboutvideo from "../Assets/about-video/Backend web development - a complete overview.mp4";
// import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

// export default function TeamShipSection() {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [showVideo, setShowVideo] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const handlePlay = () => {
//     setShowVideo(true);
//     setTimeout(() => {
//       if (videoRef.current) {
//         videoRef.current.play();
//         setIsPlaying(true);
//       }
//     }, 100);
//   };

//   const handleTogglePlay = () => {
//     if (videoRef.current) {
//       if (videoRef.current.paused) {
//         videoRef.current.play();
//         setIsPlaying(true);
//       } else {
//         videoRef.current.pause();
//         setIsPlaying(false);
//       }
//     }
//   };

//   const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!videoRef.current || !duration) return;
//     const bar = e.currentTarget;
//     const clickX = e.nativeEvent.offsetX;
//     const newTime = (clickX / bar.clientWidth) * duration;
//     videoRef.current.currentTime = newTime;
//   };

//   const handleSkip = (seconds: number) => {
//     if (videoRef.current) {
//       let newTime = videoRef.current.currentTime + seconds;
//       if (newTime < 0) newTime = 0;
//       if (newTime > duration) newTime = duration;
//       videoRef.current.currentTime = newTime;
//     }
//   };

//   // update progress and times
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const updateProgress = () => {
//       setProgress((video.currentTime / video.duration) * 100);
//       setCurrentTime(video.currentTime);
//       setDuration(video.duration);
//     };

//     video.addEventListener("timeupdate", updateProgress);
//     video.addEventListener("loadedmetadata", updateProgress);
//     return () => {
//       video.removeEventListener("timeupdate", updateProgress);
//       video.removeEventListener("loadedmetadata", updateProgress);
//     };
//   }, [showVideo]);

//   // format time nicely
//   const formatTime = (seconds: number) => {
//     if (isNaN(seconds)) return "0:00";
//     const min = Math.floor(seconds / 60);
//     const sec = Math.floor(seconds % 60);
//     return `${min}:${sec < 10 ? "0" : ""}${sec}`;
//   };

//   return (
//     <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-12 md:py-16 bg-white text-gray-800">
//       <div className="w-full max-w-7xl mx-auto">
//         {/* Text Block */}
//         <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-8 md:gap-10 mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[80%] mb-8 sm:mb-10">
//           <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-xl xl:text-xl 3xl:text-4xl font-mont font-medium leading-tight mb-4 sm:mb-0">
//             The best software <br className="hidden sm:block" />teams ship quickly and often.
//           </h2>
//           <div className="w-full sm:w-1/2 md:w-[60%] lg:w-[70%] 3xl:w-[50%] flex flex-col justify-center">
//             <p className="text-gray-900 font-mont text-sm sm:text-base lg:text-sm 3xl:text-lg pr-0 sm:pr-6 md:pr-10 pb-2">
//               With its intuitive interface and powerful features, Stellar
//               empowers businesses to leverage technology for growth.
//             </p>
//             <div className="pt-3 sm:pt-5 lg:text-sm">
//               <button
//                 onClick={handlePlay}
//                 className="bg-[#8A63FF] text-white font-mont py-2 px-5 rounded-full hover:bg-[#7A53EF] transition"
//               >
//                 Watch Video
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Video Block */}
//         <div className="w-full flex justify-center items-center mt-4 sm:mt-6">
//           <div className="flex flex-col space-y-4 relative rounded-2xl overflow-hidden shadow-lg w-full sm:w-[90%] md:w-[85%] lg:w-[80%] aspect-video">
//             {!showVideo && (
//               <div className="relative w-full h-full flex justify-center border border-gray-200 rounded-xl">
//                 <img
//                   src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV0uO6brHoskULOyasOMXWHXxK_f83yTTCfQ&s"
//                   alt="Team Thumbnail"
//                   className="object-cover rounded-xl w-full h-full"
//                 />
//                 <button
//                   onClick={handlePlay}
//                   className="absolute inset-0 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 3xl:text-4xl flex items-center justify-center bg-black/40 text-white font-medium rounded-xl"
//                 >
//                   ▶ Play Video
//                 </button>
//               </div>
//             )}

//             {showVideo && (
//               <div
//                 className="relative w-full h-full aspect-video rounded-xl overflow-hidden"
//                 onMouseEnter={() => setHovered(true)}
//                 onMouseLeave={() => setHovered(false)}
//               >
//                 <video
//                   ref={videoRef}
//                   src={aboutvideo}
//                   className="w-full h-full object-cover rounded-xl"
//                 />

//                 {/* Play/Pause */}
//                 {hovered && (
//                   <button
//                     onClick={handleTogglePlay}
//                     className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition text-white rounded-xl"
//                   >
//                     {isPlaying ? <Pause size={60} /> : <Play size={60} />}
//                   </button>
//                 )}

//                 {/* Progress Bar with seeking */}
//                 {hovered && (
//                   <div
//                     className="absolute bottom-2 left-0 right-0 h-2 bg-gray-300 rounded-full mx-4 overflow-hidden cursor-pointer"
//                     onClick={handleSeek}
//                   >
//                     <div
//                       className="h-full bg-[#8A63FF] transition-all"
//                       style={{ width: `${progress}%` }}
//                     />
//                   </div>
//                 )}

//                 {/* Timer in bottom-right */}
//                 {hovered && (
//                   <div className="absolute bottom-4 right-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
//                     {formatTime(currentTime)} / {formatTime(duration)}
//                   </div>
//                 )}

//                 {/* 10 sec skip controls */}
//                 {hovered && (
//                   <>
//                     <button
//                       className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
//                       onClick={() => handleSkip(-10)}
//                     >
//                       <RotateCcw size={20} /> -10s
//                     </button>
//                     <button
//                       className="absolute bottom-4 left-20 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
//                       onClick={() => handleSkip(10)}
//                     >
//                       <RotateCw size={20} /> +10s
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <p className="text-center text-gray-900 font-mont mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base md:text-lg">
//         Experience the Stellar difference and unlock the true potential of your online
//       </p>
//     </section>
//   );
// }




import { useRef, useState, useEffect } from "react";
import aboutvideo from "../Assets/about-video/Backend web development - a complete overview.mp4";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

export default function TeamShipSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Intersection Observer to detect when section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Show and play video when section is in view
          setShowVideo(true);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0; // Ensure video starts from beginning
              videoRef.current.play().catch(() => {
                console.error("Autoplay prevented by browser");
              });
              setIsPlaying(true);
              setProgress(0);
              setCurrentTime(0);
            }
          }, 100);
        } else {
          // Pause and reset video when section leaves view
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
            setShowVideo(false); // Reset to show thumbnail
            setProgress(0);
            setCurrentTime(0);
          }
        }
      },
      {
        root: null, // Use viewport as root
        threshold: 0.5, // Trigger when 50% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handlePlay = () => {
    setShowVideo(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0; // Start from beginning
        videoRef.current.play().catch(() => {
          console.error("Play prevented by browser");
        });
        setIsPlaying(true);
        setProgress(0);
        setCurrentTime(0);
      }
    }, 100);
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          console.error("Play prevented by browser");
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const bar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const newTime = (clickX / bar.clientWidth) * duration;
    videoRef.current.currentTime = newTime;
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      videoRef.current.currentTime = newTime;
    }
  };

  // Update progress and times
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateProgress);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [showVideo]);

  // Format time nicely
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <section
      ref={sectionRef}
      className="px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-12 md:py-16 bg-white text-gray-800"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Text Block */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-8 md:gap-10 mx-auto w-full sm:w-[90%] md:w-[85%] lg:w-[80%] mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-xl xl:text-xl 3xl:text-4xl font-mont font-medium leading-tight mb-4 sm:mb-0">
            The best software <br className="hidden sm:block" />teams ship quickly and often.
          </h2>
          <div className="w-full sm:w-1/2 md:w-[60%] lg:w-[70%] 3xl:w-[50%] flex flex-col justify-center">
            <p className="text-gray-900 font-mont text-sm sm:text-base lg:text-sm 3xl:text-lg pr-0 sm:pr-6 md:pr-10 pb-2">
              With its intuitive interface and powerful features, Stellar
              empowers businesses to leverage technology for growth.
            </p>
            {/* <div className="pt-3 sm:pt-5 lg:text-sm">
              <button
                onClick={handlePlay}
                className="bg-[#8A63FF] text-white font-mont py-2 px-5 rounded-full hover:bg-[#7A53EF] transition"
              >
                Watch Video
              </button>
            </div> */}
          </div>
        </div>

        {/* Video Block */}
        <div className="w-full flex justify-center items-center mt-4 sm:mt-6">
          <div className="flex flex-col space-y-4 relative rounded-2xl overflow-hidden shadow-lg w-full sm:w-[90%] md:w-[85%] lg:w-[80%] aspect-video">
            {!showVideo && (
              <div className="relative w-full h-full flex justify-center border border-gray-200 rounded-xl">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV0uO6brHoskULOyasOMXWHXxK_f83yTTCfQ&s"
                  alt="Team Thumbnail"
                  className="object-cover rounded-xl w-full h-full"
                />
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 3xl:text-4xl flex items-center justify-center bg-black/40 text-white font-medium rounded-xl"
                >
                  ▶ Play Video
                </button>
              </div>
            )}

            {showVideo && (
              <div
                className="relative w-full h-full aspect-video rounded-xl overflow-hidden"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <video
                  ref={videoRef}
                  src={aboutvideo}
                  className="w-full h-full object-cover rounded-xl"
                  // muted // Ensures autoplay compatibility
                />

                {/* Play/Pause */}
                {hovered && (
                  <button
                    onClick={handleTogglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition text-white rounded-xl"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause size={60} /> : <Play size={60} />}
                  </button>
                )}

                {/* Progress Bar with seeking */}
                {hovered && (
                  <div
                    className="absolute bottom-2 left-0 right-0 h-2 bg-gray-300 rounded-full mx-4 overflow-hidden cursor-pointer"
                    onClick={handleSeek}
                    aria-label="Seek video"
                  >
                    <div
                      className="h-full bg-[#8A63FF] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Timer in bottom-right */}
                {hovered && (
                  <div className="absolute bottom-4 right-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                )}

                {/* 10 sec skip controls */}
                {hovered && (
                  <>
                    <button
                      className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                      onClick={() => handleSkip(-10)}
                      aria-label="Skip back 10 seconds"
                    >
                      <RotateCcw size={20} /> -10s
                    </button>
                    <button
                      className="absolute bottom-4 left-20 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                      onClick={() => handleSkip(10)}
                      aria-label="Skip forward 10 seconds"
                    >
                      <RotateCw size={20} /> +10s
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-gray-900 font-mont mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base md:text-lg">
        Experience the Stellar difference and unlock the true potential of your online
      </p>
    </section>
  );
}