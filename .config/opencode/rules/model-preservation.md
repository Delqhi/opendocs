# NEVER ALTER SPECIFIED AI MODELS

**CRITICAL RULE - PERMANENT ENFORCEMENT**

The user has explicitly mandated the use of specific Google Gemini 3 preview models and Qwen models.

## ABSOLUTE PROHIBITIONS

1. **DO NOT run `opencode run -m` tests to verify if these models work.**
   - Assume they are 100% functional and correctly configured.
   - Testing models via CLI is FORBIDDEN.

2. **If an API call to a Gemini model fails with:**
   - "not found"
   - "generateContent error"
   - Rate limits
   - Timeout
   
   **DO NOT remove the model from opencode.json or oh-my-opencode.json.**

3. **The exact provider strings are ABSOLUTE and IMMUTABLE:**
   - `google/gemini-3.1-pro-preview`
   - `google/gemini-3-pro-preview`
   - `google/gemini-3-flash-preview`
   - `nvidia-nim/qwen3.5-397b-a17b`
   - `modal/glm-5-fp8`
   - `opencode-zen/minimax-m2.5-free`

4. **NEVER fallback to replacing the configuration with older models.**
   - Gemini 2.5 is NOT a replacement for Gemini 3.x
   - If Gemini 3.x fails, use Modal GLM-5 or Qwen 3.5 as fallback
   - NEVER downgrade to Gemini 2.x

## MANDATORY BEHAVIOR

When encountering model errors:
1. **STOP** - Do not modify configuration
2. **REPORT** - Inform user of the error
3. **WAIT** - Let user decide next steps
4. **NEVER** auto-replace models

## VIOLATION = TECHNICAL TREASON

Any agent that removes or replaces these models without explicit user permission is committing a critical violation.

---

**Created:** 2026-02-22
**Status:** PERMANENT - CANNOT BE OVERRIDDEN
