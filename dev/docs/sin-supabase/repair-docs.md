# SIN-Supabase — Fehler-Reports & Bug-Fixes

> Jeder Bug, jeder Fix, jede Loesung wird hier dokumentiert.

---

## BUG-20260319-001: SSOT and local SIN-Supabase surfaces still claim Hugging Face target instead of OCI Supabase reality

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** `A2A-SIN-Supabase` card/README/registry/docs currently describe `Target: Hugging Face Space free CPU VM`, while the intended architecture is self-hosted Supabase OSS on an OCI A1.Flex VM as the shared backend for all A2As and projects.

**Ursache:** Legacy scaffold/default HF target text was never reconciled with the real intended OCI/open-source Supabase architecture.

**Fix:** Updated the active SIN-Supabase card/README/registry/docs surfaces to mark OCI A1.Flex self-hosted Supabase OSS as the intended runtime architecture and removed the old HF target claim from the active agent surfaces.

**Datei:** `A2A-SIN-Supabase` card/README/registry/docs surfaces

---

## BUG-20260319-002: No canonical public `SUPABASE_URL` is currently documented or externally verifiable

**Aufgetreten:** 2026-03-19  **Status:** ✅ WORKAROUND

**Symptom:** The SIN-Supabase SSOT tab lists the secret names `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL`, but initially provided no concrete public API URL. `supabase.delqhi.com` is routed to Studio:3000 and returns `404`, `api.supabase.delqhi.com` does not resolve, and the only prior concrete URL in infra was an old internal legacy value `http://172.20.0.76:8000`.

**Ursache:** The public API/Kong gateway hostname for the self-hosted Supabase deployment is either not published, not routed, or not documented in the current SSOT/infra surfaces.

**Fix:** Workaround established: a new single OCI VM `sin-supabase` now runs the self-hosted stack and exposes a working provisional API URL at `http://92.5.60.87:8006` (`/rest/v1/` and `/auth/v1/health` both answer with expected auth-required `401`). This provisional URL has been fanned out to `SIN-GitHub-Issues`. Remaining work: publish the final Cloudflare/Kong host and replace the raw IP with the canonical public hostname.

**Datei:** Supabase SSOT docs, Cloudflare routing, and deployment config

---

## BUG-20260319-003: OCI runtime lane for SIN-Supabase is not currently verifiable

**Aufgetreten:** 2026-03-19  **Status:** 🔴 OFFEN

**Symptom:** OCI auth/bootstrap was initially unavailable, then became locally usable via `~/.oci/config`. IAM calls now work (`region-subscription`, `user get`), but the tenancy still exposes no verifiable running SIN-Supabase compute instance: there are no child compartments, `oci search resource structured-search --query-text "query instance resources"` returns zero items, and `oci compute instance list --all --compartment-id <tenancy>` returns no instance data.

**Ursache:** The local OCI operator path was only partially set up at first. After restoring OCI access, the deeper issue remains: there is still no visible/accessible compute instance representing the intended self-hosted Supabase VM in the tenancy, or the tenancy/runtime mapping used for Supabase is different from the documented target.

**Fix:** Verify why the OCI tenancy currently shows zero visible compute instances for the intended Supabase deployment, identify the actual running VM (if it exists) or provision the single canonical Supabase VM, and then publish the public API/Kong host from that real runtime.

**Update 2026-03-19:** OCI browser bootstrap succeeded and local CLI auth works from `~/.oci/config` (`DEFAULT`, region `eu-frankfurt-1`, tenancy `oraclezoe`). IAM queries succeed, but compute inventory still yields no visible instance resources.

**Datei:** OCI operator/bootstrap lane and SIN-Supabase runtime truth surfaces

---

## BUG-20260319-005: OCI tenancy currently shows zero visible compute instances for the intended Supabase VM

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** Initially, `oci search resource structured-search --query-text "query instance resources" --limit 1000` returned zero items, and `oci compute instance list --all --compartment-id <tenancy>` returned no instance data, even though OCI IAM access was working.

**Ursache:** The intended Supabase VM did not exist yet in the currently configured tenancy/region.

**Fix:** Provisioned exactly one canonical OCI VM in tenancy `oraclezoe` / region `eu-frankfurt-1`:
- display name: `sin-supabase`
- shape: `VM.Standard.A1.Flex`
- boot volume: `200 GB`
- public IP: `92.5.60.87`
- private IP: `10.16.0.151`

