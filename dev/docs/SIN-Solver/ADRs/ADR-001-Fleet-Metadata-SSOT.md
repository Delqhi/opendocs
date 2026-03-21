# ADR 001: Canonical Fleet-Metadata as Single Source of Truth

**Date:** 2026-03-21
**Status:** Accepted

## Context
The SIN-Solver platform consists of 48 A2A agents spread across 11 teams. Managing configuration, governance, and deployment parameters via scattered configs or localized Git repos creates drift and makes fleet-wide validation impossible.

## Decision
We establish the `sin-solver-control-plane` repository and specifically the `fleet-metadata.yaml` (or equivalent schema-validated artifact) as the definitive, single source of truth (SSOT) for all agent configurations, boundaries, and governance states.

## Consequences
- **Positive:** Centralized audit, single deployment pipeline, atomic governance changes.
- **Negative:** Agents cannot self-declare operational status without a control-plane MR. All changes must flow through the central registry.
