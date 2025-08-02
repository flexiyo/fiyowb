import { renderToString } from 'react-dom/server'
import App from './App'
import { StaticRouter } from 'react-router-dom'

export function render(url, _) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
