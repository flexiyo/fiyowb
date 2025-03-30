import React from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const MediaPreview = ({ type, mediaUrl, imageSettings = {} }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getFilterStyle = (settings) => {
    if (!settings) return {};
    return {
      filter: `
        brightness(${settings.brightness}%) 
        contrast(${settings.contrast}%) 
        saturate(${settings.saturation}%) 
        blur(${settings.blur}px)
        grayscale(${settings.grayscale}%)
        sepia(${settings.sepia}%)
        hue-rotate(${settings.hueRotate}deg)
      `,
      transform: `rotate(${settings.rotation}deg)`,
    };
  };

  if (!mediaUrl) {
    return (
      <div className="w-full h-full bg-secondary-bg dark:bg-secondary-bg-dark md:rounded-xl flex items-center justify-center">
        <p className="text-primary-text dark:text-primary-text-dark opacity-60">
          Select media to preview
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-black/30">
        {type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-contain"
              loop
              playsInline
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-4 px-2 backdrop-blur-sm bg-black/20 rounded-lg py-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause size={20} color="white" />
                  ) : (
                    <Play size={20} color="white" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-[var(--color-secondary-bg-dark)]/80 hover:bg-[var(--color-secondary-bg-dark)] transition-colors"
                >
                  {isMuted ? (
                    <VolumeX size={20} color="white" />
                  ) : (
                    <Volume2 size={20} color="white" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-black/10">
            <img
              src={mediaUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain select-none"
              style={getFilterStyle(imageSettings)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPreview;
