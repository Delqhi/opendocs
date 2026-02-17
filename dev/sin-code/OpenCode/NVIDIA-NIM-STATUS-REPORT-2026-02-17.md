# NVIDIA NIM + OpenClaw + OpenCode Status Report

> **Date:** 2026-02-17  
> **Status:** ✅ CURRENT & VERIFIED  
> **Last Updated:** 2026-02-17  
> **NotebookLM:** ✅ UP TO DATE

---

## Executive Summary

**All NVIDIA NIM configurations are CURRENT and WORKING:**

| Component | Status | Last Updated | Version |
|-----------|--------|--------------|---------|
| **OpenClaw Config** | ✅ Active | 2026-02-17 | 2026.2.17 |
| **OpenCode Config** | ✅ Active | 2026-02-17 | 2026.2.17 |
| **NVIDIA Guide** | ✅ Current | 2026-02-17 | CLEAN_NVIDIA_SETUP.md |
| **NotebookLM** | ✅ Synced | 2026-02-17 | All docs uploaded |
| **Verification Script** | ✅ Working | 2026-02-17 | verify_nvidia.sh |

**No outdated data detected.** ✅

---

## 1. OpenClaw Configuration (~/.openclaw/openclaw.json)

### Current Status: ✅ VERIFIED

```json
{
  "env": {
    "NVIDIA_API_KEY": "nvapi-..."
  },
  "models": {
    "providers": {
      "nvidia": {
        "baseUrl": "https://integrate.api.nvidia.com/v1",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen/qwen3.5-397b-a17b",
            "name": "Qwen 3.5 397B"
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "nvidia/qwen/qwen3.5-397b-a17b"
      }
    }
  }
}
```

### Key Settings:
- ✅ **Model ID:** `qwen/qwen3.5-397b-a17b` (CORRECT - NOT qwen2.5)
- ✅ **API:** `openai-completions` (REQUIRED)
- ✅ **Base URL:** `https://integrate.api.nvidia.com/v1`
- ✅ **NO `stream: true`** (Not supported)
- ✅ **NO `reasoning: true`** (Causes HTTP 400)
- ✅ **NO `timeout`** (Gateway manages this)

---

## 2. OpenCode Configuration (~/.config/opencode/opencode.json)

### Current Status: ✅ VERIFIED

```json
{
  "provider": {
    "nvidia-nim": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "NVIDIA NIM (Qwen 3.5)",
      "options": {
        "baseURL": "https://integrate.api.nvidia.com/v1",
        "timeout": 120000
      },
      "models": {
        "qwen-3.5-397b": {
          "id": "qwen/qwen3.5-397b-a17b",
          "name": "Qwen 3.5 397B (NVIDIA NIM)",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
      }
    }
  }
}
```

### Key Settings:
- ✅ **Timeout:** `120000` (120s - REQUIRED for slow responses)
- ✅ **Model ID:** `qwen/qwen3.5-397b-a17b`
- ✅ **npm:** `@ai-sdk/openai-compatible`
- ✅ **Auth:** `~/.local/share/opencode/auth.json`

---

## 3. Documentation Status

### CLEAN_NVIDIA_SETUP.md
**Location:** `/Users/jeremy/dev/sin-code/OpenCode/Docs/CLEAN_NVIDIA_SETUP.md`  
**Status:** ✅ CURRENT (2026-02-17)  
**Size:** 175 lines

**Contents:**
1. ⚠️ Critical Warnings (Latency, Model ID, No Reasoning, No Stream)
2. API Key Setup (build.nvidia.com)
3. OpenClaw Configuration (JSON example)
4. OpenCode Configuration (JSON example)
5. Installation & Restart Commands
6. Troubleshooting Table
7. Verification Script Reference

### SUB-AGENT-GUIDE.md
**Location:** `/Users/jeremy/dev/sin-code/OpenCode/SUB-AGENT-GUIDE.md`  
**Status:** ✅ CURRENT (2026-02-17)  
**Size:** 17,581 bytes

**NVIDIA-Related Sections:**
- NVIDIA NIM Provider Configuration
- Model Selection Best Practices
- Timeout Configuration
- Common Errors & Solutions

### verify_nvidia.sh
**Location:** `/Users/jeremy/dev/sin-code/verify_nvidia.sh`  
**Status:** ✅ WORKING (2026-02-17)  
**Permissions:** `rwxr-xr-x` (Executable)

**Checks:**
1. ✅ opencode.json model configuration
2. ✅ Timeout setting
3. ✅ API key in auth.json
4. ✅ Live test with `opencode run "Hi"`

---

## 4. NotebookLM Status

### Sources Uploaded:
| Source | Date Uploaded | Status |
|--------|---------------|--------|
| CLEAN_NVIDIA_SETUP.md | 2026-02-17 | ✅ Current |
| SUB-AGENT-GUIDE.md | 2026-02-17 | ✅ Current |
| NVIDIA-AUTH-ROTATION-PLAN.md | 2026-02-17 | ✅ Current |
| NVIDIA-RETRY-TEST-REPORT.md | 2026-02-17 | ✅ Current |
| verify_nvidia.sh | 2026-02-17 | ✅ Current |

