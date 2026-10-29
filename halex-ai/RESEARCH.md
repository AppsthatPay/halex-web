# HALEX AI — Open-model research, October 2026

Status: staging research notes, 2026-10-27. Prices and model details change fast.
Always re-check the provider's own pricing page before spending money.
Nothing in this file is a price guarantee.

Scope note (2026-10-29): this research serves HALEX-AI, the general AI
system built in the open by many AI systems and human collaborators.
HALEX-M is a separate product (Allen's blockchain intelligence app);
blockchain topics appear here only where a model or framework choice
touches them, never as HALEX-AI's framing.

## What the October 2026 sources actually say

### Frontier open-weight models (large, hosted)
- Respan, October 2026 comparison table (from each model's official card or launch post):
  - Kimi K3 (Moonshot AI): 2.8T total / 104B active, 1M context, Kimi K3 licence. Best for long engineering and research tasks with images.
  - DeepSeek V4.1 Flash (DeepSeek): 552B / 8B prefill, 16B decode, 1M context, MIT licence. Long-context agents at low cost per call.
  - Qwen3.8 (Qwen / Alibaba): 2.4T / 95B, 262K native up to about 1M, Qwen3.8-Max licence. General-purpose agents.
  - GLM-5.3 (Z.ai): 744B / 40B, 1M context, GLM-5.3 licence. Coding and terminal agents.
  - MiMo-V2.6-Pro (Xiaomi): 1.02T / 42B, 1M context, MIT. Agents across text, image, video and audio.
  - Qwen3.8-27B: 27B dense, 262K native up to about 1M, Apache 2.0. Strongest small model to self-host in that table.
  - Gemma 4 (Google): 31B dense largest size, 256K context, Apache 2.0. On-device and workstation deployments.
  - gpt-oss-120b (OpenAI): 117B / 5.1B active, 128K context, Apache 2.0. Single-GPU serving.
  Source: https://www.respan.ai/blog/best-open-source-llms
- AI Magazine, October 2026: "the strongest open-weight models trail the closed frontier by about four months" (Epoch AI estimate quoted there), and Stanford AI Index 2026 measured a 3.3% gap between top closed and top open model in March 2026. Quick picks in that guide: best overall MiMo-V2.6-Pro (top open model on the Artificial Analysis Intelligence Index); Kimi K3 top open model on the Arena text leaderboard; best for coding DeepSeek V4.1 Flash, Kimi K3, GLM-5.3; best on one GPU or Mac Qwen3.8-27B and Gemma 4, both Apache 2.0.
  Source: https://ai-magazine.com/best-open-source-llms/
- Morph, October 2026 coding ranking: Kimi K3 is "the top open-weight model on that board (#7, 1658)" on the Arena Frontend Code Arena, 2.8T parameters, weights on Hugging Face, $2.5 / $14 on Morph, 1M context. Note: that $2.5 / $14 figure conflicts with other hosts below, so treat hosted Kimi pricing as unverified until checked at the chosen host.
  Source: https://www.morphllm.com/best-ai-model-for-coding
- CloudZero, updated October 21, 2026: "DeepSeek V4 for frontier reasoning under MIT, Qwen3.8 and Gemma 4 for clean Apache 2.0 licensing, GLM-5.3 for coding, Kimi K3 for long context, Llama 4 for single-GPU scale."
  Source: https://www.cloudzero.com/blog/best-open-source-llms/

### Hosted open-model pricing (October 2026, third-party summaries, not provider pages)
- StackSpend, October 2026 host examples:
  - Together AI: Kimi K3 $2.70 / $13.50 per million tokens; Qwen3.8-2.4T $2 / $6; Inkling $1 / $4.05.
  - Fireworks AI: Kimi K3 $3 / $15 (Fast $4.50 / $22.50); GLM-5.3 $1.40 / $4.40; V4.1 Flash $0.30 / $1.20.
  - DeepInfra: DeepSeek V4 Pro $1.30 / $2.60; Llama 3.3 70B $0.10 / $0.32.
  - Groq: GPT-OSS 120B $0.15 / $0.60 (about 500 tokens/sec in that summary); GPT-OSS 20B $0.075 / $0.30.
  - OpenRouter: pass-through provider pricing, no inference markup, 5.5% fee on card credit purchases.
  Source: https://www.stackspend.app/blog/model-selection/llm-model-pricing-october-2026
- A second pricing summary lists DeepSeek V4 Flash at $0.09 / $0.18 and Kimi K3 at $0.18 / $20.00, which conflicts with StackSpend. That conflict is exactly why hosted prices are marked UNVERIFIED here: do not budget from either table alone.
  Source: https://whatsthebigdata.com/llm-api-pricing-calculator/
- Self-host break-even (Startupik, October 2026): one rented H100 at $2,548/month was the example rate used there; break-even against hosted models needs very high, round-the-clock token volume, and a part-time workload "cannot break even on a 24/7 rented card even at 100% utilisation during those hours" in that analysis. Conclusion for HALEX: hosted API first, self-host only if volume or control later justifies it.
  Source: https://startupik.com/self-host-open-weight-llm-2026/

### Agentic frameworks (open, model-agnostic)
- LangGraph: precise control over state, branching and retries; built on LangChain; MIT licence in the comparisons found.
- CrewAI: fastest path to a role-based multi-agent team (researcher, writer, reviewer); MIT.
- AutoGen (Microsoft): multi-agent conversation loops, human-in-the-loop patterns; MIT.
- All three are free to run as code; the bill is the model API plus hosting, not the framework.
  Sources: https://dev.to/the_movie_9b1357e8c99cfaa/ai-agent-frameworks-in-2026-crewai-vs-langgraph-vs-autogen-tested-1geh and https://hinterbuild.com/blog/langgraph-vs-crewai-vs-autogen-compare
- Production stack pattern found in 2026 guides: orchestrator (LangGraph / AutoGen / CrewAI) + tool registry with JSON-schema validation + sandbox for risky tools + retrieval layer (LlamaIndex / Haystack, vector store) + trace/eval layer (Langfuse / Phoenix). HALEX AI staging mirrors this in miniature in plain JavaScript, with a Python LangGraph version as the later server-side step.
  Source: https://futureagi.com/blog/open-source-stack-ai-agents-2025/

### In-browser models (honest limits)
- WebLLM: 1B to 8B models, up to about 5 GB download, strictly WebGPU on modern desktop GPU, OpenAI-compatible chat interface, grammar-constrained JSON output.
- Transformers.js: about 0.5B to 1.5B practical for text, up to about 1 GB, WebGPU with CPU/WASM fallback, better for embeddings, classification and small tasks than for long agent work.
- Practical small models cited in a September 2026 test: WebLLM Llama-3.2-1B-Instruct (about 1 GB, 4-bit); Transformers.js Qwen2.5-0.5B-Instruct (about 350 MB, 4-bit).
  Sources: https://www.mograblog.com/2026/09/webllm-running-smart-models-in-browser/ and https://truongphan.com/2026/09/02/webllm-vs-transformersjs/
- Phone verdict: in-browser models are a useful offline fallback for short answers, not a robust agent. They are slow, download-heavy, and weak on multi-step tool work on a phone. Do not sell them as the main HALEX AI brain.

## Recommendation (from this research)

- PRIMARY: hosted open-weight frontier model through an OpenAI-compatible API, default choice Kimi K3 (Moonshot), via Together AI or Fireworks AI, model ID confirmed at the host at setup time. Reason: top open-weight Arena standing in the sources above, 1M context, strong long engineering/research work. Cost: hosted pricing is UNVERIFIED and varies by host (see conflict above); budget only after checking the host page. Licence: read the Kimi K3 licence before commercial use; it is not Apache/MIT.
- FALLBACK: DeepSeek V4.1 Flash, MIT licence, 1M context, low hosted cost in the summaries above (also unverified, check host page). Use it for fast, cheap, high-volume work and when the primary host is down or too expensive.
- SELF-HOST LATER OPTION (not staging): Qwen3.8-27B, Apache 2.0, for a server Jeffrey controls, if volume or data control later justifies a GPU.
- IN-BROWSER FALLBACK (staging only): HALEX offline knowledge + tool answers with no model at all. This is what staging ships today. A WebLLM small model can be added later as an optional download, not as the default.

## What this is NOT
- Not a copy of Muse software. Muse is not the blueprint. This design uses general agent structure (planner, tool loop, memory, retrieval, safety gates) plus open models and HALEX's own tools.
- Not limitless. Hosted APIs bill per token, free tiers are capped, and a rented GPU is thousands per month in the example above. Anyone promising free frontier AI is selling a gimmick.
- Not a trader. HALEX AI never moves funds, never holds keys or seeds, never trades live. Advisory only.
