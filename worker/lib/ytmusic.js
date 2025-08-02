// /lib/ytmusic.js

// --- Deobfuscation helpers for tS/tH ---

async function fetchAndDeobfuscate(videoId) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "__",
  };

  const response = await fetch(`https://mp3api.ytjar.info/?id=${videoId}`, {
    headers,
  });
  if (!response.ok)
    throw new Error(`Failed to fetch page: ${response.statusText}`);

  const pageText = await response.text();
  const scriptMatches = pageText.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (!scriptMatches) throw new Error("No script tags found.");

  let encodedStr = null,
    key = null,
    num1 = null,
    num2 = null,
    num3 = null,
    num4 = null;
  for (const script of scriptMatches) {
    const paramMatch = script.match(
      /\(\s*"(.*?)"\s*,\s*(\d+)\s*,\s*"(.*?)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
    );
    if (paramMatch) {
      [, encodedStr, num1, key, num2, num3, num4] = paramMatch;
      break;
    }
  }
  if (!encodedStr || !key)
    throw new Error("No encoded parameters found in any script tag.");

  function decodeBase(d, e, f) {
    const charset =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
    const baseE = charset.slice(0, e);
    const baseF = charset.slice(0, f);
    let value = d
      .split("")
      .reverse()
      .reduce((acc, char, index) => {
        const pos = baseE.indexOf(char);
        return pos !== -1 ? acc + pos * Math.pow(e, index) : acc;
      }, 0);
    let result = "";
    while (value > 0) {
      result = baseF[value % f] + result;
      value = Math.floor(value / f);
    }
    return result || "0";
  }

  function deobfuscate(h, _, n, t, e) {
    let result = "";
    for (let i = 0; i < h.length; i++) {
      let s = "";
      while (h[i] !== n[e]) {
        s += h[i];
        i++;
      }
      for (let j = 0; j < n.length; j++)
        s = s.replace(new RegExp(n[j], "g"), j);
      result += String.fromCharCode(decodeBase(s, e, 10) - t);
    }
    return result;
  }

  const deobfuscatedText = deobfuscate(encodedStr, "", key, num2, num3);
  const tSMatch = deobfuscatedText.match(/var\s+tS\s*=\s*"(\d+)"/);
  const tHMatch = deobfuscatedText.match(/var\s+tH\s*=\s*"([a-f0-9]+)"/);

  return { tS: tSMatch?.[1] || null, tH: tHMatch?.[1] || null };
}

async function fetchYTMusic(endpoint, body) {
  const response = await fetch(
    `https://music.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

// --- SEARCH ---

export async function searchTracksInternal(term, continuation = null) {
  const body = continuation
    ? { continuation }
    : { query: term, params: "EgWKAQIIAWoSEAMQBBAJEA4QChAFEBEQEBAV" };
  const ytMusicData = await fetchYTMusic("search", body);
  if (!ytMusicData) throw new Error("YouTube Music API failed");

  const musicShelf =
    ytMusicData?.continuationContents?.musicShelfContinuation ??
    ytMusicData?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find(
      (c) => c?.musicShelfRenderer
    )?.musicShelfRenderer;

  const results = (musicShelf?.contents || [])
    .map(({ musicResponsiveListItemRenderer: track }) => {
      if (!track?.playlistItemData?.videoId) return null;
      const title =
        track.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text
          ?.runs?.[0]?.text || "";
      const artistsRaw =
        track.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text
          ?.runs || [];
      const artists = artistsRaw.map((r) => r?.text).join("");
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
            ]
          : []
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
  return { results, continuation: next };
}

// --- Relative Track Data ---

async function getRelativeTrackData(videoId) {
  try {
    const ytMusicData = await fetchYTMusic("next", { videoId });
    if (!ytMusicData?.contents || !ytMusicData?.currentVideoEndpoint)
      throw new Error("No video details available");

    const playlistId =
      ytMusicData?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.find(
        (tab) => tab?.tabRenderer?.title === "Up next"
      )?.tabRenderer?.content?.musicQueueRenderer?.content
        ?.playlistPanelRenderer?.contents?.[1]?.automixPreviewVideoRenderer
        ?.content?.automixPlaylistVideoRenderer?.navigationEndpoint
        ?.watchPlaylistEndpoint?.playlistId;

    const browseId =
      ytMusicData?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.find(
        (tab) => tab?.tabRenderer?.title === "Lyrics"
      )?.tabRenderer?.endpoint?.browseEndpoint?.browseId;

    return { playlistId, browseId };
  } catch {
    return null;
  }
}

// --- GET TRACK INFO MAIN LOGIC ---

export async function getTrackData(videoId, env, ssr) {
  let title,
    keywords = [],
    artists,
    duration,
    images,
    playsCount;

  // fetch initial YT page
  const response = await fetch(`https://music.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await response.text();
  const regex = html.match(/var ytInitialPlayerResponse = (.*?);\s*<\/script>/);

  let result = null;
  if (regex) {
    result = JSON.parse(regex[1]);
  }

  if (result?.videoDetails?.title) {
    const { lengthSeconds, shortDescription, thumbnail, viewCount } =
      result.videoDetails;

    title = result.videoDetails.title;
    keywords = result.videoDetails.keywords;
    artists = shortDescription
      .split("\n")
      .filter((line) => line.trim() !== "")[1];
    duration = ((s) =>
      `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
        2,
        "0"
      )}`)(Number(lengthSeconds));
    images = thumbnail.thumbnails;
    playsCount = ((n) =>
      n >= 1e9
        ? (n / 1e9).toFixed(1) + "B"
        : n >= 1e6
        ? (n / 1e6).toFixed(1) + "M"
        : n >= 1e3
        ? (n / 1e3).toFixed(1) + "K"
        : n)(Number(viewCount));
  } else {
    // fallback: oembed+search
    title =
      (
        await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        ).then((r) => (r.ok ? r.json() : null))
      )?.title || "";

    const { results } = await searchTracksInternal(`${videoId} ${title}`);
    const found =
      results.find((item) => item.videoId === videoId) || results[0];
    if (!found) throw new Error("Track not found");

    const parts = found.artists?.split(" • ") || [];
    artists = parts.join(" • ");
    duration = parts.pop();
    images = found.images;
    playsCount = found.playsCount;
  }

  const playedAt = new Date().toISOString();

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+$/, "")
    .slice(0, 10);

  const slug = `${baseSlug}_${videoId}`;

  // Store sitemap if env is given
  if (env && env.YTMUSIC_SITEMAP_KV) {
    await env.YTMUSIC_SITEMAP_KV.put(
      `${videoId}`,
      JSON.stringify({ slug, playedAt })
    );
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

  const { tS, tH } = await fetchAndDeobfuscate(videoId);
  if (!tS || !tH) throw new Error("Failed to fetch deobfuscated result");
  const relativeData = await getRelativeTrackData(videoId);

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
    tS,
    tH,
  };
}

