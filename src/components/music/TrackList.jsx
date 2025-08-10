import {
  memo,
  useContext,
  useState,
  useCallback
} from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import {
  ArrowDownCircle
} from "lucide-react";
import MusicContext from "../../context/items/MusicContext";

// ----------------- TrackItem -----------------
const TrackItem = memo(({
  track, loading
}) => {
  const {
    getTrack, getTrackData
  } = useContext(MusicContext);

  const [trackLoading, setTrackLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quality, setQuality] = useState("Normal");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setTrackLoading(true);
    await getTrack(track?.videoId);
    setTrackLoading(false);
  },
    [getTrack,
      track?.videoId,
      loading]);

  const handleDownload = async () => {
    setDownloadLoading(true);

    const qualityIndex = {
      Low: 2, Normal: 3, High: 4
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
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadLoading(false);
    setShowModal(false);
  };

  return (
    <div className="flex">
      <motion.div
        onClick={handleClick}
        initial={ { opacity: 0, y: 10 }}
        animate={ { opacity: 1, y: 0 }}
        exit={ { opacity: 0, y: 10 }}
        transition={ { duration: 0.3 }}
        disabled={loading}
        aria-label={`Play track ${track?.title || "unknown"}`}
        className="flex flex-row items-center w-full gap-4 h-18 mb-4 rounded-md active:scale-98 transition-transform cursor-pointer select-none"
        >
        {loading ? (
          <>
            <motion.div className="w-16 h-16 rounded-md bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="flex flex-col px-3 w-2/3">
              <motion.div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
              <motion.div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
            <div className="ml-auto w-6 h-6" />
          </>
        ): (
          <div className="flex justify-between items-center w-full gap-4">
            <motion.img
              src={track?.images[1]?.url}
              alt={track?.title || "Track image"}
              className={`w-16 h-16 rounded-lg object-cover dark:bg-gray-700 bg-gray-200 ${
              trackLoading ? "animate-pulse": ""
              }`}
              initial={ { scale: 0.9, opacity: 0 }}
              animate={ { scale: 1, opacity: 1 }}
              transition={ { duration: 0.3, ease: "easeOut" }}
              loading="lazy"
              draggable={false}
              />
            <div className="flex flex-col w-2/3 overflow-hidden text-left">
              <p className="text-md dark:text-gray-100 text-gray-900 truncate">
                {track?.title}
                {track?.name}
              </p>
              <p className="text-xs text-gray-400 font-medium truncate dark:text-gray-400">
                {/* track?.artists */}
                {track?.artists?.all?.map(a => a.name).join(", ") || ""; }
              </p>
            </div>

            {/* Push download button to right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="ml-auto text-gray-600 dark:text-gray-300 hover:bg-gray-800 p-2 py rounded-full transition-colors focus:outline-none focus:ring focus:ring-blue-500"
              aria-label={`Download ${track?.title || track?.name} track`}
              >
              <ArrowDownCircle className="w-7 h-7" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
            initial={ { opacity: 0 }}
            animate={ { opacity: 1 }}
            exit={ { opacity: 0 }}
            aria-modal="true"
            role="dialog"
            >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
              initial={ { scale: 0.95 }}
              animate={ { scale: 1 }}
              exit={ { scale: 0.95 }}
              transition={ { type: "spring", stiffness: 350, damping: 20 }}
              >
              {/* Track Info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                src={track?.images[1]?.url || track?.image[1]?.url}
                alt={track?.title || "Track"}
                className="w-16 h-16 rounded-xl object-cover"
                draggable={false}
                />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate overflow-hidden w-[50vw] max-w-xs">
                  {track?.title || track?.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-[50vw] max-w-xs">
                  {/* track?.artists */}
                  {track?.artists?.all?.map(a => a.name).join(", ") || ""; }
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
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500 transition"
                aria-label="Choose audio quality"
                disabled={downloadLoading}
                >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
              <p className="mt-3 text-gray-400 dark:text-gray-500 text-xs">
                Download by clicking the three dot after redirection!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={downloadLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloadLoading}
                className={`px-4 py-2 rounded-md font-medium text-white transition ${
                downloadLoading
                ? "bg-blue-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700"
                }`}
                >
                {downloadLoading ? "Preparing...": "Download"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
});

// ----------------- Skeleton Loader for TrackItem -----------------
const SkeletonTrackItem = () => (
<motion.div
layout
initial={ { opacity: 0,
y: 10 }}
animate={ { opacity: 1,
y: 0 }}
exit={ { opacity: 0,
y: 10 }}
transition={ { duration: 0.3 }}
className="flex flex-row items-center w-full gap-4 cursor-pointerl h-18 mb-4 rounded-md active:scale-98 transition-transform cursor-pointer select-none"
>
<div className="w-16 h-16 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
<div className="flex flex-col w-2/3">
<div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
<div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
</div>
<div className="ml-auto">
<div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
</div>
</motion.div>
);

// ----------------- TrackList -----------------
const TrackList = memo(({
tracks = [], loading, ref, onScrollEnd
}) => {
// Debounce scroll event to minimize multiple calls
const handleScroll = useCallback(
(e) => {
if (loading || !onScrollEnd || !e.target) return;

const {
scrollTop,
scrollHeight,
clientHeight
} = e.target;
if (scrollTop + clientHeight >= scrollHeight - 100) {
onScrollEnd();
}
},
[loading,
onScrollEnd]
);

return (
<div
ref={ref}
onScroll={handleScroll}
className="h-screen w-full overflow-y-auto no-scrollbar pb-24"
aria-label="Track list"
tabIndex={0}
>
{tracks.length > 0 ? (
<>
{tracks.map((track, index) => (
<TrackItem key={index} track={track} loading={loading} />
))}

{loading && Array.from({
length: 7
}).map((_, idx) => (
<SkeletonTrackItem key={`init-skeleton-${idx}`} />
)): (
<p className="text-center text-gray-500 dark:text-gray-400 mt-10">
No tracks available.
</p>
)}
</div>
);

export default TrackList;