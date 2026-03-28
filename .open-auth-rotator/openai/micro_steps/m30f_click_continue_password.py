import asyncio, nodriver as uc, sys, os


async def run():
    if os.path.exists("/tmp/m30_skip_login.txt"):
        print("M30f SKIP: Kein Re-Login noetig.")
        return True
    mode = (
        open("/tmp/m30_login_mode.txt").read().strip()
        if os.path.exists("/tmp/m30_login_mode.txt")
        else ""
    )
    if mode == "otp":
        print("M30f SKIP: OTP-Modus, kein Passwort-Submit.")
        return True
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab for tab in b.tabs
            if any(x in getattr(tab, "url", getattr(tab.target, "url", "")) for x in ["auth.openai", "email-verification", "log-in", "chatgpt.com/auth"])
        ),
        None,
    )
    if not t:
        print("M30f FAIL: Kein auth.openai Tab.")
        return False
    print("M30f: Kurze Anti-Bot Gedenksekunde...")
    await asyncio.sleep(1.0)
    await t.evaluate("""(function(){
        var btn = document.querySelector('button[type="submit"]');
        if(btn) btn.click();
    })()""")
    print("M30f OK: Weiter nach Passwort geklickt.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
