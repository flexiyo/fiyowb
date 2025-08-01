const fetch = require("node-fetch");

async function musicHandler(slug) {
  if (!slug) return { meta: null, data: null };
  const videoId = slug.split("_")[1];

  try {
    const res = await fetch(
      `https://ytmusic.kaushalkrishna011.workers.dev/track?videoId=${videoId}&isBot=true`
    );
    console.log(res)
    const { success, data } = await res.json();

    if (!success || !data) return { meta: null, data: null };

    const { slug, title, keywords, artists, images, playsCount, duration } = data;

    const artistName = artists?.map((a) => a.name).join(", ");
    const image = images?.[0]?.url || "";

    const meta = {
      page_title: `${title} | Flexiyo`,
      page_description: `${title} by ${artistName} – ${playsCount} plays • ${duration} mins`,
      page_keywords: `${keywords}, ${title}, ${artistName}`,
      page_author: artistName,
      canonical_url: `https://flexiyo.web.app/music/${slug}`,
      og_title: title,
      og_description: `${artistName} - Listen now`,
      og_image: image,
      og_type: "music.song",
      twitter_title: title,
      twitter_description: `Track by ${artistName}`,
      twitter_image: image,
      twitter_handle: "@flexiyo",
      schema_type: "MusicRecording",
      schema_title: title,
      schema_description: `${artistName} on Flexiyo`,
      artist_name: artistName,
    };

    return { meta, data };
  } catch (err) {
    return { meta: null, data: null };
  }
}

module.exports = { musicHandler };
