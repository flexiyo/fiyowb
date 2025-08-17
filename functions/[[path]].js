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
    allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  );
  await next();
});

app.route("/api/ytmusic", ytMusicRoutes);

app.route("/", seoRoutes);

// --- Entry Point ---
export const onRequest = async ({ request, env, context }) => {
  const response = await app.fetch(request, env, context);

  if (response.status === 404) {
    return env.ASSETS.fetch(request);
  }

  return response;
};

export const fetch = (request, env, context) => {
  return onRequest({ request, env, context });
};