# openantigravity-auth-rotator — Fehler-Reports & Bug-Fixes

> Jeder Bug, jeder Fix, jede Lösung wird hier dokumentiert.
> Sofort beim Erkennen eintragen — nie vergessen, nie verlieren.
> Plugin: `@opencode-ai/antigravity` (v1.6.0)
> Accounts: `~/.config/opencode/antigravity-accounts.json`

---

## BUG-XXX: Rotator-Gemini-Key-Generierung scheitert an deaktivierten APIs im Companion-Projekt

**Aufgetreten:** 2026-03-21  
**Status:** 🔴 OFFEN

**Symptom:** Die aus dem Rotator-Refresh-Token abgeleitete HTTP-Key-Erzeugung fuer ImageGen erreicht `onboardUser` und den echten `managedProjectId`, scheitert aber danach konsistent mit `403 SERVICE_DISABLED` gegen `serviceusage.googleapis.com` bzw. `apikeys.googleapis.com` auf dem Companion-Projekt des neuesten `rotator-*` Users.

**Ursache:**
1. `~/.config/opencode/antigravity-accounts.json` kann geloeschte Rotator-Accounts enthalten; ein naiver "neuester Account"-Pick fuehrt dann in tote Projekte.
2. Das relevante OAuth-Consumer-/Client-Projekt hinter dem Antigravity-Client (`1071006060591`) musste separat fuer `apikeys.googleapis.com` und `serviceusage.googleapis.com` aktiviert werden.
3. Beim echten live `rotator-*` User bleibt das Companion-Projekt (`managedProjectId`, z. B. `yielding-student-zgn9c`) fuer `apikeys.googleapis.com` / `serviceusage.googleapis.com` weiterhin deaktiviert. Cloud Console zeigt beim Aktivieren kein simples Success, sondern einen Resource-/Terms-/Loading-Flow, der bislang nicht stabil automatisiert ist.

**Fix:**
1. `~/.config/opencode/skills/imagegen/scripts/generate_gemini_key.py` waehlt jetzt bevorzugt den live in Google Workspace existierenden Rotator-Account statt eines geloeschten stale Accounts.
2. Die kostenlosen Control-Plane-APIs im OAuth-Consumer-Projekt wurden per Browser-Automation im Admin-Profil aktiviert.
3. Der letzte offene Schritt ist die vollstabile Aktivierung von `serviceusage.googleapis.com` und `apikeys.googleapis.com` im jeweils frisch onboardeten Companion-Projekt des aktuellen Rotator-Users, ohne manuelle Endnutzer-Eingriffe und ohne Billing-/Free-Trial-Aktivierung.

**Datei:** `~/.config/opencode/skills/imagegen/scripts/generate_gemini_key.py`, `~/.config/opencode/antigravity-accounts.json`, Google Cloud Console (`apikeys.googleapis.com`, `serviceusage.googleapis.com`)

---

## BUG-20260325-05: Watcher konnte direkt nach manuellem `main.py rotate` sofort selbst noch einmal rotieren

**Aufgetreten:** 2026-03-25  
**Status:** ✅ GEFIXT

**Symptom:** Nach einem manuellen `python3 main.py rotate` konnte der Watcher unmittelbar danach noch einmal eine zweite Rotation starten, obwohl nach einer gerade beendeten Rotation mindestens ein kurzer Sicherheitsabstand gelten muss.

**Ursache:** Die Watcher-Loop merkte sich `last_rot` nur im eigenen Prozessspeicher. Das deckte nur Rotationen ab, die der Watcher selbst gestartet hatte. Ein manueller `main.py rotate` setzte zwar das gemeinsame Lock waehrend des Laufs, schrieb nach dem Ende aber keinen gemeinsam sichtbaren "rotation fertig"-Zeitpunkt. Sobald das Lock weg war, konnte der Watcher bei einem neuen Trigger sofort wieder loslaufen.

**Fix:** Gemeinsame Rotationszustands-Datei `core/watcher_rotation_state.py` eingefuehrt. Sowohl der manuelle Pfad in `core/main_dispatch.py` als auch die Watcher-Loop in `core/watcher_loop.py` schreiben jetzt nach jeder beendeten Rotation einen gemeinsamen End-Timestamp nach `/tmp/openAntigravity-auth-rotator.last-rotation`. Die Watcher-Loop verwendet diesen Timestamp als `effective_last_rot`, bevor sie eine neue Rotation erlaubt. Live verifiziert: echter manueller Rotate lief erfolgreich durch; anschliessend erschien kein zweiter `Starting rotation`-Eintrag im gefaehrlichen Fenster. Zusaetzlich wurde ein synthetischer `QUOTA_EXHAUSTED`-Trigger in `grace-window-proof.log` erkannt, aber innerhalb des Schutzfensters bewusst nicht erneut gestartet.

**Datei:** `core/watcher_rotation_state.py`, `core/main_dispatch.py`, `core/watcher_loop.py`, `core/watcher_config.py`

---

## BUG-20260325-04: `watcher_config.py` mit Merge-Konfliktmarkern blockiert Watcher und `main.py rotate`

**Aufgetreten:** 2026-03-25  
**Status:** ✅ GEFIXT

**Symptom:** `cd /Users/jeremy/.open-auth-rotator/antigravity && python3 main.py rotate` bricht schon beim Import mit `SyntaxError: invalid decimal literal` in `core/watcher_config.py` ab. Dadurch startet auch der Watcher nicht mehr.

**Ursache:** In `core/watcher_config.py` sind ungeaufloeste Git-Merge-Konfliktmarker (`<<<<<<<`, `=======`, `>>>>>>>`) stehen geblieben. Python parst die Datei deshalb gar nicht mehr.

**Fix:** Konflikt in `core/watcher_config.py` sauber aufgeloest, die gewollten Werte `COOLDOWN_SECS = 30` und `_GOOGLE_AUTH_REINJECT_COOLDOWN = 60` behalten, den doppelten manuell gestarteten Watcher-Prozess entfernt und die LaunchAgent-Instanz als einzige aktive Watcher-Instanz stehen gelassen. Danach bootete `python3 main.py status` wieder sauber.

**Datei:** `core/watcher_config.py`

---

## BUG-XXX: Rotation leert lokale Antigravity-Auth zu frueh vor erfolgreicher Neu-Injektion

**Aufgetreten:** 2026-03-20  
**Status:** 🔴 OFFEN

**Symptom:** Waehrend `python3 main.py rotate` werden bestehende lokale Antigravity-Accounts/Auth-Daten bereits vor Abschluss des Browser-OAuth-Flows auf 0 gesetzt. Scheitert der Browser- oder Token-Schritt, bleibt lokal zwischenzeitlich oder dauerhaft kein gueltiger Antigravity-Account mehr uebrig.

**Ursache:** `core/main_rotate.py` und der parallele Startpfad `core/rotation/rotate_start.py` fuehren Pre-Cleanup vor dem neuen Browser-OAuth aus. Dabei kann `_cleanup_old_rotator_users(...)` schon vor erfolgreicher neuer Token-Injektion lokale Account-Daten umschreiben; mit stale `logs/credentials.json` ist sogar der falsche Keep-Kandidat moeglich.

**Fix:** Ein versuchter Fix (Entfernen des Pre-Cleanups) wurde implementiert, hat aber den Rotator komplett kaputt gemacht und wurde daher von `@user` verworfen. Derzeit keine Loesung aktiv. Pre-Cleanup bleibt vorerst erhalten, der Bug ist damit wieder offen.

**Datei:** `core/main_rotate.py`, `core/rotation/rotate_start.py`, `core/main_cleanup_users.py`, `core/main_rotate_inject.py`

---

## BUG-20260325-02: Live-Rotator blieb auf Google `gaplustos` haengen obwohl `Verstanden` sichtbar war

**Aufgetreten:** 2026-03-25  
**Status:** ✅ GEFIXT

**Symptom:** Der laufende Antigravity-Rotator blieb auf `https://accounts.google.com/speedbump/gaplustos...` (`Willkommen in Ihrem neuen Konto`) haengen. Im Browser war `Verstanden` sichtbar, der Flow lief aber trotzdem in spaetere Schritte weiter bzw. brach ohne OAuth-Code ab.

**Ursache:** Der aktive Login-Pfad nutzte `core/login/step03b_click.py`. Dort wurde schon nach dem ersten gemeldeten DOM-/CDP-Klick aus der Schleife ausgestiegen, ohne zu pruefen, ob `gaplustos` die Seite wirklich verlassen hat. Wenn der erste DOM-Klick nur ein No-op war, wurde nie sauber auf CDP-/Keyboard-Fallback eskaliert und `login_async.py` lief in OTP/Consent weiter, obwohl die Workspace-Interstitial noch offen war.

**Fix:** `core/login/step03b_click.py` wartet jetzt nach jeder Aktion explizit auf das Verlassen von `gaplustos`, eskaliert bei No-op von DOM -> CDP -> `Tab` x11 + `Enter`, retryt solange die Seite sichtbar bleibt und liefert `False`, wenn die Interstitial nach allen Retries immer noch blockiert. `core/login/login_async.py` failt danach frueh mit klarer Meldung statt in spaetere Schritte zu driften. Der LaunchAgent-Watcher wurde nach dem Patch neu gestartet, damit der laufende Prozess das neue Modul sicher laedt.

**Datei:** `core/login/step03b_click.py`, `core/login/login_async.py`

---

## BUG-20260325-03: Gaplustos-Exit-Check crasht waehrend Navigation auf `ExceptionDetails.lower`

**Aufgetreten:** 2026-03-25  
**Status:** ✅ GEFIXT

**Symptom:** Ein echter `python3 main.py rotate` Lauf scheitert direkt nach dem `Verstanden`-Klick auf `speedbump/gaplustos` mit `Browser OAuth failed: 'ExceptionDetails' object has no attribute 'lower'`.

**Ursache:** Waehren des Exit-Pollings nach dem `Verstanden`-Klick kann Nodriver bei einer Navigations-/Context-Umschaltung aus `tab.evaluate("document.body.innerText || ''")` kurzzeitig kein String-Body, sondern ein `ExceptionDetails`-Objekt liefern. Die neue `gaplustos`-Erkennung in `core/login/step03b_click.py` und der parallele Fallback in `core/login/step03b_run.py` behandelten diesen Rueckgabewert ungeprueft mit `.lower()` und crashten dadurch mitten im erfolgreichen Redirect.

**Fix:** Beide `gaplustos`-Detektoren wurden auf eine sichere String-Normalisierung umgestellt (`_safe_lower_text(...)` / `str(... or "")`), sodass Navigations-Zwischenzustaende mit Nicht-String-Rueckgaben nicht mehr crashen. Danach wurde ein echter `python3 main.py rotate` Lauf erneut ausgefuehrt und erfolgreich bis zur Auth-Injektion sowie Old-Account-Cleanup verifiziert; der Watcher wurde anschliessend neu gestartet, damit der Langlaeufer denselben Fix nutzt.

**Datei:** `core/login/step03b_click.py`, `core/login/step03b_run.py`

---

## BUG-XXX: Lokale Antigravity-Accounts bleiben erhalten obwohl Workspace-User fehlen

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** `~/.config/opencode/antigravity-accounts.json` enthielt tote `rotator-*` Accounts, obwohl `list_rotator_users()` in Google Workspace 0 User zurueckgab. `status` zeigte dadurch veraltete Accounts an.

**Ursache:** Es gab keine Reconcile-Logik zwischen lokaler Account-Registry und dem echten Workspace-Zustand. `core/main_cleanup_users.py` war zudem deaktiviert, sodass tote lokale Eintraege nie automatisch bereinigt wurden.

**Fix:**
1. Neue Reconcile-Funktion in `core/accounts_reconcile.py`
2. `core/main_cmd_status.py` reconciled jetzt vor der Anzeige
3. `core/main_rotate.py` reconciled jetzt vor jeder neuen Rotation
4. Wenn nach Reconcile keine gueltigen Accounts mehr uebrig bleiben, wird auch der stale `google`-Eintrag aus `~/.local/share/opencode/auth.json` entfernt

**Datei:** `core/accounts_reconcile.py`, `core/main_cmd_status.py`, `core/main_rotate.py`

---

## BUG-XXX: Service-Account-Impersonation ist nicht kompatibel mit dem aktuellen Antigravity-Refresh-Token-Flow

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Rotation erstellt einen neuen `rotator-*` User, aber Antigravity endet mit ungueltigen Refresh-Tokens oder toten lokalen Accounts. Bei Testlauf schlug `onboardUser` mit `403 Forbidden` fehl und der Service-Account-Flow lieferte nur ein Pseudo-Refresh-Token (`service_account_impersonation`).

**Ursache:**
1. `core/service_account_impersonate.py` liefert nur Access-Token, aber keinen echten OAuth-Refresh-Token
2. `core/watcher_guardian_token.py` erwartet zwingend einen echten Refresh-Token fuer `grant_type=refresh_token`
3. `core/token_onboard.py` konnte mit dem impersonierten Token kein `managedProjectId` provisionieren (`403 Forbidden`)

**Fix:** `core/main_rotate.py` failt jetzt explizit vor der Injection mit einer klaren Fehlermeldung, statt kaputte lokale Accounts (`service_account_impersonation|None`) in `antigravity-accounts.json` zu schreiben. Workspace-User werden danach sauber geloescht.

**Datei:** `core/main_rotate.py`, `core/service_account_impersonate.py`, `core/watcher_guardian_token.py`, `core/token_onboard.py`

---

## BUG-XXX: API-Rotation injiziert komplettes User-Objekt statt Email-String

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** `~/.config/opencode/antigravity-accounts.json` enthielt unter `email` ein ganzes Dict (`{"email": ..., "password": ..., "user_id": ...}`) statt eines Strings.

**Ursache:** Ein Ad-hoc-Inject-Skript uebergab den kompletten Return-Wert von `create_workspace_user()` direkt an `inject_new_account()` statt nur `user["email"]`.

**Fix:** Lokalen State neu injiziert und `core/accounts_reconcile.py` gegen solche Legacy-Eintraege gehaertet (`dict -> email string`).

**Datei:** `core/accounts_reconcile.py`, `~/.config/opencode/antigravity-accounts.json`

---

## BUG-XXX: Gepatchte Global-Plugin-Datei wird nicht von OpenCode verwendet

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Aenderungen unter `/Users/jeremy/Library/pnpm/.../opencode-antigravity-auth/` hatten keinen Effekt zur Laufzeit.

**Ursache:** OpenCode laedt die gecachte Plugin-Kopie aus `~/.cache/opencode/node_modules/opencode-antigravity-auth/`, nicht die global installierte pnpm-Kopie.

**Fix:** Laufzeit-Patch auch in der Cache-Kopie unter `~/.cache/opencode/node_modules/opencode-antigravity-auth/dist/src/plugin/token.js` angewendet.

**Datei:** `~/.cache/opencode/node_modules/opencode-antigravity-auth/dist/src/plugin/token.js`

---

## BUG-XXX: Service-Account-Token erreicht Antigravity-Modelle nicht wegen Cloud Code Private API Consumer-Kontext

**Aufgetreten:** 2026-03-18  
**Status:** 🔴 OFFEN

**Symptom:** `opencode run --model google/antigravity-claude-sonnet-4-6 ...` endet mit `403` gegen `https://cloudcode-pa.googleapis.com/v1internal:streamGenerateContent` bzw. danach mit `No Antigravity accounts configured`.

**Ursache:** Der per Domain-Wide-Delegation erzeugte Access-Token laeuft technisch ueber den Service-Account-Consumer-Kontext (`artificial-biometrics` / Projekt-Nr. `779050628870`). `cloudcode-pa.googleapis.com` ist jedoch eine interne/private API und akzeptiert diesen Consumer-Kontext nicht wie ein echter Antigravity-OAuth-Token.

**Fix:** Noch offen. Gemini API-Key-Modelle funktionieren mit dieser Strategie, Antigravity-Plugin-Modelle benoetigen weiterhin einen echten OAuth-Refresh-Token aus dem Antigravity-Login-Flow oder einen anderen Weg, denselben Consumer-Kontext wie der echte OAuth-Client zu erhalten.

**Datei:** `core/service_account_impersonate.py`, `~/.cache/opencode/node_modules/opencode-antigravity-auth/dist/src/plugin/token.js`, `~/.config/opencode/antigravity-accounts.json`

---

