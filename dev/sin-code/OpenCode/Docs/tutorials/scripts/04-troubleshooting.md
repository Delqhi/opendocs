# VIDEO SCRIPT: Troubleshooting Common Issues

## Duration: 8 minutes

---

## SCENE 1: Introduction (0:00-0:30)

**[Camera: Presenter with troubleshooting toolkit graphic]**

**Voiceover:**
"Welcome to OpenCode Troubleshooting! Learn how to diagnose and fix the most common OpenCode issues. We'll cover installation problems, provider errors, agent issues, and configuration mistakes. Let's become debugging experts!"

**[On-screen text: "Diagnose → Fix → Verify"]**

---

## SCENE 2: Installation Issues (0:30-2:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Problem 1: OpenCode won't install or run."

**[Show error]**

```bash
$ opencode --version
bash: opencode: command not found
```

**Voiceover:**
"Solution: Reinstall with proper permissions"

**[Show commands]**

```bash
# Check Node.js version
node --version  # Must be v20+

# Reinstall OpenCode
npm install -g opencode

# Verify installation
which opencode
opencode --version

# If still fails, clear npm cache
npm cache clean --force
npm install -g opencode
```

**Voiceover:**
"Problem 2: Permission errors during installation"

**[Show error]**

```
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```

**Solution:**

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
npm install -g opencode
```

---

## SCENE 3: Provider Configuration Errors (2:00-3:30)

**[Screen recording: Terminal + JSON editor]**

**Voiceover:**
"Problem 3: Models not showing up"

**[Show command]**

```bash
$ opencode models
No models available
```

**Voiceover:**
"Diagnosis: Check provider configuration"

**[Show terminal]**

```bash
# Verify opencode.json syntax
cat ~/.config/opencode/opencode.json | jq .

# Check for common errors:
# 1. Missing commas
# 2. Invalid JSON
# 3. Wrong provider schema
```

**[Show incorrect vs correct JSON]**

```json
// ❌ WRONG - Missing comma
{
  "provider": {
    "opencode-zen": {
      "npm": "@ai-sdk/openai-compatible"
      "name": "OpenCode ZEN"
    }
  }
}

// ✅ CORRECT
{
  "provider": {
    "opencode-zen": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenCode ZEN"
    }
  }
}
```

**Voiceover:**
"Problem 4: API authentication errors"

**[Show error]**

```
Error: Authentication failed for provider google
```

**Solution:**

```bash
# Re-authenticate
opencode auth logout
opencode auth login

# Check auth status
opencode auth list

# Verify token file exists
ls -la ~/.config/opencode/antigravity-accounts.json
```

---

## SCENE 4: Agent Configuration Issues (3:30-5:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Problem 5: Agent not responding"

**[Show command hanging]**

```bash
$ echo "Hello" | opencode --agent sisyphus
[No response...]
```

**Voiceover:**
"Diagnosis checklist:"

**[Show commands]**

```bash
# 1. Check if model exists
opencode models | grep big-pickle

# 2. Verify agent config
cat ~/.config/opencode/oh-my-opencode.json | jq '.agent.sisyphus'

# 3. Test with different agent
echo "Hello" | opencode --agent explore

# 4. Check provider auth
opencode auth list

# 5. Look for error logs
tail -f ~/.config/opencode/opencode.log
```

**Voiceover:**
"Problem 6: Wrong model assigned to agent"

**[Show incorrect config]**

```json
{
  "agent": {
    "sisyphus": {
      "model": "nonexistent-model"  // ❌ This doesn't exist!
    }
  }
}
```

**Solution:**

```bash
# List available models
opencode models

# Update oh-my-opencode.json with correct model path
# Format: "provider/model-id"
{
  "agent": {
    "sisyphus": {
      "model": "opencode-zen/zen/big-pickle"  // ✅ Correct
    }
  }
}
```

---

## SCENE 5: Performance Issues (5:00-6:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Problem 7: Slow responses or timeouts"

**[Show symptoms]**

```
[Waiting 60+ seconds for response...]
Error: Request timeout
```

**Voiceover:**
"Solutions:"

**[Show terminal]**

```bash
# 1. Increase timeout in opencode.json
{
  "provider": {
    "nvidia": {
      "options": {
        "timeout": 120000  // 120 seconds
      }
    }
  }
}

# 2. Use faster models for simple tasks
#    zen/big-pickle is faster than qwen3.5-397b

# 3. Check network connectivity
curl -I https://api.opencode.ai/v1
curl -I https://integrate.api.nvidia.com/v1

# 4. Clear agent cache
rm -rf ~/.cache/opencode
```

---

## SCENE 6: Configuration File Corruption (6:00-7:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Problem 8: Config files corrupted or invalid"

**[Show error]**

```
Error parsing opencode.json: Unexpected token
```

**Voiceover:**
"Recovery steps:"

**[Show commands]**

```bash
# 1. Backup current config
cp ~/.config/opencode/opencode.json ~/.config/opencode/opencode.json.backup

# 2. Validate JSON
cat ~/.config/opencode/opencode.json | jq . || echo "Invalid JSON"

# 3. Restore from backup if exists
if [ -f ~/.config/opencode/opencode.json.backup ]; then
  cp ~/.config/opencode/opencode.json.backup ~/.config/opencode/opencode.json
fi

# 4. Or recreate from template
cat > ~/.config/opencode/opencode.json << 'EOF'
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
          "name": "Big Pickle",
          "limit": {
            "context": 200000,
            "output": 128000
          }
        }
      }
    }
  }
}
EOF

# 5. Verify
opencode models
```

---

## SCENE 7: Debugging Tools (7:00-7:30)

**[Screen recording: Terminal]**

**Voiceover:**
"Essential debugging commands:"

**[Show commands]**

```bash
# Full system check
opencode doctor

# Verbose logging
opencode --verbose --agent explore "Test"

# Check all config files
ls -la ~/.config/opencode/
ls -la ~/.opencode/

# View recent errors
tail -100 ~/.config/opencode/opencode.log

# Reset everything (nuclear option)
rm -rf ~/.config/opencode
rm -rf ~/.opencode
# Then reinstall
```

---

## SCENE 8: Getting Help (7:30-8:00)

**[Camera: Presenter]**

**Voiceover:**
"Still stuck? Here's how to get help:"

**[On-screen text]**

- "Check: docs/troubleshooting/ for detailed guides"
- "Read: ts-ticket-XX.md for known issues"
- "Run: opencode doctor for automated diagnosis"
- "Search: GitHub issues for similar problems"
- "Ask: Community Discord/Slack channels"

**Voiceover:**
"When asking for help, always include:"

**[Show checklist]**

```
✓ OpenCode version: opencode --version
✓ Config files: ~/.config/opencode/opencode.json
✓ Error messages: Full error output
✓ Steps to reproduce: What you did before error
✓ Environment: OS, Node.js version
```

**Voiceover:**
"Thanks for watching! Take the troubleshooting quiz to test your knowledge. Link below!"

**[End screen with quiz link]**

---

## PRODUCTION NOTES

**Visual Elements:**
- Red X for problems, green check for solutions
- Side-by-side: Error vs Fix
- Animated error highlighting

**Screen Recording:**
- Terminal font: 16pt
- Show full error messages
- Zoom in on critical parts

**Post-Production:**
- Add troubleshooting flowchart as overlay
- Include links to all referenced docs
- Create downloadable troubleshooting checklist

---

**SCRIPT VERSION:** 1.0
**LAST UPDATED:** 2026-02-18
**DURATION:** 8:00
