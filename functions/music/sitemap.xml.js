import sitemapSeo from "../_app/seo/musicSitemap.seo.js";

export const onRequest = async ({ request }) => {
  return sitemapSeo(request, env);
};
