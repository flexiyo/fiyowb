import { Hono } from "hono";
import ytMusicRoutes from "./_app/routes/ytmusic.routes.js";
import seoRoutes from "./_app/routes/seo.routes.js";
import { handleSitemap } from "./_app/lib/ytmusic.lib.js";

const app = new Hono();

// --- CORS Middleware ---
app.use("/*", async (c, next) => {
  const origin = c.req.header("Origin") || "";
  const allowedOrigins = (
    c.env.ALLOWED_ORIGINS || "https://flexiyo.pages.dev,http://localhost:3000"
  ).split(",");

  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
          ? origin
          : allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  c.res.headers.set(
    "Access-Control-Allow-Origin",
    allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  );
  await next();
});

// --- Dynamic Sitemap ---
app.get("/music_sitemap.xml", async ({ env }) => {
  const sitemapXml = await handleSitemap(env);
  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
});

// --- API Routes ---
app.route("/api/ytmusic", ytMusicRoutes);

// --- Allowed Bot List (for SEO SSR only) ---
const allowedBots = [
  "Googlebot",
  "Bingbot",
  "YandexBot",
  "Applebot",
  "LinkedInBot",
  "facebookexternalhit",
  "Twitterbot",
  "Discordbot",
  "GPTBot",
  "DuckDuckBot",
  "Google-InspectionTool",
  "embed",
];

function isAllowedBot(userAgent = "") {
  return allowedBots.some(bot => userAgent.includes(bot));
}

// --- Request Handler Entry Point ---
export const onRequest = async ({ request, env, context }) => {
  const userAgent = request.headers.get("User-Agent") || "";

  // Enable SSR only for approved bots
  if (isAllowedBot(userAgent)) {
    app.route("/", seoRoutes); // Inject SEO routes only for bots
  }

  const response = await app.fetch(request, env, context);

  // Fallback to asset handler for 404s (e.g., SPA fallback)
  if (response.status === 404) {
    return env.ASSETS.fetch(request);
  }

  return response;
};
// Music Sitemap
app.get("/music_sitemap.xml", async ({ env }) => {
  const sitemapXml = await handleSitemap(env);
  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
});

// API
app.route("/api/ytmusic", ytMusicRoutes);

// Detect bots
function isBot(userAgent = "") {
  return /bot|crawl|spider|facebook|twitter|discord|preview/i.test(userAgent);
}

// Request handler
export const onRequest = async ({ request, env, context }) => {
  const userAgent = request.headers.get("User-Agent") || "";

  if (isBot(userAgent)) {
    app.route("/", seoRoutes);
  }

  const response = await app.fetch(request, env, context);

  if (response.status === 404) {
    return env.ASSETS.fetch(request);
  }

  return response;
};
