---
name: sin-vision-colab
description: "Screen recording + AI vision analysis via official Google Colab MCP Server. 100% Headless. No browser automation. Uses Gemini via google-colab-ai natively."
license: Apache-2.0
compatibility: opencode
metadata:
  audience: all-agents
  workflow: screen-vision-analysis
  trigger: screen-record, screenshot, vision-analyze, look-screen
  version: v3-colab-mcp-server
---

# A2A-SIN-Vision-Colab Skill (v3 SOTA 2026)

Screen recording + AI vision analysis via the **Colab MCP Server** using **google-colab-ai**.

## 🔴 THE FALL OF BROWSER AUTOMATION (March 2026)

**Browser automation (nodriver, AppleScript) for Google Colab is dead.**
Chrome 146+ blocks DevToolsActivePort on default profiles, and AppleScript JavaScript execution is disabled by default.

We no longer use Cloudflare tunnels, FastAPI, or hacky browser scripts. We use the **Colab MCP Server** directly.

## 🟢 ARCHITEKTUR (V3 - Colab MCP Server)

```
[Agent] → look-screen CLI → [OpenCode MCP Client] → [Colab MCP Server] → Gemini Vision Analysis
              ↓
        Supabase Vision Logs
```

## 🔑 KEY FEATURES

- ✅ **KEIN Browser mehr!** — 100% Headless API Connection.
- ✅ **Offizielles MCP** — Google Colab MCP Server.
- ✅ **KEIN API-Key** — läuft direkt über das im MCP Server gemountete Google-Konto.
- ✅ **Gemini 2.5 Pro gratis** für ALLE Colab-Nutzer.

## 📋 WANN NUTZEN

| Trigger | Aktion |
|---------|--------|
| "nimm bildschirm auf" | `look-screen --record` |
| "analysiere bildschirm" | `look-screen --screenshot /tmp/screen.png --describe` |
| "was siehst du?" | `look-screen --once --screenshot /tmp/screen.png` |
| "überwache bildschirm" | `look-screen --interval 3` |
| "stop aufnahme" | `look-screen --stop` |

## 🚀 SETUP (Colab MCP Server)

### 1. Installation (einmalig)

Der Colab MCP Server wird über `uvx` direkt vom GitHub-Repo geladen. Keine manuelle Installation nötig:

```bash
# Testen ob uvx verfügbar ist
uvx --version

# Colab MCP Server testen (lädt automatisch beim ersten Aufruf)
uvx git+https://github.com/googlecolab/colab-mcp --help
```

### 2. OpenCode MCP Konfiguration

Registriere den `colab` MCP Server in deiner `opencode.json`. Es sind keine Colab-Notebook-URLs (`vision-colab-1.url`) oder Cloudflare-Tunnel mehr nötig!

```json
// opencode.json — im "mcp" Block hinzufügen
"colab": {
  "type": "local",
  "command": [
    "uvx",
    "git+https://github.com/googlecolab/colab-mcp"
  ],
  "enabled": true
}
```

### 3. Colab Notebook öffnen

Öffne ein Google Colab Notebook in deinem Browser und halte den Tab offen. Der MCP Server verbindet sich automatisch mit dem aktiven Notebook.

**Genutzte Google Accounts:**
- `zukunftsorientierte.energie@gmail.com` (Primary)
- `jeremyschulze93@gmail.com` (Secondary)

### 4. Verifizieren

```bash
# look-screen Status prüfen
look-screen --status

# Erwartete Ausgabe:
# [look-screen] Vision Architecture: v3-colab-mcp-server
# [look-screen] Engine: google-colab-ai (Gemini 2.5)
# [look-screen] Status: Active - Routing through OpenCode MCP
```

## 🔧 LOOK-SCREEN CLI

Das `look-screen` Tool delegiert jetzt an den `opencode run` Befehl, um den Colab MCP Server aufzurufen.

```bash
# Status prüfen (zeigt v3 Architektur)
look-screen --status

# Einzelnes Screenshot analysieren
look-screen --screenshot /tmp/screen.png --describe

# Kontinuierliche Überwachung (alle 3 Sekunden)
look-screen --interval 3

# Screenshot aufnehmen und beschreiben
screencapture -x /tmp/screen.png && look-screen --screenshot /tmp/screen.png --describe
```

## 🔄 AGENT WORKFLOW

```python
# So nutzt JEDER Agent diesen Skill:

# 1. Screenshot machen
import subprocess
subprocess.run(["screencapture", "-x", "/tmp/screen.png"])

# 2. Analyse anfordern
result = subprocess.run(
    ["look-screen", "--screenshot", "/tmp/screen.png", "--describe"],
    capture_output=True, text=True
)
analysis = result.stdout
```

## ⚠️ ARCHITECTURAL RULE: NO BROWSER AUTOMATION FOR COLAB

**NIEMALS** versuchen, Colab über den Browser mit AppleScript oder `nodriver` zu automatisieren. Wenn Colab benötigt wird, **IMMER** den Colab MCP Server nutzen.

## 🔗 RESSOURCEN

- [google-colab-ai Getting Started](https://colab.research.google.com/github/googlecolab/colabtools/blob/main/notebooks/Getting_started_with_google_colab_ai.ipynb)
- [Colab MCP Server (März 2026)](https://googledevelopers.blogspot.com/announcing-the-colab-mcp-server-connect-any-ai-agent-to-google-colab/)
- [Colab MCP GitHub Repo](https://github.com/googlecolab/colab-mcp)
