# QUIZ: Agent Configuration & Workflows

**Total Questions:** 12  
**Passing Score:** 10/12 (83%)  
**Topic:** Agent setup, model assignment, and swarm workflows

---

## Question 1

Which agent is the main worker for coding tasks?

- [ ] prometheus
- [x] sisyphus
- [ ] librarian
- [ ] explore

**Explanation:** Sisyphus is the primary development agent for complex coding tasks.

---

## Question 2

Where is agent configuration stored?

- [ ] `opencode.json`
- [x] `oh-my-opencode.json`
- [ ] `agents.json`
- [ ] `.config/agents.json`

**Explanation:** Agent-specific config goes in `oh-my-opencode.json`.

---

## Question 3

What is the minimum number of agents for swarm mode?

- [ ] 3
- [ ] 4
- [x] 5
- [ ] 7

**Explanation:** MANDATE 0.1 requires minimum 5 parallel agents for swarm operations.

---

## Question 4

Which parameter enables parallel agent execution?

- [ ] `parallel: true`
- [ ] `async: true`
- [x] `run_in_background: true`
- [ ] `concurrent: true`

**Explanation:** `run_in_background: true` is mandatory for parallel execution.

---

## Question 5

Which agent specializes in planning and architecture?

- [x] prometheus
- [ ] atlas
- [ ] oracle
- [ ] sisyphus

**Explanation:** Prometheus creates architecture plans and task breakdowns.

---

## Question 6

What is the correct model path format?

- [ ] `model@provider`
- [ ] `provider.model`
- [x] `provider/model`
- [ ] `provider:model`

**Explanation:** Format is `provider-id/model-id` (e.g., `opencode-zen/zen/big-pickle`).

---

## Question 7

Which agent should review code quality?

- [ ] sisyphus
- [ ] prometheus
- [x] oracle
- [ ] librarian

**Explanation:** Oracle specializes in code review and quality assurance.

---

## Question 8

What temperature is best for code generation?

- [ ] 0.1 (very focused)
- [x] 0.6-0.7 (balanced)
- [ ] 1.0 (creative)
- [ ] 2.0 (maximum creativity)

**Explanation:** 0.6-0.7 provides good balance between creativity and accuracy for coding.

---

## Question 9

Which agent is FREE and best for research?

- [ ] sisyphus
- [ ] prometheus
- [x] librarian
- [ ] oracle

**Explanation:** Librarian uses FREE OpenCode ZEN models for research tasks.

---

## Question 10

What is the correct swarm workflow order?

- [x] Plan → Implement → Review → Document → Verify
- [ ] Implement → Plan → Review → Verify → Document
- [ ] Review → Plan → Implement → Document → Verify
- [ ] Plan → Review → Implement → Verify → Document

**Explanation:** Prometheus plans, Sisyphus implements, Oracle reviews, Librarian documents, Explore verifies.

---

## Question 11

Which command tests a specific agent?

- [ ] `opencode test --agent sisyphus`
- [ ] `opencode run sisyphus "Test"`
- [x] `echo "Test" | opencode --agent sisyphus`
- [ ] `opencode --sisyphus "Test"`

**Explanation:** Use `echo "prompt" | opencode --agent <name>` to test agents.

---

## Question 12

What should you do if an agent doesn't respond?

- [ ] Restart OpenCode immediately
- [x] Check model availability with `opencode models`
- [ ] Delete agent config
- [ ] Reinstall OpenCode

**Explanation:** First verify the assigned model exists and provider is authenticated.

---

## Answer Key

1. sisyphus
2. `oh-my-opencode.json`
3. 5
4. `run_in_background: true`
5. prometheus
6. `provider/model`
7. oracle
8. 0.6-0.7
9. librarian
10. Plan → Implement → Review → Document → Verify
11. `echo "Test" | opencode --agent sisyphus`
12. Check model availability

---

## Scoring

- **12/12** - Agent Master! 🎯
- **10-11/12** - Swarm ready! ✅
- **8-9/12** - Review agent docs 📚
- **<8/12** - Re-watch agent tutorial 🎬

---

**Related Resources:**
- Video: `docs/tutorials/scripts/03-agent-setup.md`
- Interactive: `docs/examples/oh-my-opencode-json-interactive.sh`
- Docs: `AGENTS.md` (Mandates 0.1-0.3)
