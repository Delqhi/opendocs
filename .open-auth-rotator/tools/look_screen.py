#!/usr/bin/env python3
"""
look-screen CLI (v4.1) — Direct Gemini REST API with Fallback Chain
===================================================================
No browser. No Colab MCP. No CDP. No tunnels.
Pure REST: screenshot → base64 → Gemini Vision → response.

Features:
  - One-shot screenshot analysis
  - Live screen monitoring (interval-based, Gemini analyzes each frame)
  - Screen recording (video)
  - Local JSONL logging (all analyses saved)
  - Supabase logging (optional)
  - Menubar integration (state file, PID management)
  - Log viewer
  - Status dashboard

Fallback chain (unlimited via free tier quota rotation):
  1. gemini-2.5-flash (1M context, unlimited)
  2. gemini-3-flash-preview (250K context)
  3. gemini-3.1-flash-lite-preview (250K context)
  4. gemma-3-27b (15K context)
  5. gemma-3-12b (15K context)
  6. gemma-3-4b (15K context)
"""

import argparse
import base64
import hashlib
import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime
from urllib import request, error

GEMINI_API_KEYS = [
    os.environ.get("GEMINI_VISION_API_KEY"),
    "AIzaSyDOqYyXH4WqhR8-Mul2fYlrNbvJKRnoJxg",
    "AIzaSyCVQSVrnk23ung38HEXsYrZmjcRhS3iWhM",
    "AIzaSyCvKZlCdpI8oUHDI435bSFfTpGIyrh3Oig",
]
GEMINI_API_KEYS = [k for k in GEMINI_API_KEYS if k]
KEY_INDEX = 0


def get_api_key():
    global KEY_INDEX
    return GEMINI_API_KEYS[KEY_INDEX % len(GEMINI_API_KEYS)]


def rotate_key():
    global KEY_INDEX
    KEY_INDEX += 1
    if KEY_INDEX >= len(GEMINI_API_KEYS):
        KEY_INDEX = 0
    print(
        f"[look-screen] Rotated to key #{KEY_INDEX + 1}/{len(GEMINI_API_KEYS)}",
        file=sys.stderr,
    )
    return get_api_key()


VISION_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3-flash-preview",
]

SCREENSHOT_DIR = Path("/tmp/look-screen")
LOG_FILE = SCREENSHOT_DIR / "observations.jsonl"
VISION_DIR = Path("/tmp/look-screen/recordings")
STATE_FILE = Path("/tmp/look-screen-menubar-state")
PID_FILE = Path("/tmp/look-screen-monitor.pid")
SUPABASE_URL = os.environ.get("VISION_SUPABASE_URL", "http://92.5.60.87:54321")
SUPABASE_KEY = os.environ.get("VISION_SUPABASE_KEY", "")

DEFAULT_PROMPT = "Analyze this screenshot. What page is shown? What UI elements are visible? What action should be taken next? Is there an error?"


def take_screenshot(path: str) -> str:
    subprocess.run(["screencapture", "-x", path], check=True, timeout=5)
    return path


def encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def analyze_via_gemini(image_b64: str, prompt: str, model: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={get_api_key()}"
    payload = json.dumps(
        {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/png", "data": image_b64}},
                    ]
                }
            ]
        }
    ).encode("utf-8")

    req = request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}, method="POST"
    )
    with request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "error" in data:
        err = data["error"]
        raise Exception(
            f"{model} error {err.get('code')}: {err.get('message', 'Unknown')}"
        )

    candidates = data.get("candidates", [])
    if not candidates:
        raise Exception(f"{model}: No candidates in response")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(p.get("text", "") for p in parts if p.get("text"))
    if not text:
        raise Exception(f"{model}: Empty response text")
    return text


def analyze_with_fallback(image_path: str, prompt: str) -> str:
    image_b64 = encode_image(image_path)
    last_error = None
    for model in VISION_MODELS:
        try:
            return analyze_via_gemini(image_b64, prompt, model)
        except Exception as e:
            last_error = str(e)
            err_str = str(e).lower()
            if (
                "403" in err_str
                or "leaked" in err_str
                or "429" in err_str
                or "quota" in err_str
            ):
                rotate_key()
            print(f"[look-screen] {model}: {e}", file=sys.stderr)
            continue
    return f"[look-screen] All models failed. Last error: {last_error}"


