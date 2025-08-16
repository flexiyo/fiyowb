import React, { useState, useRef, useEffect, useCallback } from "react";

const AudioProgressBar = ({
  position,
  duration,
  setAudioProgress,
  audioRef,
  seekTo,
}) => {
  const progressBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPosition, setDraggedPosition] = useState(null);

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds && timeInSeconds !== 0) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const calculatePositionFromEvent = useCallback(
    (e) => {
      if (!progressBarRef.current || !duration) return null;

      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clickPosition = clientX - rect.left;
      const progressBarWidth = progressBar.clientWidth;

      const newPosition = Math.max(
        0,
        Math.min((clickPosition / progressBarWidth) * duration, duration)
      );

      return newPosition;
    },
    [duration]
  );

  const handleProgressBarClick = useCallback(
    (e) => {
      // Don't handle click if we're dragging
      if (isDragging) return;
      
      const newPosition = calculatePositionFromEvent(e);

      if (newPosition === null) return;

      seekTo(newPosition);

      setDraggedPosition(null);
      setIsDragging(false);
    },
    [calculatePositionFromEvent, seekTo, isDragging]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!duration) return;

      // Prevent text selection while dragging
      e.preventDefault();

      const newPosition = calculatePositionFromEvent(e);

      if (newPosition === null) return;

      setIsDragging(true);
      setDraggedPosition(newPosition);
    },
    [calculatePositionFromEvent, duration]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !duration) return;

      const newPosition = calculatePositionFromEvent(e);

      if (newPosition === null) return;

      setDraggedPosition(newPosition);
    },
    [isDragging, duration, calculatePositionFromEvent]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging || draggedPosition === null) {
      setIsDragging(false);
      setDraggedPosition(null);
      return;
    }

    seekTo(draggedPosition);

    setIsDragging(false);
    setDraggedPosition(null);
  }, [isDragging, draggedPosition, seekTo]);

  const handleTouchStart = useCallback((e) => {
    handleMouseDown(e);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const displayPosition = draggedPosition !== null ? draggedPosition : position;

  const progressPercentage =
    duration > 0 ? (displayPosition / duration) * 100 : 0;

  return (
    <div className="w-full">
      <div className="relative group mb-4">
        <div
          ref={progressBarRef}
          className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer relative"
          onClick={handleProgressBarClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            className="absolute left-0 top-0 h-full bg-green-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-md group-hover:shadow-lg" />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span>{formatTime(displayPosition)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgressBar;