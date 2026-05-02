/**
 * Load an HTML template and inject translations
 */
export async function loadTemplate(templatePath, t) {
  const response = await fetch(templatePath)
  let html = await response.text()
  
  // Replace translation keys like {{key.path}} with actual translations
  html = html.replace(/{{([\w.]+)}}/g, (match, key) => {
    return t(key) || match
  })
  
  return html
}

/**
 * Convert HTML string to DOM element
 */
export function htmlToElement(html) {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstChild
}
