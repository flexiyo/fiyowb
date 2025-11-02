import fetch from "node-fetch";

// -----------------------------
// Core fetch wrapper
// -----------------------------
async function fetchYTMusic(endpoint, body) {
  const response = await fetch(
    `https://music.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false`,
    {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        context: {
          client: {
            clientName: "WEB_REMIX",
            clientVersion: "1.20250317.01.00",
          },
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`YT Music API Error: ${response.status}`);
  return response.json();
}

// -----------------------------
// Search tracks
// -----------------------------
export async function searchTracksInternal(term, continuation = null) {
  const body = continuation
    ? {
      continuation,
    }
    : {
      query: term,
      params: "EgWKAQIIAWoSEAMQBBAJEA4QChAFEBEQEBAV",
    };

  const ytMusicData = await fetchYTMusic("search", body);
  if (!ytMusicData) throw new Error("YouTube Music API failed");

  const musicShelf =
    ytMusicData?.continuationContents?.musicShelfContinuation ??
    ytMusicData?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find(
      (c) => c?.musicShelfRenderer,
    )?.musicShelfRenderer;

  if (!musicShelf?.contents)
    return {
      results: [],
      continuation: null,
    };

  const results = musicShelf.contents
    .map(({ musicResponsiveListItemRenderer: track }) => {
      if (!track?.playlistItemData?.videoId) return null;

      const title =
        track.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text
          ?.runs?.[0]?.text || "";

      const artistsRaw =
        track.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text
          ?.runs || [];
      const artists = artistsRaw.map((r) => r.text).join(" ");

      let playsCount =
        track.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text
          ?.runs?.[0]?.text || null;
      if (playsCount) {
        playsCount = parseInt(playsCount.replace(/\D/g, ""), 10) || null;
      }

      const thumbs =
        track.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      const images = [
        ...thumbs,
        {
          ...thumbs[0],
          url: thumbs[0].url.replace("w60-h60", "w400-h400"),
          width: 400,
          height: 400,
        },
        {
          ...thumbs[0],
          url: thumbs[0].url.replace("w60-h60", "w600-h600"),
          width: 600,
          height: 600,
        },
      ];

      return {
        videoId: track.playlistItemData.videoId,
        title,
        artists,
        playsCount,
        images,
      };
    })
    .filter(Boolean);

  const next =
    musicShelf?.continuations?.[0]?.nextContinuationData?.continuation || null;

  return {
    results,
    continuation: next,
  };
}

// -----------------------------
// Relative data (lyrics/playlist)
// -----------------------------
async function getRelativeTrackData(videoId) {
  try {
    const ytMusicData = await fetchYTMusic("next", {
      videoId,
    });
    if (!ytMusicData?.contents || !ytMusicData?.currentVideoEndpoint)
      throw new Error("No video details available");

    const tabRenderer =
      ytMusicData.contents.singleColumnMusicWatchNextResultsRenderer
        ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;

    const playlistId = tabRenderer?.find(
      (tab) => tab.tabRenderer?.title === "Up next",
    )?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer
      ?.contents?.[1]?.automixPreviewVideoRenderer?.content
      ?.automixPlaylistVideoRenderer?.navigationEndpoint?.watchPlaylistEndpoint
      ?.playlistId;

    const browseId = tabRenderer?.find(
      (tab) => tab.tabRenderer?.title === "Lyrics",
    )?.tabRenderer?.endpoint?.browseEndpoint?.browseId;

    return {
      playlistId,
      browseId,
    };
  } catch {
    return null;
  }
}

// -----------------------------
// Track details
// -----------------------------//
const trackCache = new Map();

export async function getTrackData(videoId, env, ssr) {
  if (trackCache.has(videoId)) {
    return trackCache.get(videoId);
  }

  try {
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    ).then((r) => (r.ok ? r.json() : null));

    const title = oembedResponse?.title;
    if (!title) throw new Error("No valid title from YouTube");

    // Fallback to get proper track info
    const fallback = await searchTracksInternal(title);
    const found =
      fallback?.results?.find((i) => i.videoId === videoId) ||
      fallback?.results?.[0];
    if (!found) throw new Error("Track not found via fallback");

    const { artists, images, playsCount } = found;

    const response = await fetch(
      `https://yt-extractor-vmgt.onrender.com/extract?url=https://youtu.be/${videoId}`
      );

    const audioUrls = await response.json()
    
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 15);
    const slug = `${baseSlug}_${videoId}`;

    const playedAt = new Date().toISOString();

    if (env?.FIYOWB_MUSIC_SITEMAP) {
      env.FIYOWB_MUSIC_SITEMAP.put(
        `${videoId}`,
        JSON.stringify({ slug, playedAt })
      ).catch(console.error);
    }

    const baseTrack = {
      videoId,
      slug,
      title,
      keywords: [],
      artists,
      playsCount,
      images,
      urls: {
        audio: audioUrls.,
      },
    };

    trackCache.set(videoId, baseTrack);

    if (ssr) return baseTrack;

    const relativeData = await getRelativeTrackData(videoId);
    const merged = {
      ...baseTrack,
      ...(relativeData || {}),
    };

    trackCache.set(videoId, merged);
    return merged;
  } catch (err) {
    console.error(`Error in getTrackData(${videoId}):`, err.message);
    return null;
  }
}

