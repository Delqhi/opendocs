# Runbook: Governance Rollout to New Agent

**Audience:** Developers & Leads  
**Prerequisites:** Control-plane installed.  
**Last Updated:** 2026-03-21

## 1. Context
Enforcing the `sin-solver-control-plane` on an ungoverned agent.

## 2. Steps
1. Navigate to the agent root: `cd a2a/team-xxx/A2A-NewAgent`.
2. Generate config: `mkdir .sin` and run the projection script to fetch the latest `agent.yaml`.
3. Define boundaries: create `.sin/mcp-bindings.json`.
4. Run diagnostics: `govern doctor .` to identify structural violations (e.g. missing README, invalid `package.json` scripts).
5. Fix violations: Add missing scripts, normalize paths, implement `test:a2a:live`.
6. Run preflight: `govern preflight .`
7. Promote: Open PR updating `fleet-metadata.yaml` to move the agent from `ungoverned` to `eval` or `enforced`.
