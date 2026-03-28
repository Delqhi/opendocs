import asyncio, sys, subprocess, os

def run_sync():
    print("M27: Raeume Port 1455 leer...")
    os.system("lsof -ti tcp:1455|xargs kill -9 2>/dev/null")

    print("M27: opencode auth login Prozess im Hintergrund starten...")
    os.system("rm -f /tmp/opencode_auth.log /tmp/oauth_url.txt")

    # Fire and forget im Hintergrund, ABER BROWSER=echo setzen, damit es nicht in macOS aufpoppt!
    env = os.environ.copy()
    env["BROWSER"] = "echo"

    subprocess.Popen(
        '/Users/jeremy/.opencode/bin/opencode auth login --provider openai --method "ChatGPT Pro/Plus (browser)" > /tmp/opencode_auth.log 2>&1',
        shell=True,
        env=env,
        start_new_session=True,
    )
    print("M27 OK: CLI läuft im Hintergrund. BROWSER=echo gesetzt!")
    return True

async def run():
    return run_sync()

if __name__ == "__main__":
    sys.exit(0 if run_sync() else 1)