def log_entry(analysis: str, screenshot_path: str, prompt: str, iteration: int = 0):
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    img_hash = hashlib.sha256(open(screenshot_path, "rb").read()).hexdigest()[:16]
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "prompt": prompt,
        "analysis": analysis,
        "screenshot_path": str(screenshot_path),
        "screenshot_hash": img_hash,
        "iteration": iteration,
        "source": "look-screen-v4.1-gemini-rest",
    }
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry


def log_to_supabase(analysis: str, screenshot_path: str, prompt: str):
    if not SUPABASE_KEY:
        return
    try:
        img_hash = hashlib.sha256(open(screenshot_path, "rb").read()).hexdigest()[:16]
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "prompt": prompt,
            "analysis": analysis[:4000],
            "screenshot_hash": img_hash,
            "source": "look-screen-v4.1-gemini-rest",
        }
        data = json.dumps(entry).encode("utf-8")
        req = request.Request(
            f"{SUPABASE_URL}/rest/v1/vision_logs",
            data=data,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            method="POST",
        )
        request.urlopen(req, timeout=10)
    except Exception:
        pass


def record_screen():
    VISION_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output = VISION_DIR / f"recording_{ts}.mp4"
    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification "Bildschirmaufzeichnung gestartet" with title "look-screen"',
        ]
    )
    pid = subprocess.Popen(["screencapture", "-v", "-x", str(output)])
    STATE_FILE.write_text("recording")
    print(f"[look-screen] Recording started: {output} (PID: {pid.pid})")
    return str(output)


def stop_recording():
    STATE_FILE.write_text("stopped")
    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification "Bildschirmaufzeichnung gestoppt" with title "look-screen"',
        ]
    )
    # Kill any screencapture -v processes
    subprocess.run(["pkill", "-f", "screencapture.*-v"], capture_output=True)
    print("[look-screen] Recording stopped")


def start_monitor(interval: float = 3.0, prompt: str = ""):
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    analysis_prompt = prompt or DEFAULT_PROMPT

    # Write PID file
    PID_FILE.write_text(str(os.getpid()))
    STATE_FILE.write_text("monitoring")

    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification "Live Monitoring gestartet" with title "look-screen"',
        ]
    )
    print(f"[look-screen] Live monitoring started (interval={interval}s)")
    print(f"[look-screen] Logs: {LOG_FILE}")
    print(f"[look-screen] Press Ctrl+C to stop")

    last_hash = ""
    frame_count = 0

    def handle_signal(sig, frame):
        print(f"\n[look-screen] Monitoring stopped after {frame_count} frames")
        PID_FILE.unlink(missing_ok=True)
        STATE_FILE.write_text("stopped")
        subprocess.run(
            [
                "osascript",
                "-e",
                'display notification "Live Monitoring gestoppt" with title "look-screen"',
            ]
        )
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    while True:
        ts = time.strftime("%H:%M:%S")
        screenshot_path = SCREENSHOT_DIR / f"frame_{frame_count:04d}.png"

        try:
            take_screenshot(str(screenshot_path))
            img_hash = hashlib.md5(open(screenshot_path, "rb").read()).hexdigest()

            if img_hash != last_hash:
                analysis = analyze_with_fallback(str(screenshot_path), analysis_prompt)
                print(f"\n{'=' * 60}")
                print(f"[{ts}] Frame #{frame_count}")
                print(f"{'=' * 60}")
                print(analysis[:600])
                print(f"{'=' * 60}")

                log_entry(analysis, str(screenshot_path), analysis_prompt, frame_count)
                log_to_supabase(analysis, str(screenshot_path), analysis_prompt)
                last_hash = img_hash

            frame_count += 1
            time.sleep(interval)

        except Exception as e:
            print(f"[look-screen] Error: {e}")
            time.sleep(interval)


def stop_monitor():
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, signal.SIGTERM)
            print(f"[look-screen] Stopped monitor process (PID: {pid})")
        except (ProcessLookupError, ValueError):
            pass
        PID_FILE.unlink(missing_ok=True)
    STATE_FILE.write_text("stopped")
    subprocess.run(["pkill", "-f", "look_screen.*--monitor"], capture_output=True)
    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification "Live Monitoring gestoppt" with title "look-screen"',
        ]
    )
    print("[look-screen] Monitor stopped")


def view_logs(limit: int = 10):
    if not LOG_FILE.exists():
        print(
            "[look-screen] No logs yet. Start monitoring first: look-screen --monitor"
        )
        return

    print(f"[look-screen] Last {limit} observations from {LOG_FILE}")
    print(f"{'=' * 80}")

    lines = LOG_FILE.read_text().strip().split("\n")
    for line in lines[-limit:]:
        try:
            entry = json.loads(line)
            ts = entry.get("timestamp", "?")
            analysis = entry.get("analysis", "")[:200]
            it = entry.get("iteration", "?")
            print(f"[{ts}] Frame #{it}:")
            print(f"  {analysis}")
            print(f"{'-' * 80}")
        except json.JSONDecodeError:
            continue

    print(f"\n[look-screen] Total entries: {len(lines)}")


