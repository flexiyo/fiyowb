import fetch from 'node-fetch';

async function fetchMp3secMp3has(videoId) {
  const headers = {
    "User-Agent':
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://genyt.net/"
  };

  const response = await fetch(`https://video.genyt.net/${videoId}`, {
    headers
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }

  const html = await response.text();

  const result = {
    mp3sec: null,
    mp3has: null,
  };
  const seen = new Set();

  const regex = /var\s+(mp3sec|mp3has)\s*=\s*['"]([^'"`<>\n]+)['"]/g;
  let match;

  while ((match = regex.exec(html))) {
    const [,
      key,
      value] = match;
    result[key] = value;
    seen.add(key);
    if (seen.size === 2) break;
  }

  return result;
}

async function fetchYTMusic(endpoint, body) {
  const response = await fetch(
    `https://music.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false`,
    {
      method: "POST",
      headers: {
        "User-Agent':
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json"
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

export async function searchTracksInternal(term, continuation = null) {
  const body = continuation
  ? {
    continuation
  }: {
    query: term,
    params: "EgWKAQIIAWoSEAMQBBAJEA4QChAFEBEQEBAV"
  };
  const ytMusicData = await fetchYTMusic("search", body);
  if (!ytMusicData) throw new Error("YouTube Music API failed");

  const musicShelf =
  ytMusicData?.continuationContents?.musicShelfContinuation ??
  ytMusicData?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find(
    (c) => c?.musicShelfRenderer
  )?.musicShelfRenderer;

  if (!musicShelf?.contents) return {
    results: [],
    continuation: null
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
    track.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text
    ?.runs || [];
    const artists = artistsRaw.map((r) => r.text).join("");
    const playsCount =
    track.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text
    ?.runs?.[0]?.text || null;
    const images = (
      track.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
    ).flatMap((img) =>
      img?.url?.includes("w60-h60")
      ? [
        img,
        {
          ...img,
          url: img.url.replace("w60-h60", "w120-h120"),
          width: 120,
          height: 120,
        },
        {
          ...img,
          url: img.url.replace("w60-h60", "w400-h400"),
          width: 400,
          height: 400,
        },
        {
          ...img,
          url: img.url.replace("w60-h60", "w600-h600"),
          width: 600,
          height: 600,
        },
      ]: []
    );

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
    results, continuation: next
  };
}

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

    const playlistId = tabRenderer?.find(
      (tab) => tab.tabRenderer?.title === "Up next"
    )?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer
    ?.contents?.[1]?.automixPreviewVideoRenderer?.content
    ?.automixPlaylistVideoRenderer?.navigationEndpoint?.watchPlaylistEndpoint
    ?.playlistId;

    const browseId = tabRenderer?.find(
      (tab) => tab.tabRenderer?.title === "Lyrics"
    )?.tabRenderer?.endpoint?.browseEndpoint?.browseId;

    return {
      playlistId,
      browseId
    };
  } catch {
    return null;
  }
}

export async function getTrackData(videoId, env, ssr) {
  let title,
  keywords = [],
  artists,
  duration,
  images,
  playsCount;

  const initialResponse = await fetch(
    `https://music.youtube.com/watch?v=${videoId}`,
    {
      headers: {
        "User-Agent':
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
    }
  );
  const html = await initialResponse.text();
  const regex = html.match(/var ytInitialPlayerResponse = (.*?);\s*<\/script>/);

  let result = null;
  if (regex?.[1]) {
    try {
      result = JSON.parse(regex[1]);
    } catch (e) {
      console.error("Failed to parse ytInitialPlayerResponse", e);
    }
  }

  if (result?.videoDetails?.title) {
    const {
      lengthSeconds,
      shortDescription,
      thumbnail,
      viewCount,
      title: videoTitle,
    } = result.videoDetails;
    title = videoTitle;
    keywords = result.videoDetails.keywords || [];
    artists = shortDescription?.split("\n").filter(Boolean)[1] || "";
    duration = new Date(Number(lengthSeconds) * 1000)
    .toISOString()
    .slice(14, 19);
    images = thumbnail.thumbnails;
    playsCount = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(viewCount);
  } else {
    const [oembedResponse,
      searchResponse] = await Promise.all([
        fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        ).then((r) => (r.ok ? r.json(): null)),
        searchTracksInternal(videoId),
      ]);

    title = oembedResponse?.title || "";
    const found =
    searchResponse.results.find((item) => item.videoId === videoId) ||
    searchResponse.results[0];
    if (!found) throw new Error("Track not found via fallback");

    const parts = found.artists?.split(" • ") || [];
    artists =
    parts.length > 1 ? parts.slice(0, -1).join(" • "): parts[0] || "";
    duration = parts[parts.length - 1] || "0:00";
    images = found.images;
    playsCount = found.playsCount;
  }

  const playedAt = new Date().toISOString();
  const baseSlug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .replace(/_+/g, "")
  .slice(0, 15)
  .replace(/^-+|-+$/g, "")
  .replace(/-+$/, "");

  const slug = `${baseSlug}_${videoId}`;

  if (env?.FIYOWB_MUSIC_SITEMAP) {
    env.FIYOWB_MUSIC_SITEMAP.put(
      `${videoId}`,
      JSON.stringify({
        slug, playedAt
      })
    ).catch(console.error);
  }

  if (ssr) {
    return {
      videoId,
      slug,
      title,
      keywords,
      artists,
      duration,
      playsCount,
      images,
    };
  }

  const [fetchedMp3secMp3has,
    relativeData] = await Promise.all([
      fetchMp3secMp3has(videoId),
      getRelativeTrackData(videoId),
    ]);

  const {
    mp3sec,
    mp3has
  } = fetchedMp3secMp3has;
  if (!mp3sec || !mp3has) throw new Error("Failed to fetch mp3sec or mp3has");

  return {
    videoId,
    slug,
    title,
    keywords,
    artists,
    duration,
    playsCount,
    images,
    ...(relativeData || {}),
    mp3sec,
    mp3has
  };
}

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

  const nextTrack = tracks[Math.floor(Math.random() * tracks.length)];
  const nextTrackId =
  nextTrack?.playlistPanelVideoRenderer?.navigationEndpoint?.watchEndpoint
  ?.videoId;

  return {
    videoId: nextTrackId
  };
}

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
  .filter((c) => c.suggestionText && c.suggestionQuery);

  return {
    results: suggestions || []
  };
}

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
  const {
    keys
  } = await kvStore.list();
  const promises = keys.map((key) => kvStore.get(key.name));
  const rawDataEntries = await Promise.all(promises);

  const entries = rawDataEntries
  .map((rawData) => {
    if (!rawData) return null;
    try {
      const data = JSON.parse(rawData);
      if (data?.slug) {
        return generateUrlEntry(data.slug, data.playedAt);
      }
    } catch (e) {
      console.error("Invalid JSON in KV:", e);
    }
    return null;
  })
  .filter(Boolean);

  return wrapInSitemap(entries);
}

export async function handleSitemap(env) {
  const kvStore = env.FIYOWB_MUSIC_SITEMAP;
  const [staticSitemap, staticTimestamp] = await Promise.all([
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
  const keyCount = (await kvStore.list()).keys.length;

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