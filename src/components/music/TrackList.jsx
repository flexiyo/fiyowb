import { memo, useContext, useState } from "react";
import { motion } from "framer-motion";
import MusicContext from "../../context/items/MusicContext";

const TrackItem = memo(({ track, loading }) => {
  const { getTrack } = useContext(MusicContext);

  const [trackLoading, setTrackLoading] = useState(false);

  const handleClick = async () => {
    setTrackLoading(true);
    await getTrack(track?.videoId);
    setTrackLoading(false);
  };

  return (
    <motion.button
      className="flex flex-row max-w-[500px] w-full mb-3 h-18 items-center justify-start active:scale-99 transition-all duration-50 cursor-pointer"
      onClick={handleClick}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {loading ? (
        <>
          <motion.div className="w-16 h-16 rounded-md bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="flex flex-col px-3 w-2/3">
            <motion.div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
            <motion.div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
          </div>
        </>
      ) : (
        <>
          <motion.img
            className={`w-16 h-16 rounded-md dark:bg-gray-700 bg-gray-200 object-cover ${
              trackLoading && "animate-pulse"
            }`}
            src={track?.images[1]?.url}
            alt="Track"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <div className="flex flex-col px-3 w-2/3">
            <p className="text-md text-start font-medium dark:text-gray-100 text-gray-900 truncate">
              {track?.title}
            </p>
            <p className="text-start text-gray-400 text-xs font-medium truncate">
              {track?.artists}
            </p>
          </div>
        </>
      )}
    </motion.button>
  );
});

const TrackList = memo(({ tracks, loading, ref, onScrollEnd }) => {
  const handleScroll = (e) => {
    if (!loading && e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 100) {
      onScrollEnd();
    }
  };
  return (
    <div className="h-screen w-full overflow-y-auto no-scrollbar pb-24" ref={ref} onScroll={handleScroll}>
      {tracks?.length > 0 &&
        tracks?.map((track) => (
          <TrackItem key={track?.videoId} track={track} loading={loading} />
        ))}
    </div>
  );
});

export default TrackList;
