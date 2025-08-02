// handlers/ytmusic.handler.js
import { Hono } from 'hono'
import {
  searchTracksInternal,
  getTrackData,
  getNextTrackData,
  getTrackLyricsData,
  getSuggestionsData,
} from '../lib/ytmusic.js'

const ytMusicRoutes = new Hono()

ytMusicRoutes.get('/search', async (c) => {
  const term = c.req.query('term')
  const continuation = c.req.query('continuation')
  if (!term && !continuation) return c.json({ error: 'Missing search term' }, 400)

  const data = await searchTracksInternal(term, continuation)
  return c.json({ success: true, data })
})

ytMusicRoutes.get('/track', async (c) => {
  const videoId = c.req.query('videoId')
  const ssr = c.req.query('ssr')
  if (!videoId) return c.json({ error: 'Missing video ID' }, 400)

  const data = await getTrackData(videoId, c.env, ssr)
  return c.json({ success: true, data })
})

ytMusicRoutes.get('/next', async (c) => {
  const videoId = c.req.query('videoId')
  const playlistId = c.req.query('playlistId')
  const playedTrackIds = c.req.query('playedTrackIds')
  if (!videoId || !playlistId) return c.json({ error: 'Missing params' }, 400)

  const data = await getNextTrackData(videoId, playlistId, playedTrackIds)
  return c.json({ success: true, data })
})

ytMusicRoutes.get('/lyrics', async (c) => {
  const browseId = c.req.query('browseId')
  if (!browseId) return c.json({ error: 'Missing browse ID' }, 400)

  const lyrics = await getTrackLyricsData(browseId)
  return c.json({ success: true, data: lyrics })
})

ytMusicRoutes.get('/suggestions', async (c) => {
  const term = c.req.query('term')
  if (!term) return c.json({ error: 'Missing term' }, 400)

  const data = await getSuggestionsData(term)
  return c.json({ success: true, data })
})

export default ytMusicRoutes
