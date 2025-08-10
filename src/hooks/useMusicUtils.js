import axios from "axios";
import {
  load
} from "cheerio";
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
      /* const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/search?term=${encodeURIComponent(term)}&${
          continuation ? `&continuation=${continuation}` : ""
        }`,
      ); */

      const {
        data
      } = await axios.get(
        `${FIYOSAAVN_BASE_URI}/search/songs?query=${encodeURIComponent(term)}&limit=40&${
        continuation ? `&page=${continuation}`: ""
        }`,
      );

      //setContinuation(data.data?.continuation);
      setContinuation(continuation + 1)
      // return data.data?.results;
      return data.data?.results;
    } catch (error) {
      console.error(`Error searching: ${error}`);
      return [];
    }
  };

  /** Get Track Data */
  const getTrackData = async (videoId) => {
    try {
      const cachedTrack = await getCachedTrackData(videoId);
      if (cachedTrack) {
        return cachedTrack;
      }

      /* const trackRes = await axios.get(
        `${YTMUSIC_BASE_URI}/track?videoId=${videoId}`,
      ); */

      const {
        data
      } = await axios.get(
        `${FIYOSAAVN_BASE_URI}/songs/${videoId}`,
      );

      // const trackData = data?.data;
      const trackData = data?.data?.[0];

      // const { slug, title, artists, images, duration, playlistId, browseId } = trackData;

      const {
        url,
        name: title,
        artists: artistsList,
        image: images,
        duration: durationSeconds,
        downloadUrl
      } = trackData;

      const parts = url.split("/")
      const slug = `${parts[parts.length - 2]}_${parts[parts.length - 1]}`;

      const artists = artistsList?.all?.map(a => a.name).join(", ") || "";

      const duration = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, "0")}`;

      /* const htmlRes = await fetch(`https://video.genyt.net/${videoId}`, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "User-Agent": navigator.userAgent || "Mozilla/5.0",
          Referer: "https://genyt.net/",
        },
      });

      const html = await htmlRes.text();
      const $page = load(html);
      const scriptText = $page("script").text();

      const mp3secMatch = scriptText.match(
        /var\s+mp3sec\s*=\s*['"]([^'"]+)['"]/,
      );
      const mp3hasMatch = scriptText.match(
        /var\s+mp3has\s*=\s*['"]([^'"]+)['"]/,
      );

      const mp3sec = mp3secMatch?.[1];
      const mp3has = mp3hasMatch?.[1];

      if (!mp3sec || !mp3has) {
        throw new Error("Failed to extract mp3sec or mp3has");
      }

      // 👉 Use the extracted values in getLinks.php call
      const linksResponse = await fetch(
        `https://genyt.net/getLinks.php?vid=${videoId}&s=${mp3sec}&h=${mp3has}`,
      );
      if (!linksResponse.ok)
        throw new Error(
        `Failed to get download links: ${linksResponse.statusText}`,
      );

      const $ = load(await linksResponse.text());
      const extractLinks = (filter) =>
      $("a.btn")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(filter);

      const urls = {
        audio: extractLinks((url) => url.includes("mime=audio%2Fwebm")),
      }; */

      const urls = {
        audio: downloadUrl?.map(d => ({
          quality: d.quality, url: d.url
        })) || []
      };

      const track = {
        videoId,
        slug,
        title,
        artists,
        image: images?.[3]?.url || images?.[2]?.url,
        duration,
        urls,
        // playlistId,
        // browseId,
        createdAt: new Date(),
      };

      await cacheTrackData(track);
      return track;
    } catch (error) {
      console.error(`Error fetching track data: ${error}`);
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
      /* const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/lyrics?browseId=${browseId}`,
      );
      const  { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/lyrics/${browseId}`,
      );
      if (!data?.data) return "No Lyrics Available";

      setCurrentTrack({
        ...currentTrack, lyrics: data?.data
      }); */
      setCurrentTrack({
        ...currentTrack, lyrics: "Couldn't load the lyrics for this song."
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
      /* const { data } = await axios.get(
        `${YTMUSIC_BASE_URI}/next?videoId=${currentTrack.videoId}&playlistId=${
        currentTrack.playlistId
        }&previouslyPlayedTracks=${previouslyPlayedTracks.join(",") || ""}`,
      );
      const nextTrackId = data?.data?.videoId; */
      
      const {
        data
      } = await axios.get(
        `${FIYOSAAVN_BASE_URI}/songs/${videoId}/suggestions&limit=10`
      );

      const filtered = data?.data?.filter(track => !previouslyPlayedTracks.includes(track.id));

      const nextTrackId = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)].id: null;

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