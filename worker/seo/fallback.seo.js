import htmlTemplate from "../../index.html";

function injectSSR(html) {
  const seoHtml = `
    <h1>Welcome to Flexiyo</h1>
    <p>A social community where you can create, share, and explore content - from short videos to music and more.</p>

    <section>
      <h2>Explore</h2>
      <ul>
        <li><a href="/music">Listen to Music</a></li>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/signup">Create account</a></li>
      </ul>
    </section>

    <article>
      <h2>Flex in Your Onset</h2>
      <p>Flexiyo helps creators and learners connect, share skills, and showcase their talent across social platforms.</p>
      <p><a href="/about">Learn more →</a></p>
    </article>
  `;

  return html.replace(
    /<div\s+id=["']root["'].*?>.*?<\/div>/s,
    `<div id="root">${seoHtml}</div>`
  );
}

export default {
  async fetch() {
    const fullHtml = injectSSR(htmlTemplate);

    return new Response(fullHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
