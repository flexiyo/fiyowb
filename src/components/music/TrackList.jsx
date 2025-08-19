import {
  memo,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
} from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import {
  MoreVertical,
  Share2,
  Download,
  Link,
  X
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
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [quality, setQuality] = useState("Normal");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const menuRef = useRef(null);

  const trackTitle = track?.title;
  const trackArtists = track?.artists || "Unknown Artist";
  const trackImage = track?.images?.[1]?.url;
  const trackId = track?.videoId;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  },
    [showOptionsMenu]);

  const handleClick = useCallback(async () => {
    if (loading || !trackId) return;
    setTrackLoading(true);
    await getTrack(trackId);
    setTrackLoading(false);
  },
    [getTrack,
      trackId,
      loading])

  const extractTrackSlug = (title,
    videoId) => {
    const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,
      "-")
    .replace(/^-+|-+$/g,
      "")
    .slice(0,
      15);
    return `${baseSlug}_${videoId}`;
  }

  const handleShare = useCallback(async () => {
    const shareUrl = `https://flexiyo.pages.dev/music/${extractTrackSlug(trackTitle, trackId)}`;
    try {
      if (navigator.share && navigator.canShare?.({
        url: shareUrl
      })) {
        await navigator.share({
          title: trackTitle,
          text: "Listen on Flexiyo",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        console.log("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
    setShowOptionsMenu(false);
  },
    [track,
      trackId,
      trackTitle,
      trackArtists]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = `https://flexiyo.pages.dev/music/${extractTrackSlug(trackTitle, trackId)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      console.log("Link copied to clipboard!");
    } catch (err) {
      console.log("Copy failed:", err);
    }
    setShowOptionsMenu(false);
  },
    [track,
      trackId]);

  const handleDownloadClick = useCallback(() => {
    setShowOptionsMenu(false);
    setShowDownloadModal(true);
  },
    []);

  const handleDownload = async () => {
  if (!trackId) {
    alert("Track ID not available.");
    return;
  }

  setDownloadLoading(true);

  try {
    const fetched = await getTrackData(trackId);
    const qualityIndex = {
      Low: 2,
      Normal: 3,
      High: 4,
    }[quality];

    const audioUrl = fetched?.urls?.audio?.[qualityIndex]?.url;
    if (!audioUrl) {
      alert("Download URL not available for the selected quality.");
      setDownloadLoading(false);
      return;
    }

    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error("Failed to fetch audio file.");
    const blob = await response.blob();

    const artists = fetched?.artists?.join(", ") || "Unknown Artist";
    const fileName = `${fetched.title || "track"} - ${artists}.mp3`;

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);

    setShowDownloadModal(false);
  } catch (err) {
    console.error(err);
    alert("Failed to download track.");
  } finally {
    setDownloadLoading(false);
  }
};

  const menuOptions = [{
    icon: Share2,
    label: "Share",
    onClick: handleShare,
  },
    {
      icon: Download,
      label: "Download",
      onClick: handleDownloadClick,
    },
    {
      icon: Link,
      label: "Copy Link",
      onClick: handleCopyLink,
    },
  ];

  return (
    <>
      <div className="flex flex-row items-center w-full gap-4 h-18 mb-3 rounded-md relative">
        {loading ? (
          <>
            <div className="w-15 h-15 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="flex flex-col w-2/3">
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
            <div className="ml-auto">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </>
        ): (
          <>
            <div
              onClick={handleClick}
              className="flex items-center flex-1 gap-4 cursor-pointer active:scale-98 transition-transform select-none min-w-0"
              >
              <img
              src={trackImage}
              alt={trackTitle}
              className={`w-15 h-15 rounded-lg object-cover dark:bg-gray-700 bg-gray-200 flex-shrink-0 ${
              trackLoading ? "animate-pulse": ""
              }`}
              loading="lazy"
              draggable={false}
              />
            <div className="flex flex-col flex-1 overflow-hidden text-left min-w-0">
              <p className="text-sm dark:text-gray-100 text-gray-900 truncate">
                {trackTitle}
              </p>
              <p className="text-xs text-gray-400 font-medium truncate dark:text-gray-400">
                {trackArtists}
              </p>
            </div>
          </div>

          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(!showOptionsMenu);
              }}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={`Options for ${trackTitle}`}
              >
              <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showOptionsMenu && (
                <motion.div
                  initial={ { opacity: 0, scale: 0.95, y: -10 }}
                  animate={ { opacity: 1, scale: 1, y: 0 }}
                  exit={ { opacity: 0, scale: 0.95, y: -10 }}
                  transition={ { duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden min-w-[160px]"
                  >
                  {menuOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.label}
                        onClick={option.onClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                        <IconComponent className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>

    {/* Download Quality Modal */}
    <AnimatePresence>
      {showDownloadModal && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          initial={ { opacity: 0 }}
          animate={ { opacity: 1 }}
          exit={ { opacity: 0 }}
          onClick={() => setShowDownloadModal(false)}
          aria-modal="true"
          role="dialog"
          >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden"
            initial={ { scale: 0.9, opacity: 0 }}
            animate={ { scale: 1, opacity: 1 }}
            exit={ { scale: 0.9, opacity: 0 }}
            transition={ { type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Download Track
              </h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                src={trackImage}
                alt={trackTitle || "Track"}
                className="w-16 h-16 rounded-xl object-cover"
                draggable={false}
                />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {trackTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {trackArtists}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="quality"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                >
                Audio Quality
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={downloadLoading}
                >
                <option value="Low">Low Quality (96 kbps)</option>
                <option value="Normal">Normal Quality (160 kbps)</option>
                <option value="High">High Quality (320 kbps)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                The download will start automatically
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                disabled={downloadLoading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloadLoading}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                downloadLoading
                ? "bg-blue-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                }`}
                >
                {downloadLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing...
                  </span>
                ): (
                  "Download"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</>
);
});

// ----------------- Skeleton Loader for TrackItem -----------------
const SkeletonTrackItem = () => (
<div className="flex flex-row items-center w-full gap-4 h-18 mb-3 rounded-md">
<div className="w-15 h-15 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
<div className="flex flex-col w-full">
<div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-2 animate-pulse" />
<div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
</div>
<div className="ml-auto">
<div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
</div>
</div>
);

// ----------------- TrackList -----------------
const TrackList = memo(({
tracks = [], loading, ref, onScrollEnd
}) => {
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
<TrackItem key={track.id || index} track={track} loading={loading} />
))}

{loading &&
Array.from({
length: 20
}).map((_, idx) => (
<SkeletonTrackItem key={`init-skeleton-${idx}`} />
))}
</>
): (
!loading && (
<div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
<p className="text-lg font-medium mb-2">
No tracks found
</p>
<p className="text-sm">
Try searching for something else
</p>
</div>
)
)}
</div>
);
});

export default TrackList;