# Runbook: Google Docs Sync Failure

**Audience:** Operators  
**Prerequisites:** Access to `sin-google-apps` service account.  
**Last Updated:** 2026-03-21

## 1. Symptoms
- The GitHub action "Docs Sync" fails.
- Parity cycle reports a drift between the repo markdown and the Google Doc projection.

## 2. Diagnostics
- Run the manual diff script: `npm run sync:a2a:control-plane-projection -- --dry-run`.
- Verify the Service Account has `Editor` access to the target Google Doc.

## 3. Resolution
- If the tab ID changed (e.g. user manually deleted and recreated the tab), update `docs-sync.config.yaml` with the new `tabId`.
- Re-run the sync: `npm run sync:a2a:doc-checklists`.
