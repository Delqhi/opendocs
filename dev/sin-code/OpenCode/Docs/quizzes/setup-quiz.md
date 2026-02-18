# QUIZ: OpenCode Setup & Installation

**Total Questions:** 10  
**Passing Score:** 8/10 (80%)  
**Topic:** Complete setup process from installation to first agent interaction

---

## Question 1

What is the minimum Node.js version required for OpenCode?

- [ ] Node.js 16+
- [x] Node.js 20+
- [ ] Node.js 18+
- [ ] Node.js 22+

**Explanation:** OpenCode requires Node.js 20 or higher for all features to work correctly.

---

## Question 2

Where should the main OpenCode configuration file be located?

- [ ] `~/.opencode/opencode.json`
- [ ] `~/config/opencode/opencode.json`
- [x] `~/.config/opencode/opencode.json`
- [ ] `/etc/opencode/opencode.json`

**Explanation:** The primary config location is `~/.config/opencode/opencode.json` (Source of Truth).

---

## Question 3

Which command installs OpenCode globally?

- [ ] `npm install opencode`
- [x] `npm install -g opencode`
- [ ] `yarn add opencode`
- [ ] `brew install opencode`

**Explanation:** The `-g` flag installs globally, making the `opencode` command available system-wide.

---

## Question 4

What is the first step after installing OpenCode?

- [ ] Configure agents
- [ ] Install plugins
- [x] Verify installation with `opencode --version`
- [ ] Create config directory

**Explanation:** Always verify the installation succeeded before proceeding with configuration.

---

## Question 5

Which provider is FREE and recommended for beginners?

- [ ] NVIDIA NIM
- [ ] Google Antigravity
- [x] OpenCode ZEN
- [ ] Streamlake

**Explanation:** OpenCode ZEN provides FREE uncensored models with generous context limits.

---

## Question 6

What does the `opencode models` command do?

- [ ] Installs new models
- [x] Lists all available models from configured providers
- [ ] Downloads model weights
- [ ] Tests model performance

**Explanation:** `opencode models` displays all models available from your configured providers.

---

## Question 7

Which directory structure is correct for OpenCode?

- [x] `~/.config/opencode/` (primary) and `~/.opencode/` (legacy)
- [ ] `~/.openai/opencode/`
- [ ] `/opt/opencode/`
- [ ] `~/Applications/opencode/`

**Explanation:** Primary config is in `~/.config/opencode/`, legacy files remain in `~/.opencode/`.

---

## Question 8

How do you verify your configuration is valid?

- [ ] `opencode check`
- [ ] `opencode verify`
- [x] `opencode models` (shows available models if config is valid)
- [ ] `opencode doctor`

**Explanation:** If `opencode models` lists models without errors, your configuration is valid.

---

## Question 9

What is the correct format for model references in agent config?

- [ ] `model-id`
- [ ] `provider-id:model-id`
- [x] `provider-id/model-id`
- [ ] `provider-id.model-id`

**Explanation:** Model paths use forward slash: `opencode-zen/zen/big-pickle`

---

## Question 10

Which command tests an agent with a simple prompt?

- [ ] `opencode test --agent explore`
- [ ] `opencode run explore "Hello"`
- [x] `echo "Hello" | opencode --agent explore`
- [ ] `opencode --explore "Hello"`

**Explanation:** Pipe a prompt to opencode with the `--agent` flag to test specific agents.

---

## Answer Key

1. Node.js 20+
2. `~/.config/opencode/opencode.json`
3. `npm install -g opencode`
4. Verify installation with `opencode --version`
5. OpenCode ZEN
6. Lists all available models
7. `~/.config/opencode/` and `~/.opencode/`
8. `opencode models`
9. `provider-id/model-id`
10. `echo "Hello" | opencode --agent explore`

---

## Scoring

- **10/10** - Setup Master! 🎯
- **8-9/10** - Ready to configure! ✅
- **6-7/10** - Review setup docs 📚
- **<6/10** - Re-watch tutorial video 🎬

---

**Related Resources:**
- Video: `docs/tutorials/scripts/01-complete-setup.md`
- Interactive: `docs/examples/opencode-json-interactive.sh`
- Docs: `UNIVERSAL-BLUEPRINT.md`
