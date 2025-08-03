import { Hono } from 'hono';
import {
  renderMusicPage,
  renderUserPage,
} from '../lib/seo.lib.js';

const seoRoutes = new Hono();

seoRoutes.get('/music/:slug', (c) => {
  return renderMusicPage(c.req.raw, c.env, c.executionCtx);
});

seoRoutes.get('/u/:username', (c) => {
  return renderUserPage(c.req.raw, c.env, c.executionCtx);
});

export default seoRoutes;
