import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { LikeIcon, CommentIcon, ShareIcon, MoreIcon, PlayIcon } from "../icons";

const Clips = () => {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(0);
  const [isLiked, setIsLiked] = useState({});
  const [showLikeAnimation, setShowLikeAnimation] = useState({});
  const videoRefs = useRef([]);
  const clipRefs = useRef([]);
  const likeAnimationTimeouts = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const getClips = async () => {
      setLoading(true);
      try {
        const mockClips = [
          {
            id: uuidv4(),
            creators: [
              {
                id: "user1",
                username: "creativecreator",
                full_name: "Creative Creator",
                avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                is_verified: true,
                followers_count: 125000,
              },
            ],
            media_key:
              "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            created_at: new Date("2025-02-15T18:30:00"),
            caption: "Check out this amazing sunset!",
            description:
              "Captured this breathtaking sunset at the beach last evening. The colors were unreal!",
            hashtags: "nature,sunset,beach,vibes",
            track: {
              id: "track123",
              title: "Summer Feelings",
              artists: ["Chill Beats"],
              link: "https://soundcloud.com/example/summer-feelings",
            },
            likes_count: 15243,
            comments_count: 342,
            shares_count: 128,
          },
          {
            id: uuidv4(),
            creators: [
              {
                id: "user2",
                username: "anothercreator",
                full_name: "Another Creator",
                avatar: "https://randomuser.me/api/portraits/men/70.jpg",
                is_verified: false,
                followers_count: 50000,
              },
            ],
            media_key:
              "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            created_at: new Date("2025-02-10T12:00:00"),
            caption: "Elephants Dream clip!",
            description: "A short clip from the Elephants Dream movie.",
            hashtags: "animation,movie,elephantsdream",
            track: {
              id: "track456",
              title: "Dreamy Sounds",
              artists: ["Ambient Music"],
              link: "https://soundcloud.com/example/dreamy-sounds",
            },
            likes_count: 8765,
            comments_count: 120,
            shares_count: 60,
          },
          {
            id: uuidv4(),
            creators: [
              {
                id: "user3",
                username: "thirdcreator",
                full_name: "Third Creator",
                avatar: "https://randomuser.me/api/portraits/women/70.jpg",
                is_verified: false,
                followers_count: 75000,
              },
            ],
            media_key:
              "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            created_at: new Date("2025-02-05T15:45:00"),
            caption: "Big Buck Bunny!",
            description: "A clip from the Big Buck Bunny open source movie.",
            hashtags: "animation,bunny,opensource",
            track: {
              id: "track789",
              title: "Forest Sounds",
              artists: ["Nature Ambiance"],
              link: "https://soundcloud.com/example/forest-sounds",
            },
            likes_count: 4567,
            comments_count: 85,
            shares_count: 40,
          },
        ];

        setClips(mockClips);
        setIsLiked(
          mockClips.reduce((acc, clip) => ({ ...acc, [clip.id]: false }), {})
        );
        setShowLikeAnimation(
          mockClips.reduce((acc, clip) => ({ ...acc, [clip.id]: false }), {})
        );
      } catch (error) {
        console.error("Clip fetch error:", error);
        setClips([]);
      } finally {
        setLoading(false);
      }
    };

    getClips();
  }, [activeCategory]);

  useEffect(() => {
    if (clipRefs.current.length > 0 && typeof playingIndex === "number") {
      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.6,
      };

      const observers = [];

      const handleIntersection = (index) => (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo(index);
            setPlayingIndex(index);
          } else {
            stopVideo(index);
          }
        });
      };

      clipRefs.current.forEach((clipRef, index) => {
        if (clipRef) {
          const observer = new IntersectionObserver(
            handleIntersection(index),
            observerOptions
          );
          observer.observe(clipRef);
          observers.push(observer);
        }
      });

      return () => {
        observers.forEach((observer, index) => {
          if (clipRefs.current[index]) {
            observer.unobserve(clipRefs.current[index]);
          }
        });
      };
    }
    return () => {};
  }, [clips]);

  useEffect(() => {
    if (clips.length > 0) {
      playVideo(playingIndex);
    }
  }, [clips]);

  const handleScroll = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1) {
      e.preventDefault();
      return;
    }

    const nextIndex = Math.round(scrollTop / clientHeight);

    if (playingIndex !== nextIndex) {
      stopVideo(playingIndex);
      setPlayingIndex(nextIndex);
      container.scrollTo({
        top: nextIndex * clientHeight,
        behavior: "smooth",
      });

      e.preventDefault();
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const handleLike = (clipId, e) => {
    e.stopPropagation();
    setIsLiked((prev) => ({ ...prev, [clipId]: !prev[clipId] }));
  };

  const handleDoubleTap = (clipId, index, e) => {
    e.stopPropagation();

    if (videoRefs.current[index]) {
      setIsLiked((prev) => ({ ...prev, [clipId]: true }));
      setShowLikeAnimation((prev) => ({ ...prev, [clipId]: true }));

      if (likeAnimationTimeouts.current[clipId]) {
        clearTimeout(likeAnimationTimeouts.current[clipId]);
      }

      likeAnimationTimeouts.current[clipId] = setTimeout(() => {
        setShowLikeAnimation((prev) => ({ ...prev, [clipId]: false }));
      }, 700);
    }
  };

  const playVideo = (index) => {
    if (!videoRefs.current[index]) {
      return;
    }

    const playPromise = videoRefs.current[index].play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          videoRefs.current[index].muted = false;
        })
        .catch((error) => {
          console.log("Autoplay prevented:", error);
        });
    }
  };

  const stopVideo = (index) => {
    if (!videoRefs.current[index]) {
      return;
    }

    videoRefs.current[index].pause();
  };

  const togglePlayPause = (index) => {
    if (playingIndex === index) {
      stopVideo(index);
      setPlayingIndex(null);
    } else {
      playVideo(index);
      setPlayingIndex(index);
    }
  };

  return (
    <div className="flex justify-center mx-auto w-full min-h-screen">
      <div className="flex flex-col lg:flex-row max-w-7xl w-full px-2 md:px-6 gap-6">
        <div className="flex flex-col lg:flex-row w-full">
          <div className="flex-1 lg:w-2/3 h-full">
            <div
              ref={containerRef}
              className="flex flex-col w-full max-w-3xl mx-auto overflow-y-scroll snap-y snap-mandatory h-screen no-scrollbar"
              onScroll={handleScroll}
            >
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              )}

              {!loading &&
                clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    ref={(el) => (clipRefs.current[index] = el)}
                    className="h-screen aspect-[9/16] flex flex-col relative mb-1 snap-start"
                  >
                    <div className="relative flex-1 bg-black overflow-hidden">
                      <div
                        className="h-full w-full"
                        onClick={() => togglePlayPause(index)}
                        onDoubleClick={(e) =>
                          handleDoubleTap(clip.id, index, e)
                        }
                      >
                        <video
                          ref={(el) => (videoRefs.current[index] = el)}
                          src={clip.media_key}
                          className="h-full w-full object-contain bg-black"
                          loop
                          playsInline
                          muted={true}
                          preload="metadata"
                          poster=""
                          disablePictureInPicture
                          style={{ objectFit: "cover" }}
                        />

                        {playingIndex !== index && (
                          <div
                            className="absolute inset-0 flex items-center justify-center text-white text-4xl"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            onClick={() => togglePlayPause(index)}
                          >
                            <PlayIcon />
                          </div>
                        )}
                      </div>

                      {showLikeAnimation[clip.id] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg
                            className="w-32 h-32 text-red-500 animate-ping"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}

                      <div className="absolute bottom-0 right-0 m-4 flex flex-col justify-end items-center space-y-8 ">
                        <button
                          className="flex flex-col items-center"
                          onClick={(e) => handleLike(clip.id, e)}
                        >
                          <LikeIcon filled={isLiked[clip.id]} />
                          <span className="text-white text-sm mt-1">
                            {formatNumber(
                              isLiked[clip.id]
                                ? clip.likes_count + 1
                                : clip.likes_count
                            )}
                          </span>
                        </button>

                        <button className="flex flex-col items-center">
                          <CommentIcon />
                          <span className="text-white text-sm mt-1">
                            {formatNumber(clip.comments_count)}
                          </span>
                        </button>

                        <button className="flex flex-col items-center">
                          <ShareIcon />
                          <span className="text-white text-sm mt-1">
                            {formatNumber(clip.shares_count)}
                          </span>
                        </button>

                        <button className="flex flex-col items-center">
                          <MoreIcon />
                        </button>

                        <div className="w-8 h-8 rounded-md bg-gray-800 overflow-hidden mt-2">
                          <img
                            src={
                              clip.track?.artists?.[0]?.avatar ||
                              "https://i.pravatar.cc/150?img=3"
                            }
                            alt="Track"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-12 p-4 bg-gradient-to-t from-black/40 to-transparent">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img
                              src={clip.creators[0]?.avatar}
                              alt={clip.creators[0]?.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-white font-medium flex items-center">
                                {clip.creators[0]?.username}
                                {clip.creators[0]?.is_verified && (
                                  <svg
                                    className="w-4 h-4 ml-1 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                )}
                              </p>
                              <button className="ml-2 px-3 py-1 text-sm font-semibold text-white border border-white/50 rounded-md hover:bg-white/10 transition">
                                Follow
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-white mb-2">{clip.caption}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {clip.hashtags.split(",").map((tag, idx) => (
                            <span key={idx} className="text-blue-400 text-sm">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {!loading && clips.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">
                    No clips found in this category
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clips;