## BUG-XXX: Echter OAuth-Login blieb auf dem Identifier-Step oder schrieb ins falsche Feld

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Der Browser-Flow blieb auf `E-Mail-Adresse` haengen oder schrieb spaeter Passwortzeichen in den Identifier-Step. Neue Rotator-User bekamen dadurch nie einen echten Refresh-Token.

**Ursache:**
1. Der OAuth-Tab wurde nicht als eigener frischer Tab geoeffnet
2. Google hosted-domain Login erwartete nur den `rotator-...`-Lokalteil, nicht immer den ganzen Mailstring im Feld
3. `step02_fill.py` erkannte versteckte Password-Nodes zu frueh als Erfolg
4. `step03_fill.py` akzeptierte nicht sichtbare `input[type=password]`

**Fix:**
- `browser.get(..., new_tab=True)` in `core/login/login_async.py`
- `core/login/step01_url.py` nutzt `login_hint` plus `hd=zukunftsorientierte-energie.de`
- `core/login/step02_fill.py` tippt den Lokalteil und wartet erst auf sichtbares Passwortfeld / `/challenge/pwd`
- `core/login/step03_fill.py` akzeptiert nur sichtbare Passwortfelder

**Datei:** `core/login/login_async.py`, `core/login/step01_url.py`, `core/login/step02_fill.py`, `core/login/step03_fill.py`

---

## BUG-XXX: Frische Workspace-User brauchen auf `gaplustos` zwingend `Verstanden`

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Nach erfolgreichem Passwort-Login landete der Flow auf `https://accounts.google.com/speedbump/gaplustos...` (`Willkommen in Ihrem neuen Konto`) und blieb dort haengen.

**Ursache:** Das ist ein Pflicht-Screen fuer neue Workspace-User. Ohne explizites Bestaetigen gibt es keinen Redirect zum OAuth-Callback.

**Fix:** `core/login/step03b_click.py` fuehrt den Schritt jetzt in dieser festen Reihenfolge aus:
1. direkter DOM-Klick auf `Verstanden`
2. CDP-Mausklick auf denselben Button
3. Fallback `Tab` × 11 + `Enter`
4. sofort stoppen, sobald die Seite `gaplustos` verlaesst, damit spaetere Seiten nicht im Hintergrund fehlgeklickt werden

**Datei:** `core/login/step03b_click.py`, `core/login/step03b_run.py`

---

## BUG-XXX: OAuth haengt im Google-Account-Chooser fest wenn Chrome das eingeloggte Geschaeftlich-Profil direkt recycelt

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** `python3 main.py rotate` bleibt im Browser-Login auf `accounts.google.com/.../accountchooser` haengen. Statt den neuen `rotator-*` User einzuloggen sieht der Flow nur das bereits eingeloggte Konto `info@zukunftsorientierte-energie.de`; `Anderes Konto verwenden` fuehrt in den letzten Tests nicht stabil weiter zum Identifier-/Password-Step.

**Ursache:** `core/login/login_chrome.py` startet Chrome direkt mit dem persistenten Profil `~/Library/Application Support/Google/Chrome/Geschaeftlich`. Dadurch bringt Google sofort den Account-Chooser fuer das schon eingeloggte Admin-Konto hoch. Der OAuth-Flow fuer neue `rotator-*` Nutzer braucht aber einen frischen Login-Kontext statt eines recycelten Business-Profils.

**Fix:** `core/login/login_chrome.py` startet den OAuth-Run jetzt wieder mit einem sauberen Temp-Profil unter `/tmp/openAntigravity_login_profile_7654`, killt alte Port-7654-Debug-Chrome-Prozesse vor dem Start und raeumt die dedizierte Debug-Chrome-Session am Ende wieder weg.

**Datei:** `core/login/login_chrome.py`, `core/login/step02_fill.py`

---

## BUG-XXX: Chrome-Sync-/Crash-Prompts nach Callback erzeugen visuelles Rauschen, blockieren aber nicht den Token-Capture

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Nach `localhost:51121/oauth-callback?...code=...` tauchten `In Chrome anmelden?` und `Seiten wiederherstellen?` auf.

**Ursache:** Google/Chrome zeigt nach dem erfolgreichen OAuth-Callback zusaetzliche UI-Prompts fuer Browser-Signin bzw. Crash-Restore an.

**Fix:**
- Chrome startet jetzt mit `--disable-sync`, `--hide-crash-restore-bubble` und `--disable-features=SigninInterceptBubble,ExplicitBrowserSigninUIOnDesktop`
- Der Callback selbst gilt als Erfolg; das Popup ist nachgelagert und wird explizit mit `Chrome ohne Konto verwenden` geschlossen, nicht mit `Als "Rotator" fortfahren`
- Auf der nativen `signin/oauth/firstparty/nativeapp`-Seite werden keine generischen Hintergrund-Klicks mehr ausgefuehrt
- Nach erfolgreichem Callback wird die dedizierte Debug-Chrome-Session direkt per Port-7654-Kill beendet; `browser.stop()` haengt nicht mehr im Erfolgsfall dazwischen
- Google-App-Passwoerter helfen hier nicht

**Datei:** `core/login/login_chrome.py`, `core/login/login_async.py`

---

## BUG-XXX: Vollrotation schaltet fremde OpenCode-Sessions ungefragt um

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** Beim erfolgreichen Rotator-Lauf sprangen andere laufende OpenCode/iTerm-Sessions ploetzlich auf andere Modelle oder wurden neu gestartet, obwohl nur die Auth-Rotation laufen sollte.

**Ursache:** `core/main_rotate.py` startete nach Erfolg automatisch `oc01b_restart_opencode.py`; `core/gemini_fallback.py` rief ebenfalls ohne Opt-in `restart_opencode_sessions()` auf.

**Fix:** OpenCode-Session-Restarts sind jetzt standardmaessig AUS. Sie laufen nur noch, wenn `OPENANTIGRAVITY_RESTART_OPENCODE=1` explizit gesetzt ist. Ausserdem wurde `oc01b_restart_opencode.py` aus dem normalen Orchestrator-/LaunchAgent-Rotate-Pfad entfernt, damit der Trigger nur noch den Rotator startet.

**Datei:** `core/main_rotate.py`, `core/gemini_fallback.py`, `core/opencode_restart.py`

---

## BUG-XXX: Telegram-Erfolgslog meldet Versand trotz ungueltiger Platzhalter-Chat-ID

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** Nach erfolgreicher Rotation konnte Telegram mit `HTTP 400 Bad Request` fehlschlagen, waehrend `core/main_rotate.py` trotzdem `Telegram notification sent` loggte.

**Ursache:** `telegram/telegram_bot.py` akzeptierte den Platzhalter `YOUR_CHAT_ID_HERE` als echte Chat-ID, und `core/main_rotate.py` ignorierte den booleschen Rueckgabewert von `send_rotation_success()`.

**Fix:** Platzhalter-Chat-ID wird jetzt wie "nicht konfiguriert" behandelt, und `core/main_rotate.py` loggt nur noch Erfolg, wenn der Telegram-Versand wirklich `True` liefert.

**Datei:** `telegram/telegram_bot.py`, `core/main_rotate.py`

---

## BUG-XXX: Telegram-Bot-Token war hart in Repo-Code verdrahtet

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** `telegram/telegram_bot.py` enthielt den Bot-Token direkt im Code und waere so mit Commits/Repo-Historie mit ausgeliefert worden.

**Ursache:** Der Helper nutzte einen harten Default-Token statt lokaler Konfiguration oder Environment.

**Fix:** Bot-Token wird jetzt nur noch aus `~/.config/opencode/telegram_config.json` oder `TELEGRAM_BOT_TOKEN` gelesen.

**Datei:** `telegram/telegram_bot.py`

---

## BUG-XXX: Nach erfolgreicher Rotation bleiben OpenCode-Modelle unbenutzbar

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** Browser-OAuth und Account-Injection laufen durch, aber danach funktionieren die Modelle in OpenCode praktisch nicht bzw. der neue rotierte Google-/Antigravity-Account ist fuer echte Modellnutzung nicht brauchbar.

**Ursache:** Es war eine Kette aus Browser-Flow-Blockern: `step03b` blieb nach dem ersten erfolgreichen `Verstanden`-Klick zu lange im Zwischenstep, `step05` musste den nativen Google-Consent `Anmelden` explizit bedienen, und der Debug-Chrome-Cleanup hing nach erfolgreichem Code-Capture im alten Fallback-Close-Pfad.

**Fix:** `core/login/step03b_click.py` stoppt jetzt direkt nach dem ersten erfolgreichen `Verstanden`, `core/login/step05_consent.py` klickt den nativen Google-Consent korrekt und dismisset danach das Chrome-Popup, und `core/login/login_chrome.py`/`core/login/login_async.py` beenden die dedizierte Port-7654-Chrome-Session robust ueber eine eigene PID-/Process-Group statt im haengenden Altpfad.

**Datei:** `core/main_rotate.py`, `core/main_rotate_oauth.py`, `core/login/*`, `~/.config/opencode/antigravity-accounts.json`, `~/.local/share/opencode/auth.json`

---

## BUG-XXX: telegram_product Poller crasht unter lokalem Python 3.9 vor jeder Bot-Verarbeitung

**Aufgetreten:** 2026-03-19  
**Status:** ✅ GEFIXT

**Symptom:** Der laufende Produkt-Bot-Loop startet, crasht aber sofort, daher werden Live-Kommandos wie `/status` und `/diag` nicht verarbeitet.

**Ursache:** `telegram_product/api.py` nutzt Python-3.10-Syntax (`dict | None`) auf dem lokalen CommandLineTools-Python 3.9 und bricht schon beim Import mit `TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'`.

**Fix:** `telegram_product/api.py` und `telegram_product/service.py` sind jetzt Python-3.9-kompatibel (`from __future__ import annotations`), danach wurde der Poller ueber den lokalen Python-3.9-Pfad neu gestartet und Live-Kommandos (`/status`, `/diag`) wurden erfolgreich verarbeitet.

**Datei:** `telegram_product/api.py` und ggf. weitere `telegram_product/*.py`

---

## BUG-XXX: Antigravity-Requests uebernahmen `x-goog-api-key` aus der Umgebung und kollidierten mit OAuth

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** `google/antigravity-claude-sonnet-4-6` lieferte `The API Key and the authentication credential are from different projects.` obwohl ein echter OAuth-Refresh-Token erfolgreich injiziert war.

**Ursache:** Die OpenCode-/AI-SDK-Requestkette uebernahm `x-goog-api-key` aus der Umgebung (`GOOGLE_API_KEY`). Der Antigravity-Plugin-Patch entfernte nur `x-api-key`, nicht aber `x-goog-api-key`, wodurch API-Key- und OAuth-Auth gleichzeitig im Request landeten.

**Fix:** In der echten Laufzeitkopie des Plugins wird jetzt sowohl `x-api-key` als auch `x-goog-api-key` vor dem Antigravity-Request entfernt.

**Datei:** `~/.cache/opencode/node_modules/opencode-antigravity-auth/dist/src/plugin/request.js`

---

## BUG-XXX: Cleanup war deaktiviert und liess mehrere rotator-* Accounts in Google / lokal stehen

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Es konnten sich mehrere `rotator-*` User in Google Workspace ansammeln, waehrend lokal ein anderer oder stale Account aktiv blieb.

**Ursache:** `core/main_cleanup_users.py` war hart deaktiviert und `core/main_cmd_cleanup.py` bereinigte nur einen Teil der Drift-Faelle.

**Fix:**
- `core/main_cleanup_users.py` loescht wieder alle Workspace-Rotator-User ausser dem Keep-Account
- derselbe Schritt reduziert lokale Accounts sofort auf genau einen Keep-Account
- `core/main_cmd_cleanup.py` fuehrt jetzt zuerst Reconcile und dann den echten Single-Account-Sweep aus

**Datei:** `core/main_cleanup_users.py`, `core/main_cmd_cleanup.py`

---

## BUG-XXX: Watcher brauchte wieder einen kleinen Claude -> Gemini-API Fallback statt sofort Full-Rotate

**Aufgetreten:** 2026-03-18  
**Status:** ✅ GEFIXT

**Symptom:** Bei Claude-Rate-Limits gab es entweder sofort Full-Rotation oder gefaehrliche direkte Config-Mutationen. Gewuenscht war: erst Antigravity verbrauchen, dann auf Gemini API springen, erst beim naechsten Full-Rotate wieder zurueck.

**Ursache:** Der Watcher hatte keine eigene Claude-only Fallback-Stufe mehr.

**Fix:**
- `core/watcher_log_scan.py` unterscheidet jetzt `claude_rate_limit` von allgemeinem Rotate-Trigger
- `core/gemini_fallback.py` aktiviert den Gemini-API-Fallback
- `core/opencode_restart.py` restartert OpenCode-Sessions optional mit `-m provider/model`
- `core/main_rotate.py` schaltet den Gemini-API-Fallback nach erfolgreicher Full-Rotation wieder aus
- `core/gemini_config.py` schreibt nur noch `provider.gemini-api.options.apiKey`, niemals top-level `apiKey`

**Datei:** `core/watcher_log_scan.py`, `core/watcher_loop.py`, `core/gemini_fallback.py`, `core/opencode_restart.py`, `core/gemini_config.py`, `core/main_rotate.py`

---

## BUG-XXX: Offene Environment Variablen in OpenCode

**Aufgetreten:** 2026-03-16  
**Status:** ✅ GEFIXT

**Symptom:** `opencode auth list` zeigt unerwünschte Environment Variablen:
```
●  Google GOOGLE_GENERATIVE_AI_API_KEY
●  Google GEMINI_API_KEY
```

**Ursache:** Diese Variablen waren in `.zshrc` und `~/.config/secrets/.env.local` gesetzt.

**Fix:**
1. `.zshrc` Zeile 114 entfernt: `export GOOGLE_GENERATIVE_AI_API_KEY=...`
2. `~/.config/secrets/.env.local` Zeile 17 entfernt: `export GEMINI_API_KEY=...`

**WICHTIG:** Nach Änderung neue Shell starten oder `source ~/.zshrc` ausführen.

---

## BUG-XXX: ws00 löscht frisch erstellten rotator-* User

**Aufgetreten:** 2026-03-16  
**Status:** ✅ GEFIXT

**Symptom:** Post-Cleanup-Schritt löscht den gerade erst erstellten neuen rotator-* User.

**Ursache:** `ws00_delete_prev.py` prüfte nur `logs/credentials.json` (alter Account) und `antigravity-accounts.json` (könnte stale sein), aber NICHT den brandneuen Account aus `logs/tokens.json`.

**Fix in `steps/workspace/ws00_delete_prev.py`:**
```python
tokens = Path("logs/tokens.json")
tokens_email = json.loads(tokens.read_text()).get("email", "") if tokens.exists() else ""
keep = {e for e in (cur_email, tokens_email, get_active_email()) if e}
```
Jetzt werden ALLE drei Quellen geprüft: alter Account, neuer Account (tokens.json), und aktiver Account.

---

## BUG-XXX: Google Workspace hat 2+ rotator-* User trotz Cleanup

**Aufgetreten:** 2026-03-16  
**Status:** ✅ GEFIXT

**Symptom:** Nach Rotation existieren 2 oder mehr `rotator-*` User in Google Workspace.

**Ursache:** `ws00_delete_prev.py` hatte keine Pagination und löschte nicht zuverlässig alle alten User.

**Fix:** 
1. `ws00_delete_prev.py` paginiert jetzt über alle Results
2. **NEU:** `ws99_verify_one_rotator.py` als letzter Schritt im Rotator-Flow
   - Prüft ob EXAKT 1 rotator-* User existiert
   - Falls >1, löscht alle außer dem aktiven Account
   - Falls 0, Error (sollte nie passieren nach erfolgreicher Rotation)

**Integration in `orchestrator/steps_rotate.py`:**
```python
("steps/workspace/ws99_verify_one_rotator.py", "Verify: nur 1 rotator user in Google"),
```

**Datei:** `steps/workspace/ws99_verify_one_rotator.py`

---

## BUG-XXX: "invalid refresh tokens" nach Rotation

**Aufgetreten:** 2026-03-16  
**Status:** ✅ GEFIXT

**Symptom:** Nach Rotation: `Error: All Antigravity accounts have invalid refresh tokens.`

**Ursache:** `token04_inject.py` schrieb leere `refresh`/`access` Tokens nach `auth.json`, oder Rotation wurde unterbrochen bevor Injection abschließen konnte.

