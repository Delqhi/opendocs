# VIDEO SCRIPT: Provider Configuration Masterclass

## Duration: 10 minutes

---

## SCENE 1: Introduction (0:00-0:30)

**[Camera: Presenter with provider logos background]**

**Voiceover:**
"Welcome to the Provider Configuration Masterclass! Today you'll learn how to configure AI providers in OpenCode, including FREE options like OpenCode ZEN and premium providers like NVIDIA NIM. Let's master provider configuration!"

**[On-screen text: "Providers: FREE → Premium → Fallback Chains"]**

---

## SCENE 2: Understanding Providers (0:30-2:00)

**[Screen recording: Presentation slide]**

**Voiceover:**
"What exactly is a provider? A provider is a service that offers AI models via API. OpenCode supports multiple providers through the @ai-sdk/openai-compatible package."

**[Show diagram]**

```
┌─────────────────────────────────────────┐
│           OpenCode Config               │
├─────────────────────────────────────────┤
│  Provider: opencode-zen (FREE)          │
│  Provider: nvidia-nim (Premium)         │
│  Provider: google (Antigravity)         │
│  Provider: streamlake (Enterprise)      │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│         AI Models Available             │
├─────────────────────────────────────────┤
│  zen/big-pickle (200K context)         │
│  kimi-k2.5 (1M context)                 │
│  gemini-3-flash (1M context)            │
└─────────────────────────────────────────┘
```

---

## SCENE 3: FREE Provider Setup (2:00-4:00)

**[Screen recording: Text editor]**

**Voiceover:**
"Let's start with FREE providers. Open your opencode.json and add the OpenCode ZEN provider."

**[Show JSON being typed]**

```json
{
  "provider": {
    "opencode-zen": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenCode ZEN (FREE)",
      "options": {
        "baseURL": "https://api.opencode.ai/v1"
      },
      "models": {
        "zen/big-pickle": {
          "name": "Big Pickle (UNCENSORED)",
          "limit": {
            "context": 200000,
            "output": 128000
          }
        },
        "zen/uncensored": {
          "name": "Uncensored Model",
          "limit": {
            "context": 200000,
            "output": 128000
          }
        },
        "zen/code": {
          "name": "Code Specialist",
          "limit": {
            "context": 200000,
            "output": 128000
          }
        }
      }
    }
  }
}
```

**Voiceover:**
"Save the file and verify with:"

**[Show terminal]**

```bash
opencode models | grep zen
```

---

## SCENE 4: NVIDIA NIM Provider (4:00-6:00)

**[Screen recording: Text editor]**

**Voiceover:**
"Now let's add NVIDIA NIM for high-performance models. First, get your API key from build.nvidia.com"

**[Show browser: build.nvidia.com signup]**

**Voiceover:**
"Add this to your opencode.json:"

**[Show JSON]**

```json
{
  "provider": {
    "nvidia": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "NVIDIA NIM",
      "options": {
        "baseURL": "https://integrate.api.nvidia.com/v1",
        "timeout": 120000
      },
      "models": {
        "moonshotai/kimi-k2.5": {
          "name": "Kimi K2.5 (1M Context)",
          "limit": {
            "context": 1048576,
            "output": 65536
          }
        },
        "qwen/qwen3.5-397b-a17b": {
          "name": "Qwen 3.5 397B (BEST CODE)",
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

**Voiceover:**
"Set your API key in the environment:"

**[Show terminal]**

```bash
# Add to ~/.zshrc or ~/.bashrc
export NVIDIA_API_KEY="nvapi-your-key-here"

# Reload shell
source ~/.zshrc

# Verify
echo $NVIDIA_API_KEY
```

---

## SCENE 5: Google Antigravity Provider (6:00-8:00)

**[Screen recording: Browser + Terminal]**

**Voiceover:**
"For Google's Gemini models, we use the Antigravity plugin. Install it first:"

**[Show terminal]**

```bash
# Install plugin
opencode auth add google

# Start OAuth flow
opencode auth login
```

**[Show browser: Google OAuth consent screen]**

**Voiceover:**
"Use a PRIVATE Gmail account, NOT your Google Workspace! Now add to opencode.json:"

**[Show JSON]**

```json
{
  "provider": {
    "google": {
      "npm": "@ai-sdk/google",
      "models": {
        "antigravity-gemini-3-flash": {
          "id": "gemini-3-flash-preview",
          "name": "Gemini 3 Flash",
          "limit": {
            "context": 1048576,
            "output": 65536
          }
        },
        "antigravity-gemini-3-pro": {
          "id": "gemini-3-pro-preview",
          "name": "Gemini 3 Pro",
          "limit": {
            "context": 2097152,
            "output": 65536
          }
        }
      }
    }
  }
}
```

---

## SCENE 6: Fallback Chain Strategy (8:00-9:00)

**[Screen recording: Presentation]**

**Voiceover:**
"A fallback chain ensures you always have a working model. Here's the recommended order:"

**[Show diagram]**

```
1. zen/big-pickle (FREE, uncensored)
   ↓ (if fails)
2. kimi-k2.5 (NVIDIA, 1M context)
   ↓ (if fails)
3. qwen3.5-397b (NVIDIA, best code)
   ↓ (if fails)
4. gemini-3-flash (Google, multimodal)
```

**Voiceover:**
"Implement this in your agent configuration or use external handover logic."

---

## SCENE 7: Verification & Testing (9:00-9:30)

**[Screen recording: Terminal]**

**Voiceover:**
"Let's verify all providers are configured correctly:"

**[Show commands]**

```bash
# List all models
opencode models

# Filter by provider
opencode models | grep zen
opencode models | grep nvidia
opencode models | grep google

# Test provider
echo "Hello" | opencode --model zen/big-pickle
```

---

## SCENE 8: Conclusion (9:30-10:00)

**[Camera: Presenter]**

**Voiceover:**
"You've now configured multiple providers! Next, watch the Agent Setup tutorial to configure which agents use which models. Links in the description!"

**[End screen with related videos]**

---

## PRODUCTION NOTES

**Recording Checklist:**
- [ ] API keys blurred in post-production
- [ ] Terminal font: 16pt monospace
- [ ] Browser zoom: 125% for readability
- [ ] Cursor highlight enabled

**Post-Production:**
- Add provider comparison table as overlay
- Include API key setup links in description
- Create chapter markers for each provider

---

**SCRIPT VERSION:** 1.0
**LAST UPDATED:** 2026-02-18
**DURATION:** 10:00
