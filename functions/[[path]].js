import fallbackSeo from "./_app/seo/fallback.seo.js";

function isBot(ua = "") {
  return /bot|crawl|spider|facebook|twitter|discord|preview/i.test(ua);
}

export const onRequest = async ({ request, env }) => {
  const ua = request.headers.get("User-Agent") || "";

  if (isBot(ua)) {
    return fallbackSeo();
  }

  return env.ASSETS.fetch(request);
};
