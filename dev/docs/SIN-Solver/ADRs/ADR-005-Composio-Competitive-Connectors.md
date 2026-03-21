# ADR 005: Composio-Competitive Connector Architecture

**Date:** 2026-03-21
**Status:** Accepted

## Context
We need standard integration mechanisms for external tools (Google, X, etc.) that match or exceed the developer experience of platforms like Composio.

## Decision
We architect connectors using the `SIN-Authenticator` plane to handle OAuth/session storage, combined with dedicated Action/MCP agents (`sin-google-apps`, `sin-tiktok`, etc.) that abstract API complexities into robust, intent-driven operations.

## Consequences
- **Positive:** Reusable auth state, unified tool interface across all A2A agents.
- **Negative:** Connectors require maintenance of both the auth layer and the action layer.