// -----------------------------
// Next track (deterministic)
// -----------------------------
export async function getNextTrackData(videoId, playlistId, playedTrackIds) {
  const ytMusicData = await fetchYTMusic("next", {
    videoId,
    playlistId,
    playedTrackIds: playedTrackIds || [],
  });

  const playlist =
    ytMusicData?.contents?.singleColumnMusicWatchNextResultsRenderer
      ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer
      ?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;

  if (!playlist) throw new Error("No playlist available");

  const playedIds = new Set(playedTrackIds || []);

  const tracks = playlist.filter(
    (item) =>
      item?.playlistPanelVideoRenderer &&
      !playedIds.has(item.playlistPanelVideoRenderer.videoId)
  );

  if (tracks.length === 0) {
    return { videoId: null };
  }

  const nextTrackId =
    tracks[1]?.playlistPanelVideoRenderer?.navigationEndpoint?.watchEndpoint
      ?.videoId;

  return {
    videoId: nextTrackId,
  };
}

// -----------------------------
// Lyrics
// -----------------------------
export async function getTrackLyricsData(browseId) {
  if (!browseId) return "No lyrics available for this song.";
  const ytMusicData = await fetchYTMusic("browse", {
    browseId,
  });
  const lyrics =
    ytMusicData?.contents?.sectionListRenderer?.contents?.[0]
      ?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text;
  return lyrics || "Couldn't load the lyrics for this song.";
}

// -----------------------------
// Suggestions
// -----------------------------
export async function getSuggestionsData(term) {
  if (!term)
    return {
      results: [],
    };
  const ytMusicData = await fetchYTMusic("music/get_search_suggestions", {
    input: term,
  });
  const suggestions =
    ytMusicData?.contents?.[0]?.searchSuggestionsSectionRenderer?.contents
      ?.map((content) => ({
        suggestionText:
          content.searchSuggestionRenderer?.suggestion?.runs?.[0]?.text,
        suggestionQuery:
          content.searchSuggestionRenderer?.navigationEndpoint?.searchEndpoint
            ?.query,
      }))
      .filter((c) => c.suggestionText && c.suggestionQuery) || [];

  return {
    results: suggestions,
  };
}

// -----------------------------
// Sitemap
// -----------------------------
function generateUrlEntry(slug, date) {
  // ensure we only keep yyyy-mm-dd format
  const lastmod = new Date(date).toISOString().split("T")[0];
  return `
            <url>
                  <loc>https://flexiyo.pages.dev/music/${slug}</loc>
                        <lastmod>${lastmod}</lastmod>
                              <changefreq>weekly</changefreq>
                                    <priority>0.8</priority>
                                        </url>`;
}

function wrapInSitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
                                          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                                          ${entries.join("\n")}
                                          </urlset>`;
}

async function buildSitemap(kvStore) {
  const entries = [];
  let cursor;

  do {
    const { keys, list_complete, cursor: nextCursor } = await kvStore.list({
      cursor,
      limit: 100,
    });

    const rawDataEntries = await Promise.all(
      keys.map((k) => kvStore.get(k.name))
    );

    for (const rawData of rawDataEntries) {
      if (!rawData) continue;
      try {
        const data = JSON.parse(rawData);
        if (data?.slug && data?.playedAt) {
          entries.push(generateUrlEntry(data.slug, data.playedAt));
        }
      } catch (_) {
        // ignore bad entries silently
      }
    }

    cursor = nextCursor;
    if (list_complete) break;
  } while (cursor);

  return wrapInSitemap(entries);
}

export async function handleSitemap(env) {
  const kvStore = env.FIYOWB_MUSIC_SITEMAP;
  const sitemap = await buildSitemap(kvStore);

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // 1h cache OK for Google
    },
  });
}
