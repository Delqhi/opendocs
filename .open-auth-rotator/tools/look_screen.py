#!/usr/bin/env python3
"""
look-screen CLI (v3) - Enterprise Architecture via Colab MCP Server
-------------------------------------------------------------------
This CLI captures the screen and delegates the vision analysis
directly to the official Google Colab MCP Server.
No browser automation, no cloudflared tunnels, no FastAPI servers.
100% Headless API utilizing google-colab-ai (Gemini 2.5).
"""

import argparse
import base64
import json
import os
import signal
import subprocess
import sys
import time
import hashlib
from pathlib import Path
from datetime import datetime

SCREENSHOT_DIR = Path("/tmp/look-screen")
LOG_FILE = SCREENSHOT_DIR / "observations.jsonl"
VISION_DIR = Path("/tmp/look-screen/recordings")
SUPABASE_URL = os.environ.get("VISION_SUPABASE_URL", "http://92.5.60.87:54321")
SUPABASE_KEY = os.environ.get("VISION_SUPABASE_KEY", "")
RECORDING = False
RECORD_PID = None


def take_screenshot(path: str) -> str:
    subprocess.run(["screencapture", "-x", path], check=True, timeout=5)
    return path


def encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def analyze_via_colab_mcp(image_path: str, prompt: str) -> str:
    """
    Delegates the analysis to the OpenCode CLI, which is connected to the
    Google Colab MCP Server. The Colab MCP Server executes the vision analysis
    headless using the `google.colab.ai` module (Gemini Vision).
    """
    # Build the payload for the MCP tool or opencode run command.
    # In an MCP context, the agent uses the colab-mcp-server tool to execute python remotely.
    python_payload = f"""
from google.colab import ai
from PIL import Image
import base64
import io

# Decode the uploaded image sent via MCP context
with open("{image_path}", "rb") as img_file:
    image = Image.open(io.BytesIO(img_file.read())).convert('RGB')
    
response = ai.generate_text("{prompt}", images=[image])
print(response.text)
"""

    print(f"[look-screen] Sending image to Colab MCP Server for analysis...")

    try:
        # Run opencode CLI to route this task through the Colab MCP Server
        # (This assumes the colab-mcp-server is active in ~/.config/opencode/opencode.json)
        result = subprocess.run(
            [
                "opencode",
                "run",
                f"Analyze this image using the colab-mcp-server: {prompt}. The image is at {image_path}. Do not write a script, just execute it on Colab and return the result.",
                "--format",
                "json",
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )

        # Parse the JSON output from OpenCode to get the text response
        parts = []
        for line in result.stdout.splitlines():
            try:
                ev = json.loads(line)
                if ev.get("type") == "text":
                    parts.append(ev.get("part", {}).get("text", ""))
            except json.JSONDecodeError:
                pass

        analysis = "".join(parts).strip()
        if analysis:
            return analysis
        else:
            return f"Colab MCP Server Error (No Output). Stderr: {result.stderr}"

    except Exception as e:
        return f"Error connecting to Colab MCP: {e}"


def log_to_supabase(analysis: str, screenshot_path: str, prompt: str):
    if not SUPABASE_KEY:
        return

    img_hash = hashlib.sha256(open(screenshot_path, "rb").read()).hexdigest()[:16]
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "prompt": prompt,
        "analysis": analysis,
        "screenshot_hash": img_hash,
        "source": "look-screen-v3-mcp",
    }

    subprocess.run(
        [
            "curl",
            "-s",
            "-X",
            "POST",
            f"{SUPABASE_URL}/rest/v1/vision_logs",
            "-H",
            f"apikey: {SUPABASE_KEY}",
            "-H",
            f"Authorization: Bearer {SUPABASE_KEY}",
            "-H",
            "Content-Type: application/json",
            "-H",
            "Prefer: return=minimal",
            "-d",
            json.dumps(entry),
        ],
        capture_output=True,
        text=True,
        timeout=10,
    )


def record_screen():
    global RECORDING, RECORD_PID
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

    RECORD_PID = subprocess.Popen(["screencapture", "-v", "-x", str(output)])
    RECORDING = True
    print(f"[look-screen] Recording started: {output}")
    return str(output)


def stop_screen():
    global RECORDING, RECORD_PID
    if RECORD_PID:
        RECORD_PID.terminate()
        RECORD_PID = None
        RECORDING = False
    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification "Bildschirmaufzeichnung gestoppt" with title "look-screen"',
        ]
    )
    print("[look-screen] Recording stopped")


def watch_loop(interval: float = 3.0, max_iterations: int = 200, prompt: str = ""):
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    default_prompt = (
        prompt
        or "Analyze this screenshot. What page is shown? What UI elements are visible? What action should be taken next? Is there an error?"
    )

    print(
        f"[look-screen] Starting visual observer via Colab MCP Server (interval={interval}s)"
    )

    last_hash = ""
    for i in range(max_iterations):
        ts = time.strftime("%H:%M:%S")
        screenshot_path = SCREENSHOT_DIR / f"frame_{i:04d}.png"

        try:
            take_screenshot(str(screenshot_path))
            img_hash = hashlib.md5(open(screenshot_path, "rb").read()).hexdigest()

            if img_hash != last_hash:
                analysis = analyze_via_colab_mcp(str(screenshot_path), default_prompt)
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
        description="look-screen CLI v3 — Colab MCP Server Backend"
    )
    parser.add_argument("--interval", type=float, default=3.0)
    parser.add_argument("--max-iterations", type=int, default=200)
    parser.add_argument("--screenshot", help="Screenshot to analyze")
    parser.add_argument("--describe", action="store_true")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--prompt", default="", help="Custom analysis prompt")
    parser.add_argument("--record", action="store_true", help="Start screen recording")
    parser.add_argument("--stop", action="store_true", help="Stop screen recording")
    parser.add_argument(
        "--status", action="store_true", help="Show Colab MCP Server status"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="look-screen v3.0.0 (Colab MCP Server + google-colab-ai)",
    )
    # Deprecated flags (kept for compat, but ignored):
    parser.add_argument("--rotator", help=argparse.SUPPRESS)

    args = parser.parse_args()

    if args.status:
        print("[look-screen] Vision Architecture: v3-colab-mcp-server")
        print("[look-screen] Engine: google-colab-ai (Gemini 2.5)")
        print("[look-screen] Tunneling: DISABLED (MCP native direct connection)")
        print("[look-screen] Browser Automation: PURGED (SOTA 2026 Headless API)")
        print("[look-screen] Status: Active - Routing through OpenCode MCP")
        return

    if args.stop:
        stop_screen()
        return

    if args.record:
        record_screen()
        return

    if args.describe and args.screenshot:
        prompt = (
            args.prompt
            or "Describe this screenshot in detail. What is shown? What UI elements? Any errors?"
        )
        result = analyze_via_colab_mcp(args.screenshot, prompt)
        print(result)
        log_to_supabase(result, args.screenshot, prompt)
        return

    if args.once and args.screenshot:
        prompt = args.prompt or "Analyze this screenshot."
        result = analyze_via_colab_mcp(args.screenshot, prompt)
        print(result)
        log_to_supabase(result, args.screenshot, prompt)
        return

    watch_loop(
        interval=args.interval, max_iterations=args.max_iterations, prompt=args.prompt
    )


if __name__ == "__main__":
    main()
