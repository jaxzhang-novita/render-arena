---
name: Novitaai
description: Use when building AI applications that need LLM inference, image/video/audio generation, GPU compute resources, or secure code execution sandboxes. Reach for this skill when integrating open-source models, managing API authentication, handling async tasks, or deploying AI workloads.
metadata:
    mintlify-proj: novitaai
    version: "1.0"
    source: "https://novita.ai/docs/skill.md"
---

# Novita AI Skill

## Product summary

Novita AI is a cloud inference platform providing cost-effective access to 10,000+ open-source AI models. Use it to ship LLM chat/completion APIs, image/video/audio generation, GPU instances for custom workloads, and Agent Sandbox for secure code execution. The platform is OpenAI-compatible for LLMs, supports async/batch processing, and charges per-second for compute. Primary docs: https://novita.ai/docs. Key endpoints: `https://api.novita.ai/openai` (LLM), `https://api.novita.ai/v3` (image/video/audio). Authentication: Bearer token in `Authorization` header. Manage API keys at https://novita.ai/settings/key-management.

## When to use

Reach for this skill when:
- Building LLM applications that need OpenAI-compatible chat/completion APIs with cost-effective open-source models
- Generating images, videos, or audio at scale (async tasks with task_id polling)
- Running GPU-intensive workloads on dedicated instances with per-second billing
- Executing AI-generated code securely in isolated sandboxes (Agent Sandbox)
- Processing large batches of LLM requests asynchronously (Batch API, up to 50k requests per batch)
- Integrating with frameworks like LangChain, Dify, or Cursor that support Novita
- Handling rate limits or needing higher throughput (contact support to increase limits)
- Debugging API errors or checking account balance/billing

## Quick reference

### Authentication & Setup
| Task | Command/Code |
|------|--------------|
| Get API key | Visit https://novita.ai/settings/key-management, create new key |
| Set auth header | `Authorization: Bearer {API_KEY}` |
| Check balance | GET `/v1/user/balance` with Bearer token |
| List models | GET `https://api.novita.ai/openai/v1/models` |

### LLM API (OpenAI-compatible)
| Endpoint | Use case |
|----------|----------|
| `/v1/chat/completions` | Chat conversations (streaming or non-streaming) |
| `/v1/completions` | Text completion (legacy) |
| `/v1/embeddings` | Generate embeddings |
| `/v1/rerank` | Rerank search results |

### Image/Video/Audio (Async)
| Task | Pattern |
|------|---------|
| Generate image | POST to model endpoint -> get `task_id` -> poll `/v3/task_result/{task_id}` |
| Generate video | Same async pattern; check model docs for duration/aspect ratio limits |
| Text-to-speech | POST request -> `task_id` -> retrieve result via Task Result API |

### Batch API (LLM only)
| Step | Action |
|------|--------|
| 1. Prepare | Create JSONL file with requests (one per line, same model per batch) |
| 2. Upload | POST file to `/v1/files` with `purpose=batch` |
| 3. Create batch | POST to `/v1/batches` with `input_file_id`, `endpoint`, `completion_window=24h` |
| 4. Check status | GET `/v1/batches/{batch_id}` (statuses: VALIDATING, PROGRESS, COMPLETED, FAILED, EXPIRED) |
| 5. Retrieve results | GET `/v1/files/{output_file_id}/content` after COMPLETED |

### GPU Instance
| Task | Note |
|------|------|
| Create instance | Use dashboard or API; select template, GPU type, region |
| Billing | Per-second for vCPU/RAM; free local storage; network transfer free |
| Lifecycle | Start/stop/restart/delete via API or console |
| Storage | Local disk (ephemeral), network volume (persistent) |

### Agent Sandbox
| Feature | Details |
|---------|---------|
| Startup | <200ms, supports high concurrency |
| Languages | Python, JavaScript, TypeScript, C++ |
| Billing | Per-second for vCPU and RAM |
| Persistence | Pause/resume with state preserved |
| Integration | SDK/CLI for spawning and managing sandboxes |

## Decision guidance

### When to use LLM Chat vs Completion
| Scenario | Use |
|----------|-----|
| Multi-turn conversation, system prompts, role-based responses | Chat Completion (`/v1/chat/completions`) |
| Simple text continuation, legacy workflows | Completion (`/v1/completions`) |

### When to use Streaming vs Non-streaming
| Scenario | Use |
|----------|-----|
| Long outputs, user-facing responses, real-time feedback | Streaming (`stream=true`) |
| Batch processing, evaluations, when full response needed | Non-streaming (`stream=false`) |

### When to use Batch API vs Real-time API
| Scenario | Use |
|----------|-----|
| 100+ requests, cost optimization, 24h turnaround acceptable | Batch API (higher rate limits, lower cost) |
| <100 requests, real-time responses needed, interactive use | Real-time API (immediate results) |

### When to use GPU Instance vs Serverless GPU
| Scenario | Use |
|----------|-----|
| Long-running workloads, custom environments, persistent state | GPU Instance (on-demand, per-second billing) |
| Short async tasks, API endpoints, auto-scaling | Serverless GPU (endpoint-based) |

### When to use Agent Sandbox vs GPU Instance
| Scenario | Use |
|----------|-----|
| Secure code execution, AI agents, high concurrency, <200ms startup | Agent Sandbox |
| Custom model training, long-running compute, full OS access | GPU Instance |

## Workflow

