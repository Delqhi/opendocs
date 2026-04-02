#!/usr/bin/env python3
"""
Vision-Colab v2 Setup — google-colab-ai Architecture

Die NEUE Lösung: google-colab-ai statt Qwen3-VL + cloudflared
- KEIN API-Key nötig — läuft über Google-Konto
- Gemini + Gemma gratis für ALLE Colab-Nutzer
- Vision-Unterstützung — Bilder analysieren!
- Seit März 2026: Colab MCP Server für Agent-Anbindung

Usage:
    python3 ~/.open-auth-rotator/tools/vision_colab_setup.py
"""

import json
import os
import subprocess
import time
from pathlib import Path

CONFIG_DIR = Path.home() / ".config" / "opencode"
CONFIG_FILE = CONFIG_DIR / "vision-colab-config.json"
URL_FILE_1 = CONFIG_DIR / "vision-colab-1.url"
URL_FILE_2 = CONFIG_DIR / "vision-colab-2.url"
NOTEBOOK_PATH = (
    Path(__file__).resolve().parent / "vision-colab" / "colab_vision_hub_v2.ipynb"
)


def print_step(num, title):
    print(f"\n{'=' * 60}")
    print(f"STEP {num}: {title}")
    print(f"{'=' * 60}")


def read_url(path: Path) -> str:
    if path.exists():
        return path.read_text().strip()
    return ""


def save_urls(url1: str, url2: str):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    if url1:
        URL_FILE_1.write_text(url1.strip())
    if url2:
        URL_FILE_2.write_text(url2.strip())

    config = {
        "version": "v2-google-colab-ai",
        "url1": url1.strip(),
        "url2": url2.strip(),
        "authToken": "sin-vision-2026-secure-token",
        "supabaseUrl": os.environ.get("VISION_SUPABASE_URL", "http://92.5.60.87:54321"),
        "supabaseKey": os.environ.get("VISION_SUPABASE_KEY", ""),
        "model": "gemini-via-google-colab-ai",
    }

    tmp = CONFIG_FILE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(config, indent=2))
    os.chmod(tmp, 0o600)
    os.replace(tmp, CONFIG_FILE)
    print(f"\n✅ Config saved to {CONFIG_FILE}")


def main():
    print("\n🔬 A2A-SIN-Vision-Colab v2 — google-colab-ai Setup")
    print(f"Notebook: {NOTEBOOK_PATH}")
    print("\n🟢 NEUE ARCHITEKTUR:")
    print("  ✅ google-colab-ai — KEIN API-Key nötig")
    print("  ✅ Gemini Vision gratis über Google-Konto")
    print("  ✅ Colab MCP Server für Agent-Anbindung (seit März 2026)")

    existing_1 = read_url(URL_FILE_1)
    existing_2 = read_url(URL_FILE_2)

    if existing_1:
        print(f"\n📋 Existing Colab 1 URL: {existing_1[:60]}...")
    if existing_2:
        print(f"📋 Existing Colab 2 URL: {existing_2[:60]}...")

    print_step(
        1, "Open Colab Notebook 1 (Account: zukunftsorientierte.energie@gmail.com)"
    )
    print("1. Open Chrome with Default profile")
    print("2. Go to: https://colab.research.google.com")
    print("3. Login with: zukunftsorientierte.energie@gmail.com")
    print(
        "4. Upload notebook: ~/.open-auth-rotator/tools/vision-colab/colab_vision_hub_v2.ipynb"
    )
    print("5. Runtime → Change runtime type → T4 GPU → Save")
    print("6. Run all cells — uses google-colab-ai (NO API KEY NEEDED)")
    print("7. Copy the Cloudflare URL from output")
    print("8. Save URL to ~/.config/opencode/vision-colab-1.url")

    print_step(2, "Open Colab Notebook 2 (Account: jeremyschulze93@gmail.com)")
    print("1. Open Chrome with jeremyschulze93@gmail.com profile")
    print("2. Go to: https://colab.research.google.com")
    print("3. Login with: jeremyschulze93@gmail.com")
    print("4. Upload same notebook")
    print("5. Runtime → Change runtime type → T4 GPU → Save")
    print("6. Run all cells")
    print("7. Copy the Cloudflare URL from output")
    print("8. Save URL to ~/.config/opencode/vision-colab-2.url")

    print_step(3, "Enter Colab URLs")
    url1 = (
        input(f"Colab 1 URL (Account 1) [{existing_1 or 'enter URL'}]: ").strip()
        or existing_1
    )
    url2 = (
        input(f"Colab 2 URL (Account 2) [{existing_2 or 'enter URL'}]: ").strip()
        or existing_2
    )

    if not url1 and not url2:
        print("\n❌ No URLs provided. Setup incomplete.")
        return

    save_urls(url1, url2)

    print_step(4, "Verify Setup")
    config = json.loads(CONFIG_FILE.read_text()) if CONFIG_FILE.exists() else {}

    print(
        f"Colab 1: {'✅' if config.get('url1') else '❌'} {config.get('url1', 'not set')[:60]}"
    )
    print(
        f"Colab 2: {'✅' if config.get('url2') else '❌'} {config.get('url2', 'not set')[:60]}"
    )
    print(
        f"Model: {'✅' if config.get('model') else '❌'} {config.get('model', 'not set')}"
    )

    if config.get("url1") or config.get("url2"):
        print("\n✅ Vision-Colab v2 setup complete!")
        print("\nTest with:")
        print(f"  look-screen --screenshot /tmp/test.png --describe")
        print(f"  look-screen --rotator openrouter --interval 3")
    else:
        print("\n❌ Setup incomplete. No Colab URLs configured.")


if __name__ == "__main__":
    main()
