# QUIZ: Provider Configuration

**Total Questions:** 8  
**Passing Score:** 7/8 (87.5%)  
**Topic:** AI provider setup, API keys, and model configuration

---

## Question 1

Which npm package is required for OpenAI-compatible providers?

- [ ] `@ai-sdk/openai`
- [x] `@ai-sdk/openai-compatible`
- [ ] `@ai-sdk/provider`
- [ ] `openai-node`

**Explanation:** `@ai-sdk/openai-compatible` enables compatibility with OpenAI-like APIs.

---

## Question 2

Where should API keys be stored in opencode.json?

- [ ] Directly in the provider config
- [x] In environment variables (referenced in config)
- [ ] In a separate `.env` file only
- [ ] Hardcoded in the model definition

**Explanation:** API keys should be in environment variables for security, not hardcoded.

---

## Question 3

What is the correct baseURL for NVIDIA NIM?

- [ ] `https://api.nvidia.com/v1`
- [ ] `https://nvidia.ai/v1`
- [x] `https://integrate.api.nvidia.com/v1`
- [ ] `https://nim.nvidia.com/v1`

**Explanation:** NVIDIA NIM uses `https://integrate.api.nvidia.com/v1` as the API endpoint.

---

## Question 4

Which Google authentication method does OpenCode use?

- [ ] API Key
- [x] OAuth 2.0
- [ ] Service Account
- [ ] JWT Token

**Explanation:** Google Antigravity uses OAuth 2.0 via `opencode auth login`.

---

## Question 5

What timeout is recommended for NVIDIA NIM (Qwen 3.5 397B)?

- [ ] 30000ms (30 seconds)
- [ ] 60000ms (60 seconds)
- [x] 120000ms (120 seconds)
- [ ] 300000ms (300 seconds)

**Explanation:** Qwen 3.5 397B has high latency (70-90s), requiring 120s timeout.

---

## Question 6

Which model has the largest context window?

- [ ] zen/big-pickle (200K)
- [x] moonshotai/kimi-k2.5 (1M)
- [ ] qwen3.5-397b (262K)
- [ ] gemini-3-flash (1M)

**Explanation:** Kimi K2.5 offers 1M token context via NVIDIA NIM.

---

## Question 7

What HTTP status code indicates rate limiting?

- [ ] 400
- [ ] 401
- [ ] 403
- [x] 429

**Explanation:** HTTP 429 means "Too Many Requests" - wait 60 seconds and retry.

---

## Question 8

Which provider is best for uncensored content?

- [ ] NVIDIA NIM
- [ ] Google Antigravity
- [x] OpenCode ZEN
- [ ] Streamlake

**Explanation:** OpenCode ZEN specializes in uncensored, unrestricted content generation.

---

## Answer Key

1. `@ai-sdk/openai-compatible`
2. Environment variables
3. `https://integrate.api.nvidia.com/v1`
4. OAuth 2.0
5. 120000ms (120 seconds)
6. moonshotai/kimi-k2.5 (1M)
7. 429 (Too Many Requests)
8. OpenCode ZEN

---

## Scoring

- **8/8** - Provider Expert! 🎯
- **7/8** - Ready for production! ✅
- **5-6/8** - Review provider docs 📚
- **<5/8** - Re-watch provider tutorial 🎬

---

**Related Resources:**
- Video: `docs/tutorials/scripts/02-provider-config.md`
- Interactive: `docs/examples/nvidia-api-key-test.sh`
- Docs: `AGENTS.md` (Provider Configuration section)
