# VIDEO SCRIPT: Best Practices & Mandates Mastery

## Duration: 10 minutes

---

## SCENE 1: Introduction (0:00-0:30)

**[Camera: Presenter with mandate icons]**

**Voiceover:**
"Welcome to Best Practices and Mandates! Learn the 33 core mandates that govern professional OpenCode usage. Master these principles and become an elite AI-powered developer. Let's unlock peak productivity!"

**[On-screen text: "33 Mandates → Elite Developer Status"]**

---

## SCENE 2: The Supreme Laws (0:30-2:00)

**[Screen recording: Presentation slide]**

**Voiceover:**
"The first three mandates are SUPREME LAWS. Violating these is technical treason!"

**[Show mandate list]**

```
MANDATE 0.0: IMMUTABILITY OF KNOWLEDGE
→ Never delete documentation
→ Only additive changes
→ Preserve all history

MANDATE 0.1: MODULAR SWARM SYSTEM
→ Never work alone
→ Minimum 5 parallel agents
→ Swarm delegation always

MANDATE 0.2: REALITY OVER PROTOTYPE
→ No mocks, no simulations
→ Real code only
→ Production-ready every commit
```

**Voiceover:**
"These aren't suggestions - they're MANDATORY. Let's see them in action."

---

## SCENE 3: Documentation Mandates (2:00-3:30)

**[Screen recording: File structure]**

**Voiceover:**
"Mandate 0.5: Citadel Documentation Sovereignty"

**[Show directory structure]**

```
Docs/[module-name]/
├── 01-overview.md
├── 02-lastchanges.md
├── 03-troubleshooting.md
├── 04-architecture.md
├── 05-api-reference.md
├── ... (26 pillars total)
└── 26-appendix.md
```

**Voiceover:**
"Every module needs 26-pillar documentation, 500+ lines each!"

**[Show example]**

```bash
# Create documentation structure
mkdir -p Docs/my-module
cd Docs/my-module

# Create all 26 pillars
for i in {01..26}; do
  touch "${i}-pillar-template.md"
done

# Each file must be 500+ lines
wc -l 01-overview.md  # Must show 500+
```

**Voiceover:**
"Mandate 0.6: Ticket-Based Troubleshooting"

**[Show example]**

```bash
# Create troubleshooting ticket
cat > troubleshooting/ts-ticket-01.md << 'EOF'
# TS-TICKET-01: Provider Authentication Error

## Problem
Authentication failed for NVIDIA provider

## Root Cause
API key expired

## Resolution
1. Generate new key at build.nvidia.com
2. Update environment variable
3. Test with: opencode models

## Commands Used
export NVIDIA_API_KEY="new-key"
opencode models
EOF
```

---

## SCENE 4: Workflow Mandates (3:30-5:00)

**[Screen recording: Terminal session]**

**Voiceover:**
"Mandate 0.3: Omniscience Blueprint"

**[Show commands]**

```bash
# Every project MUST have BLUEPRINT.md
ls BLUEPRINT.md  # Must exist

# Blueprint must be 500+ lines
wc -l BLUEPRINT.md  # Must show 500+

# Must cover all 22 pillars
grep -c "^##" BLUEPRINT.md  # Must show 22+ sections
```

**Voiceover:**
"Mandate 0.16: Trinity Documentation Standard"

**[Show structure]**

```
/project/
├── docs/
│   ├── non-dev/      # User guides
│   ├── dev/          # API docs
│   ├── project/      # Team docs
│   └── postman/      # API collections
├── DOCS.md           # Rulebook
└── README.md         # Gateway
```

---

## SCENE 5: Coding Standards (5:00-6:30)

**[Screen recording: Code editor]**

**Voiceover:**
"Mandate 0.9: TypeScript Strict Mode"

**[Show tsconfig.json]**

```json
{
  "compilerOptions": {
    "strict": true,              // ✅ REQUIRED
    "noImplicitAny": true,       // ✅ REQUIRED
    "noImplicitThis": true,      // ✅ REQUIRED
    "strictNullChecks": true,    // ✅ REQUIRED
    "strictFunctionTypes": true, // ✅ REQUIRED
    "alwaysStrict": true         // ✅ REQUIRED
  }
}
```

