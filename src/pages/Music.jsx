import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music4Icon } from "lucide-react";
import CustomTopNav from "../layout/items/CustomTopNav";
import MusicContext from "../context/items/MusicContext";
import MusicSearchBox from "../components/music/MusicSearchBox";
import TrackList from "../components/music/TrackList";
import TrackDeck from "../components/music/player/TrackDeck";

const Music = () => {
  const {
    getTrack,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
    searchTracks,
    currentTrack,
    continuation,
    isAudioPlaying,
    audioProgress,
    seekTo,
  } = useContext(MusicContext);

  const location = useLocation();
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [isSearchBoxActive, setIsSearchBoxActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchBoxRef = useRef(null);
  const trackListRef = useRef(null);

  /** Live Params Modifier */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    if (currentTrack?.videoId) {
      queryParams.set("track", currentTrack.videoId);
      document.title = `${currentTrack?.title} - Flexiyo`;
    } else {
      queryParams.delete("track");
      document.title = "Flexiyo Music";
    }

    navigate({ search: queryParams.toString() }, { replace: true });
  }, [searchQuery, currentTrack?.videoId]);

  /** Query Params */
  useEffect(() => {
    const fetchTrackData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const q = queryParams.get("q");
      const trackParam = queryParams.get("track");

      if (trackParam && trackParam !== currentTrack?.videoId) {
        try {
          await getTrack(trackParam);
        } catch (error) {
          console.error("Error fetching track data:", error);
        }
      }

      if (q) {
        setSearchQuery(q);
        handleSearch(q);
      }
    };

    fetchTrackData();
  }, [location.search]);

  /** Top Tracks */
  useEffect(() => {
    if (!searchQuery) {
      setIsLoading(true);
      searchTracks("Top+Hindi+And+English+Tracks").then((tracks) => {
        setTracks(
          tracks?.sort(() => 0.5 - Math.random())
        );
        setIsLoading(false);
      });
    }
  }, [searchQuery]);

  /** Search Box */
  const openSearchBox = () => {
    setIsSearchBoxActive(true);
    searchBoxRef.current?.focus();
  };

  const closeSearchBox = () => {
    setIsSearchBoxActive(false);
    setSearchQuery("");
  };

  const handleSearch = async (query) => {
    if (!query?.trim()) return;

    setIsLoading(true);
    try {
      const results = await searchTracks(query);
      setTracks(results);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Key Press */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isSearchBoxActive) {
          closeSearchBox();
        } else {
          openSearchBox();
        }
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isAudioPlaying) {
          handleAudioPause();
        } else {
          handleAudioPlay();
        }
      }

      if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNextAudioTrack();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekTo(audioProgress?.position - 5);
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        seekTo(audioProgress?.position + 5);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchBoxActive, isAudioPlaying, audioProgress]);

  const handleTrackListScrollEnd = () => {
    if (tracks?.length < 40 && continuation) {
      searchTracks(searchQuery, continuation).then((tracks) => {
        setTracks((prevTracks) => [...prevTracks, ...tracks]);
      });
    }
  };

  return (
    <div className="flex justify-center mx-auto w-full h-screen font-SpotifyMedium overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full md:px-6 gap-6">
        <div className="flex-1 lg:min-w-7/12">
          <div className="flex flex-col h-full">
            <CustomTopNav
              logoImage={
                !isSearchBoxActive &&
                "https://cdnfiyo.github.io/img/logos/flexiyo.png"
              }
              keepBorder={false}
              title={!isSearchBoxActive && "Music"}
              midComponent={
                isSearchBoxActive && (
                  <MusicSearchBox
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchBoxRef={searchBoxRef}
                    closeSearchBox={closeSearchBox}
                    onSearch={handleSearch}
                  />
                )
              }
              rightIcons={
                !isSearchBoxActive
                  ? [
                      {
                        resource: (
                          <i
                            className="fa fa-search text-2xl"
                            aria-hidden="true"
                            title="Search (Ctrl+K)"
                          />
                        ),
                        onClick: openSearchBox,
                      },
                      {
                        resource: (
                          <i className="fa fa-gear text-2xl" title="Settings" />
                        ),
                        onClick: () => {},
                      },
                    ]
                  : []
              }
            />
            <div className="flex flex-col px-6 pt-2 gap-4 flex-grow pb-8">
              <TrackList
                tracks={tracks}
                loading={isLoading}
                ref={trackListRef}
                onScrollEnd={handleTrackListScrollEnd}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 hidden lg:block bg-gradient-to-b lg:min-w-5/12">
          {currentTrack?.videoId ? (
            <TrackDeck />
          ) : (
            <div className="w-full hidden lg:min-w-1/2 lg:block">
              <div className="flex flex-col justify-center items-center h-screen w-full bg-gradient-to-b from-primary-bg to-body-bg dark:from-primary-bg-dark dark:to-body-bg-dark ">
                <span className="chat-icon flex justify-center items-center w-28 h-28 border-4 border-white rounded-full">
                  <Music4Icon size={35} className="animate-pulse" />
                </span>
                <p className="py-6 animate-pulse">
                  Enjoy free music on Flexiyo
                </p>
                <button
                  className="bg-black dark:bg-white hover:opacity-80 transition-opacity text-white dark:text-black px-4 py-2 rounded-full"
                  onClick={() => getTrack(tracks[0]?.videoId)}
                >
                  Play #1 track
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Music;
