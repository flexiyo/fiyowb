import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import MusicContext from "../../context/items/MusicContext";
import TrackDeck from "./player/TrackDeck";
import TrackPlayer from "./player/TrackPlayer";

const PlayerStack = () => {
  const { currentTrack, isTrackDeckOpen, setIsTrackDeckOpen } = useContext(MusicContext);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1023);

  // Memoize resize handler to prevent unnecessary re-renders
  const handleResize = useCallback(() => {
    setIsTablet(window.innerWidth <= 1023);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Memoize handlers to prevent recreations
  const openTrackDeck = useCallback(() => setIsTrackDeckOpen(true), [setIsTrackDeckOpen]);
  
  const closeTrackDeck = useCallback(() => setIsTrackDeckOpen(false), [setIsTrackDeckOpen]);

  // Optimized share handler
  const handleShare = useCallback(async () => {
    const shareUrl = `https://flexiyo.pages.dev/music/${currentTrack?.slug}`;
    
    try {
      if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
        await navigator.share({
          title: "Listen on Flexiyo",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // You can replace this with a toast notification for better UX
        console.log("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share/copy failed:", err);
    }
  }, [currentTrack?.slug]);

  // Optimized drag handler with better threshold
  const handleDragEnd = useCallback((_, info) => {
    const threshold = window.innerHeight * 0.25; // 25% of screen height
    if (info.offset.y > threshold || info.velocity.y > 500) {
      closeTrackDeck();
    }
  }, [closeTrackDeck]);

  // Memoize animation variants to prevent recreations
  const modalVariants = useMemo(() => ({
    hidden: { 
      y: "100%",
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 300,
        duration: 0.3
      }
    },
    visible: { 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 28, 
        stiffness: 280,
        duration: 0.4
      }
    }
  }), []);

  const overlayVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }), []);

  // Don't render if no current track or not on tablet
  if (!currentTrack?.videoId || !isTablet) {
    return null;
  }

  return (
    <div className="relative z-50 flex justify-center">
        {!isTrackDeckOpen && (
          <div
            className="fixed bottom-4 w-full flex justify-center z-40"
          >
            <TrackPlayer onOpenTrackDeck={openTrackDeck} />
          </div>
        )}

      <Dialog.Root open={isTrackDeckOpen} onOpenChange={setIsTrackDeckOpen}>
        <Dialog.Portal>
          <AnimatePresence>
            {isTrackDeckOpen && (
              <>
                <Dialog.Overlay asChild>
                  <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 backdrop-blur-md z-40"
                    style={{ 
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </Dialog.Overlay>

                <Dialog.Content asChild>
                  <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed bottom-0 left-0 w-full h-full bg-primary-bg dark:bg-primary-bg-dark z-50 font-SpotifyMedium overflow-hidden"
                    style={{
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      willChange: 'transform',
                      contain: 'layout style paint'
                    }}
                  >
                    <motion.div
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={{ top: 0, bottom: 0.3 }}
                      dragMomentum={false}
                      onDragEnd={handleDragEnd}
                      className="flex flex-col h-full"
                      style={{ 
                        touchAction: 'pan-y',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                    >
                      {/* Hidden accessibility elements */}
                      <Dialog.Title className="sr-only">Now Playing</Dialog.Title>
                      <Dialog.Description className="sr-only">
                        Music player with track details and controls
                      </Dialog.Description>

                      {/* Drag handle */}
                      <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-2 flex-shrink-0" />

                      {/* Header */}
                      <div className="flex justify-between items-center px-6 py-2 flex-shrink-0">                 <button
                          onClick={closeTrackDeck}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                          aria-label="Close track deck"
                        >
                          <ChevronDown 
                            size={28} 
                            className="text-gray-700 dark:text-gray-300" 
                          />
                        </button>
                        <h2 className="text-lg font-semibold text-black dark:text-white">
                          Now Playing
                        </h2>
                        <button
                          onClick={handleShare}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                          aria-label="Share track"
                        >
                          <Share2 
                            size={28} 
                            className="text-gray-700 dark:text-gray-300" 
                          />
                        </button>
                      </div>
                      <div className="overflow-y-auto transition-smooth overflow-x-hidden">
                        <TrackDeck />
                      </div>
                    </motion.div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default PlayerStack;