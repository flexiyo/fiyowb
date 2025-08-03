import { Hono } from "hono";
import {
  searchTracksInternal,
  getTrackData,
  getNextTrackData,
  getTrackLyricsData,
  getSuggestionsData,
} from "../lib/ytmusic.lib.js";

const ytMusicRoutes = new Hono();

ytMusicRoutes.get("/search", async (c) => {
  const term = c.req.query("term");
  const continuation = c.req.query("continuation");

  if (!term && !continuation) {
    return c.json({ success: false, error: "Missing search term" }, 400);
  }

  try {
    const data = await searchTracksInternal(term, continuation);
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ success: false, error: "Failed to perform search" }, 500);
  }
});

ytMusicRoutes.get("/track", async (c) => {
  const videoId = c.req.query("videoId");
  const ssr = c.req.query("ssr");

  if (!videoId) {
    return c.json({ success: false, error: "Missing video ID" }, 400);
  }

  try {
    const data = await getTrackData(videoId, c.env, ssr === "true");
    return c.json({ success: true, data });
  } catch (error) {
    console.error(`Error fetching track ${videoId}:`, error);
    return c.json(
      { success: false, error: "Failed to fetch track data" },
      500
    );
  }
});

ytMusicRoutes.get("/next", async (c) => {
  const videoId = c.req.query("videoId");
  const playlistId = c.req.query("playlistId");
  const playedTrackIds = c.req.query("playedTrackIds");

  if (!videoId || !playlistId) {
    return c.json(
      { success: false, error: "Missing videoId or playlistId" },
      400
    );
  }

  try {
    const data = await getNextTrackData(videoId, playlistId, playedTrackIds);
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Next track error:", error);
    return c.json({ success: false, error: "Failed to get next track" }, 500);
  }
});

ytMusicRoutes.get("/lyrics", async (c) => {
  const browseId = c.req.query("browseId");

  if (!browseId) {
    return c.json({ success: false, error: "Missing browse ID" }, 400);
  }

  try {
    const lyrics = await getTrackLyricsData(browseId);
    return c.json({ success: true, data: lyrics });
  } catch (error) {
    console.error(`Lyrics error for ${browseId}:`, error);
    return c.json({ success: false, error: "Failed to load lyrics" }, 500);
  }
});

ytMusicRoutes.get("/suggestions", async (c) => {
  const term = c.req.query("term");

  if (!term) {
    return c.json({ success: false, error: "Missing term" }, 400);
  }

  try {
    const data = await getSuggestionsData(term);
    return c.json({ success: true, data });
  } catch (error) {
    console.error("Suggestions error:", error);
    return c.json({ success: false, error: "Failed to get suggestions" }, 500);
  }
});

export default ytMusicRoutes;
