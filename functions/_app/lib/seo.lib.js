import { getTrackData } from "./ytmusic.lib.js";
import seoTemplate from "../templates/seoTemplate.html";
import defaultTemplate from '../templates/defaultTemplate.html';

export function renderSeoPage(template, data = {}) {
  return Object.entries(data).reduce((html, [key, value]) => {
    return html.replaceAll(`{{${key}}}`, value || '')
  }, template)
}

export function renderDefaultPage(req) {
  const url = new URL(req.url);
  const canonical = url.href;

  const title = 'Flexiyo';
  const meta_description = 'Join the Flexiyo community to share your skills, discover music, and explore creators.';
  const og_description = `Flex in Your Onset — ${meta_description}`;
  const image = 'https://flexiyo.pages.dev/logo192.png';

  const jsonLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: meta_description,
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: "Flexiyo",
      logo: {
        "@type": "ImageObject",
        url: image,
      },
    },
  });

  const html = renderSeoPage(defaultTemplate, {
    title,
    meta_description,
    og_description,
    canonical_url: canonical,
    image,
    structured_data: jsonLD,
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    },
  });
}

// MUSIC SSR PAGE
export async function renderMusicPage(slug, env) {
  const videoId = slug?.split("_").pop();

  if (!videoId) {
    return new Response("Invalid URL: Video ID not found.", { status: 400 });
  }

  try {
    const trackData = await getTrackData(videoId, env, true);
    if (!trackData || !trackData.videoId) {
      return new Response("Track data not found.", { status: 404 });
    }

    const { title, artists, keywords, duration, playsCount, images } = trackData;

    const canonical = `https://flexiyo.pages.dev/music/${slug}`;
    const image = images?.[2]?.url || "";
    const description = `Listen to ${title} by ${artists
      .split("•")[0]
      .trim()}. Enjoy high-quality audio, view lyrics, and more on Flexiyo Music.`;

    const jsonLD = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MusicRecording",
      name: title,
      byArtist: { "@type": "MusicGroup", name: artists },
      duration,
      image,
      url: canonical,
      description,
    });

    const html = renderSeoPage(seoTemplate, {
      title: `${title} - ${artists}`,
      description,
      keywords: keywords.join(", "),
      author: artists,
      canonical_url: canonical,
      image,
      og_type: "music.song",
      twitter_handle: "x_flexiyo",
      structured_data: jsonLD,
      content_block: `
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Plays:</strong> ${playsCount}</p>
        ${
          image
            ? `<figure><img src="${image}" alt="${title}" loading="lazy" /></figure>`
            : ""
        }
      `,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error(`Failed to render SSR page for videoId ${videoId}:`, error);
    return new Response("Failed to render page. Please try again later.", {
      status: 500,
    });
  }
}

// USER SSR PAGE
export async function renderUserPage(username, env) {
  if (!username) {
    return new Response("Username missing", { status: 400 });
  }

  try {
    const headers = {
      "User-Agent": "Flexiyo-SEO-Bot",
      Accept: "application/vnd.github.v3+json",
    };

    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (res.status === 404) {
      return new Response("User not found", { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`GitHub API failed with status: ${res.status}`);
    }

    const user = await res.json();
    const canonical = `https://flexiyo.pages.dev/u/${username}`;
    const image = user.avatar_url || "";

    const jsonLD = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: user.name || user.login,
      url: user.html_url,
      image,
      description: user.bio,
      mainEntityOfPage: canonical,
      sameAs: [
        user.html_url,
        user.blog,
        user.twitter_username
          ? `https://twitter.com/${user.twitter_username}`
          : null,
      ].filter(Boolean),
    });

    const html = renderSeoPage(seoTemplate, {
      title: `${user.name || user.login} (@${user.login}) - Flexiyo`,
      description: `${user.followers} Followers | ${
        user.public_repos
      } Repositories. View the profile of ${
        user.name || user.login
      } on Flexiyo.`,
      keywords: `${user.login}, github, developer, portfolio`,
      author: user.login,
      canonical_url: canonical,
      image,
      og_type: "profile",
      twitter_handle: user.twitter_username || "",
      structured_data: jsonLD,
      content_block: `
        ${
          image
            ? `<img src="${image}" width="120" alt="${user.login}" loading="lazy" />`
            : ""
        }
        <p><strong>Followers:</strong> ${user.followers.toLocaleString()}</p>
        <p><strong>Following:</strong> ${user.following.toLocaleString()}</p>
        <p><strong>Public Repos:</strong> ${user.public_repos.toLocaleString()}</p>
      `,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error(`Failed to render user SEO page for "${username}":`, error);
    return new Response("An error occurred while generating the page.", {
      status: 500,
    });
  }
}