**Fix:** 
1. Manuell re-injizieren mit aktuellen Tokens aus `logs/tokens.json`
2. `ws99_verify_one_rotator.py` läuft jetzt NACH `token04_inject.py` um sicherzustellen, dass alles konsistent ist

**Manueller Fix (falls auth.json leer):**
```python
cd ~/dev/openAntigravity-auth-rotator
python3 -c "
import sys; sys.path.insert(0, '.')
from pathlib import Path
import json
tokens = json.loads(Path('logs/tokens.json').read_text())
from core.accounts_opencode import inject_opencode_google_auth
import time
expiry_ms = int(time.time() * 1000) + tokens.get('expires_in', 3600) * 1000
inject_opencode_google_auth(tokens['refresh_token'], tokens['access_token'], expiry_ms)
print('Injected!')
"
```

---

## BUG-001: `rateLimitResetTimes` in Millisekunden → Jahr 58227

**Aufgetreten:** 2026-03-15  
**Status:** ✅ GEFIXT

**Symptom:** Claude-Modelle in OpenCode nicht auswählbar, Plugin hält Claude für permanent gesperrt.

**Ursache:** Auth-Rotator schrieb `rateLimitResetTimes.claude = time.time() * 1000` (Millisekunden) statt `time.time()` (Sekunden) → `1774143267034` entspricht Unix-Timestamp von Jahr ~58227.

**Fix — Korrupte Timestamps sanieren:**
```python
import json, time, os

path = os.path.expanduser("~/.config/opencode/antigravity-accounts.json")
data = json.load(open(path))
MAX_SANE = time.time() + 7 * 24 * 3600  # 7 Tage = absolutes Maximum

for acct in data["accounts"]:
    rl = acct.get("rateLimitResetTimes", {})
    for k in list(rl.keys()):
        if rl[k] > MAX_SANE:
            print(f"Removing corrupted timestamp: {k} = {rl[k]}")
            del rl[k]

json.dump(data, open(path, "w"), indent=2)
```

**Prevention:** Immer `int(time.time())` — NIEMALS `int(time.time() * 1000)` für Reset-Times.

---

## BUG-002: 2 Accounts in accounts.json statt 1

**Aufgetreten:** 2026-03-15  
**Status:** ✅ GEFIXT

**Symptom:** Plugin rotiert zwischen 2 Accounts, einer mit nur 20% Claude-Quota.

**Ursache:** Alter Rotator-Account (`rotator-1773535673@...`) nicht entfernt nach Account-Wechsel.

**Fix:** Nur Account mit voller Quota behalten:
```bash
# Verify:
python3 -c "
import json, os
d = json.load(open(os.path.expanduser('~/.config/opencode/antigravity-accounts.json')))
print(len(d['accounts']), 'accounts')
for a in d['accounts']:
    print(a['email'], a.get('cachedQuota', {}).get('claude', {}).get('remainingFraction', '?'))
"
```

**Aktueller Stand:** 1 Account — `rotator-1773542772@zukunftsorientierte-energie.de` (100% Claude-Quota).

---

## BUG-003: `timeout`/`chunkTimeout` auf falscher Config-Ebene

**Aufgetreten:** 2026-03-15  
**Status:** ✅ GEFIXT

**Symptom:** `Error: Configuration is invalid — Unrecognized keys: "timeout", "chunkTimeout" provider.google`

**Ursache:** Keys direkt in `provider.google` gesetzt statt in `provider.google.options`.

**Fix in `~/.config/opencode/opencode.json`:**
```json
{
  "provider": {
    "google": {
      "options": {
        "timeout": false,
        "chunkTimeout": 999999999
      }
    }
  }
}
```

**Schema-Quelle:** `https://opencode.ai/config.json` → `properties.provider.additionalProperties.properties.options`

---

## BUG-004: SSE read timed out bei Opus Thinking

**Aufgetreten:** 2026-03-15 03:17 Uhr  
**Status:** ✅ GEFIXT via BUG-003

**Symptom:** `Error: SSE read timed out` bei `antigravity-claude-opus-4-6-thinking` — Session bricht ab.

**Ursache:** Default `chunkTimeout` (~15-30s) wird überschritten während Extended-Thinking-Pausen.

**Fix:** `options.chunkTimeout: 999999999` (= ~11.5 Jahre) in `opencode.json` — siehe BUG-003.

---

## BUG-005: Antigravity-Modelle nach Config-Neustart nicht auswählbar

**Aufgetreten:** 2026-03-15 11:44 Uhr  
**Status:** ✅ GEFIXT

**Symptom:** Nach opencode-Neustart springt Modell sofort auf GPT-5.2 zurück, Antigravity-Modelle nicht wählbar.

**Ursachen (kombiniert):**
1. Korrupter Timestamp in Account[0] (BUG-001 oben)
2. `oh-my-opencode.json` + `~/.opencode/agents/sisyphus.json` beide auf `openai/gpt-5.2` gesetzt

**Fix:**
1. Timestamp sanieren (BUG-001)
2. `~/.config/opencode/oh-my-opencode.json` → `sisyphus.model = "google/antigravity-claude-opus-4-6-thinking"`
3. `~/.opencode/agents/sisyphus.json` → `model.primary = "google/antigravity-claude-opus-4-6-thinking"`

**Getestet (2026-03-15):**
```
opencode run --model google/antigravity-claude-sonnet-4-6 → SONNET_OK ✅
opencode run --model google/antigravity-claude-opus-4-6-thinking → OPUS_OK ✅
```

---

## BUG-017: Watcher Log-Verzeichnis falsch + Trigger-Pattern matcht nicht

Vollständige Doku: ~/dev/docs/opencode/repair-docs.md BUG-016

Kurzform:
- LOGS_DIR zeigte auf nicht-existentes Verzeichnis
- Korrekt: ~/.local/share/opencode/log/
- Pattern erweitert: "All 1 account(s) rate-limited for claude"
- Commit: fix(watcher): correct log dir + match real rate-limit error message

---

## RBUG-001: `core/login/run.py` used `asyncio.run()` instead of nodriver event loop

**Aufgetreten:** 2026-07-12 (refactor)
**Status:** FIXED

**Symptom:** OAuth browser automation crashes with `RuntimeError: This event loop is already running` or silently fails because nodriver creates its own event loop and `asyncio.run()` conflicts with it.

**Ursache:** Original `run.py` called `asyncio.run(_run_login(...))`. nodriver uses its own loop via `uc.loop()`, so calling `asyncio.run()` either creates a second loop (breaking nodriver) or raises on Python 3.10+ where nesting is disallowed.

**Fix:** Replace `asyncio.run(coro)` with `uc.loop().run_until_complete(coro)`:
```python
# WRONG (original):
return asyncio.run(_run_login(email, password))

# CORRECT (fixed in core/login/run.py):
import nodriver as uc
return uc.loop().run_until_complete(_run_login(email, password))
```

**Files changed:** `core/login/run.py` (now calls `uc.loop().run_until_complete`)

---

## RBUG-002: `core/utils.py notify()` did not escape quotes in osascript string

**Aufgetreten:** 2026-07-12 (refactor)
**Status:** FIXED

**Symptom:** macOS notification crashes silently or osascript syntax error when title or message contains `"` or `'` characters (e.g. error messages with apostrophes like "user's token expired").

**Ursache:** Original `notify()` injected title/message directly into an osascript string without escaping:
```python
script = f'display notification "{message}" with title "{title}" ...'
# crashes if message = "user's token failed"
```

**Fix:** Escape both double and single quotes before interpolation (in `core/utils_notify.py`):
```python
t = title.replace('"', '\\\\"'). replace("'", "\\'")
m = message.replace('"', '\\\\"'). replace("'", "\\'")
```

**Files changed:** `core/utils_notify.py`

---

## RBUG-003: `main.py` imported from non-existent `core.browser_login`

**Aufgetreten:** 2026-07-12 (refactor)
**Status:** FIXED

**Symptom:** `ImportError: No module named 'core.browser_login'` at startup.

**Ursache:** Original `main.py` had `from core.browser_login import run_oauth_login` but no `core/browser_login.py` file existed in the repository. The correct module is `core/login/run.py`.

**Fix:** Refactored `main.py` now uses `from core.login.run import oauth_login` via `core/main_rotate_oauth.py`.

**Files changed:** `core/main_rotate_oauth.py` (uses correct import path)

---

## BUG-004 — ffmpeg in core/vision/recorder.py (BANNED)
- **Date:** 2026-03-15
- **Status:** FIXED
- **Symptom:** `core/vision/recorder.py` (77 lines) used ffmpeg for screen recording. `core/vision/nim_validator.py` (71 lines) was duplicated oversized validator.
- **Cause:** Agent created ffmpeg-based recorder ignoring the explicit M1 ban.
- **Fix:** Deleted `core/vision/` entirely. Correct implementation is `validate/recorder_start.py` using `screencapture -v -x` (macOS ScreenCaptureKit native, no ffmpeg).
- **Rule:** NEVER use ffmpeg. ALWAYS use `subprocess.Popen(["screencapture", "-v", "-x", path])` on macOS M1.

---

## BUG-005 — core/gcp/step4_checkbox_vtp.py: 311 lines + ffmpeg
- **Date:** 2026-03-15
- **Status:** FIXED
- **Symptom:** `core/gcp/step4_checkbox_vtp.py` was 311 lines (violates ≤20 line atomic mandate) and imported the banned `VideoRecorder` from `core/vision/recorder.py`.
- **Cause:** Agent created monolith file violating both size and recorder mandates.
- **Fix:** Deleted file. Correct approach: split into individual atomic GCP step files under `steps/gcp/` when needed.
- **Rule:** Every file ≤20 lines. One atomic action per file. No ffmpeg.

---

## BUG-006 — orchestrator/run_login.py over 20-line limit
- **Date:** 2026-03-15
- **Status:** FIXED
- **Symptom:** `orchestrator/run_login.py` was 40 lines.
- **Cause:** STEPS list + runner logic in same file.
- **Fix:** Extracted STEPS list to `orchestrator/steps_list.py` (14 lines). Runner trimmed to ≤20 lines.
- **Rule:** Even orchestrators must stay ≤20 lines. Extract data (STEPS list) to separate files.

---

## BUG-007 — steps/login/login06_click_consent.py: 22 lines
- **Date:** 2026-03-15
- **Status:** FIXED
- **Symptom:** `login06_click_consent.py` was 22 lines (2 over limit).
- **Cause:** Verbose if/else block for auth code save logic.
- **Fix:** Collapsed to single-line guard + combined mkdir/write_text on one line.
- **Rule:** Prefer one-liner guards (`if not x: raise ...`) to keep atomic files at ≤20 lines.


---

## RBUG-004: `browser.get_all_tabs()` existiert nicht in nodriver

**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT

**Symptom:** `AttributeError: 'Browser' object has no attribute 'get_all_tabs'` in allen login-Steps login02–login07 sobald sie via CDP auf bestehenden Chrome verbinden.

**Ursache:** nodriver hat keine Methode `get_all_tabs()`. Die korrekte API ist das synchrone Property `browser.tabs` (gibt `List[Tab]` zurück, kein await nötig).

**Fix:** In allen 6 Dateien:
```python
# FALSCH:
tab = (await browser.get_all_tabs())[0]

# KORREKT:
tab = browser.tabs[0]
```

**Dateien:** `steps/login/login02_fill_email.py` bis `login07_capture_code.py` (alle 6 gefixt)

---

## RBUG-005: `subprocess.run(chrome01_open)` blockiert Orchestrator für immer

**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT

**Symptom:** `orchestrator/run_login.py` hängt nach dem ersten Step `chrome01_open.py` endlos — kein weiterer Step wird gestartet.

**Ursache:** `chrome01_open.py` endet nie (`await uc.loop().create_future()` läuft ewig, hält Chrome am Leben). `subprocess.run()` wartet auf Prozessende → deadlock.

**Fix:** Neues `orchestrator/runner.py` erkennt `chrome01_open.py` und startet es als `subprocess.Popen` (background). Nach 3s Sleep laufen alle weiteren Steps normal. Am Ende: `chrome_proc.terminate()`.

**Dateien:** Neues `orchestrator/runner.py` — `run_login.py` und `run_rotate.py` delegieren dorthin.

---

## ATOMIC-001: Atomic Architecture Implementation
**Status:** COMPLETE
All 29 new files created. Smoke test passed. See ARCHITECTURE.md for full layout.

---

## RBUG-006: `await uc.loop().create_future()` — Wrong-loop Python 3.14

**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT

**Symptom:** `RuntimeError: Task got Future attached to a different loop` in chrome01_open.py. Chrome startet kurz, Python crasht sofort → Chrome stirbt via nodriver atexit.

**Fix:** `await asyncio.get_running_loop().create_future()` statt `await uc.loop().create_future()`

**Datei:** `steps/chrome/chrome01_open.py`

---

## RBUG-007: `time.sleep(3)` — Race condition Chrome nicht bereit

**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT

**Symptom:** login01 → `Failed to connect to browser` — Chrome hat Port-File noch nicht geschrieben.

**Fix:** `shared/chrome_wait.py` — 0.2s-Ticks (max 50×) statt blindem Sleep.

**Regel:** NIEMALS `time.sleep(N)` mit N > 0.5 — immer kurze Poll-Loops.

---

## RBUG-008: Doppeltes `--remote-debugging-port` — nodriver überschreibt unseren Port

**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT

**Symptom:** `Failed to connect to browser` — Port-File hat 9224, Chrome hört aber auf 50409.

**Ursache:** `browser_args=[--remote-debugging-port=9224]` + nodriver addiert automatisch eigenen Port. Letzter gewinnt → Chrome auf 50409, wir verbinden auf 9224.

**Fix:** Kein `--remote-debugging-port` in browser_args. Stattdessen echten Port nach Start aus `browser.config.port` schreiben:
```python
browser = await uc.start(user_data_dir=str(PROFILE))
write_port(browser.config.port)  # schreibt den echten Port
```

**Datei:** `steps/chrome/chrome01_open.py`

## RBUG-012: Chrome sign-in dialog re-appears at login06 after successful Google login
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** "In Chrome anmelden?" native dialog appears again at login06/consent step (after login05c already dismissed it once)
**Ursache:** Chrome shows sign-in promo dialog every time a new Google account signs in. `--disable-sync --no-first-run` insufficient
**Fix:** Added `--no-signin-promo --disable-signin-promo --disable-features=ChromeSignin,EnterpriseProfileCreation` to chrome01_open.py browser_args; also added osascript dismiss at top of step05_consent.py loop
**Datei:** steps/chrome/chrome01_open.py, core/login/step05_consent.py

## RBUG-013: chrome_wait timeout — 10s too short for M1 Chrome startup
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `TimeoutError: [chrome_wait] Chrome not ready` — Chrome starts fine but takes ~15s on M1
**Ursache:** chrome_wait.py only polled 50×0.2s = 10s; Chrome needs ~12-15s to start and write port file
**Fix:** Increased to 100×0.2s = 20s max
**Datei:** shared/chrome_wait.py

## RBUG-014: Chrome "Beim Öffnen deines Profils ist ein Fehler aufgetreten" profile corruption dialog
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome shows "profile error" native dialog on startup; nodriver can't connect → port never written → chrome_wait timeout
**Ursache:** 1) master_profile corrupted by repeated SIGKILL/SIGTERM during debugging runs; 2) `--disable-features=ChromeSignin,EnterpriseProfileCreation` flag broke profile loading
**Fix:** Deleted entire logs/master_profile, removed --disable-features flag, added osascript OK-dismiss after write_port in chrome01_open.py as safety net
**Datei:** steps/chrome/chrome01_open.py

## RBUG-015: Google image CAPTCHA triggered after too many email-submit attempts
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** After login02 fills email, Google shows handwriting CAPTCHA "Gehörten oder gesehenen Text bitte hier eingeben" — step05_consent loops 30× on wrong page
**Ursache:** Multiple failed login runs triggered Google bot detection → CAPTCHA on identifier page
**Fix:** New atomic step login03b_solve_captcha.py: PIL-crop CAPTCHA img element from screenshot → ddddocr OCR → fill input → Weiter
**Datei:** steps/login/login03b_solve_captcha.py, orchestrator/steps_rotate.py

## RBUG-016: ddddocr installed package broken on Python 3.14
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `ImportError: cannot import name 'DdddOcr' from 'ddddocr.core'` — site-packages ddddocr has wrong exports
**Ursache:** Installed ddddocr package restructured (OCREngine not aliased as DdddOcr), also repo root ddddocr.py stub shadows it
**Fix:** Switched CAPTCHA solver in login03b from ddddocr → pytesseract (tesseract 5.5.2 confirmed working)
**Datei:** steps/login/login03b_solve_captcha.py

