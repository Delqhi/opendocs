import asyncio, nodriver as uc, sys, os, re

F = "https://auth.openai.com/authorize?response_type=code&client_id=app_EMoamEEZ73f0CkXaXp7hrann&redirect_uri=http%3A%2F%2Flocalhost%3A1455%2Fauth%2Fcallback&scope=openid+profile+email+offline_access&codex_cli_simplified_flow=true"


async def extract_url_from_log():
    for _ in range(30):
        if os.path.exists("/tmp/opencode_auth.log"):
            with open("/tmp/opencode_auth.log", "r", errors="ignore") as f:
                content = f.read()
                m = re.search(r"(https://auth\.openai\.com[^\s\x1b]+)", content)
                if m:
                    return m.group(1)
        await asyncio.sleep(0.5)
    return F


async def run():
    print("M30a: Warte auf OAuth URL aus Hintergrund-Prozess...")
    url = await extract_url_from_log()
    print(f"M30a OK: URL gefunden: {url[:60]}...")

    b = await uc.start(host="127.0.0.1", port=9334)

    for t in b.tabs:
        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if (
            ("openai.com" in curr or "chatgpt.com" in curr) and not any(x in curr for x in ["auth.openai", "email-verification", "log-in", "chatgpt.com/auth"])
        ):
            try:
                await t.close()
            except:
                pass

    print("M30a: Oeffne OAuth URL in neuem Tab...")
    t = await b.get(url, new_tab=True)
    await asyncio.sleep(3)
    for _ in range(20):
        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "log-in" in curr:
            print("M30a OK: /log-in Seite erkannt. Re-Login noetig.")
            return True
        if "authorize" in curr:
            print("M30a OK: Direkt auf Authorize Seite (kein Re-Login).")
            with open("/tmp/m30_skip_login.txt", "w") as f:
                f.write("1")
            return True
        if "localhost:1455" in curr:
            print("M30a OK: Direkt Callback! Token gespeichert.")
            with open("/tmp/m30_skip_login.txt", "w") as f:
                f.write("1")
            return True
        await asyncio.sleep(0.5)
    print("M30a WARN: Unbekannter Zustand, versuche trotzdem Re-Login.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
