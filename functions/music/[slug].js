import musicSeo from "../_app/seo/music.seo.js";
import fallbackSeo from "../_app/seo/fallback.seo.js";

export const onRequest = async ({ request, env }) => {
  const ua = request.headers.get("user-agent") || "";
  const isBot = /bot|crawl|spider|facebook|twitter|discord|preview/i.test(ua);

  return isBot ? musicSeo(request, env) : fallbackSeo();
};
