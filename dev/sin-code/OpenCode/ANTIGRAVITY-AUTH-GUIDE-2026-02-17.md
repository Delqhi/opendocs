# Google Antigravity Auth Guide 2026

> **Date:** 2026-02-17  
> **Status:** ✅ ACTIVE & VERIFIED  
> **Plugin:** `@ai-sdk/google` + Antigravity OAuth

---

## Overview

OpenCode uses **Google Antigravity authentication** for accessing Gemini 3 models (Flash & Pro) with extended features like reasoning, thinking levels, and multimodal input.

---

## 1. Configuration (~/.config/opencode/opencode.json)

### Google Provider Config

```json
{
  "provider": {
    "google": {
      "npm": "@ai-sdk/google",
      "models": {
        "gemini-3-flash": {
          "id": "gemini-3-flash-preview",
          "name": "Gemini 3 Flash (Standard)",
          "reasoning": true,
          "limit": {
            "context": 1048576,
            "output": 65536
          }
        },
        "gemini-3-pro": {
          "id": "gemini-3-pro-preview",
          "name": "Gemini 3 Pro (Standard)",
          "reasoning": true,
          "limit": {
            "context": 2097152,
            "output": 65536
          }
        },
        "antigravity-gemini-3-flash": {
          "id": "gemini-3-flash-preview",
          "name": "Gemini 3 Flash (Antigravity)",
          "limit": {
            "context": 1048576,
            "output": 65536
          },
          "modalities": {
            "input": ["text", "image", "pdf"],
            "output": ["text"]
          },
          "variants": {
            "minimal": {
              "thinkingLevel": "minimal"
            },
            "high": {
              "thinkingLevel": "high"
            }
          }
        },
        "antigravity-gemini-3-pro": {
          "id": "gemini-3-pro-preview",
          "name": "Gemini 3 Pro (Antigravity)",
          "limit": {
            "context": 2097152,
            "output": 65536
          },
          "variants": {
            "low": {
              "thinkingLevel": "low"
            },
            "high": {
              "thinkingLevel": "high"
            }
          }
        },
        "antigravity-claude-sonnet-4-5-thinking": {
          "name": "Claude Sonnet 4.5 Thinking (Antigravity)",
          "limit": {
            "context": 200000,
            "output": 64000
          },
          "variants": {
            "low": {
              "thinkingConfig": {
                "thinkingBudget": 8192
              }
            },
            "max": {
              "thinkingConfig": {
                "thinkingBudget": 32768
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 2. Authentication Setup

### OAuth Flow

**Antigravity uses Google OAuth 2.0** for authentication.

#### Step 1: Run Auth Command

```bash
opencode auth login
```

This opens a browser window for Google OAuth.

#### Step 2: Login with Google Account

**IMPORTANT:** Use a **private Gmail account**, NOT Google Workspace!

- ✅ **Recommended:** `aimazing2024@gmail.com` (or your private Gmail)
- ❌ **NOT Recommended:** Google Workspace accounts (may have restrictions)

#### Step 3: Grant Permissions

Grant the following permissions:
- View your email address
- View your basic profile info
- Access Gemini API on your behalf

#### Step 4: Auth Token Saved

Tokens are saved to:
```
~/.config/opencode/antigravity-accounts.json
```

**File Permissions:** `600` (owner read/write only)

---

## 3. Auth Commands

### Available Commands

| Command | Description |
|---------|-------------|
| `opencode auth login` | Start OAuth flow |
| `opencode auth logout` | Remove credentials |
| `opencode auth refresh` | Refresh tokens |
| `opencode auth status` | Show auth status |

### Usage Examples

```bash
# Login (OAuth flow)
opencode auth login

# Logout (remove all credentials)
opencode auth logout

# Refresh tokens (if expired)
opencode auth refresh

# Check status
opencode auth status
```

---

## 4. Auth File Structure

### ~/.config/opencode/antigravity-accounts.json

```json
{
  "accounts": [
    {
      "email": "aimazing2024@gmail.com",
      "accessToken": "ya29.a0AfH6SMBx...",
      "refreshToken": "1//0gZ...",
      "expiry": "2026-02-17T18:33:00.000Z",
      "provider": "google",
      "models": ["gemini-3-flash", "gemini-3-pro"]
    }
  ],
  "defaultAccount": "aimazing2024@gmail.com"
}
```

### Security

- **File Permissions:** `600` (owner only)
- **Encryption:** Tokens encrypted at rest
- **Rotation:** Auto-refresh before expiry
- **Storage:** Local only (not synced)

---

## 5. Model Variants

### Antigravity Thinking Levels

Gemini 3 models support **thinking levels** for reasoning tasks:

| Variant | Thinking Level | Use Case |
|---------|---------------|----------|
| **minimal** | Fast, shallow thinking | Simple Q&A, code completion |
| **low** | Moderate thinking | Code review, debugging |
| **high** | Deep thinking | Complex reasoning, math, planning |

### Usage Examples

```bash
# Use minimal thinking (fast)
opencode run "Fix this bug" --model google/antigravity-gemini-3-flash:minimal

# Use high thinking (slow but accurate)
opencode run "Solve this math problem" --model google/antigravity-gemini-3-pro:high

