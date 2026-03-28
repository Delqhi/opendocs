import asyncio, nodriver as uc, sys, os

_FLAGS = [
    "/tmp/m30_skip_login.txt",
    "/tmp/m30_login_mode.txt",
    "/tmp/m30_otp_needed.txt",
    "/tmp/current_otp2.txt",
    "/tmp/current_email.txt",
    "/tmp/current_otp.txt",
    "/tmp/current_password.txt",
    "/tmp/oauth_url.txt",
    "/tmp/m08_popup_seen.txt",
]

_STALE_DOMAINS = [
    "openai.com",
    "chatgpt.com",
    "temp-mail.org",
    "auth0.com",
    "localhost:1455",
]

async def run():
    for f in _FLAGS:
        if os.path.exists(f):
            try: os.remove(f)
            except: pass
    b = await uc.start(host="127.0.0.1", port=9334)

    # Cleanly close all stale tabs
    tabs_to_close = []
    for tab in b.tabs:
        url = getattr(tab, "url", getattr(tab.target, "url", ""))
        if any(d in url for d in _STALE_DOMAINS):
            tabs_to_close.append(tab)

    if tabs_to_close and len(b.tabs) == len(tabs_to_close):
        # Open a blank tab before closing everything so the browser doesn't quit
        await b.get("about:blank", new_tab=True)

    for tab in tabs_to_close:
        try:
            await tab.close()
        except Exception as e:
            print(f"M00 WARN: Konnte Tab nicht schliessen: {e}")

    try:
        cookies = await b.connection.send(uc.cdp.network.get_cookies())
        for c in cookies:
            if "openai.com" in c.domain or "chatgpt.com" in c.domain:
                await b.connection.send(
                    uc.cdp.network.delete_cookies(
                        name=c.name, domain=c.domain, path=c.path
                    )
                )
    except Exception as e:
        print(f"M00 WARN: Konnte Cookies nicht loeschen: {e}")
        
    print("M00 OK: Alte Tabs + OpenAI Cookies + Flags geloescht.")
    return True

if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
