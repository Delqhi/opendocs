# VIDEO SCRIPT: Complete OpenCode Setup Guide

## Duration: 15 minutes

---

## SCENE 1: Introduction (0:00-0:30)

**[Camera: Presenter facing camera with OpenCode logo in background]**

**Voiceover:**
"Welcome to the complete OpenCode setup guide! In this 15-minute tutorial, you'll learn how to set up OpenCode from scratch, configure providers, and start using AI agents for software development. By the end, you'll have a fully functional AI-powered development environment."

**[On-screen text: "What You'll Learn: Installation → Configuration → First Agent"]**

---

## SCENE 2: Prerequisites Check (0:30-2:00)

**[Screen recording: Terminal window]**

**Voiceover:**
"Before we begin, let's verify you have the prerequisites. Open your terminal and run these commands:"

**[Show commands being typed]**

```bash
# Check Node.js (required: v20+)
node --version

# Check npm
npm --version

# Check git
git --version

# Check macOS version (for macOS users)
sw_vers
```

**Voiceover:**
"If any of these are missing, install them first. Node.js 20 or higher is required for OpenCode."

---

## SCENE 3: Installing OpenCode (2:00-4:00)

**[Screen recording: Terminal window]**

**Voiceover:**
"Now let's install OpenCode. We'll use npm for installation."

**[Show command]**

```bash
# Install OpenCode globally
npm install -g opencode

# Verify installation
opencode --version

# Check available commands
opencode --help
```

**Voiceover:**
"Great! OpenCode is now installed. Let's verify it's working by checking the available models."

**[Show command]**

```bash
opencode models
```

---

## SCENE 4: Directory Structure Setup (4:00-6:00)

**[Screen recording: Terminal + Finder]**

**Voiceover:**
"OpenCode requires a specific directory structure. Let's create it now."

**[Show commands]**

```bash
# Create OpenCode config directory
mkdir -p ~/.config/opencode

# Navigate to config directory
cd ~/.config/opencode

# Create initial config files
touch opencode.json
touch oh-my-opencode.json
touch AGENTS.md

# Verify structure
ls -la
```

**Voiceover:**
"Now let's also create the legacy directory for backward compatibility."

**[Show commands]**

```bash
# Create legacy directory
mkdir -p ~/.opencode

# Copy blueprint template if it exists
cp ~/dev/sin-code/Blueprint-drafts/blueprint-vorlage.md ~/.opencode/ 2>/dev/null || echo "Blueprint will be created later"
```

---

## SCENE 5: Provider Configuration (6:00-9:00)

**[Screen recording: Text editor opening opencode.json]**

**Voiceover:**
"Now the most important part: configuring your AI providers. Open the opencode.json file in your favorite editor."

**[Show file being edited]**

```json
{
  "$schema": "https://opencode.ai/schemas/config.json",
  "provider": {
    "opencode-zen": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenCode ZEN (FREE)",
      "options": {
        "baseURL": "https://api.opencode.ai/v1"
      },
      "models": {
        "zen/big-pickle": {
          "name": "Big Pickle (OpenCode ZEN - UNCENSORED)",
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
"This configures the FREE OpenCode ZEN provider. Save the file and verify with:"

**[Show terminal]**

```bash
# Verify config
opencode models | grep zen
```

---

## SCENE 6: Agent Configuration (9:00-11:00)

**[Screen recording: Text editor opening oh-my-opencode.json]**

**Voiceover:**
"Next, let's configure which agents use which models. Open oh-my-opencode.json"

**[Show file being edited]**

```json
{
  "agent": {
    "sisyphus": {
      "model": "opencode-zen/zen/big-pickle"
    },
    "prometheus": {
      "model": "opencode-zen/zen/big-pickle"
    },
    "librarian": {
      "model": "opencode-zen/zen/big-pickle"
    },
    "explore": {
      "model": "opencode-zen/zen/big-pickle"
    }
  }
}
```

**Voiceover:**
"This configures all agents to use the FREE OpenCode ZEN models. Perfect for getting started without any costs!"

---

## SCENE 7: First Agent Test (11:00-13:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Let's test our setup with a simple agent interaction. We'll use the explore agent."

**[Show command]**

```bash
# Start OpenCode with explore agent
opencode --agent explore
```

**[Show interaction]**

```
User: What is the current directory structure?
Explore: Let me check that for you...
[Agent responds]
```

**Voiceover:**
"Excellent! The agent is working. You can now interact with AI agents for your development tasks."

---

## SCENE 8: Verification Checklist (13:00-14:00)

**[Screen recording: Terminal running verification commands]**

**Voiceover:**
"Let's run a complete verification to ensure everything is working."

**[Show commands]**

```bash
# 1. Check OpenCode version
opencode --version

# 2. List available models
opencode models

# 3. Verify providers
opencode auth list

# 4. Test agent
echo "Test message" | opencode --agent explore

# 5. Check config files exist
ls -la ~/.config/opencode/
```

**Voiceover:**
"All checks passed? Perfect! Your OpenCode setup is complete."

---

## SCENE 9: Conclusion & Next Steps (14:00-15:00)

**[Camera: Presenter facing camera]**

**Voiceover:**
"Congratulations! You've successfully set up OpenCode. Here's what's next:"

**[On-screen text with links]**

- "Watch: Provider Configuration Tutorial (10 min)"
- "Watch: Agent Setup Guide (12 min)"
- "Read: UNIVERSAL-BLUEPRINT.md for complete documentation"
- "Try: Interactive examples in docs/examples/"

**Voiceover:**
"Check the description for links to all resources. In the next video, we'll dive deep into provider configuration. Thanks for watching!"

**[End screen with OpenCode logo and subscribe button]**

---

## PRODUCTION NOTES

### Required Assets:
- OpenCode logo (PNG, transparent background)
- Background music (royalty-free, tech/coding theme)
- Screen recording software (OBS Studio or QuickTime)
- Video editing software (DaVinci Resolve or Final Cut Pro)

### Recording Tips:
- Terminal font size: 16pt (readable on mobile)
- Terminal theme: Dark (better contrast)
- Resolution: 1920x1080 minimum
- Frame rate: 30fps for screen recording

### Post-Production:
- Add captions/subtitles
- Include timestamps in description
- Create thumbnail with title overlay
- Export as MP4 (H.264 codec)

---

## METADATA

**Title:** "OpenCode Complete Setup Guide - From Zero to AI-Powered Development"
**Description:** "Learn how to set up OpenCode in 15 minutes. Complete step-by-step guide for installation, configuration, and first agent interaction."
**Tags:** ["opencode", "ai", "development", "setup", "tutorial", "coding", "automation"]
**Category:** "Education"
**Language:** "English"

---

**SCRIPT VERSION:** 1.0
**LAST UPDATED:** 2026-02-18
**AUTHOR:** DEQLHI-SWARM Phase 4
