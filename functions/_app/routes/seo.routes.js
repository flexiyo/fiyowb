import { Hono } from 'hono';
import {
  renderMusicPage,
  renderUserPage,
} from '../lib/seo.lib.js';

const seoRoutes = new Hono();

seoRoutes.get('/music/:slug', (c) => {
  return renderMusicPage(c.req.raw, c.env);
});

seoRoutes.get('/u/:username', (c) => {
  return renderUserPage(c.req.raw, c.env);
});


export default seoRoutes;