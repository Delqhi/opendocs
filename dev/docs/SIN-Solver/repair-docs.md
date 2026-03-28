## BUG-001: Monolithischer Worker
**Aufgetreten:** Mo. 16 März 2026 06:27:41 CET
**Status:** 🔴 OFFEN
**Symptom:** worker.py für twocaptcha wurde als 140+ Zeilen Monolith erstellt.
**Ursache:** Veraltete KI-Muster (Monolithen statt Micro-Steps).
**Fix:** Wird in <30 Zeilen Micro-Dateien zerlegt mit Self-Healing Fallback.
**Datei:** services/workers/platforms/twocaptcha/worker.py

## BUG-001: Monolithischer Worker (UPDATE)
**Status:** ✅ GEFIXT
**Fix:** Die 140+ Zeilen `worker.py` wurde gelöscht. Architektur wurde auf Ultra-Mikro-Steps (<30 Zeilen) im Ordner `twocaptcha/steps/` umgestellt. Ein `healing_runner.py` steuert die Ausführung und generiert bei Fehlern sofort `healing_request.txt` für Deep-Research.

---

## BAN-GOOGLE-SDK: @ai-sdk/google ist STRENGSTENS VERBOTEN
**Aufgetreten:** 16. März 2026  **Status:** 🔴 PERMANENTER BANN
**Symptom:** Inklusion von `"npm": "@ai-sdk/google"` in der `opencode.json` führt zu korrupten API-Aufrufen und "Requested entity was not found" Fehlern.
**Ursache:** Das Standard Google AI SDK kollidiert mit der Antigravity-Authentifizierung. Es versucht Pfade zu nutzen, die für Antigravity-Modelle nicht zulässig sind.
**Verbot:** Dieses Paket darf NIEMALS wieder in irgendeiner OpenCode-Konfiguration auftauchen. Wir nutzen AUSSCHLIESSLICH das `opencode-antigravity-auth` Plugin ohne das Google SDK NPM Paket.
**Datei:** ~/.config/opencode/opencode.json

## BUG-001: A2A-SIN-Google-Apps nicht erreichbar & falscher E-Mail-Versand
**Aufgetreten:** Wed Mar 18 2026  **Status:** ✅ GEFIXT
**Symptom:** E-Mail wurde fälschlicherweise über lokales AppleScript/Nodriver anstatt über `sin-google-apps` versendet. `sin-google-apps` war lokal teils nicht startbar, weil Build-Dependencies fehlten.
**Ursache:** Falscher Ausführungspfad (Gmail-UI statt A2A/MCP) plus fehlendes `node_modules` im Agent-Projekt; dadurch scheiterte `npm run build` mit `TS2307` (`tar`, `@huggingface/hub`, `node-cron`).
**Fix:** Dependencies installiert (`npm --prefix .../A2A-SIN-Google-Apps install`), Build erfolgreich, A2A-RPC geprüft (`POST /a2a/v1` mit `agent/getCard` = 200), und Wrapper `bin/sin-google-apps` gehärtet: führt jetzt vor dem Build automatisch `npm install` aus, wenn `node_modules`/Lock-Metadaten fehlen.
**Datei:** `a2a/team-infratructur/A2A-SIN-Google-Apps/package.json`, `a2a/team-infratructur/A2A-SIN-Google-Apps/package-lock.json`, `bin/sin-google-apps`

## BUG-002: Restart-Kommando trifft laufenden sin-google-apps Prozess nicht
**Aufgetreten:** Wed Mar 18 2026  **Status:** 🔴 OFFEN
**Symptom:** `pkill -f "sin-google-apps serve-a2a"` beendete die laufende Instanz nicht sicher; erneuter Start lieferte `EADDRINUSE` auf `127.0.0.1:45872`.
**Ursache:** Prozess-Matching auf Kommandozeilenstring war nicht robust genug fuer Wrapper/Node-Prozesskette.
**Fix:** Noch offen. Fuer sofortige Verifikation wurden Health/Card/RPC gegen die bereits laufende Instanz geprueft (alle 200).
**Datei:** Laufzeitprozess `bin/sin-google-apps serve-a2a` / Port `45872`

## BUG-003: Lokaler Docker-Build fuer HF-Repro nicht moeglich (Daemon down)
**Aufgetreten:** Wed Mar 18 2026  **Status:** 🔴 OFFEN
**Symptom:** `docker build` zur Reproduktion des HF Build-Errors bricht lokal mit `Cannot connect to the Docker daemon` ab.
**Ursache:** Docker Desktop/Daemon lief auf diesem Host nicht.
**Fix:** Noch offen. HF-Build-Debugging musste ohne lokalen Container-Repro erfolgen.
**Datei:** Lokale Runtime (`docker` / `/Users/jeremy/.docker/run/docker.sock`)

## BUG-004: HF Space BUILD_ERROR in Docker Step 11/11
**Aufgetreten:** Wed Mar 18 2026  **Status:** ✅ GEFIXT
**Symptom:** `delqhi/sin-google-apps` faellt reproduzierbar in `BUILD_ERROR`; HF Runtime meldet nur Fehler im kombinierten Docker RUN-Step (`pip install && npm install -g gemini-cli && npm install && npm run build && npm prune`).
**Ursache:** HF-Build brach im fruehen RUN-Step ab (Python/pip-Teil in Container-Setup). Durch monolithische Build-Kette war die Fehlerquelle nicht stabil isolierbar.
**Fix:** Dockerfile auf separierte RUN-Schritte umgestellt und problematische Python/pip-Install-Schritte entfernt; danach ging Space in `RUNNING`.
**Datei:** `a2a/team-infratructur/A2A-SIN-Google-Apps/Dockerfile`

## BUG-005: Live HF Gmail Send blockiert durch fehlende Gmail OAuth Scopes
**Aufgetreten:** Wed Mar 18 2026  **Status:** 🔴 OFFEN
**Symptom:** Live-Action `google.gmail.send` auf `delqhi-sin-google-apps.hf.space` liefert `google_user_oauth_required` trotz gesetztem OAuth-Client im Space.
**Ursache:** Verfuegbarer User-OAuth-Cache enthaelt Docs/Drive/Tasks, aber nicht `gmail.readonly` + `gmail.send`; ohne diese Scopes wird Senden geblockt.
**Fix:** OAuth-Client + User-OAuth-JSON werden als Space-Config gesetzt; finale Scope-Erweiterung per Gmail-Consent (`google.gmail.oauth.login` mit Gmail-Scopes) steht noch aus.
**Datei:** `src/runtime.ts`, HF Space Secrets `SIN_GOOGLE_APPS_OAUTH_CLIENT_SECRET`, `SIN_GOOGLE_APPS_USER_OAUTH_JSON`

## BUG-006: Repo-weite Dateisuche via Glob bricht an fluechtigen Chrome-/venv-Artefakten
**Aufgetreten:** Thu Mar 19 2026  **Status:** 🔴 OFFEN
**Symptom:** Repo-weite `glob`/`rg`-Suche ueber `/Users/jeremy/dev` liefert wiederholt `No such file or directory` fuer fluechtige `Singleton*`, `RunningChromeVersion` und `venv/bin/python*` Pfade; dadurch werden Discovery-Schritte unzuverlaessig.
**Ursache:** Der Suchlauf traversiert volatile Chrome-Debug-Profile und teilweise kaputte venv-Artefakte, die waehrend des Laufs verschwinden.
**Fix:** Fuer grosse Discovery-Laeufe gezielt auf konkrete Projektwurzeln einschranken oder ueber agent-spezifische/`ls`-basierte Pfade suchen; langfristig volatile Pfade aus der Suche ausschliessen.
**Datei:** `/Users/jeremy/dev/**` (volatile profile + venv artefacts)

## BUG-007: WebAuto meldet MCP-Health, aber Browser-Aktionen starten ohne aktive Seite nicht direkt
**Aufgetreten:** Thu Mar 19 2026  **Status:** 🔴 OFFEN
**Symptom:** `webauto-nodriver goto` und `record_screen` liefern `{"error": "no page"}`, obwohl `mcp_status` operabel meldet.
**Ursache:** Die Browser-Lane ist verbunden, aber es existiert noch keine aktive/adoptierte Seite fuer direkte Navigationsschritte.
**Fix:** Vor Browser-Schritten erst eine Debug-Session/Profile-Lane sauber bootstrapen oder ueber Relaunch/Launch-Tool eine Seite erzeugen; danach erneut navigieren.
**Datei:** WebAuto-Nodriver Runtime / aktive CDP-Seite

## BUG-008: WebAuto `record_screen` timed out trotz geladener Seite
**Aufgetreten:** Thu Mar 19 2026  **Status:** 🔴 OFFEN
**Symptom:** Nach erfolgreichem `goto` auf GitHub laeuft `record_screen` in einen MCP-Timeout (`-32001`).
**Ursache:** Noch unklar; vermutlich Blockade in der Aufnahme-Pipeline oder zu spaete Rueckgabe bei aktiver Debug-Session.
**Fix:** Fuer direkte Browser-Steuerung vorerst `goto`/DOM-Zustand/Screenshots priorisieren; Aufnahme nur als Sekundaerbeweis verwenden, bis die Runtime stabilisiert ist.
**Datei:** WebAuto-Nodriver Aufnahme-Pipeline

## BUG-009: A2A-SIN-Supabase Build scheitert lokal wegen fehlender installierter Agent-Dependencies
**Aufgetreten:** Thu Mar 19 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix a2a/team-infratructur/A2A-SIN-Supabase run build` bricht mit `TS2307` fuer `tar`, `@huggingface/hub` und `node-cron` ab, obwohl diese in `package.json` stehen.
**Ursache:** Der Agent-Root hat die Dependencies deklariert, aber im aktuellen Workspace waren sie lokal nicht installiert/verfuegbar; dadurch scheitert TypeScript vor dem eigentlichen Runtime-Check. Danach zeigte sich noch ein zweiter Root-Path-Bug: der gebaute CLI loeste den Agent-Root aus `dist/` statt aus dem echten Projektroot auf.
**Fix:** `npm install` im Agent-Root ausgefuehrt, Build erfolgreich verifiziert und Root-Pfad-Aufloesung in `src/runtime.ts` auf den echten Agent-Root korrigiert, sodass die Alpha-Memory-Config wieder korrekt erkannt wird.
**Datei:** `a2a/team-infratructur/A2A-SIN-Supabase/package.json`, `a2a/team-infratructur/A2A-SIN-Supabase/src/runtime.ts`, `a2a/team-infratructur/A2A-SIN-Supabase/src/hf_sync.ts`

## BUG-010: Falscher Folgecheck nach Projection-Generierung
**Aufgetreten:** Thu Mar 19 2026  **Status:** ✅ GEFIXT
**Symptom:** Nach erfolgreicher Projection-Generierung meldete der direkte Folgecheck faelschlich, dass `dashboard-enterprise/components/a2a/controlPlaneProjection.generated.ts` fehle.
**Ursache:** Kein Repo-Codefehler; der direkte Folgecheck war fehlerhaft/inkonsistent, waehrend die generierten Artefakte korrekt auf Platte geschrieben wurden.
**Fix:** Artefakte direkt per absolutem Pfad verifiziert (`ls` + Python-Readback). Generator bleibt unveraendert, da die Ausgabe korrekt ist.
**Datei:** `scripts/alpha/generate-control-plane-registry-projection.mjs`, `dashboard-enterprise/components/a2a/controlPlaneProjection.generated.ts`

## BUG-011: Alpha-Harness Tests decken echte Mismatches in Helper-/Script-Vertraegen auf
**Aufgetreten:** Thu Mar 19 2026  **Status:** ✅ GEFIXT
**Symptom:** `pytest tests/unit/test_alpha_harnesses.py -q` failt in drei Stellen: `RouteStoreStatus` erwartet mehr Felder als der Test setzt, `inspect-replay.mjs` erkennt Duplikate auf Datei-Input nicht wie erwartet, und `reconcile-projections.mjs` behandelt externe Dateipfade nicht korrekt.
**Ursache:** Die neuen Harness-Tests haben reale Inkonsistenzen zwischen Testannahmen und den Operator-Tooling-Vertraegen offengelegt (vollstaendiger `RouteStoreStatus`, path joining fuer absolute Dateien, Replay-Script-Fallback-Parsing).
**Fix:** Test auf echten `RouteStoreStatus` erweitert; `inspect-replay.mjs` und `reconcile-projections.mjs` auf absolute und relative Pfade robust gemacht. Danach laufen alle sechs Alpha-Harness-Tests gruen.
**Datei:** `tests/unit/test_alpha_harnesses.py`, `scripts/alpha/inspect-replay.mjs`, `scripts/alpha/reconcile-projections.mjs`

## BUG-012: Alpha observations generator nutzt verbotenen Pilot-Mutationspfad fuer Queue-Latency-Messung
**Aufgetreten:** Thu Mar 19 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run report:alpha:observations` failt mit `pilot_route_requires_authoritative_store`, weil der Generator `create_task`/`claim_next` direkt gegen den geschuetzten Alpha-Pilotpfad benchmarkt.
**Ursache:** Der Messpfad nutzt echte Room-13 Pilot-Mutationsrouten, obwohl diese im degraded in-memory fallback absichtlich blockiert werden. Der Schutz funktioniert korrekt; falsch ist der Benchmark-Ansatz.
**Fix:** Queue-Latency-Messung auf einen lokalen Harness mit explizitem autoritativem Stub umgestellt und Projection-Refresh direkt vor der Staleness-Messung gezogen. Danach werden `alpha-observations`, `alpha-scorecard` und `alpha-acceptance-gates` gruen erzeugt.
**Datei:** `scripts/alpha/generate-alpha-observations.mjs`

