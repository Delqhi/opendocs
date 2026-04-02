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
LOG_FILE = VISION_DIR / "observations.jsonl"


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
        self.is_monitoring = False

        self.menu = [
            rumps.MenuItem("🔴 Start Live Monitor", self.toggle_monitor),
            rumps.MenuItem("📸 Analyze Current Screen", self.analyze_screen),
            rumps.MenuItem("📋 Menu Bar Context", self.analyze_menu),
            None,
            rumps.MenuItem("🎥 Start Recording", self.start_record),
            rumps.MenuItem("⏹ Stop All", self.stop_all),
            None,
            rumps.MenuItem("📊 Status", self.show_status),
            rumps.MenuItem("📜 View Logs", self.view_logs),
            None,
            rumps.MenuItem("❌ Quit", self.quit_app),
        ]

    @rumps.timer(2)
    def update_icon(self, _):
        if STATE_FILE.exists() and STATE_FILE.read_text().strip() in (
            "monitoring",
            "recording",
        ):
            self.title = "🔴 REC"
        else:
            self.title = "⚫ look-screen"

    def toggle_monitor(self, sender):
        if self.is_monitoring or (
            STATE_FILE.exists() and STATE_FILE.read_text().strip() == "monitoring"
        ):
            self.stop_monitor(sender)
        else:
            self.start_monitor(sender)

    def start_monitor(self, _):
        notify(
            "look-screen", "Live Monitoring gestartet — Gemini analysiert jeden Frame"
        )
        self.is_monitoring = True
        subprocess.Popen(
            ["python3", str(LOOK_SCREEN), "--monitor", "--interval", "5"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    def stop_monitor(self, _):
        notify("look-screen", "Live Monitoring gestoppt")
        self.is_monitoring = False
        run_look_screen("--stop")

    def start_record(self, _):
        notify("look-screen", "Video-Aufzeichnung gestartet")
        run_look_screen("--record")

    def stop_all(self, _):
        notify("look-screen", "Alles gestoppt")
        self.is_monitoring = False
        run_look_screen("--stop")

    def analyze_screen(self, _):
        notify("look-screen", "Analysiere Bildschirm via Gemini...")
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
        status = run_look_screen("--status")
        notify("look-screen", status[:300] if status else "No status")

    def view_logs(self, _):
        if LOG_FILE.exists():
            subprocess.run(["open", "-a", "Console", str(LOG_FILE)])
        else:
            notify("look-screen", "No logs yet — start Live Monitor first")

    def quit_app(self, _):
        if self.is_monitoring:
            self.stop_monitor(None)
        run_look_screen("--stop")
        rumps.quit_application()


if __name__ == "__main__":
    LookScreenApp().run()
