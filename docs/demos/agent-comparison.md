# Agent Comparison Demo

This experimental branch compares two system-prompt profiles using the same model and the same
Novita streaming generation API:

- **Direct** uses a deliberately constrained baseline prompt.
- **Agent** uses a more complete agent-style product and frontend prompt.

The Claude Code, Codex, OpenCode, and LLM Agent harness choices are presentation labels only. They do not
invoke those products, change the system prompt, or run an agent runtime. This demo must not be
presented as benchmark evidence for any named harness or for agents in general.

Harness state is URL-only and is not stored in Supabase or included in Gallery and Share output.
