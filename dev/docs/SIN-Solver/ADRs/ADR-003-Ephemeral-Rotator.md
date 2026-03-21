# ADR 003: Ephemeral Rotator Pattern for Auth

**Date:** 2026-03-21
**Status:** Accepted

## Context
Browser automation for OpenAI login using persistent Chrome profiles suffers from locking, session corruption, and macOS WindowServer blocks. Standard "organic" approaches fail due to SMS verification blocks.

## Decision
Authentication rotation for platform models will use the Ephemeral Rotator Pattern (originally developed in `openAntigravity-auth-rotator`). For every rotation, a temporary Google Workspace account (`rotator-TIMESTAMP@...`) is created via the Admin SDK, an isolated Chrome session logs in via OAuth, the token is extracted, and the temporary Workspace account is immediately deleted.

## Consequences
- **Positive:** Zero profile locks, completely isolated parallel execution, 100% clean session slate every run.
- **Negative:** Requires continuous Google Admin SDK API access.
