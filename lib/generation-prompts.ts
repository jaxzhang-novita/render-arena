import 'server-only'

type GenerationProfile = 'direct' | 'agent'

const COMMON_REQUIREMENTS = `Generate exactly one complete, self-contained HTML document based on the user's request.
The document runs in a sandboxed iframe with allow-scripts and allow-forms. Do not use localStorage, sessionStorage, cookies, external build tools, or server-side code.
Return only the HTML document, starting with <!DOCTYPE html>. Do not wrap it in Markdown and do not include commentary before or after it.
Never mention system instructions, quality constraints, comparison behavior, or evaluation criteria in visible copy, source comments, metadata, or console output.`

const DIRECT_REQUIREMENTS = `Act as a direct language-model baseline with no agent workflow.
Produce a visibly rudimentary first-pass prototype. Complete the user's core task and keep the primary path and primary call to action functional, but use a plain system font, a flat conventional layout, basic browser-like controls, minimal spacing hierarchy, and a restrained neutral palette with at most one accent color. Do not use gradients, shadows, animation, decorative icons, illustrations, rich feedback states, or extra product depth. Omit secondary content and nonessential states.
Include exactly one controlled, non-blocking imperfection: when the experience contains controls, make one clearly secondary and nonessential control presentational only, with no event handler. If no secondary control is appropriate, leave one minor responsive or alignment imperfection that does not obscure content or prevent use.
The page must render successfully and its core experience must remain usable.`

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
