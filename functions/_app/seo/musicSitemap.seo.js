import { handleSitemap } from "../lib/ytmusic.js";

export default async function musicSitemapSeo(_, env) {
  try {
    const xml = await handleSitemap(env);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
