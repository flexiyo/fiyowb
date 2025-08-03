import { Hono } from 'hono';
import {
  renderMusicPage,
  renderUserPage,
} from '../lib/seo.lib.js';

const seoRoutes = new Hono();

// SEO music page route
seoRoutes.get('/music/:slug', async (c) => {
  const slug = c.req.param('slug');
  return await renderMusicPage(slug, c.env);
});

// SEO user profile page route
seoRoutes.get('/u/:username', async (c) => {
  const username = c.req.param('username');
  return await renderUserPage(username, c.env);
});

export default seoRoutes;