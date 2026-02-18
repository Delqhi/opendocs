# VIDEO SCRIPT: Agent Configuration & Workflows

## Duration: 12 minutes

---

## SCENE 1: Introduction (0:00-0:30)

**[Camera: Presenter with agent icons]**

**Voiceover:**
"Welcome to Agent Configuration! Learn how to set up and configure AI agents in OpenCode, assign models, and create efficient workflows. Let's build your AI development team!"

**[On-screen text: "Agents: Sisyphus → Prometheus → Librarian → Explore"]**

---

## SCENE 2: Understanding Agents (0:30-2:00)

**[Screen recording: Presentation slide]**

**Voiceover:**
"OpenCode provides specialized agents for different tasks. Each agent has a specific role:"

**[Show table]**

| Agent | Role | Best For |
|-------|------|----------|
| **Sisyphus** | Main Worker | Complex coding tasks |
| **Prometheus** | Planner | Architecture & planning |
| **Atlas** | Heavy Lifting | Large refactoring |
| **Lecturer** | Teacher | Explanations & tutorials |
| **Librarian** | Researcher | Documentation & search |
| **Explore** | Discoverer | Code exploration |
| **Oracle** | Reviewer | Code review & quality |

**Voiceover:**
"Each agent can use different models based on the task requirements."

---

## SCENE 3: Basic Agent Configuration (2:00-4:00)

**[Screen recording: oh-my-opencode.json]**

**Voiceover:**
"Open oh-my-opencode.json in your editor. Let's configure basic agents:"

**[Show JSON being typed]**

```json
{
  "agent": {
    "sisyphus": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "Main development agent"
    },
    "prometheus": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "Planning and architecture"
    },
    "librarian": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "Documentation and research"
    },
    "explore": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "Code exploration"
    }
  }
}
```

**Voiceover:**
"This configures all agents to use the FREE OpenCode ZEN models. Perfect for getting started!"

---

## SCENE 4: Advanced Agent Profiles (4:00-6:00)

**[Screen recording: oh-my-opencode.json]**

**Voiceover:**
"For production workflows, use different models based on agent specialization:"

**[Show JSON]**

```json
{
  "agent": {
    "sisyphus": {
      "model": "nvidia/moonshotai/kimi-k2.5",
      "description": "Premium coding agent",
      "maxTokens": 8192,
      "temperature": 0.7
    },
    "prometheus": {
      "model": "nvidia/qwen/qwen3.5-397b-a17b",
      "description": "Architecture planning",
      "maxTokens": 16384,
      "temperature": 0.5
    },
    "librarian": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "FREE research agent",
      "maxTokens": 4096,
      "temperature": 0.3
    },
    "explore": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "FREE exploration",
      "maxTokens": 4096,
      "temperature": 0.5
    },
    "oracle": {
      "model": "nvidia/qwen/qwen3.5-397b-a17b",
      "description": "Code review specialist",
      "maxTokens": 8192,
      "temperature": 0.2
    }
  }
}
```

**Voiceover:**
"Notice how we use premium models for critical tasks and FREE models for research. This optimizes costs!"

---

## SCENE 5: Custom Agent Creation (6:00-8:00)

**[Screen recording: oh-my-opencode.json]**

**Voiceover:**
"You can create custom agents for specific workflows. Let's add a frontend specialist:"

**[Show JSON]**

```json
{
  "agent": {
    "frontend-ui-ux-engineer": {
      "model": "nvidia/qwen/qwen3.5-397b-a17b",
      "description": "Frontend and UI/UX specialist",
      "systemPrompt": "You are a senior frontend engineer specializing in React, TypeScript, and modern UI/UX. Always follow best practices 2026.",
      "temperature": 0.6,
      "maxTokens": 8192
    },
    "document-writer": {
      "model": "opencode-zen/zen/big-pickle",
      "description": "Technical documentation writer",
      "systemPrompt": "You are a technical writer. Create clear, comprehensive documentation following the 500+ line mandate.",
      "temperature": 0.5,
      "maxTokens": 16384
    },
    "multimodal-looker": {
      "model": "google/antigravity-gemini-3-flash",
      "description": "Image and video analysis",
      "systemPrompt": "You analyze images, diagrams, and videos. Provide detailed descriptions and insights.",
      "temperature": 0.4,
      "maxTokens": 8192,
      "vision": true
    }
  }
}
```

**Voiceover:**
"Custom agents let you tailor AI behavior for specific tasks!"

---

## SCENE 6: Agent Workflows (8:00-10:00)

**[Screen recording: Terminal + Diagram]**

**Voiceover:**
"Real power comes from agent workflows. Here's a typical development flow:"

**[Show diagram]**

```
1. PROMETHEUS (Planning)
   ↓ Creates architecture plan
2. SISOYPHUS (Implementation)
   ↓ Writes code
3. ORACLE (Review)
   ↓ Code review & feedback
4. SISYPHUS (Revisions)
   ↓ Implements fixes
5. LIBRARIAN (Documentation)
   ↓ Creates docs
6. EXPLORE (Verification)
   ↓ Verifies completion
```

**Voiceover:**
"Use the delegate_task tool to orchestrate this workflow:"

**[Show TypeScript code]**

```typescript
// Example workflow
await delegate_task({
  category: "planning",
  subagent_type: "prometheus",
  run_in_background: true,
  prompt: "Create architecture for new feature"
});

await delegate_task({
  category: "implementation",
  subagent_type: "sisyphus",
  run_in_background: true,
  prompt: "Implement feature per architecture"
});

await delegate_task({
  category: "review",
  subagent_type: "oracle",
  run_in_background: true,
  prompt: "Review code for quality and security"
});
```

---

## SCENE 7: Testing Agents (10:00-11:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Let's test each agent to ensure they're configured correctly:"

**[Show commands]**

```bash
# Test Sisyphus
echo "Create a simple TypeScript function" | opencode --agent sisyphus

# Test Prometheus
echo "Plan a REST API structure" | opencode --agent prometheus

# Test Librarian
echo "Research best practices for error handling" | opencode --agent librarian

# Test Explore
echo "Explore the current project structure" | opencode --agent explore

# Test Oracle
echo "Review this code for issues" | opencode --agent oracle
```

---

## SCENE 8: Troubleshooting (11:00-11:30)

**[Screen recording: Terminal]**

**Voiceover:**
"Common issues and solutions:"

**[Show text overlay]**

```
ISSUE: Agent not responding
→ Check: opencode models (verify model exists)
→ Check: opencode auth list (verify provider auth)

ISSUE: Wrong model for agent
→ Check: oh-my-opencode.json (verify agent.model)
→ Fix: Update model path (provider/model-id)

ISSUE: Agent gives generic responses
→ Check: temperature setting (lower = more focused)
→ Check: systemPrompt (add specific instructions)
```

---

## SCENE 9: Conclusion (11:30-12:00)

**[Camera: Presenter]**

**Voiceover:**
"You've now mastered agent configuration! Next, watch the Troubleshooting tutorial for common issues. Links below!"

**[End screen with related videos and quiz link]**

---

## PRODUCTION NOTES

**Agent Icons:**
- Use emoji or custom icons for each agent
- Consistent color scheme across videos
- Animated transitions between agents

**Screen Recording:**
- Split screen: Terminal + JSON editor
- Highlight model assignments
- Show real agent responses

**Post-Production:**
- Add agent comparison table
- Include workflow diagram as downloadable PDF
- Link to agent configuration templates

---

**SCRIPT VERSION:** 1.0
**LAST UPDATED:** 2026-02-18
**DURATION:** 12:00
