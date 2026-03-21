# CLI Reference

**Audience:** Developers & Operators  
**Prerequisites:** Node.js 18+, `sin-solver-control-plane` package built.  
**Last Updated:** 2026-03-21

The `sin-solver-control-plane` provides a central CLI (`govern`) for assessing and enforcing platform rules across all A2A agents.

## Commands

### `govern eval <agent-path>`
Evaluates a specific agent against the central `fleet-metadata.yaml` rules.
**Flags:**
- `--strict`: Fail with exit code 1 if the score drops below 80%.
- `--format json`: Return results as structured JSON (useful for CI).

### `govern preflight <agent-path>`
Runs a deep simulation to determine if an agent is ready to be moved to `enforced` state.
**Flags:**
- `--dry-run`: Do not write any `.sin/` config files.
- `--verbose`: Output detailed failure traces.

### `govern doctor`
Scans the entire monorepo for `.sin/` configuration drift against the central SSOT.

### `govern issues --plan <plan.md> --repo <owner/repo> --phase <N>`
Executes the GitHub Issue Architect pipeline. Converts a Markdown plan into a structured CEO-style GitHub issue board.
**Flags:**
- `--dry-run`: Output JSON artifacts without modifying GitHub.
- `--roadmap <file.yaml>`: Skip the Markdown parsing step and directly read a YAML roadmap.
