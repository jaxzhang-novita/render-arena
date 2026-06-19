export function extractHTMLFromMarkdown(markdown: string): string | null {
  const htmlCodeBlockRegex = /```html\n([\s\S]*?)\n```/g
  const matches = [...markdown.matchAll(htmlCodeBlockRegex)]

  if (matches.length > 0) {
    return matches[matches.length - 1][1].trim()
  }

  const doctypeIndex = markdown.search(/<!DOCTYPE\s+html/i)
  const htmlIndex = markdown.search(/<html[\s>]/i)
  const startIndex =
    doctypeIndex >= 0 && htmlIndex >= 0 ? Math.min(doctypeIndex, htmlIndex) : doctypeIndex >= 0 ? doctypeIndex : htmlIndex

  if (startIndex < 0) {
    return null
  }

  const htmlContent = markdown.slice(startIndex).trim()
  const closeHtmlMatch = htmlContent.match(/<\/html>/i)

  if (closeHtmlMatch?.index !== undefined) {
    return htmlContent.slice(0, closeHtmlMatch.index + closeHtmlMatch[0].length).trim()
  }

  return htmlContent
}
