import axios from "axios";
import { load } from "cheerio";
import { openDB } from "idb";
import { YTMUSIC_BASE_URI } from "../constants.js";

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
          db.createObjectStore("tracks", { keyPath: "videoId" });
        }
      },
    });
  };

  /** Cache Track Data */
  const cacheTrackData = async (track) => {
    const db = await openTrackDB();
    const tx = db.transaction("tracks", "readwrite");
    const store = tx.objectStore("tracks");
    await store.put(track);
    await tx.done;
  };

  /** Get Cached Track Data */
  const getCachedTrackData = async (videoId) => {
    const db = await openTrackDB();

    const readTx = db.transaction("tracks", "readonly");
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
      const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/search?term=${encodeURIComponent(term)}&${
          continuation ? `&continuation=${continuation}` : ""
        }`
      );

      setContinuation(data.data?.continuation);
      return data.data?.results;
    } catch (error) {
      console.error(`Error searching: ${error}`);
      return [];
    }
  };

  /** Get Track Data (Optimized) */
  const getTrackData = async (videoId, searchTerm) => {
    try {
      // Fire cache check and YTMusic API call in parallel
      const [cachedTrack, trackRes] = await Promise.all([
        getCachedTrackData(videoId),
        axios.get(`${YTMUSIC_BASE_URI}/track`, {
          params: { videoId, searchTerm },
        }),
      ]);

      if (cachedTrack) return cachedTrack;

      const data = trackRes?.data?.data;
      if (!data?.tS || !data?.tH) {
        throw new Error("Missing tS or tH in track response");
      }

      const { title, artists, images, duration, playlistId, browseId, tS, tH } =
        data;

      // Fetch GenYT links
      const linksHtml = await fetch(
        `https://www.genyt.net/getLinks.php?vid=${videoId}&s=${tS}&h=${tH}`
      ).then((res) => {
        if (!res.ok) throw new Error(`GenYT error: ${res.statusText}`);
        return res.text();
      });

      const $ = load(linksHtml);
      const urls = {
        audio: $("a.btn")
          .map((_, el) => $(el).attr("href"))
          .get()
          .filter((url) => url.includes("mime=audio%2Fwebm")),
      };

      const track = {
        videoId,
        title,
        artists,
        image: images?.[3]?.url || null,
        duration,
        urls,
        playlistId,
        browseId,
        createdAt: new Date(),
      };

      // Cache and return
      cacheTrackData(track); // Async, non-blocking
      return track;
    } catch (error) {
      console.error(`Error fetching track data: ${error.message}`);
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
      const trackRes = await axios.get(
        `${YTMUSIC_BASE_URI}/lyrics?browseId=${browseId}`
      );
      if (!trackRes?.data?.data) return "No Lyrics Available";

      setCurrentTrack({ ...currentTrack, lyrics: trackRes?.data?.data });
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
      const nextTrackRes = await axios.get(
        `${YTMUSIC_BASE_URI}/next?videoId=${currentTrack.videoId}&playlistId=${
          currentTrack.playlistId
        }&previouslyPlayedTracks=${previouslyPlayedTracks.join(",") || ""}`
      );
      const nextTrackId = nextTrackRes?.data?.data?.videoId;
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
