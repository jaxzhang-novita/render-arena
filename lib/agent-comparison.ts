export const agentHarnesses = [
  { id: 'claude-code', name: 'Claude Code', icon: '/logo/models/claude-color.svg' },
  { id: 'codex', name: 'Codex', icon: '/logo/models/openai.svg' },
  { id: 'opencode', name: 'OpenCode', icon: '/logo/harnesses/opencode.svg' },
  { id: 'llm-agent', name: 'LLM Agent', icon: undefined },
] as const

type AgentHarnessId = (typeof agentHarnesses)[number]['id']
export type AgentHarness = (typeof agentHarnesses)[number]

export const defaultAgentHarnessId: AgentHarnessId = 'claude-code'

export function getAgentHarness(harnessId?: string | null): AgentHarness {
  return (
    agentHarnesses.find(harness => harness.id === harnessId) ??
    agentHarnesses.find(harness => harness.id === defaultAgentHarnessId)!
  )
}
