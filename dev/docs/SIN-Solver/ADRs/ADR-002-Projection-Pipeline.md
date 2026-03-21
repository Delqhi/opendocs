# ADR 002: Projection Pipeline Pattern

**Date:** 2026-03-21
**Status:** Accepted

## Context
While `fleet-metadata` (ADR-001) is the SSOT, operational runtimes (like dashboard UIs, API gateways, Google Docs) require localized, highly optimized versions of this data. Generating these on-the-fly is inefficient and fragile.

## Decision
We adopt a "Truth → Project → Parity" pipeline. The control plane compiles the SSOT into downstream "projections" (JSON artifacts, config maps). Downstream systems operate strictly on their projections. A parity cycle continuously verifies that projections match the SSOT.

## Consequences
- **Positive:** Runtimes are decoupled from the control plane. If the control plane goes down, runtimes continue using their last known projection.
- **Negative:** Slight eventual consistency delay during propagation.
