#!/usr/bin/env python3
import subprocess
import os
import time
import json
from pathlib import Path

try:
    import rumps
except ImportError:
    subprocess.run(["pip3", "install", "--break-system-packages", "rumps"], check=True)
    import rumps

LOOK_SCREEN = Path.home() / ".open-auth-rotator" / "tools" / "look_screen.py"
STATE_FILE = Path("/tmp/look-screen-menubar-state")
VISION_DIR = Path("/tmp/look-screen")


def run_look_screen(*args):
    try:
        result = subprocess.run(
            ["python3", str(LOOK_SCREEN)] + list(args),
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"


def notify(title, message):
    subprocess.run(
        [
            "osascript",
            "-e",
            f'display notification "{message}" with title "{title}" sound name "Glass"',
        ]
    )


class LookScreenApp(rumps.App):
    def __init__(self):
        super().__init__("⚫ look-screen", quit_button=None)
        self.is_recording = False

        self.menu = [
            rumps.MenuItem("🔴 Start Recording", self.toggle_record),
            rumps.MenuItem("📸 Analyze Current Screen", self.analyze_screen),
            rumps.MenuItem("📋 Menu Bar Context", self.analyze_menu),
            None,
            rumps.MenuItem("📊 Status", self.show_status),
            rumps.MenuItem("📜 View Logs", self.view_logs),
            rumps.MenuItem("⏹ Stop Recording", self.stop_record),
            None,
            rumps.MenuItem("❌ Quit", self.quit_app),
        ]

    @rumps.timer(2)
    def update_icon(self, _):
        if self.is_recording:
            self.title = "🔴 REC"
        else:
            self.title = "⚫ look-screen"

    def toggle_record(self, sender):
        if self.is_recording:
            self.stop_record(sender)
        else:
            self.start_record(sender)

    def start_record(self, _):
        notify("look-screen", "Bildschirmaufzeichnung gestartet")
        self.is_recording = True
        STATE_FILE.write_text("recording")
        run_look_screen("--record")

    def stop_record(self, _):
        notify("look-screen", "Bildschirmaufzeichnung gestoppt")
        self.is_recording = False
        STATE_FILE.write_text("stopped")
        run_look_screen("--stop")

    def analyze_screen(self, _):
        notify("look-screen", "Analysiere Bildschirm...")
        VISION_DIR.mkdir(parents=True, exist_ok=True)
        screenshot = VISION_DIR / f"analyze_{int(time.time())}.png"
        subprocess.run(["screencapture", "-x", str(screenshot)])
        result = run_look_screen(
            "--once",
            "--screenshot",
            str(screenshot),
            "--prompt",
            "What is on this screen? What app is active? What UI elements are visible? Any errors? What action should be taken?",
        )
        notify("look-screen", result[:200] if result else "No result")

    def analyze_menu(self, _):
        notify("look-screen", "Analysiere Menu Bar Kontext...")
        VISION_DIR.mkdir(parents=True, exist_ok=True)
        screenshot = VISION_DIR / f"menubar_{int(time.time())}.png"
        subprocess.run(["screencapture", "-x", str(screenshot)])
        result = run_look_screen(
            "--once",
            "--screenshot",
            str(screenshot),
            "--prompt",
            "What app is active (check menu bar left)? What is the battery status and internet connection (check menu bar right)? Describe the full menu bar context.",
        )
        notify("look-screen", result[:200] if result else "No result")

    def show_status(self, _):
        urls = []
        for i in [1, 2]:
            f = Path.home() / ".config" / "opencode" / f"vision-colab-{i}.url"
            if f.exists():
                urls.append(f.read_text().strip())

        status = f"Recording: {'YES' if self.is_recording else 'NO'}\n"
        status += f"Colab URLs: {len(urls)}/2 configured\n"
        if urls:
            status += f"  1: {urls[0][:50]}..."
            if len(urls) > 1:
                status += f"\n  2: {urls[1][:50]}..."

        notify("look-screen", status)

    def view_logs(self, _):
        log_file = VISION_DIR / "observations.jsonl"
        if log_file.exists():
            subprocess.run(["open", "-a", "Console", str(log_file)])
        else:
            notify("look-screen", "No logs yet")

    def quit_app(self, _):
        if self.is_recording:
            self.stop_record(None)
        rumps.quit_application()


if __name__ == "__main__":
    LookScreenApp().run()
