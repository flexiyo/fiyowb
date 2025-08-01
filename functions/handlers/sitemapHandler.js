const fetch = require("node-fetch");

async function sitemapHandler() {
  try {
    const res = await fetch(
      "https://ytmusic.kaushalkrishna011.workers.dev/sitemap"
    );
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
    const xml = await res.text();

    return { xml };
  } catch (err) {
    console.error("sitemapHandler error:", err);
    return { xml: null };
  }
}

module.exports = { sitemapHandler };
