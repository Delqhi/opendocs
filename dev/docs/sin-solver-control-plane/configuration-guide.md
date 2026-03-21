# Configuration Guide

**Audience:** Developers  
**Prerequisites:** A basic understanding of the SIN-Solver monorepo structure.  
**Last Updated:** 2026-03-21

Every A2A agent must contain a `.sin/` directory at its root for localized governance configurations.

## The `.sin/` Directory Structure

```text
a2a/team-core/A2A-Example/
├── src/
├── package.json
└── .sin/
    ├── agent.yaml           # Local projection of fleet-metadata SSOT
    ├── mcp-bindings.json    # Declared tool boundaries
    └── governance.yaml      # Eval score thresholds and bypasses
```

## How to Configure a New Agent

1. Create the `.sin/` directory in your agent's root.
2. Run `npm run sync:a2a:control-plane-projection` to populate `agent.yaml`.
3. Define the `mcp-bindings.json` with the strict subset of tools your agent requires.
4. Run `govern preflight .` to verify your configuration matches the central SSOT.
