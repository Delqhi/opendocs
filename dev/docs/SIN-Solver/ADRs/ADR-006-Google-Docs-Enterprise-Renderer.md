# ADR 006: Google Docs Enterprise Renderer

**Date:** 2026-03-21
**Status:** Accepted

## Context
Agents previously dumped raw Markdown or plaintext into Google Docs, resulting in unreadable, unprofessional artifacts that damaged stakeholder trust.

## Decision
Absolute prohibition of plain text dumping. All Google Docs interactions must use `sin-google-apps` to generate "Enterprise-style" layouts: native tables, proper header hierarchies, tabs, alignments, and callout blocks. If a structured path does not exist, the agent must halt and report a missing renderer rather than fallback to plaintext.

## Consequences
- **Positive:** Professional, instantly usable output.
- **Negative:** Higher complexity for agents writing to Docs.