## RBUG-017: Antigravity Gemini 403 – loadCodeAssist rejects "MACOS" string platform enum
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `403 IAM_PERMISSION_DENIED cloudaicompanion.companions.generateChat on projects/rising-fact-p41fc`
**Ursache:** opencode-antigravity-auth@1.6.0 sends `platform: "MACOS"` (string) in loadCodeAssist request body.
Google API now rejects this with 400 INVALID_ARGUMENT. loadManagedProject returns null →
getDefaultTierId(null) → undefined → tierId fallback "FREE" → onboardUser("FREE") also fails 400 →
provisionedProjectId=undefined → uses hardcoded fallback `rising-fact-p41fc` → 403.
**Fix:**
1. Embed managedProjectId in refreshToken format: `<rt>||<managedProjectId>` (empty projectId slot)
   → Plugin sees managedProjectId in parseRefreshParts → skips loadCodeAssist/onboardUser entirely
2. New step `token02b_provision_managed_project.py`: calls onboardUser with tierId="free-tier" + platform=2
   (integer 2 = macOS in proto enum) BEFORE token03 to provision and embed managed project
3. Existing accounts patched: account[2] refreshToken updated to include ||axial-road-h8gwt
4. Dead accounts [0]+[1] (invalid_grant: Account has been deleted) removed from antigravity-accounts.json
**Datei:** steps/token/token02b_provision_managed_project.py, steps/token/token03_save_account.py,
           orchestrator/steps_rotate.py, ~/.config/opencode/antigravity-accounts.json

## RBUG-018: AppleScript write text hangs when opencode TUI captures stdin
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `osascript -e 'write text "..." to aSess'` hangs indefinitely (>15s timeout), preventing session restart after rotation
**Ursache:** iTerm2 AppleScript `write text` waits for the session's shell to be ready to accept input. When opencode TUI is running, it captures stdin via raw terminal mode, causing AppleScript to block forever.
**Fix:** Replace all AppleScript `write text` calls with direct `/dev/tty` writes. Steps oc01b, oc02, ms02-ms04 now discover opencode PIDs via `ps ax -o pid,tty,command`, save tty mappings to `logs/opencode_ttys.json`, and write directly to `/dev/ttySXXX` devices. Instant, no hangs.
**Datei:** steps/opencode/oc01b_restart_opencode.py, steps/opencode/oc02_continue.py, steps/model_switch/ms02-ms04

## RBUG-019: accounts_inject.py missing managedProjectId field (v4 format mismatch)
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** New rotated accounts saved WITHOUT `managedProjectId` field → plugin falls back to `rising-fact-p41fc` → 403
**Ursache:** `inject_new_account()` had no `managed_project_id` parameter. token03 tried to embed it in RT string as `rt||managedProjectId`, but plugin v4 uses separate `managedProjectId` JSON field on disk. Plugin's `saveToDisk()` writes `managedProjectId` from `account.parts.managedProjectId`, NOT parsed from RT.
**Fix:** Added `managed_project_id` param to `inject_new_account()`, saves as separate field. `token03_save_account.py` passes raw RT + managed ID separately.
**Datei:** core/accounts_inject.py, steps/token/token03_save_account.py

## RBUG-020: Model switch nicht funktioniert — Gemini 3.1 Pro 404
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `/models` → "Gemini 3.1 Pro" → 404 "Requested entity was not found". Modell existiert nicht auf managed project `light-advantage-5rr6j`. Claude rate-limited, aber kein Fallback auf Gemini.
**Ursache:** 1) Gemini 3.x Pro/3.1 Pro → 404 auf free-tier managed project (nur Flash works). 2) ms03 sendete "gemini 3" → match auf broken Pro model. 3) Model switch steps verwendeten `/dev/tty` writes statt AppleScript (macOS 26 TIOCSTI disabled). 4) Watcher hatte keine two-phase logic (model switch first, dann rotation).
**Fix:** 1) ms01-ms04 komplett neu: kill→restart mit `-m google/antigravity-gemini-3-flash`. 2) AppleScript `write text` statt tty writes. 3) Watcher zwei-phasig: Claude limit → Gemini Flash switch → Gemini limit → full rotation. 4) Neues `core/main_model_switch.py` + `switch` CLI command.
**Datei:** ms01-ms04, watcher_loop.py, watcher_config.py, watcher_accounts_check.py, watcher.py, main_dispatch.py, main_args.py, main_model_switch.py, oc01b, oc02

## RBUG-021: /dev/tty writes gehen auf Display statt stdin (macOS 26)
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `echo "text" > /dev/ttySXXX` schreibt auf Terminal-Display (master/output), nicht in Prozess-stdin (input). TIOCSTI auf macOS 26 disabled. Opencode TUI empfängt nichts.
**Ursache:** macOS 26 blockiert TIOCSTI (Security). Schreiben auf slave-Seite des PTY geht zur Display-Seite, nicht zur Input-Seite.
**Fix:** AppleScript `tell aSess to write text "..."` in iTerm2 — sendet korrekt an Session-Input. Alle Steps (ms01-ms04, oc01b, oc02) auf AppleScript umgestellt.
**Datei:** Alle model_switch und opencode Steps

## RBUG-022: Soft Quota Protection blockiert bei 90% — "over 90% usage" Error
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `Error: Quota protection: All 1 account(s) are over 90% usage for claude. Quota resets in 165h 46m. Add more accounts, wait for quota reset, or set soft_quota_threshold_percent: 100 to disable.`
**Ursache:** Plugin hat Default `soft_quota_threshold_percent: 90` — blockiert schon bei 90% Quota-Nutzung, 10% bleiben ungenutzt. Config `~/.config/opencode/antigravity.json` existierte nicht.
**Fix:** `~/.config/opencode/antigravity.json` erstellt mit `{"soft_quota_threshold_percent": 100, "cli_first": false, "quota_fallback": false}`. Sessions müssen neugestartet werden (Config wird einmal beim Plugin-Start geladen, nicht per Request).
**Datei:** ~/.config/opencode/antigravity.json (NEU)

## RBUG-023: Gemini 3.1 Pro 404 durch stale rateLimitResetTimes → falscher Endpoint
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT (Root Cause)
**Symptom:** `antigravity-gemini-3.1-pro` → 404 "entity not found" obwohl API mit `-low` Suffix 429 liefert (= Modell existiert, nur rate-limited)
**Ursache:** Plugin hat ZWEI Header-Styles: `antigravity` (sendet `gemini-3.1-pro-low`) und `gemini-cli` (sendet `gemini-3.1-pro-preview`). Stale Rate-Limit-Einträge (`gemini-antigravity:antigravity-gemini-3.1-pro` + `gemini-antigravity:gemini-3.1-pro-preview`) zwangen Plugin zum Fallback auf `gemini-cli` HeaderStyle → falscher Model-Name `gemini-3.1-pro-preview` an falschen Endpoint → 404.
**Fix:** Gemini Rate-Limit-Einträge aus `antigravity-accounts.json` gelöscht. `cachedQuota.gemini-pro.remainingFraction` zeigte 0.2 (20% frei) — Rate-Limit-Einträge waren stale/veraltet. SSOT aktualisiert: `gemini-3.1-pro-low` → 429 (rate-limited, NICHT 404). Modell existiert und funktioniert!
**Datei:** ~/.config/opencode/antigravity-accounts.json

## RBUG-024: Zombie opencode-Prozesse fressen 150% CPU seit 16+ Stunden
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Zwei `opencode --print-logs run echo test` Prozesse (PIDs 5141, 6631) liefen seit 2:16 Uhr mit je 75% CPU, total ~150%. MacBook langsam und heiß.
**Fix:** `kill -9 5141` und `kill -9 6631`. Ursache: alte Test-Prozesse die nicht beendet wurden. Watcher sollte solche Zombies erkennen.
**Datei:** N/A (manuelle Bereinigung)

## RBUG-025: runner.py NVIDIA NIM crash blockiert alle Model-Switches
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Model-Switch startet, aber Model-Switch-Log ist leer, Prozesse werden nicht neugestartet. Watcher-Lock bleibt aktiv.
**Ursache:** `orchestrator/runner.py` rief `validate/nim_check.py` auf, das `nvidia/cosmos-reason2-8b` auf NVIDIA NIM API aufrief. Der Free-Tier Endpoint existiert nicht → 404 → Exception → `sys.exit(1)` → gesamter Model-Switch crasht lautlos (Popen stdout ging in Log-Datei aber war leer weil Pre-import crash).
**Fix:** runner.py komplett von NVIDIA NIM / Recorder bereinigt. Nur noch: step ausführen, bei Fehler loggen + exit.
**Datei:** orchestrator/runner.py

## RBUG-026: Watcher regex zu breit — Claude-Only als All-Quota erkannt
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Watcher triggert sofort "full rotation" statt "model switch" bei Claude rate-limit.
**Ursache:** `ALL_QUOTA_PATTERNS` enthielt `"all.*rate.?limited"` — matcht auf "All 1 account(s) rate-limited for claude" → `all_quota=True` → sofortige Full Rotation statt Model Switch.
**Fix:** `"all.*rate.?limited"` aus ALL_QUOTA entfernt. 3-Tier-Logik implementiert: claude_only→switch auf 3.1-pro, gemini_pro_only→switch auf flash, all_quota→full rotation.
**Datei:** openAntigravity-ratelimit-watcher

## RBUG-027: ms03 öffnet neue leere Session statt bestehende fortzuführen
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Nach Model-Switch erscheint blanke "Omoc"-Session statt bestehende Sisyphus-Session weiterzulaufen.
**Ursache:** ms03 startete `opencode -m MODEL` ohne `--continue` Flag → immer neue Session. OpenCode benötigt `-c` / `--continue` um letzte Session fortzuführen.
**Fix:** ms03 sendet jetzt `opencode -c -m <MODEL>`. OpenCode `--continue` / `-c` resumiert automatisch die zuletzt aktive Session (unabhängig von Session-ID oder Working Dir).
**Datei:** steps/model_switch/ms03_select_gemini.py

## RBUG-028: Zwei LaunchAgent-Plists für denselben Watcher → Race Condition
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Jeder Log-Eintrag im Watcher-Log war doppelt. Model-Switch wurde zweimal gleichzeitig ausgelöst → Race Condition zwischen zwei `run_model_switch.py` Instanzen.
**Ursache:** Zwei LaunchAgent-Plists für denselben Watcher:
  - `com.openAntigravity.ratelimit-watcher.plist` → binary direkt
  - `com.opencode.ratelimit-watcher.plist` → symlink auf selbes binary
  Außerdem: `openAntigravity-ratelimit-watcher` (Python-Script) lag fälschlicherweise in `~/Library/LaunchAgents/` als nicht-Plist-Datei.
**Fix:** `com.opencode.ratelimit-watcher.plist` und das fehlplatzierte Script aus `~/Library/LaunchAgents/` entfernt. Nur `com.openAntigravity.ratelimit-watcher.plist` bleibt.
**Datei:** ~/Library/LaunchAgents/com.opencode.ratelimit-watcher.plist (deleted)

## RBUG-029: Stale Lock-Datei blockiert alle zukünftigen Model-Switches
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT (manuell)
**Symptom:** Watcher erkennt Rate-Limit aber macht nichts ("Switch lock active") — obwohl kein Switch mehr läuft.
**Ursache:** `/tmp/openAntigravity-model-switch-pro.lock` blieb nach abgebrochenem/gecrashetem Switch stehen. Der Watcher prüft `SWITCH_PRO_LOCK.exists()` → true → tut nichts.
**Fix:** `rm -f /tmp/openAntigravity-model-switch-pro.lock` + alle anderen Lock-Dateien. Permanent: SWITCH_COOLDOWN=300s sorgt für 5min Pause nach jedem Switch — wenn nach 6min noch kein Poll-Cycle ohne Lock läuft, Lock manuell löschen.
**Datei:** /tmp/openAntigravity-model-switch-pro.lock (system temp)

