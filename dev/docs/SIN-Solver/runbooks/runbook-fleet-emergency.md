# Runbook: Fleet Emergency - Agent Down

**Audience:** Operators & SRE  
**Prerequisites:** None  
**Last Updated:** 2026-03-21

## 1. Detection
- Dashboard shows `status: RED`.
- Room-13 health checks fail.

## 2. Isolation
1. Identify the failing agent: `curl http://127.0.0.1:8014/api/v1/fleet/health`.
2. Quarantine the agent: Set `governedState: ungoverned` in `fleet-metadata.yaml` and deploy to detach it from the dispatcher queue.

## 3. Recovery
- Revert the latest PR that touched the agent.
- Restart the target container or Hugging Face Space.
- Re-run `npm run test:a2a:live -- --agent <slug>`.

## 4. Post-Mortem
- Create an incident in GitHub Issues.
- Update `repair-docs.md` with the root cause and the fix.
