import template from "./seoTemplate.html";
import { renderSeoPage } from "../lib/renderSeoPage.js";

export default async function userSeo(request) {
  const url = new URL(request.url);
  const username = url.pathname.split("/u/")[1];
  if (!username) return new Response("Username missing", { status: 400 });

  const canonical = `https://flexiyo.pages.dev/u/${username}`;

  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "Flexiyo-SEO-Bot" },
    });

    if (!res.ok) throw new Error("User not found");

    const user = await res.json();
    const image = user.avatar_url || "";
    const jsonLD = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: user.name || user.login,
      url: user.html_url,
      image,
      sameAs: [user.html_url],
      description: user.bio,
    });

    const html = renderSeoPage(template, {
      title: `${user.name || user.login} - Flexiyo`,
      description: `${user.followers} Followers, ${user.following} Following, ${
        user.public_repos
      } Posts - ${user.name || user.login} (@${user.login}) on Flexiyo${
        user.bio ? `: "${user.bio}"` : ""
      }`,
      keywords: `${user.login}, github, developer`,
      author: user.login,
      canonical_url: canonical,
      image,
      og_type: "profile",
      twitter_handle: user.twitter_username || "",
      structured_data: jsonLD,
      content_block: `
          ${
            image
              ? `<img src="${image}" width="120" alt="${user.login}" />`
              : ""
          }
          <p><strong>Followers:</strong> ${user.followers}</p>
          <p><strong>Following:</strong> ${user.following}</p>
          <p><strong>Public Repos:</strong> ${user.public_repos}</p>
        `,
    });

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`<h1>Error</h1><p>${e.message}</p>`, { status: 404 });
  }
}
