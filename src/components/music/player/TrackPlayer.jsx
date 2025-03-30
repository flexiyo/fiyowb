import { useContext } from "react";
import UserContext from "../../../context/items/UserContext";
import MusicContext from "../../../context/items/MusicContext";

const TrackPlayer = ({ onOpenTrackDeck }) => {
  const { isUserAuthenticated } = useContext(UserContext);
  const {
    currentTrack,
    setCurrentTrack,
    audioProgress,
    isAudioPlaying,
    isAudioLoading,
    getTrack,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  } = useContext(MusicContext);

  const handlePlayPause = isAudioPlaying
    ? handleAudioPause
    : () => {
        if (currentTrack?.isExternal) {
          getTrack(currentTrack?.videoId);
          setCurrentTrack({ ...currentTrack, isExternal: false });
        } else {
          handleAudioPlay();
        }
      };

  return (
    <div
      className={`pb-1 fixed bottom-0 backdrop-blur-lg bg-black/20 rounded-t-md z-10 ${
        isUserAuthenticated && window.innerWidth <= 767 ? "mb-12" : ""
      } ${window.innerWidth <= 767 ? "w-[97%]" : "w-[calc(100%-7rem)]"}`}
    >
      <div className="rounded-md border-x border-t border-gray-400 dark:border-gray-800 h-18 flex flex-col justify-between bg-secondary-bg dark:bg-secondary-bg-dark">
        <div className="flex items-center justify-between p-2">
          <button className="flex-shrink-0" onClick={onOpenTrackDeck}>
            <img
              src={currentTrack.image}
              className="w-14 h-14 rounded-md object-cover"
              alt="Track Cover"
            />
          </button>

          <div className="flex-1 ml-3 overflow-hidden">
            <button className="text-start w-full" onClick={onOpenTrackDeck}>
              <p className="text-sm font-medium dark:text-gray-100 truncate">
                {currentTrack.title}
              </p>
              <p className="text-gray-400 text-xs font-medium dark:text-gray-500 truncate">
                {currentTrack.artists}
              </p>
            </button>
          </div>

          <div className="flex items-center ml-auto">
            <div className="mx-3">
              {!isAudioLoading ? (
                <button onClick={handlePlayPause}>
                  <svg
                    role="img"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width={25}
                    height={25}
                  >
                    <path
                      d={
                        isAudioPlaying
                          ? "M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"
                          : "m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                      }
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-current rounded-full" />
                </div>
              )}
            </div>

            <div className="mx-3">
              <button onClick={handleNextAudioTrack}>
                <svg
                  role="img"
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  width={20}
                  height={20}
                >
                  <path
                    d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="h-1 w-full bg-gray-800 rounded-b-md overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-b-md transition-all"
            style={{
              width: `${
                (audioProgress?.position / audioProgress?.duration) * 100 || 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackPlayer;
