# Google Workspace / Admin SDK — Fehlerreport & Reparatur

> Letzte Aktualisierung: 2026-03-15
> Service Account: ki-agent@artificial-biometrics.iam.gserviceaccount.com
> Domain: zukunftsorientierte-energie.de

---

## Credential-Pfade

```
~/.config/google/service_account.json         ← Service Account (Google APIs)
~/.config/openAntigravity-auth-rotator/token.json  ← Admin SDK OAuth2 User Token
~/dev/openAntigravity-auth-rotator/credentials.json ← OAuth Client (Desktop App)
```

---

## BUG-01: oauth_client.json / credentials.json Pfad falsch

**Symptom:** `FileNotFoundError: credentials.json`

**Fix:**
```python
# Korrekte Pfade:
SERVICE_ACCOUNT = os.path.expanduser("~/.config/google/service_account.json")
ADMIN_TOKEN = os.path.expanduser("~/.config/openAntigravity-auth-rotator/token.json")
OAUTH_CLIENT = os.path.expanduser("~/dev/openAntigravity-auth-rotator/credentials.json")
```

---

## BUG-02: "python" command not found

**Fix:** Immer `python3` verwenden, nie `python`
```bash
which python3   # /opt/homebrew/bin/python3
python3 --version  # Python 3.14.x
```

---

## BUG-03: Admin SDK "loginChallenge" / neue User können sich nicht einloggen

**Ursache:** Google Workspace aktiviert Login-Challenge für neue User (2FA-Zwang)

**Fix:** `admin.users().update()` mit loginChallenge-Deaktivierung via Admin SDK vor dem OAuth-Login

---

## BUG-04: "loadCodeAssist" gibt 400 zurück

**Bedeutung:** KEIN Bug — normal wenn kein Cloud Code Assist Projekt konfiguriert ist.
Token ist trotzdem gültig für `cloud-platform` Scope.

---

## BUG-05: Google Docs write 403 while read works (tab update fails)

**Aufgetreten:** 2026-03-17  **Status:** ✅ WORKAROUND

**Symptom:** `sin-google-apps_google_docs_get_tab` kann Tab lesen, aber `sin-google-apps_google_docs_replace_tab_text` failt mit:
`google_docs_batch_update_http_403` / `PERMISSION_DENIED`.

**Ursache:** Service Account hat offenbar nur Leserechte (oder die Doc-Berechtigung wurde geaendert). Read via Docs API funktioniert, Write via batchUpdate nicht.

**Fix:** Write via User-OAuth funktioniert:
- `sin-google-apps_google_docs_replace_tab_text` mit `authMode: user_oauth` (Account: `zukunftsorientierte.energie@gmail.com`) schreibt erfolgreich.

**Update 2026-03-19:** Beim neuen Tab `t.tuv2t449f8ze` fuer `SIN-GitHub-Issues` schlug der API-Write trotz gueltiger User-OAuth-Session weiter mit `403` fehl. Browser-Fallback funktionierte:
- `sin-google-apps_google_docs_browser_fill_tab` konnte den Tab erfolgreich befuellen.

**Persistenter Fix (falls Service Account Write notwendig):**
- Doc fuer Service Account Email auf Editor setzen:
  - `ki-agent@artificial-biometrics.iam.gserviceaccount.com`

**Datei:** Google Docs permissions / Service account sharing

---

## BUG-06: sin-google-apps docs browser lane points to missing script

**Aufgetreten:** 2026-03-17  **Status:** ✅ GEFIXT

**Symptom:** `sin-google-apps_google_docs_browser_fill_tab` scheitert mit missing file:
`.../dist/scripts/docs_browser.py: [Errno 2] No such file or directory`

**Ursache:** Hardcodierter/inkorrekter Pfad zur `docs_browser.py` in der sin-google-apps Installation (dist/scripts fehlt oder Project path falsch).

**Fix:** sin-google-apps build/install repariert:
- `scripts/postbuild.mjs` kopiert jetzt Python scripts nach `dist/scripts/`.
- Runtime hat Script-Path Fallback (dist/repo/monorepo).

