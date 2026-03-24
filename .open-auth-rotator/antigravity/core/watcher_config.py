import re
from pathlib import Path

LOGS_DIR = Path.home() / ".local" / "share" / "opencode" / "log"
LOGS_DIR_LEGACY = Path.home() / ".config" / "opencode" / "antigravity-logs"
ACCOUNTS_PATH = Path.home() / ".config" / "opencode" / "antigravity-accounts.json"
OPENCODE_AUTH_PATH = Path.home() / ".local" / "share" / "opencode" / "auth.json"
QUOTA_PATTERNS = [
    re.compile(r"QUOTA_EXHAUSTED", re.IGNORECASE),
    re.compile(r"all \d+ account", re.IGNORECASE),
    # FIX: Only match antigravity models (claude/gemini), NOT gpt - gpt is handled by opencodex-auth-rotator
    re.compile(r"rate.?limited for (claude|gemini)", re.IGNORECASE),
    re.compile(r"quota resets in \d+h", re.IGNORECASE),
    re.compile(r"Add more accounts.*opencode auth login", re.IGNORECASE),
    re.compile(
        r"all.{0,30}account.{0,30}(rate.?limit|blocked|exhausted)", re.IGNORECASE
    ),
    re.compile(r"quota protection.*all.*account", re.IGNORECASE),
]
CLAUDE_RATE_LIMIT_PATTERNS = [
    re.compile(r"rate.?limited for claude", re.IGNORECASE),
    re.compile(r"all.{0,30}account.{0,30}claude", re.IGNORECASE),
]
# MODEL_ERROR_PATTERNS intentionally NOT included in ALL_ERROR_PATTERNS.
# RBUG-063: "Requested entity was not found / preview access" errors are model-availability
# issues that rotation cannot fix — including them caused an infinite rotation loop.
ALL_ERROR_PATTERNS = QUOTA_PATTERNS
LOCK_FILE = Path("/tmp/openAntigravity-auth-rotator.lock")
COOLDOWN_SECS = 15 * 60
_GOOGLE_AUTH_REINJECT_COOLDOWN = 30