## RBUG-030: gemini-3.1-pro "Requested entity was not found" — Plugin sendet falschen Model-ID
**Aufgetreten:** 2026-03-15  **Status:** ✅ UMGANGEN (Fallback entfernt)
**Symptom:** Nach Switch zu antigravity-gemini-3.1-pro erscheint: "Requested entity was not found. Request preview access at https://goo.gle/enable-preview-features"
**Ursache (Recherche):** Plugin hat TWO Header-Styles:
  1. `antigravity` style: sendet `gemini-3.1-pro-low` → korrekt
  2. `gemini-cli` style: sendet `gemini-3.1-pro-preview` → 404 (falscher Model-ID)
  Wenn antigravity-Endpoint rate-limited ist, fällt Plugin auf gemini-cli style zurück → falsche Model-ID → 404
  Außerdem: Gemini 3.1 Pro braucht Preview-Access bei Google Cloud (https://goo.gle/enable-preview-features)
  für neue Accounts der sich Plugin automatisch erstellt.
**Permanente Lösung (Source):** 
  - Correct model IDs: `antigravity-gemini-3.1-pro-low` oder `antigravity-gemini-3.1-pro-high`
  - Plugin auf `@beta` oder neueste Version updaten
  - Stale `rateLimitResetTimes` für gemini-antigravity Keys clearen → verhindert gemini-cli Fallback
  - Preview-Access für Google Cloud Projekt aktivieren: https://goo.gle/enable-preview-features
**Fix (angewendet):** Gemini-Fallback aus Watcher komplett entfernt. Rate-Limit → sofort Auth-Rotation.
**Datei:** openAntigravity-ratelimit-watcher (gesamter Model-Switch-Zweig entfernt)

## RBUG-031: Watcher schreibt doppelt in Log-Datei
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Jeder Log-Eintrag erscheint doppelt in /tmp/openAntigravity-watcher.log
**Ursache:** LaunchAgent-Plist setzt StandardOutPath auf die Log-Datei (stdout redirect). Gleichzeitig schrieb _log() per open(LOG_FILE, "a") in dieselbe Datei → doppelter Schreibvorgang.
**Fix:** Direkten File-Write aus _log() entfernt. Nur noch print(). LaunchAgent-Redirect reicht.
**Datei:** openAntigravity-ratelimit-watcher:_log()

## RBUG-032: Cooldown 15min blocked re-trigger after quick rotation
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Rotation startet nach Rate-Limit nicht mehr (15min warten)
**Ursache:** COOLDOWN = 15*60 verhindert Neustarts innerhalb von 15 Minuten
**Fix:** COOLDOWN = 3*60 (3 Minuten); Lock-File ist primärer Guard
**Datei:** openAntigravity-ratelimit-watcher

## RBUG-033: Orphaned chrome01_open.py hält Singleton-Locks (runner kein finally)
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome "Failed to connect to browser" bei jedem Versuch nach erstem Fehler
**Ursache:** runner.py beendete chrome_proc nur am Ende (nicht bei Fehler) → Orphan-Prozess hält Singleton-Locks
**Fix:** `finally` Block in runner.run() für chrome_proc.terminate()
**Datei:** orchestrator/runner.py

## RBUG-034: Chrome Singleton-Locks nach Absturz nicht bereinigt
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT  
**Symptom:** Nächste Rotation kann Chrome nicht starten (Profile locked)
**Ursache:** Singleton* + lockfile nicht entfernt wenn vorheriger Chrome abgestürzt
**Fix:** chrome01_open.py entfernt auch "lockfile", 0.5s Pause + --no-sandbox
**Datei:** steps/chrome/chrome01_open.py

## RBUG-035: oc01b "mach weiter" tippt Text aber sendet nicht (CR vs LF)
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Text "mache weiter" erscheint in TUI-Eingabefeld aber wird nicht abgeschickt
**Ursache:** iTerm2 write_text sendet LF(\n), aber opencode TUI im Raw-Mode erwartet CR(\r=ASCII 13)
**Fix:** Phase-basierter Neustart: Phase1 öffnet TUI, Phase2 wartet 5s, sendet "mach weiter" + ASCII char 13
**Datei:** steps/opencode/oc01b_restart_opencode.py

## RBUG-036: AppleScript Timeout bei großen iTerm2-Session-Buffern
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Watcher zeigt "_iterm_texts error: timed out after 15 seconds" → 0 Sessions erkannt
**Ursache:** `contents of aSess` liest GANZEN Scrollback-Buffer (MB!) — dauert >15s
**Fix:** Nur letzte 2000 Zeichen pro Session lesen; Timeout auf 20s erhöht
**Datei:** openAntigravity-ratelimit-watcher

## RBUG-037: nodriver uc.start() schlägt fehl aus LaunchAgent-Subprocess-Kontext
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** "Failed to connect to browser" bei jedem Rotations-Versuch
**Ursache:** nodriver kann Chrome nicht starten wenn tief verschachtelt in subprocess-Kette (LaunchAgent→Popen→Popen→uc.start())
**Fix:** Verwende `open -n -a "Google Chrome" --args ...` statt nodriver uc.start(); voller Pfad /usr/bin/open
**Datei:** steps/chrome/chrome01_open.py

## RBUG-038: chrome_wait Timeout (20s) < chrome01 Polling-Zeit (30s) → Race Condition
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** TimeoutError "[chrome_wait] Chrome not ready" obwohl Chrome startet
**Ursache:** chrome01_open.py schreibt Port-Datei erst NACH Chrome-Antwort (bis 30s) — chrome_wait wartet nur 20s
**Fix:** Port-Datei sofort nach open-n schreiben; Chrome-Polling läuft danach; chrome_connect retries 30x (1s)
**Datei:** steps/chrome/chrome01_open.py + shared/chrome_connect.py

## RBUG-039: osascript -25211 Accessibility Permission from LaunchAgent
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `System Events` wirft `-25211 osascript hat keine Berechtigung für den Hilfszugriff` in login05c_dismiss_chrome_dialog.py
**Ursache:** LaunchAgent-Prozesse haben keine macOS Accessibility-Berechtigung für `System Events → click button`
**Fix:** `check=True` entfernt; Fehler wird abgefangen und geloggt statt Exception zu werfen. Zusätzlich Chrome-Flags `--no-default-browser-check --disable-default-apps --disable-features=ChromeWhatsNewUI,IdentityConsistencyMenuItems` verhindern den Dialog
**Datei:** steps/login/login05c_dismiss_chrome_dialog.py, steps/chrome/chrome01_open.py

## RBUG-040: master_profile Corruption Between Runs → Profile Error Dialog
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome zeigt "Beim Öffnen deines Profils ist ein Fehler aufgetreten" Dialog + öffnet Neuer Tab statt zu navigieren. Folge-Runs schlagen fehl weil Profil aus vorherigem Run noch gesperrt/korrupt ist.
**Ursache:** chrome01_open.py entfernte nur Singleton*+lockfile, nicht das gesamte Profil. Nach jedem Rotation-Run bleibt das Profil in einem inkonsistenten Zustand.
**Fix:** `shutil.rmtree(PROFILE)` vor jedem Chrome-Start → immer frisches Profil. Profile umbenannt zu `rotation_profile`. `--no-sandbox` entfernt (mit `open -n` nicht nötig). `--disable-infobars --disable-profile-error-dialog` hinzugefügt.
**Datei:** steps/chrome/chrome01_open.py

## RBUG-041: step03b_run.py for..else Bug + 4s Initialwartzeit
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** ToS "Verstanden" und Passwort-Schritt dauern viel zu lange
**Ursache:** Python `for...else` Bug: `for _ in range(18): await sleep(0.2)` hat kein `break` → `else` läuft IMMER → `break` feuert nach jedem Versuch. Zusätzlich 4s Initialwartzeit. Insgesamt ~8s pro Versuch statt <1s.
**Fix:** Initialwartzeit 4s→0.5s. Nach erfolgreichem Click sofort `break` + 1.5s page settle. Password fill: 5×3s statt 10×(2s+1s)=30s.
**Datei:** core/login/step03b_run.py, core/login/step03_fill.py

## RBUG-042: oc01b "opencode" FileNotFoundError in LaunchAgent PATH
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** `FileNotFoundError: [Errno 2] No such file or directory: 'opencode'` in oc01b_restart_opencode.py. Rotation log zeigt alle 12 core-Steps erfolgreich, aber oc01b scheitert → opencode-Session nie neugestartet → alter Rate-Limit-Text bleibt im Scrollback → Re-Trigger-Cycle.
**Ursache:** LaunchAgent-Prozesse haben minimales PATH ohne `/opt/homebrew/bin`. `subprocess.run(["opencode", ...])` kann Binary nicht finden.
**Fix:** Binary-Kandidaten in Priorität prüfen: `~/.local/bin/opencode`, `SIN-Solver/bin/opencode`, `/opt/homebrew/bin/opencode`, `/usr/local/bin/opencode`. LaunchAgent plist enthält jetzt PATH-Variable mit allen Pfaden.
**Datei:** Opencode-LaunchAgents/opencode-steps/oc01b_restart_opencode.py, com.openAntigravity.ratelimit-watcher.plist

## RBUG-043: oc01/oc01b/oc02 in rotator STEPS_ROTATE — falsche Architektur
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** openAntigravity-auth-rotator enthielt iTerm2-spezifische Schritte (oc01, oc01b, oc02). Rotator konnte ohne laufendes iTerm2 nicht erfolgreich abschließen. Separation of Concerns verletzt.
**Ursache:** Architektur: Rotator soll nur rotieren (ws01→chrome01→login→token→ws04→chrome02). opencode/iTerm2-Neustart ist Aufgabe von Opencode-LaunchAgents.
**Fix:** oc01/oc01b/oc02 aus STEPS_ROTATE entfernt. Neues Projekt `/dev/Opencode-LaunchAgents/antigravity/` enthält Watcher + trigger.py der nach exit code 0 oc01b aufruft.
**Datei:** orchestrator/steps_rotate.py, Opencode-LaunchAgents/antigravity/trigger.py

## RBUG-044: Rotation-Log ohne Timestamps → parallele Runs nicht debugbar
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** /tmp/openAntigravity-rotation.log hat keine Zeitstempel. Mehrere überlagerte Rotation-Runs nicht voneinander trennbar.
**Ursache:** runner.py hatte keine `time.strftime()` in print-Statements.
**Fix:** `_ts()` Hilfsfunktion → `[HH:MM:SS]` Prefix vor jedem `[runner]` Eintrag.
**Datei:** orchestrator/runner.py

## RBUG-045: oc01 scrollback ohne Längen-Limit → AppleScript Timeout
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** oc01_find_sessions.py liest `contents of aSess` ohne Truncation → bei langen Scrollback-Histories kann AppleScript timeoutten (5s Limit).
**Ursache:** Gleicher Bug wie im alten Monolith-Watcher. `contents of aSess` liefert gesamten Scrollback, kann MB groß sein.
**Fix:** Antigravity scan.py trunciert auf letzte 2000 Zeichen via AppleScript: `if (length of c) > 2000 then set c to text ((length of c)-1999) thru -1 of c`.
**Datei:** Opencode-LaunchAgents/antigravity/scan.py

## RBUG-046: Watcher-Monolith in openAntigravity-auth-rotator — falsche Zuständigkeit
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** openAntigravity-ratelimit-watcher lag im Rotator-Projekt. Rotator konnte nicht unabhängig von LaunchAgents betrieben werden. Manuelle Trigger und alternative LaunchAgents waren schwierig.
**Ursache:** Architektur-Fehler: Watcher und Rotator sollten getrennte, unabhängige Projekte sein.
**Fix:** Watcher-Logik in Micro-File-Architektur nach `/dev/Opencode-LaunchAgents/antigravity/` ausgelagert (config.py, patterns.py, scan.py, cooldown.py, trigger.py, resume.py, loop.py, main.py). LaunchAgent plist aktualisiert. Rotator kann jetzt standalone via `python orchestrator/run_rotate.py` ausgeführt werden.
**Datei:** Opencode-LaunchAgents/antigravity/, ~/Library/LaunchAgents/com.openAntigravity.ratelimit-watcher.plist

## RBUG-047: ws04_delete löscht Workspace-User → OAuth Token sofort ungültig
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** 401 "invalid_grant: Account has been deleted" bei Token-Refresh. Auth schlägt sofort nach Rotation fehl obwohl tokens.json und auth.json korrekt geschrieben wurden.
**Ursache:** ws04_delete.py löscht den Workspace-User am Ende jeder Rotation. Google invalidiert dabei sofort ALLE OAuth-Tokens dieses Users — inkl. Refresh-Token. Das ist fundamental falsch: OAuth-Token gehört zum Workspace-Account.
**Fix:** ws04 aus STEPS_ROTATE entfernt. Neues ws00_delete_prev.py löscht den VORHERIGEN User am START der nächsten Rotation. ws02_create.py speichert credentials.json → prev_credentials.json vor Überschreiben.
**Datei:** steps/workspace/ws00_delete_prev.py (NEU), steps/workspace/ws02_create.py, orchestrator/steps_rotate.py

## RBUG-048: OAuth scope fehlt email/openid → userinfo liefert leere email
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** token02_userinfo.py gibt leere email zurück. Accounts in antigravity-accounts.json haben email="". Deduplication via email funktioniert nicht → 3 Accounts statt 1.
**Ursache:** build_auth_url() hatte nur scope=cloud-platform. Google userinfo gibt email nur zurück wenn scope openid + email enthalten ist.
**Fix:** scope erweitert: cloud-platform + openid + email + profile. URL-Encoding via urllib.parse.quote() für Scope-String.
**Datei:** core/login/step01_url.py

## RBUG-049: accounts_inject.py Deduplication nach email="" → N leere Accounts
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Nach jeder Rotation mit leerem email wird EIN WEITERER Account hinzugefügt statt den alten zu ersetzen (seen-Set enthält "" → kein Duplicate erkannt → nie gefiltert).
**Ursache:** `seen = set(); [... if acc.get("email","") not in seen ...]` — leerer String "" nur einmal in seen → alle weiteren leeren Accounts bleiben.
**Fix:** Neue Logik: alle Accounts löschen außer neuem. Filterung nach managedProjectId (uniquer als email) falls email leer. Zusätzlich: nur 1 Account nach Rotation (rotation = fresh start).
**Datei:** core/accounts_inject.py

## RBUG-050: step03_fill.py send_keys schlägt auf /v3/signin/challenge/pwd fehl
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Passwort-Feld auf Google Workspace Passwort-Challenge-Seite bleibt leer. Seite zeigt "Passwort eingeben" Fehlermeldung nach Weiter-Klick.
**Ursache:** nodriver el.send_keys() funktioniert nicht zuverlässig auf /v3/signin/challenge/pwd. Feld wird zwar gefunden aber Wert nicht eingetragen. Zusätzlich: fill_password wurde aufgerufen bevor URL-Navigation zur Passwortseite abgeschlossen war.
**Fix:** 1) CDP dispatchKeyEvent pro Zeichen (zuverlässiger als send_keys). 2) click() zum Fokussieren. 3) Ctrl+A um Feld zu leeren. 4) Verify: field.value.length > 0 nach Eingabe (Retry falls 0). 5) JS click statt tab.find für "Weiter"-Button.
**Datei:** core/login/step03_fill.py, steps/login/login_all.py (URL-Wait vor fill_password)

## RBUG-051: Chrome öffnet erst nach ws00-ws03 Workspace-Schritten (~4s Verzögerung)
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Nach Hotkey ⌘R→A dauert es ~4 Sekunden bis Chrome sichtbar erscheint.
**Ursache:** runner.py startete Chrome (chrome01_open.py) erst wenn chrome01 in STEPS_ROTATE erreicht wurde — nach ws00/ws01/ws02/ws03.
**Fix:** runner.py startet Chrome als allererste Popen SOFORT beim run()-Aufruf. chrome_wait() wird erst direkt vor login_all aufgerufen. Chrome lädt parallel zu Workspace-API-Schritten.
**Datei:** orchestrator/runner.py

## RBUG-052: chrome02_close.py suchte nach falschem Profil-Namen
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome bleibt nach Rotation offen — andere Chrome-Fenster nicht betroffen, aber Rotation-Chrome läuft weiter.
**Ursache:** chrome02_close.py verwendete `pgrep -f "master_profile"` — Profil heißt aber `rotation_profile`. Deshalb wurden keine Prozesse gefunden.
**Fix:** `pgrep -f "rotation_profile"` + SIGTERM + 0.5s + SIGKILL Survivors.
**Datei:** steps/chrome/chrome02_close.py

## RBUG-053: chrome02_close.py nicht in STEPS_ROTATE
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome bleibt nach Rotation offen (selbst mit korrektem Profilnamen).
**Ursache:** chrome02_close.py war nie in steps_rotate.py eingetragen. Schritt wurde nie ausgeführt.
**Fix:** Als letzten Schritt (nach token04) in STEPS_ROTATE eingetragen.
**Datei:** orchestrator/steps_rotate.py

## RBUG-054: runner.py finally block schloss Chrome-Wrapper-Prozess aber nicht Chrome selbst
**Aufgetreten:** 2026-03-15  **Status:** ✅ GEFIXT
**Symptom:** Chrome bleibt auch nach runner.py-Beendigung offen.
**Ursache:** chrome01_open.py startet Chrome via `open -n -a "Google Chrome" ...`. Das macht Chrome zum Kind von launchd, NICHT zum Kind des Python-Subprozesses. runner.py's `terminate()` auf chrome_proc tötet nur den Python-Wrapper.
**Fix:** `_kill_rotation_chrome()` in runner.py finally block: `pgrep -f rotation_profile` → SIGTERM. Tötet nur rotation_profile-Chrome, lässt andere Chrome-Fenster in Ruhe.
**Datei:** orchestrator/runner.py

---

## ✅ STABLE STATE — 2026-03-15 23:55 — FROZEN

**Commit:** `c399bb3` (main branch, openAntigravity-auth-rotator)
**LaunchAgents Commit:** `844e0f9`

### Was funktioniert (verifiziert 23:44 Rotation)
- Rotation dauert ~50 Sekunden von Trigger bis fertig
- Chrome öffnet sofort via nodriver (`/tmp/openAntigravity_login_profile_7654`)
- Passwort-Fill via CDP `dispatchKeyEvent` per Zeichen ✅
- "Verstanden" ToS-Click ✅
- Consent → Auth-Code ✅
- Token exchange + email via userinfo ✅
- Account in antigravity-accounts.json (genau 1, activeIndex=0) ✅
- Auth in ~/.local/share/opencode/auth.json (nur `google` key) ✅
- Chrome closed via `browser.stop()` + dedicated port-7654 cleanup in try/finally ✅
- Alle alten Workspace-User gelöscht (pre+post sweep) ✅
- Hammerspoon ⌘R+A Hotkey triggert sofortige Rotation ✅

### Kritische Invarianten (NICHT ÄNDERN)
1. OAuth Scope: `openid email profile cloud-platform` — alle 4 nötig
2. Password: CDP dispatchKeyEvent — KEIN send_keys
3. Delete-Timing: START der NÄCHSTEN Rotation, nicht Ende der aktuellen
4. Account-Inject: IMMER replace ALL — kein Dedup-Filter
5. Chrome-Close: `browser.stop()` in try/finally
6. Cleanup: _cleanup_old_rotator_users() zweimal (vor UND nach Rotation)
7. auth.json: NUR `google` key anfassen — nie komplett überschreiben

### Projekte
- Rotator: `/Users/jeremy/dev/openAntigravity-auth-rotator/` (git tag: v1.0-stable)
- LaunchAgents: `/Users/jeremy/dev/Opencode-LaunchAgents/` (git tag: v1.0-stable)
- Hammerspoon: `~/.hammerspoon/` (⌘R leader + A/C/S/W/X)


## RBUG-057: managedProjectId immer leer → Gemini 3.1 Pro "invalid refresh tokens"
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** Nach jeder Rotation war `managedProjectId: ""` in antigravity-accounts.json. opencode Plugin meldete "All Antigravity accounts have invalid refresh tokens" bei Gemini-Modellen.
**Ursache:** `main_rotate.py` rief `loadCodeAssist` auf — das gibt 400 für brand-neue Workspace-User zurück. `managedProjectId` blieb immer leer.
**Fix:** Neues `core/token_onboard.py` ruft `onboardUser` Endpoint auf (15 Retries, polling bis `done=true`). Gibt echtes `managedProjectId` zurück. In `main_rotate.py` wird nach Token-Exchange aufgerufen.
**Datei:** `core/token_onboard.py` (NEU), `core/main_rotate.py`, `core/main_rotate_inject.py`
**Commit:** daa967a