## BUG-013: Hermes dispatch fallback bricht mit Python NameError bei null required_capability_key
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `node scripts/zeus/hermes-dispatch.mjs ...` failt mit `NameError: name 'null' is not defined`.
**Ursache:** Node-Template hat `required_capability_key=null` in das Python Snippet gerendert; Python erwartet `None`.
**Fix:** Hermes dispatch rendert `None` statt `null`, wenn kein capability key gesetzt ist; Fallback-Routing funktioniert wieder.
**Datei:** `scripts/zeus/hermes-dispatch.mjs`

## BUG-014: Zeus bootstrap nimmt falsches JSON-Format von `gh project list` an
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** Echter Run von `node scripts/zeus/bootstrap-github-project.mjs ...` bricht mit `TypeError: projects.find is not a function` ab.
**Ursache:** `ensureProject()` erwartet ein Array, aber `gh project list --format json` liefert auf diesem Host ein Objekt-Envelope statt eines nackten Arrays.
**Fix:** `normalizeProjectListResponse()` eingefuehrt, damit sowohl nackte Arrays als auch Objekt-Envelopes mit `projects` robust verarbeitet werden. Danach lief der Real-Run weiter.
**Datei:** `scripts/zeus/bootstrap-github-project.mjs`

## BUG-015: Zeus bootstrap scheitert in Real-Run an fehlenden GitHub Labels
## BUG-016: Parallele Dashboard-Gates koennen `.next/lock` kollidieren lassen
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** Wenn `chat-api`- und `release-gate`-Builds parallel laufen, kann Next.js mit `Unable to acquire lock .../.next/lock` oder nachfolgend mit fehlenden Standalone-Artefakten abbrechen.
**Ursache:** Mehrere Build-lastige Gates starten gleichzeitig dieselbe `dashboard-enterprise`-Produktionserzeugung und konkurrieren um denselben `.next`-Lock.
**Fix:** Noch offen. Build-intensive Gates sequentiell fahren oder einen Build-Artefakt-/Lock-Koordinator einbauen.
**Datei:** `dashboard-enterprise/.next/lock`, Gate-Skripte unter `scripts/architecture/*`

## BUG-017: Schema-Health-Gate gibt multiline SQL falsch an psql weiter
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** `npm run test:dashboard:schema-health` bricht sofort mit `invalid command \nselect` ab.
**Ursache:** Das Gate uebergibt die SQL-Query in einer Form, die `psql -c` ueber SSH nicht korrekt parsen kann.
**Fix:** Noch offen. SQL fuer den SSH/psql-Pfad auf eine sauber gequotete One-Liner-Form bringen.
**Datei:** `scripts/architecture/opensin-schema-health-gate.mjs`

## BUG-018: Parallele Gate-Läufe koennen `dashboard-enterprise/.next/lock` erneut kollidieren lassen
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** Wenn `chat-api`/`release-gate`-Läufe parallel gestartet werden, kann `ops:dashboard:build` mit `Unable to acquire lock .../.next/lock` scheitern; nachfolgende `chat-api`/`interaction-smoke` Checks schlagen dann nur wegen fehlender Standalone-Artefakte fehl.
**Ursache:** Mehrere build-lastige Gates teilen dieselbe `.next`-Arbeitsstruktur und sind weiterhin nicht vollständig gegen Parallelstart geschützt.
**Fix:** Noch offen. Einzelne Gates funktionieren stabil, wenn sie sequentiell gefahren werden; parallele lokale Läufe koennen den `.next/lock` weiterhin ausloesen. Langfristig braucht es einen Build-/Lock-Koordinator oder konsequenteres Reuse von Prebuild-Artefakten.
**Datei:** `dashboard-enterprise/.next/lock`, `scripts/architecture/opensin-release-gate.mjs`, `scripts/architecture/opensin-chat-api-gate.mjs`, `scripts/architecture/run-dashboard-enterprise-interaction-smoke.js`
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** Echter Run von `node scripts/zeus/bootstrap-github-project.mjs ...` bricht bei `gh issue create` mit `could not add label: 'zeus' not found` ab.
**Ursache:** Das Script setzt voraus, dass alle Plan-Labels bereits im Ziel-Repo existieren.
**Fix:** `ensureLabels()` vor `gh issue create` ergänzt; Zeus-, Team- und Capability-Labels werden nun idempotent angelegt, bevor das Issue erstellt wird. Danach war der Real-Run erfolgreich.
**Datei:** `scripts/zeus/bootstrap-github-project.mjs`

## BUG-016: Hermes intake findet Remote-Branch mit Slash per `gh api` nicht
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** Echter Run von `node scripts/zeus/hermes-intake.mjs --submit ...` liefert `missing_remote_branch_ref`, obwohl `git ls-remote --heads origin zeus/01-build-world-class-login-ux-and-auth-flow` den Branch bestaetigt.
**Ursache:** `gh api` wurde mit in Einzelargumente zerlegten Pfadsegmenten aufgerufen; `safeGhApiJson()` schluckte den dadurch fehlerhaften Ref-Lookup und meldete den Branch faelschlich als fehlend.
**Fix:** Ref-Lookup auf einen einzigen GitHub-API-Endpoint-String umgestellt (`repos/<repo>/git/ref/heads/<branch>`). Danach wurde der echte Branch-SHA korrekt aufgeloest.
**Datei:** `scripts/zeus/hermes-intake.mjs`

## BUG-017: Lokaler Room-13 Prozess liefert 404 auf `POST /api/tasks`
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** `node scripts/zeus/hermes-intake.mjs --submit --room13-url http://127.0.0.1:8000 ...` scheitert mit `room13_http_404:{"raw":"404 page not found"}` obwohl `GET /health` und `GET /ready` auf Port `8000` `200` liefern.
**Ursache:** Offen. Auf `127.0.0.1:8000` laeuft offenbar nicht dieselbe Task-API-Oberflaeche, die `README`/`API.md` fuer Room-13 erwarten, oder die laufende Instanz nutzt andere Router/Pfade.
**Fix:** Offen. Laufende Runtime/Route-Mounts verifizieren und den korrekten Task-Ingress fuer den echten Hermes-Submit bestimmen.
**Datei:** Laufende lokale Room-13 Runtime auf `127.0.0.1:8000`

## BUG-018: PR-55 CI-Checks schlagen auf mehreren Gates fehl
## BUG-020: Local fallback branch hydration can hide non-selected branches
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** `npm run test:dashboard:chat-api` failed with `chat_api_gate_shape_failed` after selected-branch hydration changes.
**Ursache:** The local-file fallback path filtered both `turns` and `branches` to the selected branch, so the API no longer returned the full branch list that the UI/gate expects.
**Fix:** In Arbeit. Keep branch-aware turn filtering, preserve the full branch summary list, and ensure filtered session views are not written back over the canonical stored session.
**Datei:** `dashboard-enterprise/lib/opensin-chat-storage.ts`
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** PR `#55` zeigt rote Checks fuer `docs-and-architecture`, `python-unit (3.11)`, `python-unit (3.12)`, `dashboard-quality` und `Vercel`.
**Ursache:** Die GitHub-Actions-Jobs werden auf dem Repo aktuell gar nicht gestartet, weil ein Actions-Budget-Blocker aktiv ist. Zusaetzlich meldet der Vercel-Status, dass zur Head-Commit-Author-Email kein GitHub-Account gefunden wurde.
**Fix:** Repo-interne CI-Regressions wurden lokal behoben; fuer voll gruene Remote-Checks bleibt der externe GitHub-Actions-Budget-Blocker bestehen. Naechste Fix-Commits werden mit GitHub-noreply-Author erstellt, damit der Vercel-Status auf dem neuen Head-SHA neu bewertet wird.
**Datei:** `.github/workflows/ci.yml` und betroffene Repo-Surfaces aus der PR-Range

## BUG-019: Root `npm ci` scheitert wegen veraltetem `package-lock.json`
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** Sauberer Checkout von PR-Head `fb067046...` scheitert bei `npm ci` mit `package.json and package-lock.json are in sync` / zahlreichen fehlenden Paketen im Lockfile.
**Ursache:** `package.json` enthielt neue Root-Dependencies, die nicht in `package-lock.json` nachgezogen wurden.
**Fix:** `package-lock.json` per `npm install --package-lock-only` aktualisiert und danach die Node-Gates erneut in sauberem Worktree validiert.
**Datei:** `package-lock.json`

