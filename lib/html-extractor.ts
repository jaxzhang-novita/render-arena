export function extractHTMLFromMarkdown(markdown: string): string | null {
  const htmlCodeBlockRegex = /```html\n([\s\S]*?)\n```/g
  const matches = [...markdown.matchAll(htmlCodeBlockRegex)]

  if (matches.length === 0) {
    return null
  }

  const htmlContent = matches[matches.length - 1][1].trim()

  return htmlContent
}
