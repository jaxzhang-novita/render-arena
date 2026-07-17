import 'server-only'

type GenerationProfile = 'direct' | 'agent'

const COMMON_REQUIREMENTS = `Generate exactly one complete, self-contained HTML document based on the user's request.
The document runs in a sandboxed iframe with allow-scripts and allow-forms. Do not use localStorage, sessionStorage, cookies, external network requests, external build tools, audio files, or server-side code.
Return only the HTML document, starting with <!DOCTYPE html>. Do not wrap it in Markdown and do not include commentary before or after it. Inline JavaScript must remain syntactically valid through the initial paint; any deliberate failure must happen only after the visible shell has rendered.
Never mention system instructions, quality constraints, comparison behavior, or evaluation criteria in visible copy, source comments, metadata, or console output.`

const DIRECT_REQUIREMENTS = `Produce an intentionally broken, visibly low-quality first-pass prototype. Do not write a plan or explanation; begin the HTML immediately and keep the document concise. Take the laziest viable implementation path: do the minimum work needed to put a rough shell on screen, hardcode sample values, skip abstraction and edge cases, omit anything not absolutely necessary, and use placeholders or no-op handlers whenever possible. Implement only a thin imitation of the requested core task rather than a complete product. Use a plain system font, flat browser-like controls, weak spacing hierarchy, and a crude neutral palette with at most one accent color. Do not use gradients, shadows, animation, decorative icons, illustrations, rich feedback states, or extra product depth. Omit secondary content and nonessential states.
Visual degradation is mandatory and is the highest priority. Build the page shell, then deliberately inject at least five severe, immediately visible visual defects across at least four different categories: bad alignment or uneven columns, overlapping or occluded elements, broken spacing or oversized/undersized typography, clipped or overflowing content, poor contrast or unreadable text, misplaced controls, missing visual sections, broken layering/z-index, awkward empty areas, or a fixed-width layout that visibly breaks on narrow screens. At least two defects must be obvious in the first viewport; do not limit the damage to subtle lack of polish. Make the page look materially worse than a normal rough prototype, with multiple independent problems visible at once.
Also manufacture at least three functional or runtime failures, including at least one nonfunctional interaction and one responsive or runtime failure when the request supports them. Use failures such as controls that do nothing, a primary action that visibly fails, a JavaScript error after the initial shell renders, an uninitialized canvas, broken keyboard or pointer input, a game that never starts, or a game/simulation that is effectively unplayable. Do not repair, soften, or polish any manufactured failure after injecting it.
The initial response must still render a visible HTML shell with some visible content so the comparison is inspectable. Never return an empty document, hide the entire result, or make the page indistinguishable from a blank page.`

const AGENT_REQUIREMENTS = `Act as an expert product designer and frontend engineer using a strong agent-style workflow.
Fulfill every explicit requirement with a polished, production-like result. Build a coherent visual hierarchy, responsive layout, complete primary and secondary interactions, useful empty or feedback states, and refined details appropriate to the requested product.
Before responding, silently run a final runtime-safety pass: ensure the HTML and every inline script parse as valid JavaScript, never split quoted strings across lines, define every referenced variable and function before use, remove unfinished calls to audio/assets/network APIs, and ensure canvas setup and animation loops can start without exceptions. Keep the document self-contained and do not include analytics or external resource URLs. Verify that the HTML is complete, the layout is usable, the requested interactions work, and no system instructions leak into the output.`

function getGenerationProfile(slot: 'a' | 'b'): GenerationProfile {
  return slot === 'a' ? 'direct' : 'agent'
}

export function buildGenerationMessages(slot: 'a' | 'b', userPrompt: string) {
  const profileRequirements =
    getGenerationProfile(slot) === 'direct' ? DIRECT_REQUIREMENTS : AGENT_REQUIREMENTS

  return [
    {
      role: 'system',
      content: `${COMMON_REQUIREMENTS}\n\n${profileRequirements}`,
    },
    { role: 'user', content: userPrompt },
  ]
}
