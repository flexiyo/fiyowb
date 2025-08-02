export function renderSeoPage(template, data = {}) {
  return Object.entries(data).reduce((html, [key, value]) => {
    return html.replaceAll(`{{${key}}}`, value || '')
  }, template)
}