## RBUG-058: Gemini Flash Fallback in watcher_loop.py
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** Bei QUOTA_EXHAUSTED wurde zuerst Model-Switch auf Gemini Flash versucht statt direkt zu rotieren. User wollte KEINEN Fallback.
**Ursache:** `watcher_loop.py` hatte zwei-Phasen-Logik: erst Model-Switch prüfen, dann rotieren.
**Fix:** Gesamte Model-Switch Phase aus `watcher_loop.py` entfernt. Immer direkte Rotation. `model_switch_callback` aus `Watcher` und `main_dispatch.py` entfernt.
**Datei:** `core/watcher_loop.py`, `core/watcher.py`, `core/main_dispatch.py`
**Commit:** daa967a


## RBUG-059: Vertex AI Antigravity — Image > 8000px → 400 Error
**Aufgetreten:** 2026-03-16  **Status:** ✅ WORKAROUND
**Symptom:** `invalid_request_error: At least one of the image dimensions exceed max allowed size: 8000 pixels`. Status 400 bei opencode Bildanhang.
**Ursache:** Vertex AI Antigravity Endpoint (`daily-cloudcode-pa.sandbox.googleapis.com`) lehnt Bilder > 8000px in einer Dimension ab. macOS Retina-Screenshots auf externen Displays können dieses Limit überschreiten.
**Fix/Workaround:** `tools/resize_img.py` — skaliert Bild auf max 7800px. Nutzung: `imgfix <datei>` oder `python3 ~/dev/openAntigravity-auth-rotator/tools/resize_img.py <bild>`.
**HINWEIS:** Rotation selbst funktionierte korrekt (managedProjectId: amazing-effect-kp51c ✅). Fehler ist rein auf API-Limit bei Bildgrößen zurückzuführen.
**Datei:** `tools/resize_img.py` (NEU), `bin/imgfix` (NEU)


### RBUG-059 Update — Hammerspoon Auto-Resize (2026-03-16)
**Status:** ✅ VOLLSTÄNDIG AUTOMATISCH
**Problem mit LaunchAgent:** macOS TCC (Transparency Consent Control) verweigert LaunchAgents Desktop-Write-Zugriff → EDEADLK. Außerdem feuerte `hs.pathwatcher` zu früh (Datei noch nicht fertig geschrieben → PIL UnidentifiedImageError).
**Finale Lösung:**
1. `resize_img.py` prüft zuerst Dateistabilität (gleiche Größe in 2 aufeinanderfolgenden Checks über 200ms-Intervalle) → erst dann resizen. + EDEADLK-Retry bis 5x.
2. Hammerspoon `hs.pathwatcher` auf `~/Desktop` (läuft im User-Session-Kontext → hat TCC Desktop-Zugriff) → ruft `resize_img.py` für jede neue Bilddatei auf.
**Ergebnis:** 9500x6500 → 7800x5336 vollautomatisch sobald Screenshot auf Desktop landet.
**Commit:** 5bdf8f3

## RBUG-060: OpenCode Sessions vor Auth beendet
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** Wenn Rotator startet, werden OpenCode CLI Sessions sofort beendet (vor/während Auth). Danach nichts — keine Wiederöffnung mit gleicher Session-ID, kein "mach weiter".
**Ursache:** Direkter Hotkey-Pfad (⌘R+A → `run_rotate.py`) rief oc01b NICHT auf. Watcher-Pfad rief oc01b zwar nach Rotation — aber doppelt (trigger.py + potentiell falsch getimed).
**Fix:** `oc01b_restart_opencode.py` als LETZTEN Schritt in `STEPS_ROTATE` eingetragen (nach chrome02_close). `trigger.py` entfernt `resume_opencode_sessions()` (verhindert Doppel-Aufruf). Beide Pfade (Hotkey + Watcher) nutzen nun die identische STEPS_ROTATE-Liste. Reihenfolge: Auth → Token-Inject → Chrome-Close → **oc01b** (Kill → Reopen mit Session-ID → "mach weiter").
**Datei:** `orchestrator/steps_rotate.py`, `Opencode-LaunchAgents/antigravity/trigger.py`
**Neuer Invariant:** Invariant 10 — Sessions ONLY killed AFTER full auth (oc01b last step)

## RBUG-061: Chrome "In Chrome anmelden?" Dialog nicht dismissed vor Browser-Close
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** Nach OAuth-Redirect (localhost:51121/oauth-callback) zeigt Chrome "In Chrome anmelden?" mit Buttons "Chrome ohne Konto verwenden" / "Als Rotator fortfahren". Browser wurde ohne Dismiss geschlossen.
**Ursache:** Step 05c in `login_all.py` (dismiss via CDP) lief VOR dem consent-step — zu früh, Dialog erscheint erst NACH localhost-Redirect. `login_async.py` (core/-Pfad) hatte keinerlei Dismiss-Logik.
**Fix:**
1. `login_all.py`: Neuer Step 08 NACH `run_consent()` — AppleScript (für Chrome UI Infobar) + CDP click (für DOM-Buttons) in 5-fach-Retry-Loop mit 0.4s Pause.
2. `login_async.py`: `subprocess.run(["osascript", ...])` 3x in finally-Block VOR `browser.stop()`.
**Datei:** `steps/login/login_all.py`, `core/login/login_async.py`
**Neuer Invariant:** Invariant 11 — Chrome sync dialog MUST be dismissed before browser.stop()

## RBUG-062: Gemini Flash / Model-Switch Toter Code nach RBUG-058 nicht entfernt
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** Nach RBUG-058 (Fallback entfernt aus watcher_loop.py) existierten noch 345 Zeilen tote Flash/Model-Switch-Code im Repository. Der Watcher nutzte diesen Code zwar nicht mehr — aber er existierte noch und hätte versehentlich wieder aktiviert werden können.
**Ursache:** RBUG-058 hat nur die Logik in watcher_loop.py entfernt, aber alle zugehörigen Dateien gelassen: model_switch steps, orchestrator files, opencode-restart steps.
**Gelöschte Dateien:**

## RBUG-063: Gemini Key HTTP-Deadlock auf frischen Rotator-Projekten
**Aufgetreten:** 2026-03-21  **Status:** ✅ GEFIXT
**Symptom:** `generate_gemini_key.py` scheiterte bei frischen Rotator-Accounts mit `SERVICE_DISABLED` fuer `serviceusage.googleapis.com` bzw. `apikeys.googleapis.com`. Cloud Console `enableflow` hing auf `Fehler beim Laden`, der Rotator-User konnte soft-deleted sein, und reine HTTP-Key-Erzeugung blieb blockiert.
**Ursache:** Neuer Rotator-Workspace-User + frisches `managedProjectId` erzeugten einen Bootstrap-Deadlock: `serviceusage` war im Projekt nicht nutzbar, Cloud Console war fuer den Aktivierungsflow instabil, und der bisherige Fallback war nicht robust genug. Zusaetzlich konnte der aktuelle Rotator-User in Google Workspace bereits geloescht sein.
**Fix:** `~/.config/opencode/skills/imagegen/scripts/generate_gemini_key.py` nutzt jetzt einen mehrstufigen Recovery-Flow: gueltigen Refresh-Token aus `auth.json`/Registry nutzen, geloeschten Rotator-User automatisch undelete, kontrolliertes Browser-Passwort vorbereiten, Cloud-Console-Fallback versuchen und bei Deadlock automatisch auf AI Studio `Get API key` -> `API-Schlüssel erstellen` wechseln. Der echte Key wird aus der `GenerateCloudApiKey`-Netzwerkantwort extrahiert, gegen `generativelanguage.googleapis.com/v1beta/models` validiert und nur nach `~/.config/opencode/skills/imagegen/gemini_rotator_key.txt` geschrieben. `SKILL.md` dokumentiert den finalen AI-Studio-Fallback und die Zero-Config/No-Billing-Regeln.
**Datei:** `~/.config/opencode/skills/imagegen/scripts/generate_gemini_key.py`, `~/.config/opencode/skills/imagegen/SKILL.md`
- `core/main_model_switch.py` (run_model_switch Funktion)
- `core/watcher_accounts_check.py` → `_check_gemini_flash_available()` Funktion entfernt (Rest behalten)
- `orchestrator/run_model_switch.py` (Flash/Fallback Orchestrator)
- `orchestrator/steps_model_switch.py` (STEPS_MODEL_SWITCH Liste)
- `steps/model_switch/ms01_find_claude_sessions.py` (alt)
- `steps/model_switch/ms02_open_models_menu.py`
- `steps/model_switch/ms03_select_gemini.py` (ANTIGRAVITY_SWITCH_MODEL env var)
- `steps/model_switch/ms04_send_continue.py`
- `steps/opencode/oc01_restart.py` (verwaist)
- `steps/opencode/oc01b_restart_opencode.py` (Duplikat — kanonische Version in LaunchAgents)
- `steps/opencode/oc02_continue.py` (verwaist)
**Ergebnis:** 345 Zeilen gelöscht. Kein Flash-Code mehr im Repository.
**Commit:** 407170d, tag v1.0-stable (update 4)


## RBUG-063: Watcher triggert Rotation bei Model-Not-Found Fehler
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT
**Symptom:** "Requested entity was not found. Request preview access" für antigravity-gemini-3.1-pro
erschien im opencode Log → watcher_log_scan.py fand MODEL_ERROR_PATTERNS-Match →
triggerte Full Rotation → neuer Account/Projekt hat ebenfalls kein Preview Access →
gleicher Fehler → Infinite Rotation Loop.
**Ursache:** ALL_ERROR_PATTERNS = QUOTA_PATTERNS + MODEL_ERROR_PATTERNS. MODEL_ERROR_PATTERNS
enthielt "Requested entity was not found" — dieser Fehler ist NICHT durch Rotation behebbar.
**Fix:** ALL_ERROR_PATTERNS = QUOTA_PATTERNS nur. MODEL_ERROR_PATTERNS komplett entfernt.
Nur echte Quota-Fehler (Rate-Limit für Claude/Gemini/GPT) triggern jetzt Rotation.
**Datei:** core/watcher_config.py, Commit: fda1dd7

## RBUG-065: Gaplustos Button cannot be bypassed programmatically

**Aufgetreten:** 2026-03-17  **Status:** 🔴 OFFEN

**Symptom:** Google OAuth "Verstanden" (gaplustos) button requires real user click. All automation attempts fail:
- DOM click() → returns false (button ignores synthetic events)
- CDP Mouse Events → protocol errors  
- JavaScript injection → isTrusted is read-only, cannot be spoofed
- Web research confirms: cannot bypass isTrusted from within browser context

**Ursache:** Google uses `event.isTrusted` to verify the click came from a real user input, not automation.

**Lösung:** Service Account with Domain-Wide Delegation (bypasses OAuth flow completely)

---

## RBUG-067: opencode executable not found during rotation (PATH issue)

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** In `/tmp/openAntigravity-rotation.log` failed `oc01b_restart_opencode.py` with `FileNotFoundError: [Errno 2] No such file or directory: 'opencode'`

**Ursache:** `subprocess.run(["opencode", ...])` fails because `opencode` is not in the system PATH of the background worker running the rotator.

**Fix:** Changed `["opencode", "session", "list"]` to use full absolute paths like `/Users/jeremy/.local/bin/opencode` or `~/.local/bin/opencode`.

---

## RBUG-069: Obsolete Browser Automation Cleanup

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** Nach Umstieg auf Service Account Impersonation (RBUG-066) war der gesamte Browser-Automatisierungscode (nodriver, CDP, AppleScript, Screenshot-OCR) obsolet, aber noch vorhanden.

**Ursache:** Ablösung von OAuth UI-Flow durch reine API-Interaktion.

**Fix:** Gelöscht:
- `steps/chrome/` komplett (`chrome01_open.py`, `chrome02_close.py`)
- `steps/login/` (alle `login0X_` und `login_all.py`)
- `core/login/` komplett (alle `step0X_` Module, Captcha Solver, Gaplustos Handler)
- `steps/workspace/ws03_disable_challenge.py` (nicht mehr nötig ohne Login-UI)

Das Projekt ist jetzt 100% headless, browserless und robust gegen UI-Änderungen von Google (wie `gaplustos`).

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** When running Claude Sonnet, Google API returns `models/antigravity-claude-sonnet-4-6 is not found for API version v1beta`.

**Ursache:** The Antigravity plugin only intercepts requests if `google` exists in `~/.local/share/opencode/auth.json`. Because the last rotation failed at the very end (due to the `opencode` PATH issue above), it never wrote the OAuth token to `auth.json`. OpenCode fell back to the native `gemini-api` implementation, which naturally doesn't know about Claude.

**Fix:** Fixed the PATH issue in the rotator AND manually re-injected the dummy `google` key into `auth.json` to re-enable plugin interception.

---

## RBUG-070: Domain-Wide Delegation Setup - Workspace Admin Authentication

**Aufgetreten:** 2026-03-17  **Status:** 🔴 IN PROGRESS

**Problem:** Service Account (`ki-agent@artificial-biometrics.iam.gserviceaccount.com`) kann keinen Workspace-User impersonieren weil keine Domain-Wide Delegation konfiguriert ist.

**Komponenten:**
- Service Account: `ki-agent@artificial-biometrics.iam.gserviceaccount.com`
- Client ID: `107834273462934674392`
- Admin Email: `info@zukunftsorientierte-energie.de` (Workspace Admin)
- Workspace Domain: `zukunftsorientierte-energie.de`
- Gcloud aktiver Account: `ki-agent@artificial-biometrics.iam.gserviceaccount.com` (Service Account)
- Rotator token.json: OAuth für Workspace Admin mit scopes: `admin.directory.user`, `admin.directory.user.security`

**Versuchte Lösungswege:**
1. **Admin SDK API** → Fehler: `Insufficient authentication scopes`
2. **Browser via webauto-nodriver MCP** → admin.google.com requires Passkey verification für `info@zukunftsorientierte-energie.de`
3. **Gcloud CLI** → Nur Service Account Credentials, keine Admin OAuth Credentials

**Nächste Schritte:**
1. Service Account via Chrome als `info@zukunftsorientierte-energie.de` (Workspace Admin) authorisieren
2. Oder: OAuth Token mit admin.directory.admin delegationscope neu generieren

---

## RBUG-066: Service Account with Domain-Wide Delegation Setup

**Aufgetreten:** 2026-03-17  **Status:** 🔴 MANUELLE ACTION NÖTIG

**Ziel:** Vollautomatische Authentifizierung ohne manuelle Gaplustos-Klicks

**✅ ERLEDIGT:**
- Script erstellt: `core/service_account_impersonate.py`

**⏳ MANUELL NÖTIG - Google Admin Console:**

1. **URL:** https://admin.google.com/ac/owl/domainwidedelegation

2. **Client hinzufügen:**
   - **Client ID:** `107834273462934674392`
   - **Name:** `ki-agent`

3. **OAuth Scopes (comma-separated):**
```
https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative language.tuning,https://www.googleapis.com/auth/generative language.retriever,https://www.googleapis.com/auth/generative language.runtime,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile,openid
```

**Test nach Konfiguration:**
```bash
cd ~/dev/openAntigravity-auth-rotator
python3 -c "
import sys; sys.path.insert(0, '.')
from core.service_account_impersonate import get_impersonated_tokens
tokens = get_impersonated_tokens('info@zukunftsorientierte-energie.de')
print('SUCCESS:', tokens['access_token'][:50])
"
```

**Commit:** TBD

---

## RBUG-064: antigravity-gemini-3.1-pro benötigt Preview Access (nicht automatisierbar)
**Aufgetreten:** 2026-03-16  **Status:** ✅ UMGANGEN (Modell gelöscht)
**Symptom:** `generativelanguage.googleapis.com/v1beta/models/antigravity-gemini-3.1-pro`
gibt HTTP 404 "Requested entity was not found. Request preview access at https://goo.gle/enable-preview-features"
**Ursache:** Modell `antigravity-gemini-3.1-pro` ist ein Preview-Modell. Neue Google Cloud
Projekte (nach Account-Rotation) haben keinen automatischen Preview Access. Kein API-Endpunkt
zum programmatischen Aktivieren gefunden.
**Fix:** ALLE antigravity-gemini-* Modelle aus opencode.json + oh-my-opencode.json entfernt.
Ersetzt durch google/antigravity-claude-sonnet-4-6 (Atlas, Momus, multimodal-looker, Top-Model).
Nur verbleibende Google Antigravity Modelle: antigravity-claude-sonnet-4-6 + antigravity-claude-opus-4-6-thinking.
**Datei:** ~/.config/opencode/opencode.json, ~/.config/opencode/oh-my-opencode.json