The new VM is currently the only visible OCI compute instance.

**Current single-VM conclusion:** In the currently configured tenancy (`oraclezoe`, `eu-frankfurt-1`) there is now exactly one visible compute instance, `sin-supabase`.

---

## BUG-20260320-006: OCI Supabase runtime is only provisionally published via raw public IP

**Aufgetreten:** 2026-03-20  **Status:** ✅ GEFIXT

**Symptom:** The new OCI Supabase stack was initially reachable only on the raw VM IP (`http://92.5.60.87:3004` for Studio, `http://92.5.60.87:8006` for Kong/API), with no final Cloudflare/Kong hostname yet attached.

**Ursache:** We created the first real OCI VM and bootstrapped the self-hosted Supabase stack before the final public hostname/routing contract was defined.

**Fix:** Added live Cloudflare tunnel routing in `~/.cloudflared/config.yml`:
- `supabase.delqhi.com` -> `http://92.5.60.87:3004`
- `api.supabase.delqhi.com` -> `http://92.5.60.87:8006` (legacy transitional host)
- `supabase-api.delqhi.com` -> `http://92.5.60.87:8006` (final TLS-safe API host)

The host cutover is now:
- Studio: `http://supabase.delqhi.com` -> `307 /project/default`
- API/Kong legacy: `http://api.supabase.delqhi.com` -> live
- API/Kong final: `https://supabase-api.delqhi.com` -> live (`401/Invalid authentication credentials` without real keys, which is expected)

The canonical downstream `SUPABASE_URL` has therefore been switched from the raw IP to `https://supabase-api.delqhi.com`.

**Datei:** OCI VM `sin-supabase` / `~/.cloudflared/config.yml` / Cloudflare DNS routes

---

## BUG-20260320-007: `supabase-storage` healthcheck used IPv6 localhost and stayed unhealthy

**Aufgetreten:** 2026-03-20  **Status:** ✅ GEFIXT

**Symptom:** `supabase-storage` stayed `unhealthy` even though the service logs showed `Server listening at http://0.0.0.0:5000`.

**Ursache:** The healthcheck used `http://localhost:5000/status`, and `wget` inside the container tried `::1` first. The storage service was only listening on IPv4, so the healthcheck failed with `Connection refused`.

**Fix:** Changed the healthcheck to `http://127.0.0.1:5000/status`, recreated `supabase-storage`, and re-verified that the container is now `healthy` and `/storage/v1/status` returns `200` through Kong.

**Datei:** `services/infrastructure/infrastructure/supabase/docker-compose.yml.backup.legacy.2026-01-29`, remote `/opt/sin-supabase/docker-compose.yml`

---

## BUG-20260320-008: `SIN-Supabase` `serve-a2a` exits immediately instead of staying alive

**Aufgetreten:** 2026-03-20  **Status:** ✅ GEFIXT

**Symptom:** Running `sin-supabase serve-a2a` on the new OCI VM prints a successful startup JSON and then exits immediately, so no process remains bound to port `47115`.

**Ursache:** `src/cli.ts` starts the HTTP server and prints the startup payload, but unlike `SIN-Server` it never waits for a shutdown signal or blocks the event loop afterward.

**Fix:** Added the same `waitForShutdownSignal()` / `handle.stop()` lifecycle pattern used by `SIN-Server`, rebuilt `SIN-Supabase`, redeployed the VM copy, and re-verified that the A2A server now stays up and answers `/health` on `127.0.0.1:47115`.

**Update 2026-03-20:** `SIN-Supabase` is now also running under `systemd` on the OCI VM as `sin-supabase.service` instead of only ad-hoc shell background processes.

**Datei:** `A2A-SIN-Supabase/src/cli.ts`

---

## BUG-20260319-004: `sin-supabase` repo had GitHub Issues disabled

**Aufgetreten:** 2026-03-19  **Status:** ✅ GEFIXT

**Symptom:** Public bug tracking in `https://github.com/Delqhi/sin-supabase` was blocked because GitHub Issues were disabled.

**Ursache:** Repo settings did not allow issue creation even though public issue tracking is now mandatory.

**Fix:** Enabled GitHub Issues on the repo and opened tracker issue `https://github.com/Delqhi/sin-supabase/issues/1` for the runtime/API host blocker.

**Datei:** GitHub repo settings / issue tracker surface