// --- Next Track ---

export async function getNextTrackData(videoId, playlistId, playedTrackIds) {
  const ytMusicData = await fetchYTMusic("next", {
    videoId,
    playlistId,
    playedTrackIds,
  });

  const playlist =
    ytMusicData?.contents?.singleColumnMusicWatchNextResultsRenderer
      ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer
      ?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;
  if (!playlist) throw new Error("No playlist available");

  const tracks = playlist
    .filter((item) => item?.playlistPanelVideoRenderer)
    .filter(
      (item) =>
        !playedTrackIds
          ?.split(",")
          .includes(item?.playlistPanelVideoRenderer?.videoId)
    );
  const nextTrackId =
    tracks[Math.floor(Math.random() * tracks.length)]
      ?.playlistPanelVideoRenderer?.navigationEndpoint?.watchEndpoint?.videoId;

  return { videoId: nextTrackId };
}

// --- Lyrics ---

export async function getTrackLyricsData(browseId) {
  const ytMusicData = await fetchYTMusic("browse", { browseId });
  const lyrics =
    ytMusicData?.contents?.sectionListRenderer?.contents?.[0]
      ?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text;
  return lyrics || "Couldn't load the lyrics for this song.";
}

// --- Suggestions ---

export async function getSuggestionsData(term) {
  const ytMusicData = await fetchYTMusic("music/get_search_suggestions", {
    input: term,
  });
  const suggestions =
    ytMusicData?.contents?.[0]?.searchSuggestionsSectionRenderer?.contents
      ?.map((content) => ({
        suggestionText:
          content?.searchSuggestionRenderer?.suggestion?.runs?.[0]?.text,
        suggestionQuery:
          content?.searchSuggestionRenderer?.navigationEndpoint?.searchEndpoint
            ?.query,
      }))
      .filter(Boolean);

  return { results: suggestions };
}

const STATIC_SITEMAP_KEY = "static_sitemap";
const STATIC_SITEMAP_TIMESTAMP_KEY = "static_sitemap_timestamp";
const SITEMAP_EXPIRY_DAYS = 2;
const STATIC_THRESHOLD = 25;

/**
 * Converts a slug and videoId into a <url> entry.
 */
function generateUrlEntry(slug, date) {
  return `
    <url>
      <loc>https://flexiyo.pages.dev/music/${slug}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `.trim();
}

/**
 * Converts KV (slug → videoId) into full sitemap XML.
 */
async function buildDynamicSitemap(kvStore) {
  const keys = await kvStore.list();
  const entries = [];

  for (const key of keys.keys) {
    const rawData = await kvStore.get(key.name);
    if (!rawData) continue;

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("Invalid JSON in KV:", key.name);
      continue;
    }

    if (data && data.slug) {
      entries.push(generateUrlEntry(data.slug, data.playedAt));
    }
  }

  return wrapInSitemap(entries);
}

/**
 * Wraps <urlset> around entries.
 */
function wrapInSitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join(
    "\n"
  )}</urlset>`;
}

/**
 * Handles the /sitemap.xml request.
 */
export async function handleSitemap(env) {
  const kvStore = env.YTMUSIC_SITEMAP_KV;
  const staticSitemap = await kvStore.get(STATIC_SITEMAP_KEY);
  const staticTimestamp = await kvStore.get(STATIC_SITEMAP_TIMESTAMP_KEY);

  if (staticSitemap && staticTimestamp) {
    const createdAt = new Date(staticTimestamp);
    const ageInMs = Date.now() - createdAt.getTime();
    const twoDaysInMs = SITEMAP_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (ageInMs < twoDaysInMs) {
      return new Response(staticSitemap, {
        headers: { "Content-Type": "application/xml" },
      });
    } else {
      await kvStore.delete(STATIC_SITEMAP_KEY);
      await kvStore.delete(STATIC_SITEMAP_TIMESTAMP_KEY);
    }
  }

  const keys = await kvStore.list();
  const keyCount = keys.keys.length;

  const sitemap = await buildDynamicSitemap(kvStore);

  if (keyCount >= STATIC_THRESHOLD) {
    await kvStore.put(STATIC_SITEMAP_KEY, sitemap);
    await kvStore.put(STATIC_SITEMAP_TIMESTAMP_KEY, new Date().toISOString());
  }

  return sitemap;
}

// The End