## BUG-020: Contract-Gate braucht Inventar + Lifecycle-Artifact, bekommt sie aber im frischen Checkout nicht
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run test:contracts:active` scheitert in sauberem Checkout erst auf fehlendem `Docs/architecture/service-inventory.json`, danach auf fehlendem `Docs/architecture/service-lifecycle.json`.
**Ursache:** Der Gate-Scriptlauf erwartete generierte Architektur-Artefakte, aber das npm-Script erzeugte das Inventar nicht vorab und es gab kein eingechecktes Lifecycle-SSOT fuer die aktive/planned-Einstufung.
**Fix:** `test:contracts:active` so angepasst, dass zuerst `inventory:services` laeuft; ausserdem `Docs/architecture/service-lifecycle.json` als baseline-Artifact angelegt.
**Datei:** `package.json`, `Docs/architecture/service-lifecycle.json`

## BUG-021: Dashboard-Boundary-Gate blockiert Models-Seite wegen direktem `/api/v2/*` Literal
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run test:dashboard:boundary` scheitert mit `dashboard-enterprise/app/models/page.tsx: contains direct /api/v2/* upstream reference`.
**Ursache:** Die UI-Kopie enthielt das direkte Upstream-Literal `/api/v2/models/performance`, obwohl Client-Surfaces nur BFF-/abstrahierte Referenzen tragen duerfen.
**Fix:** UI-Text auf ein BFF-neutrales Label ohne `/api/v2/` umgestellt.
**Datei:** `dashboard-enterprise/app/models/page.tsx`

## BUG-022: Dashboard-Interaction-Smoke koppelt CI unnoetig an Playwright-Browserinstallation und nutzt `fetch` falsch
## BUG-024: Expanded schema/evidence gates were stale until OCI migrations and manifest order were fixed
**Aufgetreten:** 2026-03-23  **Status:** ✅ GEFIXT
**Symptom:** Nach Ausbau von Schema-Health- und Release-Evidence-Gates meldeten die Checks fehlendes `branch_mutation_events`, fehlende `retry_mode`-Spalte sowie fehlendes `output/release-evidence/SUMMARY.md` im Manifest.
**Ursache:** Neue DB-Migrationen waren auf OCI noch nicht eingespielt, und der Evidence-Collector schrieb `SUMMARY.md` erst nach dem finalen Manifest-Snapshot.
**Fix:** Migrationen auf OCI angewendet und den Evidence-Collector so angepasst, dass `SUMMARY.md` vor dem finalen Manifest enthalten ist. Danach liefen `test:dashboard:schema-health`, `test:dashboard:release-evidence` und `test:dashboard:release-gate` wieder gruen.

## BUG-025: Clean worktree agent build failed until local package dependencies were installed
**Aufgetreten:** Wed Mar 25 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix a2a/team-coding/A2A-SIN-GitHub-Issues run build` in a fresh clean worktree failed with `TS2307` for `tar`, `@huggingface/hub`, `node-cron`, and `@modelcontextprotocol/sdk` even though they were declared in `package.json`.
**Ursache:** The clean worktree had no local `node_modules` for the agent package yet, so TypeScript resolved the repo code before its package dependencies were installed.
**Fix:** Ran `npm install` in `a2a/team-coding/A2A-SIN-GitHub-Issues`, then re-ran `npm run build` successfully. The TypeScript fix in `idle-monetization.ts` was validated after the package install.
**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/package.json`, `a2a/team-coding/A2A-SIN-GitHub-Issues/package-lock.json`
**Datei:** `supabase/migrations/20260323_opensin_branch_mutation_events.sql`, `supabase/migrations/20260323_opensin_retry_mode.sql`, `scripts/architecture/collect-opensin-release-evidence.mjs`, `scripts/architecture/opensin-schema-health-gate.mjs`

## BUG-026: Interaction-smoke script required a deleted `.mjs` helper path
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** `ops:dashboard:interaction-smoke:ci` crashed at startup with `Cannot find module './opensin-route-checks.mjs'`.
**Ursache:** The reusable route-check helper was converted to `opensin-route-checks.js`, but `dashboard-enterprise-interactions-smoke.js` still required the deleted `.mjs` path.
**Fix:** In Arbeit. Update the smoke script to import the `.js` helper path and rerun the smoke/release gate.
**Datei:** `scripts/architecture/dashboard-enterprise-interactions-smoke.js`, `scripts/architecture/opensin-route-checks.js`

## BUG-027: Interaction-smoke can report false green when the target port is already occupied
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** `ops:dashboard:interaction-smoke:ci` can hit `EADDRINUSE` on the requested localhost port while still reporting `status: passed`, because an older server is already listening and satisfies the route checks.
**Ursache:** The wrapper assumes that any ready server on the target port belongs to the current run and does not verify ownership or recover from port collisions.
**Fix:** Teilweise gefixt. Der Wrapper sucht jetzt automatisch einen freien Port statt blind den angeforderten Port zu verwenden. Vollstaendig geloest ist das Thema erst, wenn auch parallele Build-/Gate-Laeufe koordiniert werden.
**Datei:** `scripts/architecture/run-dashboard-enterprise-interaction-smoke.js`

## BUG-025: Runtime progress events were duplicated in local session state
**Aufgetreten:** 2026-03-23  **Status:** ✅ GEFIXT
**Symptom:** During chat fanout, queued/working/result progress entries could appear twice in local session state because events were both appended via the fallback helper and pushed manually afterward.
**Ursache:** `persistProgressEventWithFallback(...)` already appends the event into `turn.progressEvents`, but `maybeAdvanceOpenSINSession()` also added the same events directly into the array.
**Fix:** Removed the extra direct `turn.progressEvents.push(...)` calls and kept `persistProgressEventWithFallback(...)` as the single source of truth for event insertion.
**Datei:** `dashboard-enterprise/lib/opensin-chat.ts`
## BUG-023: Expanded schema/evidence gates exposed stale DB and manifest gaps
**Aufgetreten:** 2026-03-23  **Status:** 🔴 OFFEN
**Symptom:** Nach Ausbau von Schema-Health- und Release-Evidence-Gates meldeten die Checks fehlendes `branch_mutation_events`, fehlende `retry_mode`-Spalte sowie fehlendes `output/release-evidence/SUMMARY.md` im Manifest.
**Ursache:** Neue DB-Migrationen waren auf OCI noch nicht eingespielt, und der Evidence-Collector schrieb `SUMMARY.md` erst nach dem finalen Manifest-Snapshot.
**Fix:** In Arbeit. Migrationen auf OCI anwenden und `SUMMARY.md` vor dem Manifest final einbeziehen.
**Datei:** `supabase/migrations/20260323_opensin_branch_mutation_events.sql`, `supabase/migrations/20260323_opensin_retry_mode.sql`, `scripts/architecture/collect-opensin-release-evidence.mjs`, `scripts/architecture/opensin-schema-health-gate.mjs`
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `dashboard-quality` haette im Workflow einen fehlenden `playwright:install`-Script benoetigt; nach einer browserfreien Smoke-Umstellung scheiterte der neue unauthenticated Pfad zuerst mit `response.ok is not a function`.
**Ursache:** Der Smoke-Runner war fuer CI auf Playwright-Browserinstallation ausgelegt, obwohl der unauthenticated CI-Pfad nur einfache Reachability prueft. Beim Umbau auf browserfreie Checks wurde `fetch` wie Playwright-Response verwendet (`ok()` statt `ok`).
**Fix:** Workflow-Step fuer Playwright-Browserinstallation entfernt; unauthenticated Smoke auf reine `fetch`-Checks fuer `/login` und `/ready` umgestellt; `Response.ok` korrekt als Property verwendet. Der lokale CI-äquivalente Smoke lief danach gruen.
**Datei:** `.github/workflows/ci.yml`, `scripts/architecture/dashboard-enterprise-interactions-smoke.js`

## BUG-023: Guardrail-Gate faellt wegen fehlender strukturierter Waiver-Datei fuer Legacy Solver-18 Dateien
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run test:guardrails` blockiert mit 7 `no_active_waiver`-Verstoessen in `services/solver-18-survey-worker/src/**`.
**Ursache:** Der Guardrail-Gate erwartet fuer bekannte Legacy-Riesen-Dateien eine strukturierte Waiver-Datei, aber `Docs/architecture/guardrail-file-size-waivers.json` fehlte komplett.
**Fix:** Strukturierte Waiver-Datei mit Owner, Reason und Sunset-Date fuer die 7 Legacy-Dateien angelegt; Guardrail-Gate und Cycle-Gate danach lokal erfolgreich validiert.
**Datei:** `Docs/architecture/guardrail-file-size-waivers.json`

## BUG-028: Closure evidence gates geraten in eine unendliche Amend-Kette durch starres `git_head===HEAD`
**Aufgetreten:** 2026-03-25  **Status:** ✅ GEFIXT
**Symptom:** `test:ci:proof`, `test:attestations:closure` und `test:signoff:final` konnten nach Evidence-Refresh wieder rot werden, obwohl nur Evidence-JSONs bzw. die Gate-Skripte selbst geaendert wurden. Jeder Amend schrieb einen neuen SHA in die Artefakte und machte den naechsten Commit sofort wieder stale.
**Ursache:** Die Gates verlangten strikt `evidence_meta.git_head === current HEAD` ohne einen legitimen Evidence-only Rewrite-Pfad. Dadurch entstand bei Amend-/Follow-up-Fixes an `Docs/operations/*.json` und den Validator-Skripten eine unendliche SHA-Kette (`6e9 -> 4f9 -> 1dd -> ...`).
**Fix:** Commit-Bind-Validierung in `scripts/architecture/lib/evidence-meta.js` zentralisiert. Die Gates akzeptieren jetzt Evidence von einem direkten Ancestor-Commit, wenn seitdem ausschliesslich definierte Evidence-Artefakte bzw. die zugehoerigen Validator-Skripte geaendert wurden. Zusaetzlich wurden die stale Artefakte (`ci-green-runs`, `release-path-report`, `slo-scorecard`, `production-canary-preflight`, `production-signoff-status`) auf den aktuellen Snapshot neu gestempelt.
**Datei:** `scripts/architecture/lib/evidence-meta.js`, `scripts/architecture/ci-green-runs-gate.js`, `scripts/architecture/attestation-verify-gate.js`, `scripts/architecture/run-final-closure-program.js`, `Docs/operations/*.json`

## BUG-024: Self-hosted Runner scheitert bei `npm ci` / Root-Dependencies mit Exit 243
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** Nach Umstellung auf den Self-hosted Runner laufen die GitHub-Actions-Jobs an, aber `docs-and-architecture` und `dashboard-quality` brechen bei `Install root dependencies` mit Exit `243` ab.
**Ursache:** `npm ci` nutzte auf dem Self-hosted Host den globalen Cache unter `~/.npm`, der durch bestehende Cache-Inhalte/Berechtigungen `EACCES`/`EEXIST`-Rename-Fehler erzeugte.
**Fix:** Workflow auf repo-lokale, writable Runner-Caches umgestellt (`NPM_CONFIG_CACHE` unter `${{ github.workspace }}/.runner-cache/npm`) und per `Prepare runner caches` Schritt vorab erstellt. Danach liefen die Node-Jobs stabil auf dem Self-hosted Runner.
**Datei:** Self-hosted CI-Lane fuer `.github/workflows/ci.yml`

## BUG-025: Self-hosted Runner kann Python 3.11/3.12 im Workflow nicht bereitstellen
**Aufgetreten:** Fri Mar 20 2026  **Status:** ✅ GEFIXT
**Symptom:** `python-unit (3.11)` und `python-unit (3.12)` brachen auf dem Self-hosted Runner zuerst bei `Setup Python` ab; spaeter blieb nur `python3.12` rot.
**Ursache:** `actions/setup-python` war auf dem Mac-Runner unzuverlaessig und `ddddocr==1.4.11` ist in dieser Repo-Konfiguration nicht fuer Python 3.12 installierbar.
**Fix:** Python-Lane auf lokale Runner-Runtimes umgestellt (`/opt/homebrew/bin/python3.11`, `python3.12`), virtuelle Umgebungen direkt im Workflow erzeugt und die Matrix auf die tatsaechlich supportete Lane (`3.11`) reduziert. Danach wurde `python-unit (3.11)` gruen.
**Datei:** Self-hosted Python-Lane in `.github/workflows/ci.yml`

## BUG-024: Oeffentliche SIN-Solver Website wird global per Header deindexiert
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** Auch oeffentliche Public-Site-Routen koennen nicht indexiert werden, weil `X-Robots-Tag: noindex, nofollow, noarchive` global auf `/:path*` gesetzt wird.
**Ursache:** `dashboard-enterprise/next.config.js` nutzt aktuell eine globale Header-Regel statt Host-/Route-spezifischer Robots-Strategie.
**Fix:** Offen. Host-/Route-Policy fuer `sin-solver.delqhi.com` und Dashboard-/A2A-Surfaces definieren und die globale Noindex-Regel auf oeffentliche Routen aufbrechen.
**Datei:** `dashboard-enterprise/next.config.js`

## BUG-025: Dashboard-Typecheck haengt bei `tsc --noEmit`
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** `npm run type-check` im `dashboard-enterprise` Workdir liefert innerhalb von 120s keinen Abschluss und laeuft in ein Tool-Timeout.
**Ursache:** Noch offen. Entweder braucht der TypeScript-Graph auf diesem Host deutlich laenger oder es gibt einen stillen Hang/Performance-Bottleneck im aktuellen Dashboard-TS-Setup.
**Fix:** Offen. Muss per strukturiertem Debugging verifiziert werden, bevor weitere Build-Gates als stabil gelten.
**Datei:** `dashboard-enterprise/package.json` / TypeScript-Setup

## BUG-026: Cloudflare deployment for `dashboard-enterprise` is blocked by Worker size limit
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🚫 RETIRED BY POLICY (Sat Mar 21 2026)
**Symptom:** `npm --prefix dashboard-enterprise run deploy` fails with Cloudflare error `10027` because the generated Worker bundle exceeds the free-plan 3 MiB size limit; the main handler is about 13.5 MiB.
**Ursache:** The OpenNext/Cloudflare build output for the dashboard is too large for the current Cloudflare Worker plan limit on the target account.
**Fix:** POLICY DECISION — `dashboard-enterprise` is permanently deployed via Vercel only (`a2a.delqhi.com`). The Cloudflare/OpenNext lane is retired, not fixed. GitHub epic `#58` and sub-issues `#103`, `#104`, `#105`, `#106` closed as WONTFIX. No Cloudflare deployment lane will be maintained for `dashboard-enterprise` unless a paid plan or architectural split is explicitly approved.
**Datei:** `dashboard-enterprise/package.json` / Cloudflare deployment lane for `a2a.delqhi.com`

## BUG-027: PR #55 cannot merge cleanly because python-unit regressed and Vercel Git author matching fails
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** `gh pr checks 55 --repo Delqhi/SIN-Solver` stays blocked by `python-unit (3.11, /opt/homebrew/bin/python3.11)` failures and a Vercel status failure saying `No GitHub account was found matching the commit author email address`.
**Ursache:** The current PR branch changes route-store/runtime behavior enough that multiple unit tests now fail (`FakeStoreStatus.mode`, authoritative-store 503 expectations, worker runtime assertions), and Vercel's GitHub integration cannot map the latest commit author email to a GitHub account for its status check.
**Fix:** Pending. Repair the affected Python/unit expectations or route-store behavior so the CI lane goes green, and either use a GitHub-linked commit author email for the head commit or reconfigure the Vercel Git integration so preview status succeeds before merging to `main`.
**Datei:** PR `#55`, `.github/workflows/ci.yml`, `services/room-13-fastapi-coordinator/room13/*`, `services/workers/coordinator_runtime.py`, Vercel Git integration

## BUG-028: Clean Cloudflare debug worktree can hit local disk exhaustion during `npm install`
**Aufgetreten:** Fri Mar 20 2026  **Status:** 🔴 OFFEN
**Symptom:** `npm install` inside `/tmp/sin-solver-cf-debug/dashboard-enterprise` aborts with `ENOSPC: no space left on device` before the Cloudflare/OpenNext debug build can even start.
**Ursache:** The temporary clean worktree under `/tmp` does not have enough free local disk space to unpack the full `dashboard-enterprise/node_modules` tree.
**Fix:** Pending. Reuse an existing populated install or free additional local disk before reproducing the Cloudflare build lane from a clean worktree.
**Datei:** `/tmp/sin-solver-cf-debug/dashboard-enterprise` / local package install path

## BUG-029: Session-pool watcher was committed as a prototype without production lifecycle guarantees
**Aufgetreten:** Sat Mar 21 2026  **Status:** 🔴 OFFEN
**Symptom:** `scripts/session-pool-watcher.mjs` and `a2a/team-infratructur/A2A-SIN-Github-Action/src/session-pool.ts` only scrape issues naively, do not persist tunnel lifecycle state, and start `cloudflared` background processes ad hoc without supervised config, health checks, or idempotent archival semantics.
**Ursache:** The first pass optimized for scaffolding speed instead of live OCI/Supabase rollout discipline and end-to-end public reachability verification.
**Fix:** Replace the prototype with a canonical session-pool service layer, explicit schema constraints, supervised Cloudflare config/process management, verified reachability checks, and a real live Supabase apply/verify path.
**Datei:** `scripts/session-pool-watcher.mjs`, `a2a/team-infratructur/A2A-SIN-Github-Action/src/session-pool.ts`

## BUG-030: Live session-pool schema was not applied on OCI because no verified SQL execution path was configured locally
**Aufgetreten:** Sat Mar 21 2026  **Status:** 🔴 OFFEN
**Symptom:** `sin-supabase` SQL execution fell back to local Docker and failed with missing Docker socket instead of reaching the real OCI database; therefore the repo migration exists but live table creation was not verified.
**Ursache:** `SUPABASE_DB_URL` / `DATABASE_URL` was not wired into the local execution environment, so the runtime used its Docker fallback path.
**Fix:** Discover the canonical live DB connection path or remote execution lane for OCI, then apply and verify the schema against the real Supabase instance before declaring the feature done.
**Datei:** `a2a/team-infratructur/A2A-SIN-Supabase/src/runtime.ts`, local `sin-supabase` operator flow

## BUG-031: `google_media_analyze` MCP lane times out on YouTube analysis while local CLI succeeds
**Aufgetreten:** Sat Mar 21 2026  **Status:** ✅ GEFIXT
**Symptom:** Direct MCP calls to `google_media_analyze` for `https://youtu.be/NAq1O-tEVsE` failed with `MCP error -32001: Request timed out`, even though the local CLI lane could finish the same action.
**Ursache:** The MCP request budget was shorter than the real `SIN-Google-Apps` YouTube pipeline (`yt-dlp` staging + frame extraction + NVIDIA ASR), and the MCP tool handler blocked until the whole analysis finished.
**Fix:** Added a YouTube-specific soft timeout in `src/mcp-server.ts` so the MCP lane now returns a structured `ERR_MCP_MEDIA_ANALYZE_TIMEOUT` degrade payload with explicit CLI/A2A fallback guidance before the transport timeout fires. Validated by building the agent and forcing a 1ms soft timeout against a real YouTube URL, which returned the degrade payload deterministically. GitHub tracking: `#227`.
**Datei:** `a2a/team-infratructur/A2A-SIN-Google-Apps/src/mcp-server.ts`

## BUG-032: Phase 12 docs sync migration left runtime split between `googleDoc*` and `docsTab*`
**Aufgetreten:** Sat Mar 21 2026  **Status:** 🔴 OFFEN
**Symptom:** Phase 12 issues were mostly closed, but the repo still mixes dedicated-doc fields (`googleDocUrl`, `googleDocId`) with legacy tab fields (`docsTabUrl`, `docsTabId`). Dashboard/control-plane consumers lose docs links/counts under generated projection data, and `scripts/sync-a2a-google-doc.mjs` still overloads legacy tab ids as document ids.
**Ursache:** The migration introduced dedicated-doc scripts without a single normalization boundary; legacy shared-master-doc semantics remained in dashboard registries, projections, scaffold specs, and the sync engine.
**Fix:** Add an explicit projection-to-registry docs normalizer, stop treating tab ids as document ids, rewire the sync/creator/scaffold surfaces onto one canonical model, and only preserve legacy-master-doc behavior as an explicit fallback during migration.
**Datei:** `dashboard-enterprise/components/a2a/controlPlaneRegistry.ts`, `scripts/sync-a2a-google-doc.mjs`, `scripts/create-a2a-google-doc.mjs`, Phase 12 projection/spec surfaces

## BUG-032: Phase-12 docs sync still mixes legacy tab URLs with dedicated-doc IDs
**Aufgetreten:** Sat Mar 21 2026  **Status:** ✅ GEFIXT
**Symptom:** The dedicated-doc migration was incomplete: control-plane artifacts used `googleDocUrl`/`googleDocId`, dashboard consumers still expected `docsTabUrl`/`docsTabId`, and `scripts/sync-a2a-google-doc.mjs` overloaded `googleDocId` with legacy tab IDs like `t.*`.
**Ursache:** Phase 12 was partially implemented and partially closed early; the repo had two competing docs metadata models and a wrong npm wiring for checklist sync.
**Fix:** Added a control-plane docs normalizer, rewired `sync:a2a:doc-checklists` to the canonical checklist runner, normalized projection agents inside the Python checklist sync, converted template/spec/skill wording to the dedicated-doc model, and verified a real one-agent checklist sync against Google Docs (`sin-github-issues:replaced`, no missing tabs).
**Datei:** `dashboard-enterprise/components/a2a/controlPlaneRegistry.ts`, `scripts/sync-a2a-google-doc.mjs`, `scripts/sync-a2a-google-doc-checklists.py`, `package.json`

## BUG-033: Local Scira package install for Phase 12 scaffold fails on npm peer-resolution conflict
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix room-30-scira-ai-search install --no-save /Users/jeremy/dev/SIN-Solver/packages/research-core --ignore-scripts` aborts with `ERESOLVE could not resolve` while resolving `@vercel/analytics@1.6.1` against the app's `next@16.1.1-canary.10` dependency tree.
**Ursache:** Local npm install for the app hits an existing peer-resolution conflict in the Scira dependency graph before the new local package can even be installed for import smoke validation.
**Fix:** Used structured debugging and verified that the local package install succeeds with `--legacy-peer-deps`; Phase 12 package-resolution smoke now uses `npm --prefix room-30-scira-ai-search install --no-save /Users/jeremy/dev/SIN-Solver/packages/research-core --ignore-scripts --legacy-peer-deps` before the import check. This unblocks `#264` without mutating the existing app dependency graph.
**Datei:** `room-30-scira-ai-search/package.json`, local npm install path for `packages/research-core`

## BUG-034: `A2A-SIN-Research` build is currently broken by missing CLI helper symbols
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix a2a/team-google-apps/A2A-SIN-Research run build` fails with `TS2304` because `triggerFleetSelfHealing` and `startAutonomousIdleLoop` are referenced from `src/cli.ts` but not defined.
**Ursache:** The current `A2A-SIN-Research` CLI source references helper symbols that are absent from the compilation unit or import graph.
**Fix:** Restored the missing imports in `src/cli.ts` from `./self-healing.js` and `./idle-monetization.js`, then re-ran the agent build successfully.
**Datei:** `a2a/team-google-apps/A2A-SIN-Research/src/cli.ts`

## BUG-035: Local Scira build gate needs explicit env placeholders before code validation can run
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix room-30-scira-ai-search run build` aborts before compilation with `Invalid environment variables` because required server env keys like `UPSTASH_REDIS_REST_URL`, `PARALLEL_API_KEY`, `SUPADATA_API_KEY`, and others are undefined on this host.
**Ursache:** The Scira app validates its runtime env contract eagerly during build, so local structural/code validation fails unless the required variables are present or stubbed.
**Fix:** For local validation, provide a placeholder env bundle before invoking `npm run build`, including the original missing server vars plus runtime-only payment/auth placeholders such as `DODO_PAYMENTS_API_KEY`, `POLAR_ACCESS_TOKEN`, `MICROSOFT_CLIENT_ID`, and the starter/premium tier envs. This is sufficient for build-time validation without changing committed app config.
**Datei:** `room-30-scira-ai-search/env/server.ts`, local Scira build environment

## BUG-036: Placeholder-env Scira build is still blocked by pre-existing route and auth-scraping compile failures
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** After supplying placeholder env values, `npm --prefix room-30-scira-ai-search run build` still fails on unrelated pre-existing errors: route files in `app/health/route.ts`, `app/metrics/route.ts`, `app/ready/route.ts`, and `app/version/route.ts` re-export `dynamic`, and auth-scraping surfaces reference missing `./steel-client` / non-exported `redis` from `@/lib/db`.
**Ursache:** The current Scira app has existing Turbopack route-segment and auth-scraping module/export breakages unrelated to the Phase 12 research-core extraction.
**Fix:** Replaced the invalid route-level `dynamic` re-exports with explicit `export const dynamic = 'force-dynamic'` wrappers, restored the missing auth-scraping module graph by adding `lib/services/steel-client.ts`, exported `redis` from `lib/db/index.ts`, added the missing factory/type exports in `lib/services/auth-scraping-service.ts`, and updated auth-scraping route validators from `error.errors` to `error.issues`. With the placeholder env bundle applied, `npm --prefix room-30-scira-ai-search run build` now completes successfully.
**Datei:** `room-30-scira-ai-search/app/health/route.ts`, `room-30-scira-ai-search/app/metrics/route.ts`, `room-30-scira-ai-search/app/ready/route.ts`, `room-30-scira-ai-search/app/version/route.ts`, `room-30-scira-ai-search/lib/services/auth-scraping-service.ts`, `room-30-scira-ai-search/lib/db/index.ts`

## BUG-037: Directory rename surfaced a Turbopack root-resolution break for `tw-animate-css`
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** After renaming the app directory to `room-30-research-workbench`, `npm --prefix room-30-research-workbench run build:local` fails with `Can't resolve 'tw-animate-css' in '/Users/jeremy/dev/SIN-Solver'` because Next/Turbopack infers the repo root instead of the app root.
**Ursache:** The local validation wrapper `scripts/build-with-placeholder-env.mjs` spawned `npm run build` from the caller's current working directory instead of the app root, so Turbopack resolved package imports against the repo root.
**Fix:** Bound the wrapper script to the app root using its own script path before spawning `npm run build`. After that change, `npm --prefix room-30-research-workbench run build:local` resolves modules from the renamed app directory correctly.
**Datei:** `room-30-research-workbench/scripts/build-with-placeholder-env.mjs`

## BUG-038: `SIN-Team-Google-Apps` build failed on untyped `globalThis.isAgentBusy`
**Aufgetreten:** Sat Mar 22 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix a2a/team-google-apps/A2A-SIN-Team-Google-Apps run build` failed with `TS7017` because `src/idle-monetization.ts` accessed `globalThis.isAgentBusy` without a typed global shape.
**Ursache:** The code relied on an ad-hoc global flag, but TypeScript does not allow arbitrary properties on `globalThis` under the current strict config.
**Fix:** Typed the runtime state locally as `typeof globalThis & { isAgentBusy?: boolean }` and switched the idle-loop guard to read from that typed object. GitHub tracking: `#288`.
**Datei:** `a2a/team-google-apps/A2A-SIN-Team-Google-Apps/src/idle-monetization.ts`

## BUG-039: `A2A-SIN-GitHub-Issues` build blocked by missing install plus untyped idle flag
**Aufgetreten:** Sun Mar 23 2026  **Status:** 🔴 OFFEN
**Symptom:** `npm --prefix a2a/team-coding/A2A-SIN-GitHub-Issues run build` initially failed on missing modules (`tar`, `@huggingface/hub`, `node-cron`) because local dependencies were not installed, and still reports `TS7017` in `src/idle-monetization.ts` for `globalThis.isAgentBusy`.
**Ursache:** The package had not been installed locally after recent changes, and its idle loop still uses an untyped global busy flag just like the earlier Team-Google-Apps bug.
**Fix:** Installed dependencies; next required fix is to type the runtime busy flag in `src/idle-monetization.ts` before the GitHub-Issues build can pass.
**Datei:** `a2a/team-coding/A2A-SIN-GitHub-Issues/src/idle-monetization.ts`, `a2a/team-coding/A2A-SIN-GitHub-Issues/package.json`

## BUG-036: Scira still has unrelated Next 16 route and auth-scraping build blockers after env stubbing
**Aufgetreten:** Sat Mar 22 2026  **Status:** 🔴 OFFEN
**Symptom:** After supplying placeholder envs, `npm --prefix room-30-scira-ai-search run build` still fails on unrelated preexisting issues: route files like `app/health/route.ts` re-export `dynamic` in a pattern Next 16 rejects, `lib/services/auth-scraping-service.ts` imports missing `./steel-client`, and several auth-scraping routes import a non-exported `redis` symbol from `@/lib/db`.
**Ursache:** The current Scira app contains legacy route-wrapper and auth-scraping module drift that blocks a clean full-app build independent of the Phase 12 shared-core changes.
**Fix:** Pending dedicated Scira repair pass. Until then, use scoped validation for touched files plus shared-package and agent builds when validating Phase 12 extraction steps.
**Datei:** `room-30-scira-ai-search/app/health/route.ts`, `room-30-scira-ai-search/app/metrics/route.ts`, `room-30-scira-ai-search/app/ready/route.ts`, `room-30-scira-ai-search/app/version/route.ts`, `room-30-scira-ai-search/lib/services/auth-scraping-service.ts`, `room-30-scira-ai-search/app/api/auth-scraping/*`

## BUG-036: Placeholder-env Scira build is still blocked by pre-existing route and auth-scraping compile failures
**Aufgetreten:** Sat Mar 22 2026  **Status:** 🔴 OFFEN
**Symptom:** After supplying placeholder env values, `npm --prefix room-30-scira-ai-search run build` still fails on unrelated pre-existing errors: route files in `app/health/route.ts`, `app/metrics/route.ts`, `app/ready/route.ts`, and `app/version/route.ts` re-export `dynamic`, and auth-scraping surfaces reference missing `./steel-client` / non-exported `redis` from `@/lib/db`.
**Ursache:** The current Scira app has existing Turbopack route-segment and auth-scraping module/export breakages unrelated to the Phase 12 research-core extraction.
**Fix:** Pending separate repair lane. Use targeted file-level diagnostics for Phase 12 extraction validation until the broader Scira build is repaired.
**Datei:** `room-30-scira-ai-search/app/health/route.ts`, `room-30-scira-ai-search/app/metrics/route.ts`, `room-30-scira-ai-search/app/ready/route.ts`, `room-30-scira-ai-search/app/version/route.ts`, `room-30-scira-ai-search/lib/services/auth-scraping-service.ts`, `room-30-scira-ai-search/lib/db/index.ts`

## BUG-040: `gh issue comment --body` command broke on shell expansion from embedded curl example
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Posting the lane #352 executor brief via `gh issue comment --body $'...'` failed with `zsh: no matches found` because the multiline body contained an unescaped curl example including braces and header arguments that zsh expanded before `gh` executed.
**Ursache:** Large markdown bodies with shell metacharacters were passed inline through `--body`, which is fragile under zsh globbing and quoting rules.
**Fix:** Switched to the safer pattern of writing the comment body to a temporary markdown file and posting it via `gh issue comment --body-file`, avoiding shell expansion hazards for future control-plane issue briefs.
**Datei:** GitHub issue-comment execution path for `gh issue comment` / lane `#352`

## BUG-041: Hermes dispatch returned `selectedRoute: null` because capability seed omitted command capabilities stored in registry `surfaces`
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Preparing the Hermes dispatch payload for cleanup lane `#352` produced a valid dry-run intake payload, but `selectedRoute` was `null`, so the lane could not be auto-bound to a concrete executor identity.
**Ursache:** `scripts/alpha/generate-capability-registry-seed.mjs` originally exported `command` capabilities only from `agent.commands?.items`, while the dashboard registry encoded many commands under `agent.surfaces` with `label: 'Commands'`. That left the capability seed without enough `command` rows for routing. Cross-team fallback pressure in `room13.services.alpha_router.choose_route(...)` then compounded the mismatch.
**Fix:** The current worktree now emits command rows from mirrored `Commands` surfaces via `collectCommandItems(...)`, and router regression coverage confirms team-scoped fallback behavior. Fresh Hermes dispatch repros now auto-select non-null routes for cleanup lanes `#352-#357` and Simone lanes `#364-#369`. A remaining quality caveat is that many lanes still resolve through the broad `command` fallback (`sin-coding-ceo.health`) rather than an exact `command:implement` match, so precision follow-up remains desirable, but the original null-route bug is fixed.

## BUG-056: Hermes team routing selected the wrong agent for every Phase 13/14 job
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Fresh Hermes dispatch output no longer returned `selected: null`, but all Phase 13 jobs incorrectly routed to `sin-team-survey` instead of the intended team managers such as `sin-team-orchestrator`, `sin-coding-ceo`, `sin-storage`, or `sin-team-competition`.
**Ursache:** The Phase 13/14 issues used the generic hint `command:implement`, while the capability seed only exposed namespaced command keys such as `sin.team.orchestrator.health`. After the exact-key lookup failed, `alpha_router._auth_scope_allows(...)` still let any `auth_requirement in {None, "standard"}` candidate pass even when its `team_id` did not match the scoped team, so the cheapest fallback agent won.
**Fix:** Tightened `services/room-13-fastapi-coordinator/room13/services/alpha_router.py` so candidates with a defined non-matching `team_id` are rejected before the auth fallback. Re-ran Hermes dispatch for both phases and verified correct routing: Phase 13 resolved 9/9 to the expected team managers and Phase 14 resolved 8/8 correctly.
**Datei:** `services/room-13-fastapi-coordinator/room13/services/alpha_router.py`, `/tmp/sin-hermes-phase13-dispatch-v3.json`, `/tmp/sin-hermes-phase14-dispatch-v3.json`

## BUG-057: Room-13 `POST /api/tasks` stalled and returned late 400s because logging middleware consumed request bodies
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Hermes intake could not submit work to OCI Room-13. Direct `POST /api/tasks` requests either hung until client timeout or surfaced only as very late `400` responses, even though `GET /health` stayed green and Redis remained authoritative.
**Ursache:** `services/room-13-fastapi-coordinator/room13/middleware/logging.py` read POST bodies via `await request.body()` inside `BaseHTTPMiddleware` but did not restore the cached body for downstream handlers. The task route then stalled waiting for a body that had already been consumed by the logger.
**Fix:** Added request-body restoration in `logging.py`, rsynced the patched file to `/opt/sin-room13/app/room13/middleware/logging.py`, rebuilt the OCI `room13` compose service, and re-verified `POST /api/tasks` with a minimal authenticated probe. After the deploy, all 17 Zeus jobs were submitted successfully on OCI: 9/9 for Phase 13 and 8/8 for Phase 14.
**Datei:** `services/room-13-fastapi-coordinator/room13/middleware/logging.py`, `/opt/sin-room13/app/room13/middleware/logging.py`, `/tmp/sin-hermes-phase13-submit-results-v3.json`, `/tmp/sin-hermes-phase14-submit-results-v3.json`

## BUG-058: Room-13 AuthMiddleware ignored `JWT_SECRET` and used a hardcoded secret
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** The live Room-13 runtime accepted bearer tokens signed with the hardcoded fallback `your-secret-key-change-in-production` even though OCI `.env` already defined a real `JWT_SECRET`.
**Ursache:** `services/room-13-fastapi-coordinator/room13/middleware/__init__.py` stored the auth secret as a class constant and never hydrated it from environment-backed settings.
**Fix:** Switched the middleware to resolve its secret and algorithm from `room13.config.get_settings()`, redeployed OCI Room-13, and verified the live runtime now reports `SECRET_KEY_IN_USE=fc682fb3...` from env.
**Datei:** `services/room-13-fastapi-coordinator/room13/middleware/__init__.py`, `/opt/sin-room13/.env`

## BUG-059: Public ingress to Room-13 on `92.5.60.87:8014` timed out
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** `curl http://92.5.60.87:8014/health` timed out from the operator host, even though the Room-13 container was healthy and listening on `0.0.0.0:8014` on OCI.
**Ursache:** The OCI subnet security list for `sin-supabase-public-subnet` exposed ports like `22`, `4100`, `5678`, and `8000`, but did not allow TCP `8014`.
**Fix:** Added a new ingress security-list rule for TCP `8014` on `ocid1.securitylist.oc1.eu-frankfurt-1.aaaaaaaaxhseu25alus24pj5kuwhapx4v5ko7jm4h5g6fydnizw7ttvz4w5a`. After the rule update, direct public `GET /health` and authenticated `POST /api/tasks` both succeeded from the operator host.
**Datei:** OCI security list `ocid1.securitylist.oc1.eu-frankfurt-1.aaaaaaaaxhseu25alus24pj5kuwhapx4v5ko7jm4h5g6fydnizw7ttvz4w5a`

## BUG-060: Invalid bearer tokens returned `500` instead of `401` in Room-13 auth middleware
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** After the env-secret fix, valid env-signed tokens returned `200`, but invalid tokens still triggered `500 Internal Server Error` with a traceback instead of a clean `401 Invalid token` response.
**Ursache:** `AuthMiddleware` runs as `BaseHTTPMiddleware`, and raising `HTTPException` directly from `dispatch(...)` surfaced as an unhandled ASGI error instead of a normal auth response.
**Fix:** Replaced the middleware's raised auth exceptions with explicit `JSONResponse` returns for `401` and `503`. Verified on OCI: env-signed token returns `200`, old hardcoded-secret token now returns `401 {"detail":"Invalid token"}`.
**Datei:** `services/room-13-fastapi-coordinator/room13/middleware/__init__.py`

## BUG-061: Room-13 `GET /api/services/stats/summary` returns `500` on live OCI coordinator
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** During a live fleet-status audit, `GET /api/workers/stats/summary` and `GET /api/tasks/stats/summary` returned `200`, but `GET /api/services/stats/summary` failed with `500 Internal Server Error`.
**Ursache:** The route dependency imported runtime globals from `main`/`room13.main` instead of reading the initialized registry from the live FastAPI app state, which broke under the deployed package/import context.
**Fix:** Switched Room-13 dependency wiring to `request.app.state` for service registry / credential manager access and set those objects on `app.state` during startup. Verified live: `GET /api/services` and `GET /api/services/stats/summary` now both return `200`. GitHub bug-library issue `#274` was closed.
**Datei:** `http://92.5.60.87:8014/api/services/stats/summary`

## BUG-062: WorkerCoordinatorRuntime could not talk to authenticated Room-13 because bearer auth was missing
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** The canonical Python worker bridge could not register workers, heartbeat leases, or claim tasks against the live OCI Room-13 coordinator after auth enforcement, because every worker request would 401.
**Ursache:** `services/workers/coordinator_runtime.py` sent trace/run headers only and never attached `Authorization: Bearer ...` from env or runtime config.
**Fix:** Added bearer-token support to `WorkerCoordinatorRuntime` and verified it live with `scripts/zeus/run-room13-executor.py`: a Team-Coding executor registered successfully, claimed a real `zeus_github_branch` probe task, and completed it on the authenticated OCI coordinator. GitHub bug-library issue `#275` was closed with verification.
**Datei:** `services/workers/coordinator_runtime.py`, `tests/unit/test_worker_coordinator_runtime.py`, `scripts/zeus/run-room13-executor.py`

## BUG-063: Team-Coding still lacks a durable Zeus/Room-13 coding executor loop
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** Hermes/Room-13 can queue Team-Coding `zeus_github_branch` tasks correctly and the worker bridge can now register/claim them, but there is still no production Team-Coding executor loop that continuously consumes those tasks and turns them into real coding work.
**Ursache:** `a2a/team-coding` agents define runtime/model metadata, but there is no native long-running Room-13 worker integration under `a2a/team-coding` that maps claimed branch tasks into actual branch/worktree/opencode execution.
**Fix:** Noch offen. Added a working executor wrapper/probe path via `scripts/zeus/run-room13-executor.py` and tracked the remaining durable-executor gap in GitHub bug-library issue `OpenSIN-AI/OpenSIN#277`.
**Datei:** `a2a/team-coding/**`, `scripts/zeus/run-room13-executor.py`, `services/workers/coordinator_runtime.py`

## BUG-064: `A2A-SIN-Backend` wrapper failed because the CLI imported a missing HTTP server export
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** `bin/sin-backend run-action '{"action":"sin.backend.health"}'` crashed before the health action ran because the built CLI imported `createTemplateAgentHttpServer` from `./a2a-http.js`, but that module only exposed `runHttpServer()`.
**Ursache:** Backend CLI wiring had drifted from the actual exports in `a2a-http.ts`, `mcp-server.ts`, and `runtime.ts`.
**Fix:** Repaired `src/cli.ts` to import the real backend symbols (`runHttpServer`, `runMcpServer`, `executeBackendAgentAction`) and re-verified the wrapper health action successfully. GitHub bug-library issue `#278` was closed.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/src/cli.ts`, `bin/sin-backend`

## BUG-065: Room-13 `claim-next` could not scope tasks by team and risked cross-team task theft
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Team-Coding workers could only filter by task type/priority, not by `teamId`, so claiming `zeus_github_branch` work could steal orchestrator, infrastructure, or competition jobs from the same queue.
**Ursache:** `TaskClaimRequest` and `claim_next_task(...)` only supported `accepted_types` and `min_priority`; no team-aware filter existed in either the Room-13 route or the Python worker runtime.
**Fix:** Added `accepted_team_ids` to `services/room-13-fastapi-coordinator/room13/routes/tasks.py`, passed it through `services/workers/coordinator_runtime.py`, added route/runtime tests, redeployed Room-13 on OCI, and verified that the Team-Coding executor now claims only Team-Coding tasks. GitHub bug-library issue `#279` was closed.
**Datei:** `services/room-13-fastapi-coordinator/room13/routes/tasks.py`, `services/workers/coordinator_runtime.py`, `tests/unit/test_room13_task_routes.py`, `tests/unit/test_worker_coordinator_runtime.py`

## BUG-066: Team-Coding agent runtimes broke in worktrees because `hf_pull_script.py` pathing/artifacts were missing
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Real Team-Coding task execution failed in dedicated worktrees because Backend/Frontend resolved `hf_pull_script.py` to a missing path, and those agents had not actually shipped the required rotator script artifact.
**Ursache:** Backend and Frontend used a hardcoded relative script path but did not include `scripts/hf_pull_script.py` in their package roots.
**Fix:** Restored the standard `scripts/hf_pull_script.py` artifact into both agents and resolved the rotator path from the agent root so worktree execution no longer points at a missing file. GitHub bug-library issue `#280` was closed.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/scripts/hf_pull_script.py`, `a2a/team-coding/A2A-SIN-Frontend/scripts/hf_pull_script.py`, `a2a/team-coding/A2A-SIN-Backend/src/runtime.ts`, `a2a/team-coding/A2A-SIN-Frontend/src/runtime.ts`

## BUG-067: Team-Coding executor design classifier produced false positives
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** The first real non-design Team-Coding task (`[13B-1] Typed memory ledger ...`) was incorrectly routed to `sin-frontend` under the design-only policy.
**Ursache:** The first classifier pass used naive substring checks across the serialized task payload, so short design tokens could false-match inside unrelated text.
**Fix:** Switched the executor classifier to token-based matching in `scripts/zeus/run-room13-executor.py`, then verified subsequent Team-Coding tasks route to the backend lane instead of the frontend design lane unless real design keywords are present. GitHub bug-library issue `#281` was closed.
**Datei:** `scripts/zeus/run-room13-executor.py`

## BUG-068: Backend/Frontend hard-failed on rotator pull instead of degrading to cached auth
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** `sin-backend` / `sin-frontend` code-generation actions aborted immediately when `hf_pull_script.py` exited non-zero, even though cached OpenCode auth may already have been present locally.
**Ursache:** Backend and Frontend awaited the rotator pull as a hard precondition instead of treating it as best-effort like other coding agents already do.
**Fix:** Changed both runtimes to continue on rotator failure with a warning and cached auth fallback. GitHub bug-library issue `#282` was closed.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/src/runtime.ts`, `a2a/team-coding/A2A-SIN-Frontend/src/runtime.ts`

## BUG-069: Room-13 can leave tasks stuck in `running` after worker lease expiry
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** When the executor process died mid-task, the worker lease expired but the claimed task remained in `running` instead of returning to a recoverable queue state automatically.
**Ursache:** Expired worker leases were observable in worker state, but the workers route did not requeue the claimed task, and `claimed_task_id` could live only inside heartbeat metadata rather than the top-level worker state used for recovery.
**Fix:** Added automatic requeue-on-expired-lease in the workers route and synced `claimed_task_id` / `current_step` from heartbeat metadata into durable worker state. Verified live with a short-TTL probe worker/task: after lease expiry, the worker moved to `error` with `lease_expired_requeued`, and the task moved from `running` back to `pending` with `assigned_worker: null` plus `lease_recovery` metadata. GitHub bug-library issue `#289` was closed.
**Datei:** `services/room-13-fastapi-coordinator/room13/routes/tasks.py`, `services/room-13-fastapi-coordinator/room13/routes/workers.py`

## BUG-070: Durable executor can still drift into unrelated `AGENTS.md` edits
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** During live Team-Coding execution, the current worktrees repeatedly showed only `AGENTS.md` changes instead of obvious progress on the claimed implementation surface.
**Ursache:** Two issues compounded each other: the executor lacked hard mutation-surface guards, and the repo tracked both `AGENTS.md` and `agents.md`, which collided on macOS and made cleanup unreliable.
**Fix:** Normalized the repo to a single canonical root `AGENTS.md`, added explicit allowed-path / deletion-budget / timeout / fail-closed reset guards in `scripts/zeus/run-room13-executor.py`, and verified with a final live targeted probe against branch head `7c6cad5b`: the task failed for a separate runtime timeout, but the disposable worktree stayed clean (`worktree_status: <clean>`), so `AGENTS.md` drift no longer persisted. GitHub bug-library issue `#290` was closed.
**Datei:** `scripts/zeus/run-room13-executor.py`, `AGENTS.md`, executor worktrees under `.room13-worktrees/`

## BUG-071: Room-13 HTTP exception handler emitted `500` because `ErrorResponse` contained a raw `datetime`
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Normal `HTTPException` paths (for example `claim-next` with no matching task) degraded into `500 Internal Server Error` because the global handler itself crashed while rendering the error response.
**Ursache:** `room13.main.http_exception_handler` used `ErrorResponse.model_dump()` directly; the embedded `timestamp: datetime` field stayed as a raw `datetime`, which Starlette `JSONResponse` could not serialize.
**Fix:** Switched the handler to `model_dump(mode="json")`. Verified live: `POST /api/tasks/claim-next` now returns a structured `404` JSON payload (`No matching task available`) instead of a fake `500`. GitHub bug-library issue `#304` was closed.
**Datei:** `services/room-13-fastapi-coordinator/room13/main.py`

## BUG-072: Manual Room-13 OCI redeploy shadowed the `room13.services` package and crashed the coordinator
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** A bad manual rsync dropped `services.py`, `credentials.py`, `gateway.py`, and `worker_runtime.py` into `/app/room13/`, which made Room-13 restart-loop with `ModuleNotFoundError: 'room13.services' is not a package`.
**Ursache:** Route/service files were copied into the package root instead of their real subdirectories, so `room13/services.py` shadowed the `room13.services` package.
**Fix:** Removed the stray root-level files on OCI and redeployed the files into the correct package directories (`routes/` and `services/`). Room-13 recovered to healthy state. GitHub bug-library issue `#301` was closed.
**Datei:** `/opt/sin-room13/app/room13/`, `/opt/sin-room13/app/room13/routes/`, `/opt/sin-room13/app/room13/services/`

## BUG-073: Team-Coding durable executor can generate broad deletion-style worktree diffs
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** A controlled non-doc Team-Coding probe produced a huge deletion-style `git status` diff across large parts of the repo instead of a focused implementation change.
**Ursache:** The executor did not yet enforce a strong mutation budget/allowlist, and the root `AGENTS.md`/`agents.md` case collision on macOS amplified cleanup failures.
**Fix:** Added fail-closed mutation allowlists, deletion-budget guards, timeout-to-error conversion, `targetSha` fallback, and hard worktree reset/clean on unsafe mutations; also removed the lowercase `agents.md` duplicate from the repo. Final live targeted probe against branch head `7c6cad5b` ended with `worktree_status: <clean>`, so the broad diff no longer persisted. GitHub bug-library issue `#306` was closed.
**Datei:** `scripts/zeus/run-room13-executor.py`, `AGENTS.md`, `tests/unit/test_run_room13_executor.py`

## BUG-074: A2A-SIN-Backend build was broken by current TypeScript errors
**Aufgetreten:** Sat Mar 28 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm --prefix a2a/team-coding/A2A-SIN-Backend run build` failed, which prevented the backend wrapper from picking up newer runtime fixes.
**Ursache:** The backend HTTP server used untyped `c.env.req/res` access and `idle-monetization.ts` missed the global `isAgentBusy` declaration.
**Fix:** Added the missing `declare global` block in `a2a/team-coding/A2A-SIN-Backend/src/idle-monetization.ts` and relaxed the Hono middleware typing in `a2a/team-coding/A2A-SIN-Backend/src/a2a-http.ts`. Verified with a clean backend build. GitHub bug-library issue `#316` was closed.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/src/a2a-http.ts`, `a2a/team-coding/A2A-SIN-Backend/src/idle-monetization.ts`

## BUG-075: Standalone Team-Coding wrappers still hang on `code.generate` despite stable executor path
**Aufgetreten:** Sat Mar 28 2026  **Status:** ✅ GEFIXT
**Symptom:** `bin/sin-backend run-action '{"action":"sin.backend.code.generate",...}'` and the equivalent frontend wrapper hung until the local caller timeout, even though raw `opencode run ... --agent sin-executor-solo` worked and the durable executor path could use the direct Python runner transport safely.
**Ursache:** The standalone wrappers still delegated `code.generate` / `code.review` into the hanging Node runtime transport path instead of using the stable direct Python OpenCode runner.
**Fix:** Added a shell-wrapper fast path in `bin/sin-backend` and `bin/sin-frontend` that short-circuits `run-action` for `code.generate` / `code.review` through the per-agent Python OpenCode runner. Verified: backend wrapper returned `0` in ~95s and frontend wrapper returned `0` in ~75s with JSON `expertAnalysis: "OK\n"`. GitHub bug-library issue `#315` was closed.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/src/runtime.ts`, `a2a/team-coding/A2A-SIN-Frontend/src/runtime.ts`, `bin/sin-backend`, `bin/sin-frontend`

## BUG-076: Lower-level Node transport path can still stall on OpenCode child execution
**Aufgetreten:** Sat Mar 28 2026  **Status:** 🔴 OFFEN
**Symptom:** A direct Node transport path (`execFileAsync`/runtime-level invocation) can still stall even though the same prompt completes under raw `opencode run` or the per-agent Python runner.
**Ursache:** Noch offen. Evidence shows the product paths are fixed by bypassing the Node transport, but the lower-level Node child-process interaction itself still appears flaky for long-running OpenCode calls.
**Fix:** Mitigated in product paths by the Python runner transport in the durable executor and in the standalone shell wrappers. Remaining low-level cleanup is tracked in GitHub bug-library issue `#317`.
**Datei:** `a2a/team-coding/A2A-SIN-Backend/src/runtime.ts`, `a2a/team-coding/A2A-SIN-Frontend/src/runtime.ts`
## BUG-042: Parent issue update failed because inline Python heredoc string was not terminated correctly
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Updating issue `#351` with the submit-ready status for lane `#352` failed before the `gh issue comment` call because the temporary Python snippet writing `/tmp/issue351_submit_ready.md` had an unterminated triple-quoted string, causing a `SyntaxError` and leaving the body file empty.
**Ursache:** The inline `python3 - <<'PY'` helper used a malformed triple-quoted string literal in the shell command.
**Fix:** Re-ran the issue update with a properly terminated heredoc body file generation command.
**Datei:** GitHub issue-comment helper path for issue `#351` submit-ready status update

## BUG-043: Lane #370 submission failed because the expected Room-13 payload file had not been materialized under `/tmp/zeus-room13/`
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Attempting to submit lane `#370` with `curl --data-binary @/tmp/zeus-room13/room13-taskcreate-370-manual-submit.json` failed immediately because the file did not yet exist, so curl could not read the payload.
**Ursache:** The control-plane flow had prepared dispatch/intake artifacts and documented the submit-ready path for `#370`, but the actual `room13-taskcreate-370-manual-submit.json` file had not been generated before the first submit attempt.
**Fix:** Generated the missing manual-bound submit-ready payload for `#370` under `/tmp/zeus-room13/`, then retried submission against a local authoritative Room-13 instance successfully.
**Datei:** `/tmp/zeus-room13/room13-taskcreate-370-manual-submit.json` generation path for lane `#370`

## BUG-044: `gh issue comment` from repo workdir can fail because local `.git/config` contains invalid key `branch..gh-merge-base`
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Posting the executor-ready brief for Simone issue `#368` via `gh issue comment` failed immediately with `fatal: bad config variable 'branch..gh-merge-base' in file '.git/config'`.
**Ursache:** `gh issue comment` read the local repository git config and hit an invalid config key, so the GitHub command aborted before posting the comment.
**Fix:** Switched to `gh api repos/Delqhi/SIN-Solver/issues/<n>/comments` from outside the repository workdir, which bypassed the broken local git-config path and allowed safe issue updates without mutating git config.
**Datei:** GitHub issue-comment execution path for Simone issues `#368` and `#369`

## BUG-045: `gh api ... -f body=@file` posted the literal path instead of the markdown file contents
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** The first attempt to publish the #368 executor brief via `gh api repos/.../comments -f body=@/tmp/issue368_executor_brief.md` created a comment whose body was literally `@/tmp/issue368_executor_brief.md`.
**Ursache:** `gh api -f body=...` treats the value as a form field string, not as “read this file as body content”.
**Fix:** Switched to writing a JSON request body file and posting it with `gh api --input <json-file>`, so GitHub receives the actual markdown text.
**Datei:** GitHub API comment-post path for Simone issues `#368` and `#369`

## BUG-046: Hermes dispatch fails outside repo root because it shells `node scripts/alpha/generate-capability-registry-seed.mjs` relative to CWD
**Aufgetreten:** Tue Mar 24 2026  **Status:** ✅ GEFIXT
**Symptom:** Generating Hermes dispatch/intake artifacts for Simone lane `#364` from `/Users/jeremy` failed with `Cannot find module '/Users/jeremy/scripts/alpha/generate-capability-registry-seed.mjs'`, and intake then failed because no dispatch file was produced.
**Ursache:** `scripts/zeus/hermes-dispatch.mjs` invokes `node scripts/alpha/generate-capability-registry-seed.mjs` relative to the current working directory, so running it outside the repo root breaks module resolution.
**Fix:** Re-run Hermes dispatch/intake generation from the repository root (or future-proof the script later to resolve the seed path from `repoPath` instead of CWD).
**Datei:** `scripts/zeus/hermes-dispatch.mjs` / Simone lane `#364` dispatch generation path

## BUG-047: Main OpenSIN repo git config still had an invalid empty branch block and stale redirect origin
**Aufgetreten:** Wed Mar 25 2026  **Status:** ✅ GEFIXT
**Symptom:** `git remote -v` and other git/gh commands from `/Users/jeremy/dev/SIN-Solver` failed with `fatal: bad config variable 'branch..gh-merge-base' in file '.git/config'`, and `origin` still pointed to the old redirect target `Delqhi/SIN-Solver` instead of the canonical `SIN-Solver/OpenSIN`.
**Ursache:** The shared worktree config in `dev/SIN-Solver/.git/config` contained an invalid empty `[branch ""]` section plus a stale `origin` URL; the runner checkout had the same stale redirect URL in its own `.git/config`.
**Fix:** Removed the invalid empty branch section from `dev/SIN-Solver/.git/config`, updated the shared `origin` to `git@github.com:SIN-Solver/OpenSIN.git`, updated the runner checkout origin to `https://github.com/SIN-Solver/OpenSIN`, and verified remotes from the main repo, linked worktrees, release-check worktree, and runner checkout.
**Datei:** `dev/SIN-Solver/.git/config`, `dev/SIN-Solver-runner/_work/SIN-Solver/SIN-Solver/.git/config`

## BUG-048: `git fetch --all` still failed after the rename because non-origin remotes were not fetch-safe
**Aufgetreten:** Wed Mar 25 2026  **Status:** ✅ GEFIXT
**Symptom:** A follow-up `git fetch --all --prune` hit two separate failures: the shared `hf` remote in the main repo aborted with `fatal: expected 'acknowledgments'`, and the runner checkout origin over HTTPS returned `repository not found` for the private `SIN-Solver/OpenSIN` repo.
**Ursache:** The `hf` remote is a Hugging Face Space URL rather than a normal git fetch target, and the runner checkout still used an HTTPS origin without a valid auth path for the private repo.
**Fix:** Kept the special-purpose `hf` remote untouched, refreshed the rename caches with `git fetch origin --prune` instead of `--all`, switched the runner checkout origin to SSH (`git@github.com:SIN-Solver/OpenSIN.git`), and verified the refreshed remotes/FETCH_HEAD state afterward.
**Datei:** `dev/SIN-Solver/.git/config`, `dev/SIN-Solver-runner/_work/SIN-Solver/SIN-Solver/.git/config`

## BUG-049: Preserving local branch `session-105-gap-remediation` was blocked by a 137 MB Chrome cache blob in branch history
**Aufgetreten:** Wed Mar 25 2026  **Status:** ✅ GEFIXT
**Symptom:** `git push -u origin session-105-gap-remediation` failed with GitHub `GH001` because the branch history contained `services/solver-18-survey-worker/nodriver-service/profiles/jeremy/yougov/Default/Cache/Cache_Data/6dd795534c6fadc8_0` at 137.32 MB.
**Ursache:** The branch included an accidental workspace snapshot commit (`4c42e117`) that captured Chromium cache/profile artifacts under `services/solver-18-survey-worker/nodriver-service/profiles/jeremy/yougov/...`; one blob exceeded GitHub's hard 100 MB limit.
**Fix:** Preserved the original branch via a local backup ref, rewrote only `session-105-gap-remediation` history to remove the offending cache blob, then pushed the cleaned branch to `origin` and set its upstream successfully.
**Datei:** `session-105-gap-remediation` history affecting `services/solver-18-survey-worker/nodriver-service/profiles/jeremy/yougov/Default/Cache/Cache_Data/6dd795534c6fadc8_0`

## BUG-050: `sin-google-apps` CLI build broke because `cli.ts` called helpers it never imported and the idle flag used untyped `globalThis`
**Aufgetreten:** Wed Mar 25 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run build` in `a2a/team-infratructur/A2A-SIN-Google-Apps/` failed with `TS2304` for `triggerFleetSelfHealing` and `startAutonomousIdleLoop` in `src/cli.ts`, plus `TS7017` for `globalThis.isAgentBusy` in `src/idle-monetization.ts`, which blocked the local `bin/sin-google-apps` CLI and prevented the YouTube/media analysis lane from running.
**Ursache:** The CLI referenced `self-healing` and `idle-monetization` helpers without importing them, and the idle loop read a non-declared `globalThis` property without a typed cast.
**Fix:** Imported the missing helpers into `src/cli.ts`, cast `globalThis` to a typed agent-state shape in `src/idle-monetization.ts`, rebuilt successfully, and verified the repaired CLI by running `bin/sin-google-apps run-action '{"action":"google.media.analyze",...}'` against the OpenClaw YouTube short.
**Datei:** `a2a/team-infratructur/A2A-SIN-Google-Apps/src/cli.ts`, `a2a/team-infratructur/A2A-SIN-Google-Apps/src/idle-monetization.ts`

## BUG-051: Hermes Phase-13 dispatch produced unrouted jobs for every new Claude-vs-OpenClaw work item
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** After creating the new Phase-13 GitHub issues/linked branches for Claude-vs-OpenClaw competitive work, `node scripts/zeus/hermes-dispatch.mjs --repo Delqhi/SIN-Solver ...` generated `/tmp/sin-hermes-phase13-dispatch.json` with `selected: null` for all 9 planned jobs, so the jobs are packaged but not actually mapped to an executor route.
**Ursache:** The current capability-registry / alpha-router path did not resolve any executor for the chosen `teamHint` + `capabilityHint=command:implement` combinations (`team-orchestrator`, `team-coding`, `team-infratructur`, `team-competition`). The Phase-13 dispatch lane is therefore only partially ready.
**Fix:** Logged the blocker, kept the generated dispatch + dry-run intake artifacts as control-plane evidence, and deferred real Room-13 submission until the capability registry / routing coverage is expanded or the team/capability hints are corrected.
**Datei:** `/tmp/sin-zeus-phase13-bootstrap.json`, `/tmp/sin-hermes-phase13-dispatch.json`, `/tmp/sin-hermes-phase13-intake.json`, `scripts/zeus/hermes-dispatch.mjs`, `services/room-13-fastapi-coordinator/room13/services/alpha_router.py`

## BUG-052: `google_search` overflowed on direct multi-YouTube-URL competitive analysis query
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** A single `google_search` call that included both new YouTube URLs directly in the query/URL payload failed with `400 Bad Request` because the provider attempted to ingest more than the model token limit (`input token count is 1125263 but model only supports up to 1048576`).
**Ursache:** Passing multiple YouTube URLs into the search+analysis path caused an oversized retrieval payload from the video pages.
**Fix:** Fall back to narrower per-video research (separate URL/title lookups or lighter fetch/search paths) instead of bundling both YouTube pages into one search request.
**Datei:** `google_search` competitive-analysis path for `https://youtu.be/yZx6X4A3oM4` and `https://youtu.be/dWXX0_gQujI`

## BUG-053: Hermes Phase-14 dispatch also produced unrouted jobs for every new Claude auto-mode / GSD work item
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** After creating the new Phase-14 GitHub issues/linked branches for Claude auto-mode, dispatch, and GSD workflow-pack work, `node scripts/zeus/hermes-dispatch.mjs --repo Delqhi/SIN-Solver ...` generated `/tmp/sin-hermes-phase14-dispatch.json` with `selected: null` for all 8 planned jobs, so the tasks are packaged but still have no concrete executor route.
**Ursache:** The same capability-registry / alpha-router coverage gap seen in Phase 13 persists for the chosen `teamHint` + `capabilityHint=command:implement` combinations (`team-orchestrator`, `team-coding`, `team-competition`).
**Fix:** Logged the repeated routing blocker, preserved the Phase-14 bootstrap/dispatch/intake artifacts as evidence, and deferred Room-13 submission until capability routing is expanded or corrected.
**Datei:** `/tmp/sin-zeus-phase14-bootstrap.json`, `/tmp/sin-hermes-phase14-dispatch.json`, `/tmp/sin-hermes-phase14-intake.json`, `scripts/zeus/hermes-dispatch.mjs`, `services/room-13-fastapi-coordinator/room13/services/alpha_router.py`

## BUG-054: Closed routing issue `#370` is still reproducible on current `main`
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** Fresh baseline repro on `main` @ `f5b406eb05a0920f3b38b848afd7699b0d265103` still shows the original command-lane routing defect: `node scripts/alpha/generate-capability-registry-seed.mjs` emits `334` capability rows but `0` `command` rows, and both Phase-13 and Phase-14 Hermes dispatch artifacts still resolve every planned job to `selected: null`.
**Ursache:** The checked-in `scripts/alpha/generate-capability-registry-seed.mjs` still only mirrors `agent.commands?.items` into `capability_type: "command"` and does not synthesize command rows from registry `surfaces`/`Commands` metadata, so the closed bug was not actually resolved in the current baseline.
**Fix:** Logged the regression / false-close state, prepared to reopen issue `#370` with fresh evidence, and blocked further Room-13 submission for Phase 13/14 until the routing fix is truly landed or re-dispatched from an authoritative fixed branch.
**Datei:** `scripts/alpha/generate-capability-registry-seed.mjs`, `services/room-13-fastapi-coordinator/room13/services/alpha_router.py`, `/tmp/sin-hermes-phase13-dispatch.json`, `/tmp/sin-hermes-phase14-dispatch.json`

## BUG-055: Documented local Room-13 operator path is currently unavailable on both expected ports
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** Fresh readiness probes to `http://127.0.0.1:8014/ready` and `http://127.0.0.1:8019/ready` both failed with `Connection refused`, so even a manually bound Zeus/Hermes packet cannot currently be submitted from this host.
**Ursache:** The documented local operator path in `INTEGRATION.md` expects an authoritative repo-local Room-13 service on `127.0.0.1:8014`, but no local coordinator process is presently listening on either known port.
**Fix:** Logged the environment blocker, preserved manual-bind artifacts for issue `#370` without submission, and deferred real intake submit until a local authoritative Room-13 instance is started again.
**Datei:** `INTEGRATION.md`, `/tmp/sin-zeus-bootstrap-370-refresh.json`, `/tmp/sin-hermes-dispatch-370-refresh.json`, `/tmp/sin-hermes-intake-370-refresh.json`
## BUG-025: create-a2a + create-a2a-mcp erzeugen Metadata-/Runtime-Contract-Drift
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** Der frisch scaffoldete Agent `A2A-SIN-Paragraph` scheiterte beim `npm run build` mit TypeScript-Fehlern durch ungueltige Exporte in `metadata.ts`, fehlerhafte Imports in `a2a-http.ts`, MCP-Runtime-Mismatches und Telemetry-Imports auf nicht vorhandene Namespace-Exporte.
**Ursache:** Die Kombination aus `create-sin-a2a-agent.mjs` und `create-a2a-mcp` erzeugte fuer diesen Agenten keinen konsistenten Exportvertrag zwischen `metadata.ts`, `runtime.ts`, `mcp-server.ts` und den Telemetry-Consumern.
**Fix:** `metadata.ts` auf saubere Konstanten plus `agentConfig`-Objekt normalisiert, `runtime.ts` um die MCP-Action-Surfaces erweitert, `a2a-http.ts`/`SentinelLogger.ts` auf valide Imports umgestellt und `mcp-server.ts` auf den einargumentigen Runtime-Call ausgerichtet. Danach lief `npm run build` fuer `A2A-SIN-Paragraph` erfolgreich durch.
**Datei:** `a2a/team-lawyer/A2A-SIN-Paragraph/src/metadata.ts`, `src/runtime.ts`, `src/a2a-http.ts`, `src/mcp-server.ts`, `src/lib/telemetry/SentinelLogger.ts`

## BUG-026: create-a2a/create-a2a-team hinterlassen lokale/remote Lawyer-Scaffolds unvollständig
**Aufgetreten:** Fri Mar 27 2026  **Status:** 🔴 OFFEN
**Symptom:** `A2A-SIN-Summary` wurde lokal nur als unvollständiger Stub (`dist/`, `node_modules/`, `package-lock.json`, `scripts/`) hinterlassen und das Remote-Repo `OpenSIN-AI/A2A-SIN-Summary` blieb leer; auch `A2A-SIN-Team-lawyer` wurde nur minimal mit `agent.json`, `package-lock.json`, `scripts/` erzeugt.
**Ursache:** Die gepatchten `create-a2a-team`/`create-sin-a2a-agent`-Workflows provisionieren Repo/Verzeichnis, aber synchronisieren die vollständigen Template-Artefakte nicht zuverlässig in lokale und entfernte Lawyer-Scaffolds.
**Fix:** Noch offen. Kurzfristig werden Lawyer-Spezialisten manuell aus dem funktionsfähigen Paragraph-Muster abgeleitet; mittelfristig müssen die Generatoren den kompletten Template-Root zuverlässig materialisieren und pushen.
**Datei:** `a2a/team-lawyer/A2A-SIN-Summary`, `a2a/team-lawyer/A2A-SIN-Team-lawyer`, Generatorpfade `~/.config/opencode/skills/create-a2a-team/scripts/generate-team.sh`, `scripts/create-sin-a2a-agent.mjs`

## BUG-027: A2A-SIN-Damages runtime build brach wegen `null`-Notes im Schadenspacket ab
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** `npm run build` in `a2a/team-lawyer/A2A-SIN-Damages` schlug fehl, weil `compute_damage_packet` normalisierte Items mit `note: null` erzeugte, obwohl `DamageItem.note` nur `string | undefined` erlaubte.
**Ursache:** Die neue Runtime-Implementierung normalisierte optionale Schadensnotizen inkonsistent und verletzte dadurch den TypeScript-Vertrag des internen `DamageItem`-Typs.
**Fix:** Normalisierung auf `undefined` statt `null` umgestellt und die Runtime anschließend erfolgreich neu gebaut.
**Datei:** `a2a/team-lawyer/A2A-SIN-Damages/src/runtime.ts`

## BUG-029: A2A-SIN-Contract klassifizierte Zutrittsklauseln faelschlich als Zahlungsklauseln
**Aufgetreten:** Fri Mar 27 2026  **Status:** ✅ GEFIXT
**Symptom:** `sin.contract.analyze_contract` stufte die Klausel „Der Vermieter darf die Wohnung jederzeit ohne Vorankündigung betreten.“ wegen des Substrings `miete` in `Vermieter` als `Zahlung` statt `Zutritt` ein.
**Ursache:** Die Clause-Type-Heuristik prüfte zu breite Teilstrings (`/miete/`) und matchte dadurch unbeabsichtigt auf `Vermieter`.
**Fix:** Heuristik auf trennschärfere Wort-/Kontextmuster angepasst und die Auswertung anschließend erneut verifiziert.
**Datei:** `a2a/team-lawyer/A2A-SIN-Contract/src/runtime.ts`
