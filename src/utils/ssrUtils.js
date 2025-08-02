export const isBot = (ua = "") => {
  return /bot|crawl|slurp|spider|bing|facebook|whatsapp|telegram|preview|discord/i.test(
    ua
  );
};

export function renderTemplate(templateString, data) {
  return templateString
    .replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : "";
    })
    .replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, key, content) => {
      return data[key] ? content : "";
    });
}

export const notFoundResponse = (message = "Not found") => {
  return new Response(message, {
    status: 404,
    headers: { "Content-Type": "text/plain" },
  });
};

export const errorResponse = (error) => {
  return new Response(
    `<h1>500 Internal Server Error</h1><pre>${
      error instanceof Error ? error.stack : error
    }</pre>`,
    { status: 500, headers: { "Content-Type": "text/html" } }
  );
};
