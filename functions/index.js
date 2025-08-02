import app from './app.js'
import seoHTML from './seo.html?raw'

function isBot(ua = '') {
  return /bot|crawl|spider|facebook|twitter|discord|preview/i.test(ua)
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname


    if (pathname.startsWith('/api')) {
      return app.fetch(request, env, ctx)
    }

    const ua = request.headers.get('User-Agent') || ''

    if (isBot(ua)) {
      
    }

    return env.ASSETS.fetch(request)
  },
}
