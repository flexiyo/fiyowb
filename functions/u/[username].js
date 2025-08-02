import userSeo from "../_app/seo/user.seo.js";
import fallbackSeo from "../_app/seo/fallback.seo.js";

export const onRequest = async ({ request }) => {
  const ua = request.headers.get("user-agent") || "";
  const isBot = /bot|crawl|spider|facebook|twitter|discord|preview/i.test(ua);

  return isBot ? userSeo(request) : fallbackSeo();
};
