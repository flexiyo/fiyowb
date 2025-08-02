import template from './seoTemplate.html'
import { getTrackData } from '../lib/ytmusic.js'
import { renderSeoPage } from '../lib/renderSeoPage.js'

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const slug = url.pathname.split('/music/')[1]
    const videoId = slug?.split('_').pop()
    if (!videoId) return new Response('Invalid URL', { status: 400 })

    try {
      const data = await getTrackData(videoId, env, true)
      const canonical = `https://flexiyo.pages.dev/music/${slug}`
      const image = data.images?.[2]?.url || ''
      const jsonLD = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicRecording",
        name: data.title,
        description: data.description,
        url: canonical,
        image,
        author: { "@type": "Person", name: data.artists },
        byArtist: { "@type": "MusicGroup", name: data.artists },
      })

      const html = renderSeoPage(template, {
        title: data.title,
        description: `Listen and download '${data.title}' by ${data.artists.split('•')[0].trim()} in high quality - only on Flexiyo.`,
        keywords: data.keywords,
        author: data.artists,
        canonical_url: canonical,
        image,
        og_type: 'music.song',
        twitter_handle: 'x_flexiyo',
        structured_data: jsonLD,
        content_block: `
          <p><strong>Duration:</strong> ${data.duration}</p>
          <p><strong>Plays:</strong> ${data.playsCount}</p>
          ${image ? `<figure><img src="${image}" alt="${data.title}" /></figure>` : ''}
        `,
      })

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    } catch {
      return new Response('Failed to render page', { status: 500 })
    }
  },
}
