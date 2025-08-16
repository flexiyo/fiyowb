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
    }
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
    continuation
  }: {
    query: term,
    params: "EgWKAQIIAWoSEAMQBBAJEA4QChAFEBEQEBAV",
  };

  const ytMusicData = await fetchYTMusic("search", body);
  if (!ytMusicData) throw new Error("YouTube Music API failed");

  const musicShelf =
  ytMusicData?.continuationContents?.musicShelfContinuation ??
  ytMusicData?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer
  ?.content?.sectionListRenderer?.contents?.find(
    (c) => c?.musicShelfRenderer
  )?.musicShelfRenderer;

  if (!musicShelf?.contents)
    return {
    results: [],
    continuation: null,
  };

  const results = musicShelf.contents
  .map(({
    musicResponsiveListItemRenderer: track
  }) => {
    if (!track?.playlistItemData?.videoId) return null;

    const title =
    track.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text
    ?.runs?.[0]?.text || "";

    const artistsRaw =
    track.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text
    ?.runs || [];
    const artists = artistsRaw.map((r) => r.text).join(" • ");

    let playsCount =
    track.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text
    ?.runs?.[0]?.text || null;
    if (playsCount) {
      playsCount = parseInt(playsCount.replace(/\D/g, ""), 10) || null;
    }

    const thumbs =
    track.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
    const images = thumbs.map((t) => ({
      url: t.url,
      width: t.width,
      height: t.height,
    }));

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
    const ytMusicData = await fetchYTMusic("next",
      {
        videoId
      });
    if (!ytMusicData?.contents || !ytMusicData?.currentVideoEndpoint)
      throw new Error("No video details available");

    const tabRenderer =
    ytMusicData.contents.singleColumnMusicWatchNextResultsRenderer
    ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;

    const playlistId = tabRenderer
    ?.find((tab) => tab.tabRenderer?.title === "Up next")
    ?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer
    ?.contents?.[1]?.automixPreviewVideoRenderer?.content
    ?.automixPlaylistVideoRenderer?.navigationEndpoint?.watchPlaylistEndpoint
    ?.playlistId;

    const browseId = tabRenderer
    ?.find((tab) => tab.tabRenderer?.title === "Lyrics")
    ?.tabRenderer?.endpoint?.browseEndpoint?.browseId;

    return {
      playlistId,
      browseId
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
    ).then((r) => (r.ok ? r.json(): null));

    let title = (oembedResponse?.title || "").replace(/\|.*$|\(.*?\)|\[.*?\]/g, "");

    if (!title) throw new Error("No valid title from YouTube");

    const saavnRes = await fetch(
      `https://fiyosaavn.vercel.app/api/search/songs?query=${encodeURIComponent(
        title
      )}&limit=1`
    ).then((r) => r.json());

    const saavnTrack = saavnRes?.data?.results?.[0];
    if (!saavnTrack) throw new Error("No track found on Saavn");

    const downloadUrl =
    saavnTrack.downloadUrl?.map((d) => ({
      quality: d.quality,
      url: d.url,
    })) || [];

    const fallback = await searchTracksInternal(title);
    const found =
    fallback?.results?.find((i) => i.videoId === videoId) ||
    fallback?.results?.[0];
    if (!found) throw new Error("Track not found via fallback");

    const parts = found.artists?.split(" • ") || [];
    const artists =
    parts.length > 1
    ? parts.slice(0, -1).join(" • "): parts[0] || "Unknown Artists";

    const duration = `${Math.floor(saavnTrack.duration / 60)}:${String(
      saavnTrack.duration % 60
    ).padStart(2, "0")}`;

    const images = found.images;
    const playsCount = found.playsCount;

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
        JSON.stringify({
          slug, playedAt
        })
      ).catch(console.error);
    }

    const baseTrack = {
      videoId,
      slug,
      title,
      keywords: [],
      artists,
      duration,
      playsCount,
      images,
      urls: {
        audio: downloadUrl,
      },
    };

    trackCache.set(videoId, baseTrack);

    if (ssr) return baseTrack;

    const relativeData = await getRelativeTrackData(videoId);
    const merged = {
      ...baseTrack,
      ...(relativeData || {})
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

  if (tracks.length === 0) return {
    videoId: null
  };

  const nextTrackId =
  tracks[1]?.playlistPanelVideoRenderer?.navigationEndpoint?.watchEndpoint
  ?.videoId;

  return {
    videoId: nextTrackId
  };
}

// -----------------------------
// Lyrics
// -----------------------------
export async function getTrackLyricsData(browseId) {
  if (!browseId) return "No lyrics available for this song.";
  const ytMusicData = await fetchYTMusic("browse", {
    browseId
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
  if (!term) return {
    results: []
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
    results: suggestions
  };
}

// -----------------------------
// Sitemap
// -----------------------------
const STATIC_SITEMAP_KEY = "static_sitemap";
const STATIC_SITEMAP_TIMESTAMP_KEY = "static_sitemap_timestamp";
const SITEMAP_EXPIRY_DAYS = 2;
const STATIC_THRESHOLD = 25;

function generateUrlEntry(slug, date) {
  return `<url><loc>https://flexiyo.pages.dev/music/${slug}</loc><lastmod>${date}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
}

function wrapInSitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join(
    ""
  )}</urlset>`;
}

async function buildDynamicSitemap(kvStore) {
  const entries = [];
  let cursor;
  do {
    const {
      keys,
      list_complete,
      cursor: nextCursor
    } = await kvStore.list({
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
        if (data?.slug) {
          entries.push(generateUrlEntry(data.slug, data.playedAt));
        }
      } catch (e) {
        console.error("Invalid JSON in KV:", e);
      }
    }
    cursor = nextCursor;
    if (list_complete) break;
  } while (cursor);

  return wrapInSitemap(entries);
}

export async function handleSitemap(env) {
  const kvStore = env.FIYOWB_MUSIC_SITEMAP;
  const [staticSitemap,
    staticTimestamp] = await Promise.all([
      kvStore.get(STATIC_SITEMAP_KEY),
      kvStore.get(STATIC_SITEMAP_TIMESTAMP_KEY),
    ]);

  if (staticSitemap && staticTimestamp) {
    const ageInMs = Date.now() - new Date(staticTimestamp).getTime();
    if (ageInMs < SITEMAP_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
      return new Response(staticSitemap, {
        headers: {
          "Content-Type": "application/xml"
        },
      });
    } else {
      Promise.all([
        kvStore.delete(STATIC_SITEMAP_KEY),
        kvStore.delete(STATIC_SITEMAP_TIMESTAMP_KEY),
      ]).catch(console.error);
    }
  }

  const sitemap = await buildDynamicSitemap(kvStore);
  const keyCount = (await kvStore.list({
    limit: 1
  })).keys.length;

  if (keyCount >= STATIC_THRESHOLD) {
    Promise.all([
      kvStore.put(STATIC_SITEMAP_KEY, sitemap),
      kvStore.put(STATIC_SITEMAP_TIMESTAMP_KEY, new Date().toISOString()),
    ]).catch(console.error);
  }

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml"
    },
  });
}