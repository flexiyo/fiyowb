import { Hono } from "hono";
import ytMusicRoutes from "./_app/routes/ytmusic.routes.js";
import seoRoutes from "./_app/routes/seo.routes.js";

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

// --- API Routes ---
app.route("/api/ytmusic", ytMusicRoutes);

// --- Bot Detection (broad + accurate) ---
const botKeywords = [
  "bot",
  "crawl",
  "slurp",
  "spider",
  "embed",
  "preview",
  "fetch",
  "scan",
  "render",
  "monitor",
  "scrape",
  "linkexpander",
  "google",
  "facebook",
  "twitter",
  "discord",
  "linkedin",
  "whatsapp",
  "telegram",
  "pinterest",
  "gptbot",
  "duckduck",
  "yandex",
  "applebot",
  "bingbot",
  "redditbot",
  "vkshare",
];

function isBot(userAgent = "") {
  const ua = userAgent.toLowerCase();
  return botKeywords.some((keyword) => ua.includes(keyword));
}

// --- Entry Point Handler ---
export const onRequest = async ({ request, env, context }) => {
  const userAgent = request.headers.get("User-Agent") || "";

  // Inject SEO routes for bots (SSR for crawlers & previewers)
  if (isBot(userAgent)) {
    app.route("/", seoRoutes);
  }

  const response = await app.fetch(request, env, context);

  // 404 fallback: Serve from static ASSETS (for SPA)
  if (response.status === 404) {
    return env.ASSETS.fetch(request);
  }

  return response;
};