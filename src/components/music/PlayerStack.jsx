import { useState, useContext, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import MusicContext from "../../context/items/MusicContext";
import TrackDeck from "./player/TrackDeck";
import TrackPlayer from "./player/TrackPlayer";

const PlayerStack = () => {
  const { currentTrack } = useContext(MusicContext);
  const [isTrackDeckOpen, setIsTrackDeckOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1023);

  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth <= 1023);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openTrackDeck = () => setIsTrackDeckOpen(true);
  const closeTrackDeck = () => setIsTrackDeckOpen(false);

  return (
    currentTrack?.videoId &&
    isTablet && (
      <div className="relative z-50 flex justify-center">
        {!isTrackDeckOpen && (
          <div className="fixed bottom-4 w-full flex justify-center z-40">
            <TrackPlayer onOpenTrackDeck={openTrackDeck} />
          </div>
        )}
        <Dialog.Root open={isTrackDeckOpen} onOpenChange={setIsTrackDeckOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" />
            <Dialog.DialogTitle hidden />
            <Dialog.Content className="fixed bottom-0 left-0 w-full h-full bg-primary-bg dark:bg-primary-bg-dark rounded-t-2xl shadow-lg z-50 text-white font-SpotifyMedium">
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 150) closeTrackDeck();
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="flex flex-col h-full"
              >
                <Dialog.Description hidden />
                <div className="w-12 h-1.5 bg-white/50 rounded-full mx-auto mt-4 mb-2" />
                <div className="flex justify-between items-center px-8 py-6">
                  <h2 className="text-lg font-semibold">Now Playing</h2>
                  <div className="flex gap-4">
                    <button
                      className="text-white"
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: "Listen on Flexiyo",
                              text: `Check out this track on Flexiyo!`,
                              url: `https://flexiyo.web.app/music/${currentTrack?.slug}`,
                            })
                            .catch((err) => console.log("Error sharing:", err));
                        } else {
                          // Fallback: Copy to clipboard
                          navigator.clipboard
                            .writeText(
                              `https://flexiyo.web.app/music/${currentTrack?.slug}`
                            )
                            .then(() => alert("Link copied to clipboard!"))
                            .catch(() => alert("Failed to copy link."));
                        }
                      }}
                    >
                      <Share2 size={30} />
                    </button>
                  </div>
                </div>
                <TrackDeck />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    )
  );
};

export default PlayerStack;