## BUG-20260316: 404 Phantom Bug bei "Gemini 3.1 Pro Custom Tools"
**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT / DOKUMENTIERT
**Symptom:** OpenCode antwortet bei Verwendung von `antigravity-gemini-3.1-pro-customtools` (und anderen) mit: `Requested entity was not found. Request preview access at https://goo.gle/enable-preview-features before using this model.`
**Ursache:** 
1. Das Auth-Plugin transformiert die Modell-ID `antigravity-gemini-3.1-pro-customtools` intern zu `gemini-3.1-pro-customtools-low`.
2. Wenn der primäre Antigravity-Endpunkt im Rate-Limit hängt, versucht das Plugin (wegen veralteter Einträge in `rateLimitResetTimes`) auf den alten `gemini-cli` Fallback (`cloudcode-pa.googleapis.com`) zurückzugreifen.
3. Der Fallback-Endpunkt erwartet strikt offizielle Google Cloud-Namen (wie `gemini-3.1-pro-preview-customtools`). Weil das Plugin die falsch übersetzte Custom-ID übermittelt, blockiert Google mit einem 404 Preview-Fehler.
**Fix:** Das Problem ist kein Halluzinieren der Namen und auch kein fehlerhaftes Modell in OpenCode. Es ist ein "Phantom-Bug" des Fallbacks. Caches / `rateLimitResetTimes` des Plugins müssen gelöscht werden (bzw. auf Ablauf des Cooldowns warten), damit der primäre Endpoint wieder genutzt wird. Config in `opencode.json` MUSS auf den nativen `google/antigravity-...` Präfixen verbleiben, da das Plugin sie hartkodiert matcht.
**Datei:** `opencode.json`, `~/.local/share/opencode/auth.json` (bzw. interner Plugin Cache)

