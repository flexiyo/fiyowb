import axios from "axios";
import {
  openDB
} from "idb";
import {
  YTMUSIC_BASE_URI,
  FIYOSAAVN_BASE_URI
} from "../constants.js";

const useMusicUtils = ({
  audioRef,
  currentTrack,
  setCurrentTrack,
  setContinuation,
  setIsAudioPlaying,
  setIsAudioLoading,
  previouslyPlayedTracks,
  setPreviouslyPlayedTracks,
}) => {
  /** Open IndexedDB */
  const openTrackDB = async () => {
    return openDB("TrackCacheDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tracks")) {
          db.createObjectStore("tracks", {
            keyPath: "videoId"
          });
        }
      },
    });
  };

  /** Cache Track Data */
  const cacheTrackData = async (track) => {
    const db = await openTrackDB();
    const tx = db.transaction("tracks",
      "readwrite");
    const store = tx.objectStore("tracks");
    await store.put(track);
    await tx.done;
  };

  /** Get Cached Track Data */
  const getCachedTrackData = async (videoId) => {
    const db = await openTrackDB();

    const readTx = db.transaction("tracks",
      "readonly");
    const readStore = readTx.objectStore("tracks");
    const track = await readStore.get(videoId);
    await readTx.done;

    if (track?.createdAt < new Date().getTime() - 6 * 60 * 60 * 1000) {
      const writeTx = db.transaction("tracks", "readwrite");
      const writeStore = writeTx.objectStore("tracks");
      await writeStore.delete(videoId);
      await writeTx.done;
      return null;
    }

    return track;
  };

  /** Search Tracks */
  const searchTracks = async (term, continuation = null) => {
    setContinuation("");
    try {
      const {
        data
      } = await axios.get(
        `${YTMUSIC_BASE_URI}/search?term=${encodeURIComponent(term)}&${
        continuation ? `&continuation=${continuation}`: ""
        }`,
      );

      setContinuation(data.data?.continuation);

      return data.data?.results;
    } catch (error) {
      console.error(`Error searching: ${error}`);
      return [];
    }
  };

  /** Get Track Data */
  const getTrackData = async (videoId, tolerance = 10) => {
    try {
      // 1. Check cache
      const cached = await getCachedTrackData(videoId);
      if (cached) return cached;

      // 2. Get metadata from YT Music
      const {
        data: ytRes
      } = await axios.get(
        `${YTMUSIC_BASE_URI}/track?videoId=${videoId}`
      );
      const yt = ytRes?.data;
      if (!yt?.title) throw new Error("No valid YT Music track");

      // 3. Search on JioSaavn
      const {
        data: saavnRes
      } = await axios.get(
        `${FIYOSAAVN_BASE_URI}/search/songs?query=${encodeURIComponent(yt.title)}`
      );
      let tracks = saavnRes?.data?.results || [];
      if (!tracks.length) throw new Error("No Saavn results");

      // 4. Pick best match by duration
      let saavn = tracks[0];
      if (yt.duration) {
        saavn = tracks.find(
          t => Math.abs(t.duration - yt.duration) <= tolerance
        ) || saavn;
      }

      // 5. Build final track
      const duration = `${Math.floor(saavn.duration / 60)}:${(saavn.duration % 60)
      .toString().padStart(2, "0")}`;

      const track = {
        videoId,
        slug: yt.slug,
        title: yt.title,
        artists: yt.artists,
        image: saavn.image?.[3]?.url || saavn.image?.[2]?.url,
        duration,
        urls: {
          audio: saavn.downloadUrl?.map(d => ({
            quality: d.quality,
            url: d.url
          })) || []
        },
        playlistId: yt.playlistId,
        browseId: yt.browseId,
        createdAt: new Date(),
      };

      // 6. Cache & return
      await cacheTrackData(track);
      return track;

    } catch (err) {
      console.error(`Error fetching track data for ${videoId}: ${err.message}`);
      return null;
    }
  };

  /** Get Track */
  const getTrack = async (videoId) => {
    setIsAudioLoading(true);
    try {
      const fetchedTrackData = await getTrackData(videoId);
      if (!fetchedTrackData) return console.error("Error fetching track data");

      setCurrentTrack(fetchedTrackData);
      setPreviouslyPlayedTracks((prevTracks) => [...prevTracks, videoId]);
    } catch (error) {
      console.error(`Error in getTrack: ${error}`);
    } finally {
      setIsAudioLoading(false);
    }
  };

  /** Get Track Lyrics */
  const getTrackLyrics = async (browseId) => {
    try {
      const {
        data
      } = await axios.get(
        `${YTMUSIC_BASE_URI}/lyrics?browseId=${browseId}`,
      );
      
      if (!data?.data) return "No Lyrics Available";

      setCurrentTrack({
        ...currentTrack, lyrics: data?.data
      });
    } catch (error) {
      console.error(`Error fetching lyrics: ${error.message}`);
      return null;
    }
  };

  /** Handle Audio Play */
  const handleAudioPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
    }
    setIsAudioPlaying(true);
  };

  /** Handle Audio Pause */
  const handleAudioPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      await audio.pause();
    }
    setIsAudioPlaying(false);
  };

  /** Handle Next Audio Track */
  const handleNextAudioTrack = async () => {
    try {
      const {
        data
      } = await axios.get(
        `${YTMUSIC_BASE_URI}/next?videoId=${currentTrack.videoId}&playlistId=${
        currentTrack.playlistId
        }&previouslyPlayedTracks=${previouslyPlayedTracks.join(",") || ""}`,
      );
      const nextTrackId = data?.data?.videoId;

      if (!nextTrackId) return console.error("No next track found!");

      await getTrack(nextTrackId);
    } catch (error) {
      console.error(`Error in handleNextTrack: ${error}`);
    }
  };

  return {
    searchTracks,
    getTrackData,
    getTrack,
    getTrackLyrics,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  };
};

export default useMusicUtils;