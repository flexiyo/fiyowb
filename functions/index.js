const fastify = require("fastify");
const fs = require("fs");
const path = require("path");
const fastifyCompress = require("@fastify/compress");
const fastifyCors = require("@fastify/cors");
const functions = require("firebase-functions");

// Import handlers
const { musicHandler } = require("./handlers/musicHandler");
const { userHandler } = require("./handlers/userHandler");
const { sitemapHandler } = require("./handlers/sitemapHandler");

// Paths
const seoHtmlPath = path.join(__dirname, "seo.html");
const htmlTemplate = fs.readFileSync(seoHtmlPath, "utf8");

// Fastify instance
const app = fastify();

app.register(fastifyCompress);
app.register(fastifyCors);

// Bot detection
const isBot = (userAgent = "") => {
  return /bot|crawl|slurp|spider|Googlebot|Bingbot|YandexBot|Applebot|LinkedInBot|facebook|facebookexternalhit|twitter|Twitterbot|discord|Discordbot|GPTBot|DuckDuckBot|Google-InspectionTool|embed/i.test(
    userAgent
  );
};

// HTML renderer
function renderTemplate(template, meta = {}) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = meta[key.trim()];
    return value !== undefined ? value : "";
  });
}

// Routes
app.get("/music/:slug", async (req, res) => {
  if (!isBot(req.headers["user-agent"])) {
    return res.redirect(
      301,
      `https://${req.headers.host}/music/${req.params.slug}`
    );
  }
  const meta = await musicHandler(req.params.slug);
  const html = renderTemplate(htmlTemplate, meta);
  res.type("text/html").send(html);
});

app.get("/u/:id", async (req, res) => {
  if (!isBot(req.headers["user-agent"])) {
    return res.redirect(`https://${req.headers.host}/u/${req.params.id}`);
  }
  const meta = await userHandler(req.params.id);
  const html = renderTemplate(htmlTemplate, meta);
  res.type("text/html").send(html);
});

app.get("/sitemap.xml", async (_, res) => {
  const { xml } = await sitemapHandler();
  res.type("application/xml").send(xml);
});

app.get("*", async (req, res) => {
  if (!isBot(req.headers["user-agent"])) {
    return res.redirect(`https://${req.headers.host}/`);
  }
  res.status(404).send("Not found");
});

// Export to Firebase Functions
let fastifyApp;
app.ready().then((instance) => {
  fastifyApp = instance;
});

exports.seo = functions.https.onRequest((req, res) => {
  if (fastifyApp) {
    fastifyApp.server.emit("request", req, res);
  } else {
    res.status(503).send("Server not ready");
  }
});
