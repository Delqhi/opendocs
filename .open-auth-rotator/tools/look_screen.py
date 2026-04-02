#!/usr/bin/env python3
"""
look-screen CLI (v4) — Direct Gemini REST API with Fallback Chain
=================================================================
No browser. No Colab MCP. No CDP. No tunnels.
Pure REST: screenshot → base64 → Gemini Vision → response.

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
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime
from urllib import request, error

GEMINI_API_KEY = os.environ.get(
    "GEMINI_VISION_API_KEY", "AIzaSyCnRoGEoQJBAVssEu6BP1ojSBzIwV5r8_o"
)

VISION_MODELS = [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemma-3-27b",
    "gemma-3-12b",
    "gemma-3-4b",
]

SCREENSHOT_DIR = Path("/tmp/look-screen")
LOG_FILE = SCREENSHOT_DIR / "observations.jsonl"
VISION_DIR = Path("/tmp/look-screen/recordings")
SUPABASE_URL = os.environ.get("VISION_SUPABASE_URL", "http://92.5.60.87:54321")
SUPABASE_KEY = os.environ.get("VISION_SUPABASE_KEY", "")


def take_screenshot(path: str) -> str:
    """Capture screenshot using macOS screencapture."""
    subprocess.run(["screencapture", "-x", path], check=True, timeout=5)
    return path


def encode_image(path: str) -> str:
    """Encode image file to base64 string."""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def analyze_via_gemini(image_b64: str, prompt: str, model: str) -> str:
    """
    Send image + prompt to Gemini REST API.
    Returns analysis text or raises exception on failure.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"

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
    """
    Try each model in the fallback chain until one succeeds.
    This gives us effectively unlimited vision calls by rotating
    across models with independent free-tier quotas.
    """
    image_b64 = encode_image(image_path)
    last_error = None

    for model in VISION_MODELS:
        try:
            result = analyze_via_gemini(image_b64, prompt, model)
            return result
        except Exception as e:
            last_error = str(e)
            print(f"[look-screen] {model}: {e}", file=sys.stderr)
            continue

    return f"[look-screen] All models failed. Last error: {last_error}"


def log_to_supabase(analysis: str, screenshot_path: str, prompt: str):
    """Log vision result to Supabase (optional, non-blocking)."""
    if not SUPABASE_KEY:
        return
    try:
        img_hash = hashlib.sha256(open(screenshot_path, "rb").read()).hexdigest()[:16]
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "prompt": prompt,
            "analysis": analysis[:4000],
            "screenshot_hash": img_hash,
            "source": "look-screen-v4-gemini-rest",
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
    """Start screen recording (macOS screencapture -v)."""
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
    print(f"[look-screen] Recording started: {output} (PID: {pid.pid})")
    return str(output)


def watch_loop(interval: float = 3.0, max_iterations: int = 200, prompt: str = ""):
    """Continuous screen monitoring with vision analysis."""
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    default_prompt = (
        prompt
        or "Analyze this screenshot. What page is shown? What UI elements are visible? What action should be taken next? Is there an error?"
    )

    print(
        f"[look-screen] Starting visual observer (interval={interval}s, models: {len(VISION_MODELS)})"
    )

    last_hash = ""
    for i in range(max_iterations):
        ts = time.strftime("%H:%M:%S")
        screenshot_path = SCREENSHOT_DIR / f"frame_{i:04d}.png"

        try:
            take_screenshot(str(screenshot_path))
            img_hash = hashlib.md5(open(screenshot_path, "rb").read()).hexdigest()

            if img_hash != last_hash:
                analysis = analyze_with_fallback(str(screenshot_path), default_prompt)
                print(f"\n[look-screen] {ts} Frame #{i}:")
                print(analysis[:400])
                log_to_supabase(analysis, str(screenshot_path), default_prompt)

                entry = {
                    "timestamp": ts,
                    "iteration": i,
                    "screenshot": str(screenshot_path),
                    "analysis": analysis,
                }
                with open(LOG_FILE, "a") as f:
                    f.write(json.dumps(entry) + "\n")

                last_hash = img_hash

            time.sleep(interval)

        except KeyboardInterrupt:
            print(f"\n[look-screen] Stopped after {i} frames")
            break
        except Exception as e:
            print(f"[look-screen] Error: {e}")
            time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(
        description="look-screen CLI v4 — Direct Gemini REST API with Fallback Chain"
    )
    parser.add_argument("--interval", type=float, default=3.0)
    parser.add_argument("--max-iterations", type=int, default=200)
    parser.add_argument("--screenshot", help="Path to screenshot image to analyze")
    parser.add_argument(
        "--describe", action="store_true", help="Describe the screenshot"
    )
    parser.add_argument("--once", action="store_true", help="One-shot analysis")
    parser.add_argument("--prompt", default="", help="Custom analysis prompt")
    parser.add_argument("--record", action="store_true", help="Start screen recording")
    parser.add_argument("--stop", action="store_true", help="Stop screen recording")
    parser.add_argument(
        "--status", action="store_true", help="Show vision backend status"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="look-screen v4.0.0 (Gemini REST API + Fallback Chain)",
    )

    args = parser.parse_args()

    if args.status:
        print("[look-screen] Vision Architecture: v4-gemini-rest-fallback")
        print(f"[look-screen] API Key: {GEMINI_API_KEY[:15]}...")
        print(
            f"[look-screen] Models ({len(VISION_MODELS)}): {', '.join(VISION_MODELS)}"
        )
        print("[look-screen] Browser Automation: NONE (Pure REST)")
        print("[look-screen] Colab MCP: NOT USED (Direct Gemini API)")
        print("[look-screen] Status: Active")
        return

    if args.record:
        record_screen()
        return

    if args.describe and args.screenshot:
        prompt = (
            args.prompt
            or "Describe this screenshot in detail. What is shown? What UI elements? Any errors?"
        )
        result = analyze_with_fallback(args.screenshot, prompt)
        print(result)
        log_to_supabase(result, args.screenshot, prompt)
        return

    if args.once and args.screenshot:
        prompt = args.prompt or "Analyze this screenshot."
        result = analyze_with_fallback(args.screenshot, prompt)
        print(result)
        log_to_supabase(result, args.screenshot, prompt)
        return

    watch_loop(
        interval=args.interval, max_iterations=args.max_iterations, prompt=args.prompt
    )


if __name__ == "__main__":
    main()
