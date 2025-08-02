// index.js
import { Hono } from 'hono'
import ytMusicRoutes from './routes/ytmusic.routes.js'

const app = new Hono()

// CORS
app.use('/*', async (c, next) => {
  const origin = c.req.header('Origin') || ''
  const allowed = [
    'https://flexiyo.pages.dev',
    'https://flexiyo.web.app',
    'http://localhost:3000',
  ]
  const headers = {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (c.req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  await next()
  for (const [key, value] of Object.entries(headers)) {
    c.res.headers.set(key, value)
  }
})

app.route('/api/ytmusic', ytMusicRoutes)

export default app
