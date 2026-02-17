# Style Guide & Conventions

**General:**
*   **Modular Architecture:** Prefer multiple small, focused files over monolithic ones.
*   **2026 Best Practices:** Modern patterns, clean code, high performance.

**Frontend (React/TypeScript):**
*   **Components:** Atomic/Modular design.
*   **Styling:** TailwindCSS v4.
*   **State:** Zustand (Global), React Hooks (Local).
*   **Naming:** PascalCase for components, camelCase for functions/vars.
*   **Types:** Strict TypeScript usage.

**Backend (Go - Target):**
*   **Structure:** Standard Go project layout (`cmd/`, `internal/`, `pkg/`).
*   **Naming:** `camelCase` for internal, `PascalCase` for exported.
*   **Error Handling:** Explicit error checking (no exceptions).
*   **Concurrency:** Goroutines and Channels where appropriate.

**Documentation:**
*   Keep `ARCHITECTURE.md` and Plan files updated.
*   Use Markdown for all documentation.
