# Runbook: Auth Rotator Failure

**Audience:** Operators  
**Prerequisites:** Telegram alerts configured, access to the host machine.  
**Last Updated:** 2026-03-21

## 1. Symptoms
- Telegram alert: `🔴 FATAL: Pipeline failed 3 times in a row! Requires intervention.`
- OpenCode CLI responds with "invalid refresh token" or "Quota exceeded".
- `logs/rotator.log` shows `Pipeline failed`.

## 2. Diagnostics
1. SSH into the rotator host (`sin-solver`).
2. Tail the logs: `tail -f ~/dev/opencodex-auth-rotator/logs/rotator.log`.
3. Check the HTTP health endpoint: `curl http://127.0.0.1:1456/health`.
4. Inspect the screencapture: `open /tmp/opencodex_s06_fail.png` or `opencodex_s07_end.png`.

## 3. Resolution
**If OpenAI updated the DOM (e.g. Consent Button Changed):**
- Update `s07_handle_consent.py` to match the new button text or ID.
- Run `python3 pipeline.py` manually to verify.

**If the Account creation is rate-limited:**
- The Google Admin SDK may be blocked. Verify the service account quota in GCP Console.

**If Chrome locks or WindowServer crashes:**
- Run `pkill -9 "Google Chrome"` and `rm -rf /tmp/opencodex_profile_*`.
- Restart the supervisor daemon.
