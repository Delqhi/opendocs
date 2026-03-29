import asyncio, sys, subprocess, os, time, signal


def run_sync():
    print("M27: Raeume Port 1455 leer...")
    os.system("lsof -ti tcp:1455 | xargs kill -9 2>/dev/null; sleep 1")
    os.system("lsof -ti tcp:1455 | xargs kill -9 2>/dev/null")
    time.sleep(0.5)

    print("M27: opencode auth login Prozess im Hintergrund starten...")
    os.system("rm -f /tmp/opencode_auth.log /tmp/oauth_url.txt")

    auth_path = os.path.expanduser("~/.local/share/opencode/auth.json")
    if os.path.exists(auth_path):
        os.utime(auth_path, (0, 0))

    env = os.environ.copy()
    env["BROWSER"] = "echo"

    subprocess.Popen(
        '/Users/jeremy/.opencode/bin/opencode auth login --provider openai --method "ChatGPT Pro/Plus (browser)" > /tmp/opencode_auth.log 2>&1',
        shell=True,
        start_new_session=True,
        env=env,
    )
    print("M27 OK: CLI läuft im Hintergrund. BROWSER=echo gesetzt!")
    return True


async def run():
    return run_sync()


if __name__ == "__main__":
    sys.exit(0 if run_sync() else 1)
