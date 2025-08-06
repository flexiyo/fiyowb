import { Hono } from "hono";
import { renderDefaultPage, renderMusicPage, renderUserPage } from "../lib/seo.lib.js";

const seoRoutes = new Hono();

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

export function isBot(userAgent = "") {
  const ua = userAgent.toLowerCase();
  return botKeywords.some((keyword) => ua.includes(keyword));
}

// SEO route for music page
seoRoutes.get("/music/:slug", async (c) => {
  const ua = c.req.header("User-Agent") || "";
  if (!isBot(ua)) return c.notFound();

  const slug = c.req.param("slug");
  return await renderMusicPage(slug, c.env);
});

// SEO route for user profile
seoRoutes.get("/u/:username", async (c) => {
  const ua = c.req.header("User-Agent") || "";
  if (!isBot(ua)) return c.notFound();

  const username = c.req.param("username");
  return await renderUserPage(username);
});

// Fallback for all unmatched bot-accessed routes
seoRoutes.get("*", async (c) => {
  const ua = c.req.header("User-Agent") || "";
  if (!isBot(ua)) return c.notFound();

  const canonicalUrl = new URL(c.req.url).href;
  return await renderDefaultPage(canonicalUrl);
});

export default seoRoutes;