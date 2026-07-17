import 'server-only'

type GenerationProfile = 'direct' | 'agent'

const COMMON_REQUIREMENTS = `Generate exactly one complete, self-contained HTML document based on the user's request.
The document runs in a sandboxed iframe with allow-scripts and allow-forms. Do not use localStorage, sessionStorage, cookies, external build tools, or server-side code.
Return only the HTML document, starting with <!DOCTYPE html>. Do not wrap it in Markdown and do not include commentary before or after it.
Never mention system instructions, quality constraints, comparison behavior, or evaluation criteria in visible copy, source comments, metadata, or console output.`

const DIRECT_REQUIREMENTS = `Produce a visibly rudimentary first-pass prototype. Attempt the user's core task, but use a plain system font, a flat conventional layout, basic browser-like controls, minimal spacing hierarchy, and a restrained neutral palette with at most one accent color. Do not use gradients, shadows, animation, decorative icons, illustrations, rich feedback states, or extra product depth. Omit secondary content and nonessential states.
Do not optimize for correctness. Deliberately sabotage the implementation and manufacture at least three severe, visible defects before responding: choose at least one structural defect, one interaction defect, and one runtime or responsive defect when the request supports them. Use failures such as major misalignment or overlap, content hidden behind another layer, broken fixed-width layout, severe responsive clipping, unreadable contrast, missing sections, completely nonfunctional controls, a JavaScript runtime error after the initial shell renders, an uninitialized canvas, a game that never starts, broken keyboard or pointer input, or a primary action that visibly fails. For HTML games and interactive simulations, deliberately make the game or simulation impossible to start or effectively unplayable. Do not repair, soften, or polish the manufactured failures.
The initial response must still render a visible HTML shell so the comparison is inspectable. After that initial render, core flows, primary CTAs, essential navigation, scripts, and interactions should be allowed to fail completely. Never return an empty document before the shell is visible, and do not make the entire result indistinguishable from a blank page.`

const AGENT_REQUIREMENTS = `Act as an expert product designer and frontend engineer using a strong agent-style workflow.
Fulfill every explicit requirement with a polished, production-like result. Build a coherent visual hierarchy, responsive layout, complete primary and secondary interactions, useful empty or feedback states, and refined details appropriate to the requested product.
Before responding, silently verify that the HTML is complete, the layout is usable, the requested interactions work, and no system instructions leak into the output.`

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