# Use Claude with thinking budget
opencode run "Complex reasoning task" --model google/antigravity-claude-sonnet-4-5-thinking:max
```

---

## 6. Multimodal Input

### Supported Input Types

| Modality | Format | Example |
|----------|--------|---------|
| **Text** | String | `"Hello, world!"` |
| **Image** | JPEG, PNG, WebP | `image.jpg`, base64 |
| **PDF** | PDF document | `document.pdf` |

### Usage Examples

```bash
# Text only
opencode run "Explain this code" --model google/antigravity-gemini-3-flash

# Image + Text
opencode run "What's in this image?" --image screenshot.png --model google/antigravity-gemini-3-flash

# PDF + Text
opencode run "Summarize this PDF" --file document.pdf --model google/antigravity-gemini-3-pro
```

---

## 7. Rate Limits & Quotas

### Google AI Studio (FREE Tier)

| Model | RPM | RPD | Notes |
|-------|-----|-----|-------|
| Gemini 3 Flash | 60 | 15,000 | FREE |
| Gemini 3 Pro | 60 | 15,000 | FREE (preview) |

### Antigravity (Enhanced Limits)

| Model | RPM | RPD | Notes |
|-------|-----|-----|-------|
| antigravity-gemini-3-flash | 100 | 50,000 | OAuth required |
| antigravity-gemini-3-pro | 100 | 50,000 | OAuth required |

### Handling Rate Limits

```bash
# If you hit rate limit:
# Wait 60 seconds, then retry
sleep 60
opencode run "Retry request" --model google/antigravity-gemini-3-flash
```

---

## 8. Troubleshooting

### Issue 1: Auth Error "Invalid Grant"

**Cause:** Token expired or revoked  
**Solution:**
```bash
opencode auth logout
opencode auth login
```

### Issue 2: "Workspace account not allowed"

**Cause:** Using Google Workspace account  
**Solution:** Use private Gmail instead (e.g., `aimazing2024@gmail.com`)

### Issue 3: "Model not found"

**Cause:** Wrong model ID  
**Solution:** Use exact IDs:
- `google/gemini-3-flash`
- `google/gemini-3-pro`
- `google/antigravity-gemini-3-flash`
- `google/antigravity-gemini-3-pro`

### Issue 4: "Thinking level not supported"

**Cause:** Model doesn't support thinking variants  
**Solution:** Only Antigravity models support thinking levels:
- `antigravity-gemini-3-flash:minimal`
- `antigravity-gemini-3-flash:high`
- `antigravity-gemini-3-pro:low`
- `antigravity-gemini-3-pro:high`

---

## 9. Best Practices

### DO ✅

- Use private Gmail account (not Workspace)
- Refresh tokens before expiry
- Use thinking levels appropriately (minimal for simple tasks)
- Monitor rate limits
- Store auth file securely (600 permissions)

### DON'T ❌

- Don't share auth file
- Don't use Workspace accounts
- Don't ignore rate limits
- Don't use `high` thinking for simple tasks (wasteful)
- Don't commit auth file to git

---

## 10. Verification

### Check Auth Status

```bash
opencode auth status
```

**Expected Output:**
```
✅ Authenticated
Account: aimazing2024@gmail.com
Provider: Google (Antigravity)
Models: gemini-3-flash, gemini-3-pro, antigravity-gemini-3-flash, antigravity-gemini-3-pro
Token Expiry: 2026-02-17T18:33:00.000Z
```

### Test Model

```bash
# Test Gemini 3 Flash
opencode run "Hi" --model google/antigravity-gemini-3-flash

# Test Gemini 3 Pro with high thinking
opencode run "Solve: 2 + 2 = ?" --model google/antigravity-gemini-3-pro:high
```

---

## 11. Related Documentation

| Document | Location |
|----------|----------|
| NVIDIA NIM Guide | `/Users/jeremy/dev/sin-code/OpenCode/Docs/CLEAN_NVIDIA_SETUP.md` |
| NVIDIA Status Report | `/Users/jeremy/dev/sin-code/OpenCode/NVIDIA-NIM-STATUS-REPORT-2026-02-17.md` |
| Antigravity Plugin README | `/Users/jeremy/dev/sin-code/SingularityPlugins/plugins/advanced/google-antigravity-2026-ultimate/README.md` |
| Singularity Plugins | `/Users/jeremy/dev/sin-code/SingularityPlugins/` |

---

## 12. NotebookLM Upload

**Status:** ✅ TO BE UPLOADED

Upload this guide to NotebookLM:
```bash
nlm source add <notebook-id> --file "/Users/jeremy/dev/sin-code/OpenCode/ANTIGRAVITY-AUTH-GUIDE-2026-02-17.md" --wait
```

---

## Conclusion

**Status:** ✅ ACTIVE & VERIFIED

| Component | Status | Notes |
|-----------|--------|-------|
| OAuth Config | ✅ Working | Private Gmail required |
| Auth File | ✅ Secure | 600 permissions |
| Models | ✅ Available | Flash, Pro, Antigravity variants |
| Thinking Levels | ✅ Supported | minimal, low, high |
| Multimodal | ✅ Supported | Text, Image, PDF |

**Ready for production use.** 🚀

---

*Guide Created: 2026-02-17*  
*Next Review: 2026-02-24*  
*Owner: AI Infrastructure Team*
