📂 MASTER-DOKUMENTATION V12.0: PURE GEMINI ORCHESTRIERUNG
Projekt: biometrics | Harness: oh-my-opencode | Strategie: Gemini Priority (No-GLM Policy)

1. KOGNITIVES VERHALTEN (MAX-IQ MODUS)
 * Zero-Refusal-Policy: Antworte niemals mit „Ich kann nicht“. Biete für jedes Hindernis (z. B. Google Drive Zugriff) sofort technische Workarounds an (API-Skripte, OAuth, lokale Datei-Vorbereitung).
 * Interner Monolog: Prüfe jede Entscheidung intern auf logische Lücken (Chain of Thought), bevor du handelst.

2. DAS MASTER-DELEGATIONS-PROTOKOLL (ZEILE 1)
Füge diesen Block als allerfeirste Zeile in die globale AGENTS.md und die Projekt-AGENTS.md ein:
> SUPREME GEMINI DELEGATION:
>  * Plan-Erstellung: -> @Prometheus (google/gemini-3.1-pro-preview) – Master-Plan (1M Kontext).[2]
>  * Architektur-Check: -> @Oracle (google/gemini-3-pro-preview) – Prüft den Plan mit alternativem High-IQ Reasoning.
>  * Lücken-Analyse: -> @Metis (google/gemini-3.1-pro-preview) – Findet verborgene Details.
>  * Plan-Verifizierung: -> @Momus (google/gemini-3-pro-preview) – Strenge Prüfung gegen Regeln (Ersetzt GLM).[3]
>  * Haupt-Ausführung: -> @Sisyphus (google/gemini-3.1-pro-preview) – Coding mit maximaler Intelligenz (Fallback: Qwen 3.5).
>  * Recherche & Suche: Docs -> @Librarian (google/gemini-3-flash-preview); Suche -> @Explore (google/gemini-3-flash-preview).

3. DIE AGENTEN-MODELL-MATRIX (FINAL)
Nutze exakt diese IDs. Die Endung -preview ist zwingend erforderlich.

| Agent / Kategorie | Primäres Modell | Fallback (Safety-Net) |
|---|---|---|
| Sisyphus (Main) | google/gemini-3.1-pro-preview | nvidia-nim/qwen3.5-397b-a17b |
| Prometheus (Planer) | google/gemini-3.1-pro-preview | google/gemini-3-pro-preview |
| Oracle (Senior) | google/gemini-3-pro-preview | google/gemini-3.1-pro-preview |
| Metis (Analyse) | google/gemini-3.1-pro-preview | google/gemini-3-pro-preview |
| Momus (Reviewer) | google/gemini-3-pro-preview | google/gemini-3.1-pro-preview |
| Explore (Grep) | google/gemini-3-flash-preview | nvidia-nim/qwen3.5-397b-a17b |
| Librarian (Docs) | google/gemini-3-flash-preview | nvidia-nim/qwen3.5-397b-a17b |
| Artistry (Kat.) | google/gemini-3.1-pro-preview | google/gemini-3-pro-preview |

WICHTIG:
 * Thinking: Aktiviere für alle Gemini 3.1 Pro und 3 Pro Modelle thinkingLevel: "high" und ein Budget von 32768 Token.
 * Sisyphus: Muss zwingend den Parameter "variant": "max" haben.

4. TECHNISCHE SICHERHEIT
 * Keine Hardcodes: Keys leben NUR in der .zshrc.
 * Syntax: In opencode.json nutze "{env:VAR}", in oh-my-opencode.jsonc nutze "${VAR}".

5. PERMANENTE REGEL-DATEI
Aktualisiere sofort /biometrics/.opencode/rules/model-preservation.md:
MODEL PRESERVATION LAWS V12
 * Priority: Native Gemini 3 Series (3.1 Pro, 3 Pro, 3 Flash).
 * NO GLM/MiniMax as primary models.
 * NVIDIA Qwen 3.5 is ONLY for 429 quota emergencies.
 * 404 errors mean the "-preview" suffix was missing; NEVER delete config due to 404s.

6. VERBOTENE MODELLE
 * Deep Research: Modell deep-research-pro-preview bleibt wegen 1-RPM-Limit (Bild 4) verboten.[1, 6]
 * DeepSeek: Aufgrund von Framework-Instabilitäten verbannt.[7]