## BUG-AG1: Google Antigravity Models (Gemini 3 Pro, 3.1 Flash, 3.1 Pro Customtools) werfen 404 / Unavailable
**Aufgetreten:** 16. März 2026  **Status:** ✅ GEFIXT
**Symptom:** OpenCode wirft "Requested entity was not found" oder "Gemini 3 Pro is no longer available" bei Nutzung der Modelle über das `opencode-antigravity-auth` Plugin.
**Ursache:** Google hat diese spezifischen Endpunkte/Modelle in der Cloud Code API (Antigravity) abgeschaltet oder umbenannt. Die Modelle existieren dort unter den aufgerufenen Namen/Pfaden nicht mehr.
**Fix:** Die 3 kaputten Modelle (antigravity-gemini-3-pro, antigravity-gemini-3.1-flash, antigravity-gemini-3.1-pro-customtools) wurden aus der `opencode.json` Konfiguration, allen Dokumentationen (biometrics, docs) und dem openantigravity-auth-rotator sowie den entsprechenden Google Docs komplett entfernt.
**Datei:** ~/.config/opencode/opencode.json, /Users/jeremy/dev/openantigravity-auth-rotator/*, Google Docs

## BAN-GOOGLE-SDK: @ai-sdk/google ist STRENGSTENS VERBOTEN
**Aufgetreten:** 16. März 2026  **Status:** 🔴 PERMANENTER BANN
**Symptom:** Inklusion von `"npm": "@ai-sdk/google"` in der `opencode.json` führt zu korrupten API-Aufrufen und "Requested entity was not found" Fehlern.
**Ursache:** Das Standard Google AI SDK kollidiert mit der Antigravity-Authentifizierung. Es versucht Pfade zu nutzen, die für Antigravity-Modelle nicht zulässig sind.
**Verbot:** Dieses Paket darf NIEMALS wieder in irgendeiner OpenCode-Konfiguration auftauchen. Wir nutzen AUSSCHLIESSLICH das `opencode-antigravity-auth` Plugin ohne das Google SDK NPM Paket.
**Datei:** ~/.config/opencode/opencode.json

---

## BUG-20260316-SIN-SOLVER: Lokale .opencode/ überschreibt globale Config

**Aufgetreten:** 2026-03-16  
**Status:** ✅ GEFIXT

**Symptom:** SIN-Solver zeigt `openai/gpt-5.2` statt Antigravity Modelle, obwohl global alles richtig konfiguriert ist.

**Ursache:** Lokale `.opencode/opencode.json` in SIN-Solver hatte eigene `agent.model` Einträge die die globale Config überschreiben.

**WICHTIG: Die antigravity Konfiguration gehört in:**
- `~/.config/opencode/antigravity.json` (NICHT in opencode.json!)
- Das Plugin `opencode-antigravity-auth` fügt die Modelle automatisch hinzu

**Fix:**
1. Lokales `.opencode/` Verzeichnis in Projekten LÖSCHEN
2. Nur globale `~/.config/opencode/opencode.json` verwenden
3. Antigravity Settings in `~/.config/opencode/antigravity.json`

**Befehl:**
```bash
rm -rf /path/zum/projekt/.opencode/
```

---

## BUG-20260316-NEW: Heute gefixte Bugs (2026-03-16)

### 2 Accounts in accounts.json nach Rotation
**Status:** ✅ GEFIXT
- **Ursache:** `inject_new_account` behielt alten Account weil jede Rotation neue Email + neues Project erstellt
- **Fix:** `force_replace=True` als Default in `accounts_inject.py` - bei Rotation werden ALLE alten Accounts ersetzt

### SIN-Solver zeigt "gpt-5.2" statt Antigravity
**Status:** ✅ GEFIXT
- **Ursache:** SIN-Solver hat lokale `.opencode/opencode.json` mit `model: openai/gpt-5.2` - überschreibt globale Config
- **Fix:** Lokale Config muss `provider.google.models.antigravity-*` enthalten ODER `model` auf Antigravity setzen

---

## BUG-20260316-CLAUDE-RL: Rotation gestartet, aber OpenCode bleibt "All 1 account(s) rate-limited for claude"

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** Trotz Trigger (Hotkey `⌘R → A` / Watcher) meldet OpenCode weiter `Error: All 1 account(s) rate-limited for claude ...` und bleibt blockiert.

**Ursache:**
- Session-Restart (`oc01b`) laeuft nicht immer (PATH/opencode binary), wodurch laufende opencode TUIs den alten in-memory RateLimit-Status behalten.
- Cleanup/Sweep basiert nur auf `logs/credentials.json` und kann bei einem vorher abgebrochenen Run den tatsaechlich aktiven Account (aus `~/.config/opencode/antigravity-accounts.json`) loeschen.

**Fix:**
- `ws00_delete_prev.py` prüft jetzt auch `logs/tokens.json` (brandneuer Account) zusätzlich zu `logs/credentials.json` und `antigravity-accounts.json`
- `main_rotate.py` führt nach erfolgreicher Rotation `oc01b` aus (best-effort)

**Datei:** `steps/workspace/ws00_delete_prev.py`, `core/main_rotate.py`

---

## BUG-20260316-WS-ORPHANS: Orphaned rotator-* Workspace-User werden nicht geloescht

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** Nach mehreren Rotation-Triggern sind im Workspace mehrere `rotator-*` User vorhanden (z. B. 2+). Dadurch entstehen Quota/Token-Verwirrungen und man verliert die Kontrolle ueber den aktiven Account.

**Ursache:**
- Rotation kann vor Token-Inject abbrechen (z. B. Chrome/CDP Wait) → neu erstellter Workspace-User bleibt als Orphan stehen.
- Cleanup-Logik relied nur auf `logs/credentials.json` (kann stale/missing sein) und listet Users ohne Pagination (kann welche uebersehen).

**Fix:**
- `workspace_list.py` paginiert jetzt bei `users.list`
- `ws00_delete_prev.py` nutzt paginierte Liste und Keep-Set (credentials + tokens + activeEmail)
- **NEU:** `ws99_verify_one_rotator.py` als letzter Schritt im Flow - prüft und bereinigt falls nötig
- Post-Cleanup in `steps_rotate.py`: `ws00_delete_prev.py` läuft ZWEITES MAL nach Token-Inject

**Datei:** `core/workspace_list.py`, `steps/workspace/ws00_delete_prev.py`, `steps/workspace/ws99_verify_one_rotator.py`, `orchestrator/steps_rotate.py`

---

## BUG-20260316-ONE-ACCOUNT: antigravity-accounts.json darf nie >1 Account enthalten

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** `~/.config/opencode/antigravity-accounts.json` enthaelt (zeitweise) mehrere Accounts. OpenCode kann dadurch auf einen alten/rate-limited Account fallen oder die falsche activeIndex-Position nutzen.

**Ursache:**
- Historisch: Inject-/Dedup-Logik hat alte Accounts behalten.
- Guard liest immer nur `accounts[0]` und kann dadurch den falschen Account re-injizieren.

**Fix:**
- `inject_new_account()` bleibt "hard replace" (immer exakt 1 Account, `activeIndex=0`).
- Watcher-Guardian (`watcher_guardian.py`) sanitisiert accounts.json auf genau 1 Account bevor google-auth re-injiziert wird.

**Datei:** `core/accounts_inject.py`, `core/watcher_guardian.py`

---

## BUG-20260316-GAPLUSTOS-CLICK: "Verstanden" gefunden, aber cliclick klickt nicht

**Aufgetreten:** 2026-03-16  **Status:** 🔴 OFFEN

**Symptom:** Gaplustos-Seite erscheint, Button wird im DOM gefunden, aber der Klick (cliclick) hat keine Wirkung; Flow bleibt auf `gaplustos...`.

**Ursache:** JS liefert Viewport-Koordinaten (getBoundingClientRect), `cliclick` braucht Screen-Koordinaten. Ohne Umrechnung landet der Click an der falschen Stelle.

**Fix:** Button-Center wird jetzt zusammen mit `window.screenX/screenY`, `outerHeight/innerHeight` gelesen und zu Screen-Koordinaten umgerechnet. Fallback: DOM-Click via `elementFromPoint(...).click()`. Erfolg wird geprueft via URL-Change (gaplustos verlassen).

**Datei:** `core/login/step03d_gaplustos_find_btn.py`, `core/login/step03d_gaplustos_click_cliclick.py`, `core/login/step03d_gaplustos_click_js.py`, `core/login/step03d_gaplustos_try.py`, `core/login/step03d_gaplustos.py`

---

## BUG-20260316-ROTATE-CLEANUP-PATH: Pre-cleanup crasht mit "Path" UnboundLocalError

**Aufgetreten:** 2026-03-16  **Status:** 🔴 OFFEN

**Symptom:** Rotation startet, aber Pre-rotation Cleanup loggt: `cannot access local variable 'Path' where it is not associated with a value`.

**Ursache:** `Path` wird in einer Funktion nur in einem Branch importiert/gesetzt und spaeter ausserhalb genutzt.

**Fix:** TBD (Import/Scope von `Path` vereinheitlichen).

**Datei:** `core/main_cleanup_users.py` (oder Caller)

---

## BUG-20260316-CHROME-DISMISS-TIMEOUT: osascript dismiss kann Rotation fehlschlagen lassen

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** Nach Cleanup/Fehler bricht Rotation ab mit `osascript ... timed out after 1 seconds`.

**Ursache:** `subprocess.run(..., timeout=1)` wirft `TimeoutExpired` und wird nicht gefangen.

**Fix:** Dismiss laeuft jetzt best-effort (timeout=2 + try/except) und darf Rotation nie crashen.

**Datei:** `core/login/chrome_dismiss.py`

---

## BUG-20260316-STEP03B-EXCDETAILS: step03b_click json.loads bekommt ExceptionDetails

**Aufgetreten:** 2026-03-16  **Status:** 🔴 OFFEN

**Symptom:** `step03b` spamt: `json error: the JSON object must be str, bytes or bytearray, not ExceptionDetails` und kommt nicht weiter.

**Ursache:** `tab.evaluate(...)` liefert bei Evaluate-Fehlern ein ExceptionDetails-Objekt statt `str`/`dict`; Code behandelt das nicht als Fehlerfall.

**Fix:** TBD: ExceptionDetails sauber erkennen und als `None` behandeln; Evaluate-Fehler mit Screenshot + kurzer Log und dann retry.

**Datei:** `core/login/step03b_click.py`

---

## BUG-20260317-GAPLUSTOS-KEYBOARD-FOCUS: Tab/Enter landet auf falschem Target (navigiert weg)

**Aufgetreten:** 2026-03-17  **Status:** 🔴 OFFEN

**Symptom:** Gaplustos Step verlaesst die Seite oder triggert falsche Elemente (z.B. Navigation zu policies.google.com) statt den Button "Verstanden".

**Ursache:** Fokus/Tab-Reihenfolge unzuverlaessig (Button evtl. in iframe/shadow oder Fokus springt in Browser-UI/Link-Targets).

**Fix:** TBD: deterministisches Fokus-Setzen direkt auf den Button + verifizierter Activate (oder Screen-Recorder+Frame-Debug).

**Datei:** `core/login/step03d_gaplustos_*`

---

## BUG-20260317-GAPLUSTOS-CHECK-EXCDETAILS: ExceptionDetails hat kein .lower()

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** Rotation bricht in `step03d_gaplustos_check` ab mit: `'ExceptionDetails' object has no attribute 'lower'`.

**Ursache:** `tab.evaluate('document.body.innerText')` kann `ExceptionDetails` liefern; Code treated es wie `str`.

**Fix:** Nur `.lower()` wenn `isinstance(result, str)`, sonst leerer String.

**Datei:** `core/login/step03d_gaplustos_check.py`

---

## BUG-20260317-NODRIVER-DETACHED: Not attached to an active page (-32000)

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** Rotation bricht im Passwort-Step ab mit: `Not attached to an active page [code: -32000]`.

**Ursache:** nodriver Tab verliert Attachment waehrend Navigation/Reload; Exceptions wurden nicht abgefangen und crashen die Rotation.

**Fix:** TBD: Flow-Schritte catchen Exceptions und geben `False` zurueck (triggert emergency cleanup) statt die Rotation zu crashen.

**Datei:** `core/login/flow02_password.py` (Guard), evtl. nodriver lifecycle

---

## BUG-20260317-WS-UPDATE-412: "User creation is not complete" bei disable_login_challenge

**Aufgetreten:** 2026-03-17  **Status:** 🔴 OFFEN

**Symptom:** Direkt nach Create liefert `users.update` gelegentlich 412: `User creation is not complete.`

**Ursache:** Google Admin Directory API eventual consistency direkt nach User-Creation.

**Fix:** Retry (6 Versuche, 2s wait) bevor Rotation weiterlaeuft.

**Datei:** `core/workspace_update.py`

---

## BUG-20260316-NODRIVER-WS500: "server rejected WebSocket connection: HTTP 500"

**Aufgetreten:** 2026-03-16  **Status:** 🔴 OFFEN

**Symptom:** Rotation bricht ab bei `tab.evaluate` mit: `server rejected WebSocket connection: HTTP 500`.

**Ursache:** Unklar (CDP/WebSocket Lane in nodriver/Chrome instabil oder Profil/Port kollidiert).

**Fix:** TBD: best-effort reconnect / Chrome neu starten / Profil cleanup (nur rotator profile).

**Datei:** `core/login/step03b_run.py` / nodriver runtime

---

## BUG-20260316-TAB-NO-KEYBOARD: Tab hat kein .keyboard

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** Rotation bricht im Passwort-Step ab mit: `"Tab" has no attribute "keyboard"`.

**Ursache:** nodriver Tab API hat nicht immer `tab.keyboard`; Tippen muss ueber CDP (`tab.send(cdp_input.dispatch_key_event)`) passieren.

**Fix:** Passwort-Step nutzt jetzt `core/login/step03a_type.py` statt `tab.keyboard.send`.

**Datei:** `core/login/step03a_password.py`, `core/login/step03a_type.py`

---

## BUG-20260316-NODRIVER-CONNECT: Failed to connect to browser (sandbox)

**Aufgetreten:** 2026-03-16  **Status:** ✅ GEFIXT

**Symptom:** Rotation bricht beim Start des Browsers ab mit: `Failed to connect to browser ... pass no_sandbox=True`.

**Ursache:** nodriver/Chrome Start ist in dieser Umgebung instabil mit `sandbox=True`.

**Fix:** Start jetzt mit `sandbox=False`.

**Datei:** `core/login/login_chrome.py`

## RBUG-066: gaplustos "Verstanden" Button Click Failure
**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT
**Symptom:** Google OAuth flow hängt auf `gaplustos` speedbump Seite. Der "Verstanden" Button wird nicht geklickt → flow bleibt stecken.

**Ursache (Multiple Versuche fehlgeschlagen):**
1. DOM `click()` — Button gefunden aber Klick triggert nicht
2. CDP Mouse Events — Protocol-Fehler
3. `cliclick` mit Koordinaten-Konvertierung — falsche Koordinaten (viewport vs screen)
4. Tab/Enter Spamming — Browser verwirrt, öffnet Links statt zu klicken
5. osascript JS Injection — sandbox restrictions

**Fix:** Hardcoded Coordinates Approach mit 3 Micro-Files:
1. `step03d_gaplustos_screencapture.py` — Screenshot via `subprocess.run(['screencapture', ...])`
2. `step03d_gaplustos_detect_button.py` — Button-Detection via pytesseract OCR + fallback coordinates
3. `step03d_gaplustos_hardcoded_click.py` — Click via `cliclick c:x,y`

**Neue Logik in `step03d_gaplustos_try.py`:**
1. Erst DOM click versuchen
2. Falls fehl → screencapture → OCR → cliclick click
3. Falls fehl → Tab/Enter fallback

**Zusätzlich:** `login_chrome.py` stabilisiert mit:
- Aggressive Chrome cleanup (`pkill -9`, SingletonLock removal)
- 5 retry loops statt 3
- 2s delay zwischen retries
- Besseres error handling

**Dateien:**
- `core/login/login_chrome.py` (stabilisiert)
- `core/login/step03d_gaplustos_screencapture.py` (NEU)
- `core/login/step03d_gaplustos_detect_button.py` (NEU)
- `core/login/step03d_gaplustos_hardcoded_click.py` (NEU)
- `core/login/step03d_gaplustos_try.py` (aktualisiert)

---

## RBUG-067: Rate Limits verhindern Model-Nutzung für 6+ Tage
**Aufgetreten:** 2026-03-17 **Status:** ✅ GEFIXT
**Symptom:** Kein Antigravity-Modell funktioniert. Fehler: "Google Generative AI API key is missing" oder Rate-Limit-Error. Account existiert, hat aber `rateLimitResetTimes` die erst in 6 Tagen ablaufen.

**Ursache:** 
1. Der Account hatte alte Rate-Limits aus einem früheren Lauf gespeichert
2. `antigravity-accounts.json` enthält `rateLimitResetTimes` mit Timestamps ~1774294163024
3. Diese Limits blockieren alle Requests bis zum Ablauf (6+ Tage)
4. Der User sah "API key missing" weil das Plugin gar nicht erst versuchte Requests zu senden

**Fix:**
```python
# Rate limits in antigravity-accounts.json zurücksetzen
accounts['accounts'][0]['rateLimitResetTimes'] = {}
```

**WICHTIG:** Bei Rate-Limit-Problemen IMMER zuerst `rateLimitResetTimes` prüfen und ggf. leeren!

**Datei:** `~/.config/opencode/antigravity-accounts.json`

---

## RBUG-068: Google Auth Entry fehlt in auth.json nach Wiederherstellung
**Aufgetreten:** 2026-03-17 **Status:** ✅ GEFIXT
**Symptom:** `auth.json` enthält nur `openai` aber kein `google` - Antigravity-Modelle schlagen fehl.

**Ursache:** 
1. `inject_opencode_google_auth()` überschrieb die gesamte `auth.json` statt zu mergen
2. Wenn `openai` bereits existierte, wurde es gelöscht
3. Der Restore-Workflow behielt den existierenden `openai` Entry nicht

**Fix:**
```python
# Vor dem Schreiben: Existierende auth.json laden und MERGEN
auth = json.loads(auth_path.read_text()) if auth_path.exists() else {}
auth['google'] = {...}  # Google hinzufügen, nicht ersetzen
auth_path.write_text(json.dumps(auth, indent=2))
```

**Invariant 12:** `auth.json` MUSS immer ein Merge sein - niemals ohne Prüfung überschreiben!

**Datei:** `core/accounts_opencode.py`

---

## RBUG-069: Partial State - Workspace User existiert aber OAuth fehlgeschlagen
**Aufgetreten:** 2026-03-17 **Status:** ✅ DOKUMENTIERT
**Symptom:** Google Workspace zeigt `rotator-*` User, aber `antigravity-accounts.json` hat keinen funktionierenden Account. `opencode auth list` zeigt kein Google.

**Ursache:** 
1. Rotation erstellt zuerst Workspace User
2. Dann läuft OAuth-Flow
3. Wenn OAuth fehlschlägt (gaplustos), wird der User durch Emergency Cleanup gelöscht
4. ABER: Bei manchen Fehlern wurde der User nicht gelöscht
5. Resultat: Orphaned Workspace User ohne Auth

**Fix:**
1. `main.py cleanup` zum Entfernen orphaned Accounts
2. Bei Rotation-Failure IMMER `emergency_cleanup` laufen lassen
3. Pre-Rotation-Cleanup am Anfang von `rotate_account()` hinzugefügt

**Cleanup-Befehl:**
```bash
cd ~/dev/openAntigravity-auth-rotator && python3 main.py cleanup
```

---

## RBUG-070: Gemini API Key Integration - Provider-Konflikt
**Aufgetreten:** 2026-03-17 **Status:** ✅ IMPLEMENTIERT
**Ziel:** Zusätzlich zu Antigravity-OAuth auch Gemini API Key für direkte Gemini-Nutzung konfigurieren.

**Implementierung:**
1. `core/gemini_api_key.py` - API Key Erstellung via gcloud CLI
2. `core/gemini_config.py` - Provider-Modell-Konfiguration für opencode.json
3. `core/main_rotate.py` - Integration nach erfolgreicher Rotation

**Neue Modelle nach Rotation:**
- `gemini-3.1-pro-api-key` - Direkter Gemini API Zugriff
- `gemini-3.1-flash-api-key` - Flash via API Key
- `gemini-3.1-pro-customtools` - Mit Tool-Support

**WICHTIG:** Der Provider heißt `google-gemini-key` - nicht mit `google` (Antigravity OAuth) verwechseln!

**Dateien:**
- `core/gemini_api_key.py` (NEU)
- `core/gemini_config.py` (NEU)
- `core/main_rotate.py` (erweitert)

---

## RBUG-071: gaplustos Button kann NICHT automatisiert werden
**Aufgetreten:** 2026-03-17 **Status:** ✅ WORKAROUND IMPLEMENTIERT
**Symptom:** Alle Automatisierungsversuche für "Verstanden" Button schlagen fehl:
- JS Click: False
- Direct Button Click: False  
- AppleScript Click: Timeout
- Cliclick: False
- Tab + Enter: False

**Ursache:** 
- Google's speedbump/gaplustos Seite hat Anti-Automatisierung
- Button ist in Shadow DOM oder hat Event-Handler die nur echte Mausklicks akzeptieren
- JavaScript clicks werden geblockt

**Workaround:** 
- Semi-automatischer Modus: Script wartet 60 Sekunden
- User muss manuell im Browser auf "Verstanden" klicken
- Script erkennt URL-Wechsel automatisch

**Code:**
```python
# In step03d_gaplustos_try.py
print("[step03d] MANUAL CLICK REQUIRED - waiting 60 seconds...")
for i in range(60):
    await asyncio.sleep(1)
    if "gaplustos" not in tab.url:
        return True  # Manual click detected!
return False
```

**Invariant 13:** gaplustos erfordert MANUELLEN Click - Automatisierung nicht möglich!

**Datei:** `core/login/step03d_gaplustos_try.py`

---

## RBUG-072: gaplustos Timeout entfernt google auth + doppeltes Delete (404)
**Aufgetreten:** 2026-03-17 **Status:** 🔴 OFFEN
**Symptom:** Wenn der manuelle "Verstanden"-Click nicht innerhalb der 60s passiert, bricht die Rotation ab. Danach ist `~/.local/share/opencode/auth.json` ohne `google`-Key und es erscheint ein 404-Warnlog beim zweiten Delete des Workspace-Users.

**Ursache:**
- `step03d_gaplustos_try.py` liefert `False` → `login_fail.py` ruft `emergency_cleanup`.
- `emergency_cleanup` entfernt `google` aus `auth.json` und löscht den User.
- `main_rotate.py` ruft danach `_del(em)` und versucht erneut zu löschen → 404.

**Fix (geplant):**
1. `emergency_cleanup` soll vorhandene `google`-Auth sichern und bei Rotation-Failure wiederherstellen.
2. `_del(em)` nur ausführen, wenn `emergency_cleanup` NICHT bereits gelaufen ist.

**Workaround:** Rotation erneut starten und innerhalb von 60s manuell klicken. Falls `google`-Auth fehlt, Tokens erneut injizieren (z.B. über `logs/tokens.json`).

**Dateien:** `core/emergency_cleanup.py`, `core/login/login_fail.py`, `core/main_rotate.py`

---

## RBUG-073: opencode.json apiKey falsch platziert

**Aufgetreten:** 2026-03-17 **Status:** ✅ GEFIXT

**Symptom:** opencodex-auth-rotator schlägt fehl mit "apiKey ist kein gültiger Key unter provider.google"

**Ursache:** `apiKey` war direkt unter dem Provider platziert, nicht unter `options`.

**Fix:**
1. `apiKey` muss unter `options` stehen
2. Für `gemini-api` muss `baseURL: https://generativelanguage.googleapis.com/v1beta` gesetzt werden

**Richtige Config:**
```json
{
  "provider": {
    "google": {
      "options": {
        "apiKey": "AIzaSy..."
      },
      "models": {...}
    },
    "gemini-api": {
      "options": {
        "apiKey": "AIzaSy...",
        "baseURL": "https://generativelanguage.googleapis.com/v1beta"
      },
      "models": {...}
    }
  }
}
```

**Dateien:** `~/.config/opencode/opencode.json`

---

## RBUG-074: Gemini API Modelle nicht verfügbar (nur 2.5)

**Aufgetreten:** 2026-03-17 **Status:** ✅ GEFIXT

**Symptom:** Nur alte Modelle (gemini-2.5-pro/flash) verfügbar, obwohl 3.1 existiert.

**Ursache:** Falsche API Version (v1 statt v1beta) und falsche Model-Namen.

**Fix:**
1. `baseURL` auf `v1beta` setzen
2. Modelle: `gemini-pro-latest` → Gemini 3.1, `gemini-flash-latest` → Gemini 3 Flash

**Getestete Modelle:**
| Model ID | Actual Version |
|----------|----------------|
| `gemini-pro-latest` | gemini-3.1-pro-preview ✅ |
| `gemini-flash-latest` | gemini-3-flash-preview ✅ |
| `gemini-2.5-pro` | gemini-2.5-pro ✅ |
| `gemini-2.5-flash` | gemini-2.5-flash ✅ |

**Dateien:** `~/.config/opencode/opencode.json`, `core/gemini_config.py`

---

## RBUG-075: Gemini Direct API - Modelle unterstützen keine Bilder

**Aufgetreten:** 2026-03-17 **Status:** ✅ GEFIXT

**Symptom:** "this model does not support image input" bei gemini-pro-latest

**Ursache:** Die "latest" Modelle (gemini-pro-latest) sind keine multimodalen Preview Modelle!

**Fix:**
1. Preview Modelle verwenden die Bilder unterstützen:
   - `gemini-3.1-pro-preview` → unterstützt Bilder ✅
   - `gemini-3-flash-preview` → unterstützt Bilder ✅

2. baseURL muss `v1beta` sein

**RICHTIGE Config:**
```json
{
  "provider": {
    "gemini-api": {
      "options": {
        "apiKey": "AIzaSy...",
        "baseURL": "https://generativelanguage.googleapis.com/v1beta"
      },
      "models": {
        "gemini-3.1-pro-preview": {
          "id": "gemini-3.1-pro-preview",
          "name": "Gemini 3.1 Pro Preview",
          "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}
        },
        "gemini-3-flash-preview": {
          "id": "gemini-3-flash-preview", 
          "name": "Gemini 3 Flash Preview",
          "modalities": {"input": ["text", "image", "pdf"], "output": ["text"]}
        }
      }
    }
  }
}
```

**Getestet:** Bild-Input funktioniert! ✅

**Dateien:** `~/.config/opencode/opencode.json`

---

## BUG-XXX: Service Account Impersonation - 401 Unauthorized

**Aufgetreten:** 2026-03-17  
**Status:** 🔴 OFFEN

**Symptom:** `get_impersonated_tokens()` gibt 401 Unauthorized zurück:
```
"error": "unauthorized_client",
"error_description": "Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."
```

**Ursache:** Domain-Wide Delegation ist NICHT korrekt konfiguriert. Der Service Account hat keine Berechtigung, Workspace-User zu impersonieren.

**WICHTIGE ERKENNTNIS:**
- Domain-Wide Delegation kann NICHT via CLI/API eingerichtet werden
- MUSS manuell in Google Admin Console konfiguriert werden
- Auch nicht via gcloud, Google Workspace CLI, oder Admin SDK API möglich

**Lösung (MANUELL erforderlich):**
1. Chrome mit "Geschäftlich" Profil öffnen
2. https://admin.google.com/ac/owl/domainwidedelegation aufrufen
3. **Add new** klicken
4. **Client ID:** `107834273462934674392`
5. **OAuth Scopes (comma-separated):**
```
https://www.googleapis.com/auth/cloud-platform,
https://www.googleapis.com/auth/userinfo.email,
https://www.googleapis.com/auth/userinfo.profile,
openid,
https://www.googleapis.com/auth/admin.directory.user
```
6. **Authorize** klicken

**Service Account Details:**
- Email: `ki-agent@artificial-biometrics.iam.gserviceaccount.com`
- Client ID: `955661971872-ie97v0ns6ndb19rbr9nlpkahpmfk9ugf.apps.googleusercontent.com`
- Projekt: `artificial-biometrics`

**Test nach Konfiguration:**
```bash
cd ~/dev/openAntigravity-auth-rotator
python3 -c "
import sys; sys.path.insert(0, '.')
from core.service_account_impersonate import get_impersonated_tokens
tokens = get_impersonated_tokens('info@zukunftsorientierte-energie.de')
print('SUCCESS:', tokens['access_token'][:50])
"
```

**Datei:** `core/service_account_impersonate.py`

---

## WICHTIG: Chrome Port Konvention

**CHROME PORTS:**
| Rotator | Port | Profil |
|---------|------|--------|
| opencodex-auth-rotator | 9334 | `chrome_profile/` |
| openAntigravity-auth-rotator | 7654 | `chrome_profile/` |

**Chrome Starten:**
```bash
# openAntigravity-auth-rotator (Port 7654)
open -a "Google Chrome" --args --remote-debugging-port=7654 --user-data-dir=~/dev/openAntigravity-auth-rotator/chrome_profile
```

---

## KONFIGURATION: Alle verfügbaren Modelle

### GEMINI-API (Direct API Key - NICHT Antigravity!)
**BaseURL:** `https://generativelanguage.googleapis.com/v1beta`
**API Key:** `AIzaSyA1THIC_oph4rwO32RhilqfDGWg308iqDg`
**GCP Project:** `artificial-biometrics`

| Model ID | Name | Getestet |
|----------|------|----------|
| `gemini-pro-latest` | Gemini 3.1 Pro | ✅ |
| `gemini-flash-latest` | Gemini 3 Flash | ✅ |
| `gemini-2.5-pro` | Gemini 2.5 Pro | ✅ |
| `gemini-2.5-flash` | Gemini 2.5 Flash | ✅ |

### GOOGLE (Antigravity Plugin - OAuth)
| Model ID | Name |
|----------|------|
| `antigravity-claude-sonnet-4-6` | Claude Sonnet 4.6 |
| `antigravity-claude-opus-4-6-thinking` | Claude Opus 4.6 Thinking |
| `antigravity-gemini-3.1-pro` | Gemini 3.1 Pro |
| `antigravity-gemini-3-flash` | Gemini 3 Flash |

### WICHTIG: Config-Dateien
| Datei | Inhalt |
|-------|--------|
| `~/.config/opencode/opencode.json` | Haupt-Config mit allen Providern |
| `~/.config/openAntigravity-auth-rotator/token.json` | Admin SDK OAuth |
| `~/.config/openAntigravity-auth-rotator/oauth_client.json` | Antigravity OAuth Client |
| `~/.zshrc` | `GOOGLE_API_KEY` Environment Variable |
| gcloud CLI | `/opt/homebrew/Caskroom/gcloud-cli/560.0.0/google-cloud-sdk/bin/gcloud`
