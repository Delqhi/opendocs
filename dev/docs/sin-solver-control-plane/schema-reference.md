# Schema Reference

**Audience:** Developers & Architects  
**Prerequisites:** None  
**Last Updated:** 2026-03-21

The control plane relies on strict JSON/YAML schemas for input validation.

## `fleet-metadata.yaml`
The global single source of truth (SSOT) defining all agents, teams, and their operational status.
- `teams`: Array of objects (id, name, lead, members).
- `agents`: Array of objects defining the 48 agents.
  - `governedState`: Enum (`ungoverned`, `eval`, `enforced`).
  - `mcpBindings`: Array of strings defining allowed MCP tools.

## `issue-architect-roadmap.schema.json`
Validates the roadmap artifacts output by `plan-to-roadmap.mjs`.
- `title` (string): Title of the master tracker.
- `phase` (number): Execution phase.
- `sources` (array): External references.
- `epics` (array): The main initiatives.
  - `sub_issues` (array): Executable tasks under each epic.
