# ADR 004: .sin/ Directory Convention

**Date:** 2026-03-21
**Status:** Accepted

## Context
Agents need localized configuration that defines their boundaries, scopes, and MCP bindings, which must be verifiable by the control plane.

## Decision
Every agent repository must contain a `.sin/` directory containing standardized configuration files (e.g., `agent.yaml`, `mcp-bindings.json`, `governance.yaml`). The control plane's `doctor` command will exclusively look at this directory to assess compliance.

## Consequences
- **Positive:** Standardized layout across 48 agents. Clear separation of business logic and governance config.
- **Negative:** Small overhead when scaffolding new agents.