**Voiceover:**
"NO `any` types, NO `@ts-ignore`, NO exceptions!"

**[Show bad vs good code]**

```typescript
// ❌ WRONG - Using any
function process(data: any) {
  return data.value;
}

// ✅ CORRECT - Proper typing
interface Data {
  value: string;
}

function process(data: Data): string {
  return data.value;
}
```

**Voiceover:**
"Mandate 0.10: Commit Message Standards"

**[Show examples]**

```bash
# ✅ CORRECT - Conventional Commits
git commit -m "feat(auth): add OAuth2 support"
git commit -m "fix(api): resolve timeout issue"
git commit -m "docs: update API reference"

# ❌ WRONG - Vague messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

---

## SCENE 6: Agent Workflows (6:30-8:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Mandate 0.1: Swarm Delegation"

**[Show workflow]**

```typescript
// ❌ WRONG - Single agent
await delegate_task({
  subagent_type: "sisyphus",
  prompt: "Build entire feature"
});

// ✅ CORRECT - Swarm of 5+ agents
await delegate_task({
  subagent_type: "prometheus",
  run_in_background: true,
  prompt: "Create architecture plan"
});

await delegate_task({
  subagent_type: "sisyphus",
  run_in_background: true,
  prompt: "Implement core logic"
});

await delegate_task({
  subagent_type: "oracle",
  run_in_background: true,
  prompt: "Review code quality"
});

await delegate_task({
  subagent_type: "librarian",
  run_in_background: true,
  prompt: "Write documentation"
});

await delegate_task({
  subagent_type: "explore",
  run_in_background: true,
  prompt: "Verify implementation"
});
```

**Voiceover:**
"Minimum 5 agents, ALL in background mode, working in parallel!"

---

## SCENE 7: Quality Assurance (8:00-9:00)

**[Screen recording: Terminal]**

**Voiceover:**
"Mandate 0.25: Self-Criticism & Crashtests"

**[Show checklist]**

```bash
# Before ANY commit, verify:

# 1. Run all tests
npm test

# 2. Check linting
npm run lint

# 3. Type check
npm run typecheck

# 4. Build verification
npm run build

# 5. Integration tests
npm run test:e2e

# 6. Performance tests
npm run test:perf

# 7. Security scan
npm run security-scan
```

**Voiceover:**
"NEVER commit without passing ALL checks!"

---

## SCENE 8: Continuous Improvement (9:00-9:30)

**[Screen recording: Presentation]**

**Voiceover:**
"Mandate 0.24: Best Practices 2026"

**[Show workflow]**

```
BEFORE CODING:
1. Research: websearch_web_search_exa()
2. GitHub: grep_app_searchGitHub()
3. Docs: context7_query-docs()

DURING CODING:
1. Check latest versions
2. Verify security advisories
3. Compare alternative approaches

AFTER CODING:
1. Update documentation
2. Add to lastchanges.md
3. Create troubleshooting tickets
```

---

## SCENE 9: Conclusion & Challenge (9:30-10:00)

**[Camera: Presenter]**

**Voiceover:**
"You've learned the 33 mandates. Now the challenge: implement ALL of them in your next project. Take the best practices quiz to test your knowledge. Links below!"

**[On-screen text]**

- "Download: Complete Mandate Checklist (PDF)"
- "Practice: Interactive Examples in docs/examples/"
- "Test: Best Practices Quiz (15 questions)"
- "Certify: Elite Developer Status"

**[End screen with quiz link and certification badge]**

---

## PRODUCTION NOTES

**Visual Elements:**
- Mandate icons for each section
- Red/Yellow/Green status indicators
- Progress bars for compliance

**Screen Recording:**
- Split screen: Mandate text + Implementation
- Show real project examples
- Highlight violations vs compliance

**Post-Production:**
- Add mandate summary table
- Include downloadable checklist
- Create compliance scorecard template

---

**SCRIPT VERSION:** 1.0
**LAST UPDATED:** 2026-02-18
**DURATION:** 10:00
