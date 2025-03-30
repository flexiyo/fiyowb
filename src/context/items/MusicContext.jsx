import { createContext, useEffect, useState, useRef } from "react";
import { useContext } from "react";
import AppContext from "./AppContext";
import useMusicUtils from "../../hooks/useMusicUtils.js";

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState({});
  const [continuation, setContinuation] = useState(null);
  const [loopAudio, setLoopAudio] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isHandlingNextAudioTrack, setIsHandlingNextAudioTrack] =
    useState(false);
  const [previouslyPlayedTracks, setPreviouslyPlayedTracks] = useState([]);
  const [audioProgress, setAudioProgress] = useState({
    position: 0,
    duration: 0,
  });
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { contentQuality } = useContext(AppContext);
  const audioRef = useRef(new Audio());

  const MusicUtils = useMusicUtils({
    audioRef,
    currentTrack,
    continuation,
    setContinuation,
    setCurrentTrack,
    setIsAudioPlaying,
    setIsAudioLoading,
    previouslyPlayedTracks,
    setPreviouslyPlayedTracks,
  });

  useEffect(() => {
    if (isPlayerReady) return;

    try {
      const audio = audioRef.current;
      audio.preload = "metadata";
      setIsPlayerReady(true);
    } catch (error) {
      console.error("Error setting up Audio:", error);
      setIsPlayerReady(false);
    }
  }, [isPlayerReady]);

  useEffect(() => {
    if (!isPlayerReady) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      try {
        setAudioProgress({
          position: audio.currentTime,
          duration: audio.duration || 0,
        });

        if (
          audio.duration > 0 &&
          audio.currentTime >= audio.duration &&
          !isHandlingNextAudioTrack
        ) {
          setIsHandlingNextAudioTrack(true);
          if (loopAudio) {
            seekTo(0);
            handleAudioPlay();
          } else {
            handleNextAudioTrack();
          }
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    };

    const handleEnd = () => {
      if (loopAudio) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error("Loop play error:", err));
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [isAudioPlaying, loopAudio, isPlayerReady, isHandlingNextAudioTrack]);

  useEffect(() => {
    if (!currentTrack?.videoId || !currentTrack?.urls) return;

    const playAudio = async () => {
      try {
        setIsAudioLoading(true);
        const audio = audioRef.current;

        const getQualityIndex = (quality) => {
          switch (quality) {
            case "low":
              return 2;
            case "normal":
              return 1;
            case "high":
              return 0;
            default:
              return 0;
          }
        };

        if (
          audio.src !==
          currentTrack.urls?.audio?.[getQualityIndex(contentQuality)]
        ) {
          audio.src =
            currentTrack.urls?.audio?.[getQualityIndex(contentQuality)];
          audio.load();
        }

        await audio.play();
        setIsAudioPlaying(true);
      } catch (error) {
        console.error(`Error playing track: ${error}`);
      } finally {
        setIsHandlingNextAudioTrack(false);
        setIsAudioLoading(false);
      }
    };

    playAudio();
  }, [currentTrack?.videoId, currentTrack?.urls]);

  const handleNextAudioTrack = async () => {
    await MusicUtils.handleNextAudioTrack();
    setIsHandlingNextAudioTrack(false);
  };
  const seekTo = (position) => {
    if (!audioRef.current) return;
    setAudioProgress({ position, duration: audioProgress?.duration });
    audioRef.current.currentTime = position;
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        continuation,
        setContinuation,
        loopAudio,
        setLoopAudio,
        isAudioPlaying,
        setIsAudioPlaying,
        isAudioLoading,
        setIsAudioLoading,
        previouslyPlayedTracks,
        setPreviouslyPlayedTracks,
        audioProgress,
        setAudioProgress,
        handleNextAudioTrack,
        seekTo,
        ...MusicUtils,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export default MusicContext;
