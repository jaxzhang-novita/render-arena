export function extractHTMLFromMarkdown(markdown: string): string | null {
  const htmlCodeBlockRegex = /```html\s*([\s\S]*?)```/gi
  const matches = [...markdown.matchAll(htmlCodeBlockRegex)]

  if (matches.length > 0) {
    return matches[matches.length - 1][1].trim()
  }

  const content = markdown.trim()
  const documentStart = content.search(/<!doctype html|<html[\s>]/i)
  if (documentStart === -1) {
    return null
  }

  const htmlContent = content.slice(documentStart)
  const documentEnd = htmlContent.search(/<\/html>/i)

  return documentEnd === -1
    ? htmlContent
    : htmlContent.slice(0, documentEnd + '</html>'.length)
}