### Typical LLM Chat Task
1. **Verify credentials**: Confirm API key is set in environment or config; test with `/v1/models` list endpoint
2. **Choose model**: Browse https://novita.ai/models or call `/v1/models`; note model ID (e.g., `deepseek/deepseek-v3-0324`)
3. **Construct request**: Build messages array with `role` (system/user/assistant) and `content`; set `max_tokens`, `temperature`, `stream`
4. **Call API**: POST to `https://api.novita.ai/openai/v1/chat/completions` with Bearer auth
5. **Handle response**: If streaming, iterate chunks; if non-streaming, extract `choices[0].message.content`
6. **Check balance**: Monitor account balance; set up auto-top-up to avoid service interruption

### Typical Image Generation Task
1. **Select model**: Choose from Flux, Kling, VIDU, Seedream, etc.; check model docs for parameters
2. **Prepare payload**: Include prompt, negative_prompt, width, height, num_inference_steps (varies by model)
3. **Submit request**: POST to model endpoint (e.g., `/v3/txt2img`) with Bearer auth
4. **Get task_id**: Extract `task_id` from response
5. **Poll result**: Repeatedly GET `/v3/task_result/{task_id}` until status is `success` or `failed`
6. **Retrieve image**: Extract image URL or base64 from result; download or process

### Typical Batch Processing Task
1. **Prepare JSONL**: Create file with one request per line; each line has `custom_id`, `body` with model/messages/max_tokens
2. **Upload file**: POST to `/v1/files` with `purpose=batch`; save returned `file_id`
3. **Create batch**: POST to `/v1/batches` with `input_file_id`, `endpoint=/v1/chat/completions`, `completion_window=24h`
4. **Monitor**: Poll `/v1/batches/{batch_id}` every 30s-5m; watch for status transitions
5. **Retrieve results**: Once `status=COMPLETED`, GET `/v1/files/{output_file_id}/content`; parse JSONL output
6. **Handle errors**: Check `error_file_id` for failed requests; retry or debug

### Typical GPU Instance Task
1. **Create instance**: Select template (Kohya, Axolotl, etc.), GPU type, region, CPU/RAM
2. **Configure**: Set environment variables, ports, startup command, network volume if needed
3. **Connect**: SSH or use web UI (JupyterLab, etc.) to access instance
4. **Deploy workload**: Upload code, models, data; run training/inference
5. **Monitor**: Check metrics (CPU, GPU, memory) via dashboard
6. **Manage lifecycle**: Stop when not in use (pause billing); delete when done

## Common gotchas

- **Missing or invalid API key**: Requests fail with 403 `INVALID_API_KEY`. Verify key exists, is not expired, and is included in `Authorization: Bearer {key}` header.
- **Insufficient balance**: 400 `BILLING_BALANCE_NOT_ENOUGH` error. Check balance via `/v1/user/balance`; add credits immediately.
- **Rate limit hit (429)**: Occurs when exceeding TPM (tokens per minute) or RPM (requests per minute). Retry with exponential backoff; contact support to raise limits.
- **Async task polling timeout**: Image/video generation can take 30s-5m. Don't assume immediate completion; implement polling with timeout (e.g., 10m max).
- **Batch file format errors**: JSONL must have one request per line; all requests must target same model. Validate syntax before upload.
- **Model not found (404)**: Model ID may be deprecated or region-specific. Check `/v1/models` endpoint for current list.
- **Streaming timeout**: Long outputs may timeout. Use `stream=true` for real-time chunks; use Batch API for large-scale processing.
- **GPU instance billing surprise**: Instances charge per-second even when idle. Stop instances when not in use; set auto-shutdown policies.
- **Sandbox persistence confusion**: Paused sandboxes preserve state; deleted sandboxes do not. Commit snapshots before deletion if state is needed.
- **Image/video resolution limits**: Exceeding max resolution (varies by model) returns 400 `IMAGE_EXCEEDS_MAX_RESOLUTION`. Check model docs for constraints.

## Verification checklist

Before submitting work:
- [ ] API key is valid and has sufficient balance (check `/v1/user/balance`)
- [ ] Model ID exists and is available (verify via `/v1/models` or https://novita.ai/models)
- [ ] Request format matches API spec (required fields, correct types, valid enums)
- [ ] Authentication header is present: `Authorization: Bearer {API_KEY}`
- [ ] For async tasks (image/video), polling loop has timeout and error handling
- [ ] For batch jobs, JSONL file is valid (one request per line, same model, unique custom_ids)
- [ ] Rate limits are respected; implement backoff for 429 errors
- [ ] GPU instances are stopped when not in use (check dashboard for running instances)
- [ ] Sandbox snapshots are committed before deletion if state must persist
- [ ] Error responses are logged and handled (don't silently fail on 400/403/429/500)
- [ ] Webhook endpoints (if used) are reachable and handle ASYNC_TASK_RESULT events

## Render Arena usage notes

- Use `NEXT_NOVITA_API_KEY` first, then `NOVITA_API_KEY` when checking models locally.
- Do not commit API keys, model research output containing secrets, or raw auth headers.
- For model onboarding, verify the model through `GET https://api.novita.ai/openai/v1/models`, then update `lib/config.ts`.
- Convert Novita model prices into the current `lib/config.ts` unit: dollars per million tokens.

## Resources

**Comprehensive navigation**: https://novita.ai/docs/llms.txt

**Critical docs**:
1. [LLM API Guide](https://novita.ai/docs/guides/llm-api) - Chat/completion, streaming, parameters, code examples
2. [Batch API Guide](https://novita.ai/docs/guides/llm-batch-api) - Async processing, JSONL format, status tracking
3. [API Reference Overview](https://novita.ai/docs/api-reference/api-reference-overview) - All endpoints, authentication, error codes

---

For additional documentation and navigation, see: https://novita.ai/docs/llms.txt