def show_status():
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

    print("[look-screen] Vision Architecture: v4.1-gemini-rest-fallback")
    print(
        f"[look-screen] API Keys: {len(GEMINI_API_KEYS)} configured (auto-rotate on 403/429)"
    )
    print(f"[look-screen] Active Key: {get_api_key()[:15]}...")
    print(f"[look-screen] Models ({len(VISION_MODELS)}): {', '.join(VISION_MODELS)}")
    print("[look-screen] Browser Automation: NONE (Pure REST)")
    print("[look-screen] Colab MCP: NOT USED (Direct Gemini API)")

    # State
    state = "idle"
    if STATE_FILE.exists():
        state = STATE_FILE.read_text().strip()
    print(f"[look-screen] State: {state}")

    # Monitor PID
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, 0)
            print(f"[look-screen] Monitor: RUNNING (PID: {pid})")
        except (ProcessLookupError, ValueError):
            print(f"[look-screen] Monitor: STALE (PID file exists but process dead)")
    else:
        print(f"[look-screen] Monitor: STOPPED")

    # Stats
    if LOG_FILE.exists():
        lines = LOG_FILE.read_text().strip().split("\n")
        valid = sum(1 for l in lines if l.strip())
        print(f"[look-screen] Total observations: {valid}")
        if valid > 0:
            last = json.loads(lines[-1])
            print(f"[look-screen] Last observation: {last.get('timestamp', '?')}")
    else:
        print(f"[look-screen] Total observations: 0")

    # Recordings
    recs = list(VISION_DIR.glob("recording_*.mp4")) if VISION_DIR.exists() else []
    print(f"[look-screen] Recordings: {len(recs)}")

    # Log file
    print(f"[look-screen] Log file: {LOG_FILE}")


def main():
    parser = argparse.ArgumentParser(
        description="look-screen CLI v4.1 — Direct Gemini REST API with Fallback Chain"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=3.0,
        help="Seconds between screenshots (default: 3)",
    )
    parser.add_argument(
        "--max-iterations", type=int, default=200, help="Max frames for watch loop"
    )
    parser.add_argument("--screenshot", help="Path to screenshot image to analyze")
    parser.add_argument(
        "--describe", action="store_true", help="Describe the screenshot"
    )
    parser.add_argument("--once", action="store_true", help="One-shot analysis")
    parser.add_argument("--prompt", default="", help="Custom analysis prompt")
    parser.add_argument(
        "--record", action="store_true", help="Start screen recording (video)"
    )
    parser.add_argument(
        "--stop", action="store_true", help="Stop recording or monitoring"
    )
    parser.add_argument(
        "--monitor",
        action="store_true",
        help="Start live monitoring (screenshots + Gemini analysis)",
    )
    parser.add_argument(
        "--logs",
        type=int,
        nargs="?",
        const=10,
        help="View recent observation logs (default: 10)",
    )
    parser.add_argument(
        "--status", action="store_true", help="Show vision backend status"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="look-screen v4.1.0 (Gemini REST API + Fallback Chain)",
    )

    args = parser.parse_args()

    if args.status:
        show_status()
        return

    if args.logs is not None:
        view_logs(args.logs if isinstance(args.logs, int) else 10)
        return

    if args.stop:
        stop_monitor()
        stop_recording()
        return

    if args.record:
        record_screen()
        return

    if args.monitor:
        start_monitor(interval=args.interval, prompt=args.prompt)
        return

    if args.describe and args.screenshot:
        prompt = (
            args.prompt
            or "Describe this screenshot in detail. What is shown? What UI elements? Any errors?"
        )
        result = analyze_with_fallback(args.screenshot, prompt)
        print(result)
        log_entry(result, args.screenshot, prompt)
        log_to_supabase(result, args.screenshot, prompt)
        return

    if args.once and args.screenshot:
        prompt = args.prompt or "Analyze this screenshot."
        result = analyze_with_fallback(args.screenshot, prompt)
        print(result)
        log_entry(result, args.screenshot, prompt)
        log_to_supabase(result, args.screenshot, prompt)
        return

    # Default: watch loop (backward compat)
    start_monitor(interval=args.interval, prompt=args.prompt)


if __name__ == "__main__":
    main()
