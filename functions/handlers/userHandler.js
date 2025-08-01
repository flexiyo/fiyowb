const fetch = require("node-fetch");

async function userHandler(username) {
  if (!username) {
    return { meta: null, data: null };
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
      return { meta: null, data: null };
    }

    const data = await res.json();

    const { login, name, bio, avatar_url, followers, twitter_username } = data;

    const displayName = name || login;
    const description = bio || `${login} is a developer on GitHub`;
    const profileUrl = `https://flexiyo.web.app/u/${login}`;

    const meta = {
      page_title: `${displayName} | Flexiyo`,
      page_description: `${description} – ${followers} followers on GitHub`,
      page_keywords: `${login}, ${displayName}, GitHub, Developer`,
      page_author: displayName,
      canonical_url: profileUrl,
      og_title: displayName,
      og_description: description,
      og_image: avatar_url,
      og_type: "profile",
      twitter_title: displayName,
      twitter_description: description,
      twitter_image: avatar_url,
      twitter_handle: twitter_username ? "@" + twitter_username : "flexiyo",
      schema_type: "Person",
      schema_title: displayName,
      schema_description: description,
      artist_name: displayName,
    };

    return { meta, data };
  } catch (err) {
    console.error("userHandler error:", err);
    return { meta: null, data: null };
  }
}

module.exports = { userHandler };
