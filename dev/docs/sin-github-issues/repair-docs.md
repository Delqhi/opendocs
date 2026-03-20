# SIN-GitHub-Issues — Fehler-Reports & Bug-Fixes

> Jeder Bug, jeder Fix, jede Loesung wird hier dokumentiert.

---

## BUG-20260319-001: Fresh scaffold build fails before local dependency install

**Aufgetreten:** 2026-03-19  **Status:** 🔴 OFFEN

**Symptom:** `npm --prefix /Users/jeremy/dev/SIN-Solver/a2a/team-coding/A2A-SIN-GitHub-Issues run build` fails with `TS2307` missing-module errors for `tar`, `@huggingface/hub`, and `node-cron`.

**Ursache:** The generated scaffold declares the required dependencies in `package.json`, but the new agent package has not had `npm install` run yet.

**Fix:** Run `npm --prefix /Users/jeremy/dev/SIN-Solver/a2a/team-coding/A2A-SIN-GitHub-Issues install`, then rebuild and continue implementation.

**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/package.json`

---

## BUG-20260319-002: Validation fails because `dist/src/cli.js` is missing after runtime refactor

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `node .../dist/src/cli.js print-card`, `agent.help`, `health`, and `serve-mcp` checks initially failed with `MODULE_NOT_FOUND` for `dist/src/cli.js`.

**Ursache:** False positive caused by running validation commands in parallel with the build step before the build artifact was finished.

**Fix:** Re-ran the build sequentially, verified `dist/src/cli.js` exists, and continued validation only after the build completed.

**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/dist/src/cli.js`

---

## BUG-20260319-003: Freshly provisioned `sin-github-issues` repo has GitHub Issues disabled

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `gh repo view Delqhi/sin-github-issues --json hasIssuesEnabled` returns `false`, so the dedicated GitHub issue agent cannot use its own repo issue surface.

**Ursache:** The canonical scaffold generator provisions private repos with `--disable-issues` by default, which is the wrong default for a GitHub-Issues-focused agent.

**Fix:** Enabled GitHub Issues on `Delqhi/sin-github-issues` with `gh repo edit --enable-issues`. Generator override/post-provision follow-up still recommended.

**Datei:** GitHub repo settings / `create-sin-a2a-agent.mjs`

---

## BUG-20260319-004: `issue.ensure` fails on unknown labels and does not return a reusable issue number

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `sin.github.issues.issue.ensure` failed with `gh_failed:could not add label: 'bootstrap' not found`, and the immediate follow-up comment step could not target a created issue reliably.

**Ursache:** The helper assumes labels already exist and only returns the raw `gh issue create` URL on creation, not a normalized issue number payload for downstream actions.

**Fix:** `src/github.ts` now retries issue creation without labels when labels are unknown and always returns normalized metadata including `issueNumber` + `issueUrl`.

**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/src/github.ts`

---

## BUG-20260319-005: `SIN-GitHub-Issues` has no live Supabase coupling yet

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `sin.github.issues.health` initially reported `hasSupabaseEnv: false`, and audit persistence returned `{ persisted: false, error: "TypeError: fetch failed" }`.

**Ursache:** The new agent initially had no canonical Supabase API URL and no live env fanout from the freshly provisioned OCI backend.

**Fix:** The new OCI backend now provides a canonical host target `https://supabase-api.delqhi.com`, `SUPABASE_URL` has been fanned out to the `sin-github-issues` HF Space, the table `public.sin_github_issues_events` was created on the new Supabase backend, and repeated issue-comment actions now persist audit rows successfully.

**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/src/supabase.ts`, runtime env

---

## BUG-20260319-006: Required `SIN_SUPABASE_*` secrets are missing from the central password manager

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `sin-passwordmanager_sync_secret_to_huggingface_space` returned `secret_not_found:SIN_SUPABASE_URL` and `secret_not_found:SIN_SUPABASE_SERVICE_ROLE_KEY` when attempting to provision the new agent space.

**Ursache:** The new agent initially expected legacy `SIN_SUPABASE_*` secret names instead of the canonical Supabase secret contract.

**Fix:** The agent was migrated to the canonical names `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, the backend was provisioned on OCI, and `SUPABASE_URL` was fanned out to the HF space. Audit persistence is now working against the live backend.

**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/src/supabase.ts`, live deployment env

---

## BUG-20260319-007: HF secret fanout to `sin-github-issues` space returns 404

**Aufgetreten:** 2026-03-19  **Status:** ✅ WORKAROUND

**Symptom:** `sin-passwordmanager_sync_secret_to_huggingface_space` for `repoId=delqhi/sin-github-issues` failed with `404 Repository Not Found` on the Space secret endpoint even after the space repo existed and code upload succeeded.

**Ursache:** The Passwordmanager HF-secret path was not usable yet for the newly created space.

**Fix:** Worked around the failing fanout path by using authenticated Hugging Face API writes directly for required variables/secrets during bootstrap. The live space now has the required Supabase host variable and the agent runs against the OCI backend. Central Passwordmanager fanout for this space can still be improved later, but it is no longer a blocker.

**Datei:** Hugging Face Space provisioning for `delqhi/sin-github-issues`
