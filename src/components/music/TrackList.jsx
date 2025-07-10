import { memo, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";
import MusicContext from "../../context/items/MusicContext";

const TrackItem = memo(({ track, loading }) => {
  const { getTrack, getTrackData } = useContext(MusicContext);

  const [trackLoading, setTrackLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quality, setQuality] = useState("Normal");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleClick = async () => {
    setTrackLoading(true);
    await getTrack(track?.videoId);
    setTrackLoading(false);
  };
  const handleDownload = async () => {
    setDownloadLoading(true);
  
    const qualityIndex = {
      Low: 2,
      Normal: 1,
      High: 0,
    }[quality];
  
    const fetched = await getTrackData(track?.videoId);
    const selectedUrl = fetched?.urls?.audio?.[qualityIndex];
  
    if (!selectedUrl) {
      alert("Download URL not available.");
      setDownloadLoading(false);
      return;
    }
  
    const link = document.createElement("a");
    link.href = selectedUrl;
    link.download = `${track?.title || "track"}_${quality}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    setDownloadLoading(false);
    setShowModal(false);
  };
  

  return (
    <>
      <motion.button
        className="flex flex-row max-w-[500px] w-full mb-3 h-18 items-center justify-start active:scale-99 transition-all duration-50 cursor-pointer relative"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="ml-auto text-gray-200 hover:bg-gray-800 p-2 rounded-full"
              aria-label="Download track"
            >
              <ArrowDownCircle className="w-6 h-6" />
            </button>
          </>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-md relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              {/* Track Display */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={track?.images[1]?.url}
                  alt={track?.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {track?.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {track?.artists}
                  </p>
                </div>
              </div>

              {/* Quality Selector */}
              <div className="mb-6">
                <label
                  htmlFor="quality"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Audio Quality
                </label>
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              <p className="mt-3 text-gray-300">Download by clicking the three dot after redirection!</p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={downloadLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className={`px-4 py-2 rounded-md font-medium text-white ${
                    downloadLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {downloadLoading ? "Preparing..." : "Download"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

const TrackList = memo(({ tracks, loading, ref, onScrollEnd }) => {
  const handleScroll = (e) => {
    if (
      !loading &&
      e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 100
    ) {
      onScrollEnd();
    }
  };
  return (
    <div
      className="h-screen w-full overflow-y-auto no-scrollbar pb-24"
      ref={ref}
      onScroll={handleScroll}
    >
      {tracks?.length > 0 &&
        tracks?.map((track) => (
          <TrackItem key={track?.videoId} track={track} loading={loading} />
        ))}
    </div>
  );
});

export default TrackList;
