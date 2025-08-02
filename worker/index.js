import app from "./app.js";
import musicSeo from "./seo/music.seo.js";
import fallbackSeo from "./seo/fallback.seo.js";
import sitemapSeo from "./seo/musicSitemap.seo.js";
import userSeo from "./seo/user.seo.js";

function isBot(ua = "") {
  return /bot|crawl|spider|facebook|twitter|discord|preview/i.test(ua);
}

const seoRoutes = [
  {
    pattern: /^\/music\/([^/]+)$/,
    handler: musicSeo.fetch,
  },
  {
    pattern: /^\/$/,
    handler: fallbackSeo.fetch,
  },
  {
    pattern: /^\/u\/([\w-]+)$/,
    handler: userSeo.fetch,
  },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const ua = request.headers.get("User-Agent") || "";

    if (pathname.startsWith("/api")) {
      return app.fetch(request, env, ctx);
    }

    if (pathname.startsWith("/music/sitemap.xml")) {
      return sitemapSeo.fetch(request, env, ctx);
    }

    if (isBot(ua)) {
      for (const { pattern, handler } of seoRoutes) {
        if (pattern.test(pathname)) {
          return handler(request, env, ctx);
        }
      }

      return fallbackSeo.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