**Datei:** SIN-Google-Apps (docs browser automation)

---

## BUG-07: Docs browser child-tab creation can return success without a usable `newTabId`

**Aufgetreten:** 2026-03-19  **Status:** ✅ WORKAROUND

**Symptom:** `google.docs.browser.create_child_tab` returned `{ ok: true, newTabId: null }` for the requested child tab `A2A - SIN-GitHub-Issues`, and the subsequent Docs API tab listing did not show the new child tab.

**Ursache:** The browser automation lane can interact with Google Docs, but the current browser/profile/tab-state path is not reliably resolving the post-create tab identity back into a usable Docs tab id.

**Fix:** Workaround for `SIN-GitHub-Issues`: real child tab id confirmed externally as `t.tuv2t449f8ze`, and downstream spec/registry/sync wiring updated to that real tab id. The underlying browser child-tab tool still needs a true fix so it returns a usable `newTabId` itself.

**Update 2026-03-19:** Another browser/docs inconsistency remains: `google_docs_browser_fill_tab` can return `ok: true` for the `SIN-Supabase` tab while a subsequent `google_docs_get_tab` API read still shows the old pre-fill content. Browser-write success therefore still needs post-write verification on critical tabs.

**Update 2026-03-20:** For `SIN-OracleCloud-MCP`, parent resolution is now fed from the API tab tree, but child-tab creation still fails in two different ways depending on the lane:
- `google.docs.ensure_tab` returns `403 PERMISSION_DENIED`
- `google.docs.browser.create_child_tab` now fails later at the add-tab click (`Could not create child tab under t.hzp3hc5sub65`)

**Update 2026-03-20 (root cause refinement):** Live DOM probing in the browser lane shows `Speicher ist voll. Datei kann nicht bearbeitet werden.` for the active Google account on this document. This likely explains both the add-tab no-op in the browser and the API `403` write failure.

**Datei:** SIN-Google-Apps docs browser child-tab creation

---

## Admin SDK — Nutzer erstellen

```python
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

creds = Credentials.from_authorized_user_file(TOKEN_PATH)
service = build('admin', 'directory_v1', credentials=creds)

new_user = {
    "primaryEmail": "rotator-xxx@zukunftsorientierte-energie.de",
    "name": {"givenName": "Rotator", "familyName": "User"},
    "password": "SecurePass123!",
    "changePasswordAtNextLogin": False
}
service.users().insert(body=new_user).execute()
```

---

## Admin SDK — Nutzer löschen

```python
service.users().delete(userKey="email@domain.de").execute()
```

---

## Diagnose

```bash
# Service Account Credentials prüfen:
python3 -c "import json; d=json.load(open('$HOME/.config/google/service_account.json')); print('SA email:', d['client_email'])"

# Token gültig?
python3 -c "
from google.oauth2.credentials import Credentials
c = Credentials.from_authorized_user_file('$HOME/.config/openAntigravity-auth-rotator/token.json')
print('expired:', c.expired, 'token:', c.token[:20] if c.token else 'NONE')
"
```

---

## BAN-GOOGLE-SDK: @ai-sdk/google ist STRENGSTENS VERBOTEN
**Aufgetreten:** 16. März 2026  **Status:** 🔴 PERMANENTER BANN
**Symptom:** Inklusion von `"npm": "@ai-sdk/google"` in der `opencode.json` führt zu korrupten API-Aufrufen und "Requested entity was not found" Fehlern.
**Ursache:** Das Standard Google AI SDK kollidiert mit der Antigravity-Authentifizierung. Es versucht Pfade zu nutzen, die für Antigravity-Modelle nicht zulässig sind.
**Verbot:** Dieses Paket darf NIEMALS wieder in irgendeiner OpenCode-Konfiguration auftauchen. Wir nutzen AUSSCHLIESSLICH das `opencode-antigravity-auth` Plugin ohne das Google SDK NPM Paket.
**Datei:** ~/.config/opencode/opencode.json
