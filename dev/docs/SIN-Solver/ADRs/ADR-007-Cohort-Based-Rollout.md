# ADR 007: Cohort-Based Governance Rollout

**Date:** 2026-03-21
**Status:** Accepted

## Context
Applying the Phase 2 control-plane governance rules to all 48 agents simultaneously would halt all feature development and overwhelm the team with compliance violations.

## Decision
Governance will be applied in structured cohorts (e.g., Core 5, Wave 2, etc.). An agent's `governedState` in the fleet metadata determines its enforcement level (`ungoverned`, `eval`, `enforced`).

## Consequences
- **Positive:** Incremental, manageable path to 100% compliance.
- **Negative:** Running a dual-state fleet temporarily increases operational complexity.
