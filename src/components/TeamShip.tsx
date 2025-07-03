import { useRef, useState } from "react";
import aboutvideo from "../Assets/about-video/Backend web development - a complete overview.mp4";

export default function TeamShipSection() {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const defaultVideoURL = { aboutvideo }; // Default video URL

  const handlePlay = () => {
    setShowVideo(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  return (
    <section className="px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-12 md:py-16 bg-white text-gray-800">
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
            <div className="pt-3 sm:pt-5 lg:text-sm">
              <button
                onClick={handlePlay}
                className="bg-[#8A63FF] text-white font-mont py-2 px-5 rounded-full hover:bg-[#7A53EF] transition"
              >
                Watch Video
              </button>
            </div>
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
              <div className="w-full h-full aspect-video">
                <video
                  ref={videoRef}
                  src={aboutvideo}
                  controls
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-gray-900 font-mont mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base md:text-lg">
        Experience the Stellar difference and unlock the true potential of your
        online
      </p>
    </section>
  );
}