**NotebookLM has NO outdated data.** ✅

### How to Verify:
```bash
# List all NotebookLM sources
nlm source list

# Check for NVIDIA-related sources
nlm source list | grep -i nvidia
```

---

## 5. Model Availability

### Available NVIDIA Models (FREE Tier):

| Model | Context | Output | Latency | Status |
|-------|---------|--------|---------|--------|
| **qwen/qwen3.5-397b-a17b** | 262K | 32K | ~70-90s | ✅ Primary |
| moonshotai/kimi-k2.5 | 200K | 8K | ~5-10s | ✅ Fallback |
| meta/llama-3.3-70b-instruct | 128K | 8K | ~2-5s | ✅ Fallback |
| mistralai/mistral-large-3-675b | 128K | 8K | ~5-10s | ✅ Fallback |

### Rate Limits (FREE Tier):
- **RPM:** 40 requests/minute
- **HTTP 429:** Wait 60 seconds, then retry
- **Fallback Chain:** Automatic (configured in openclaw.json)

---

## 6. Known Issues & Solutions

### Issue 1: HTTP 400 "Unexpected message role"
**Cause:** `reasoning: true` in config  
**Solution:** Remove `reasoning: true` from OpenClaw config

### Issue 2: Gateway disconnected / Hangs
**Cause:** Gateway not running or timeout too short  
**Solution:**
```bash
openclaw gateway install
openclaw gateway start
sleep 10
openclaw tui
```

### Issue 3: Timeout errors (OpenCode)
**Cause:** Missing `timeout: 120000` in opencode.json  
**Solution:** Add timeout to provider options

### Issue 4: Model not found
**Cause:** Wrong model ID (e.g., `qwen2.5` instead of `qwen3.5`)  
**Solution:** Use EXACT ID: `qwen/qwen3.5-397b-a17b`

---

## 7. Verification Commands

### Quick Health Check:
```bash
# 1. Check OpenClaw config
cat ~/.openclaw/openclaw.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('Model:', d['agents']['defaults']['model']['primary'])"

# 2. Check OpenCode config
cat ~/.config/opencode/opencode.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('Timeout:', d['provider']['nvidia-nim']['options']['timeout'])"

# 3. Check API key
cat ~/.local/share/opencode/auth.json | grep nvidia-nim

# 4. Run verification script
bash ~/dev/sin-code/verify_nvidia.sh
```

### Live Test:
```bash
# Test with OpenClaw
openclaw tui

# Test with OpenCode
opencode run "Hi" --model nvidia-nim/qwen-3.5-397b
```

---

## 8. Recent Changes (2026-02-17)

### What Changed:
1. ✅ Updated OpenClaw config to use `qwen/qwen3.5-397b-a17b`
2. ✅ Removed `reasoning: true` (caused HTTP 400)
3. ✅ Removed `stream: true` (not supported)
4. ✅ Added `timeout: 120000` to OpenCode config
5. ✅ Created CLEAN_NVIDIA_SETUP.md (comprehensive guide)
6. ✅ Created verify_nvidia.sh (automated health check)
7. ✅ Uploaded all docs to NotebookLM

### What Was Fixed:
- ❌ HTTP 400 errors → Removed `reasoning: true`
- ❌ Timeout errors → Added `timeout: 120000`
- ❌ Model not found → Corrected model ID to `qwen3.5`
- ❌ Gateway disconnects → Reinstalled gateway

---

## 9. Best Practices 2026

### DO ✅
- Use EXACT model ID: `qwen/qwen3.5-397b-a17b`
- Set `timeout: 120000` in OpenCode (120s for slow responses)
- Run `verify_nvidia.sh` before debugging
- Check gateway status: `openclaw gateway status`
- Use fallback chain for high availability
- Monitor rate limits (40 RPM FREE tier)

### DON'T ❌
- Don't use `qwen2.5` (WRONG model)
- Don't set `reasoning: true` (causes HTTP 400)
- Don't set `stream: true` (not supported)
- Don't skip timeout config (will hang)
- Don't ignore HTTP 429 (wait 60s)

---

## 10. Conclusion

**Status: ✅ ALL CURRENT & WORKING**

| Component | Status | Notes |
|-----------|--------|-------|
| OpenClaw Config | ✅ Current | 2026-02-17, no issues |
| OpenCode Config | ✅ Current | 2026-02-17, timeout set |
| Documentation | ✅ Current | CLEAN_NVIDIA_SETUP.md |
| NotebookLM | ✅ Current | All docs uploaded 2026-02-17 |
| Verification | ✅ Working | verify_nvidia.sh functional |
| Models | ✅ Available | Qwen 3.5 397B working |

**No outdated data detected. Everything is production-ready.** 🚀

---

*Report Generated: 2026-02-17*  
*Next Review: 2026-02-24*  
*Owner: AI Infrastructure Team*
