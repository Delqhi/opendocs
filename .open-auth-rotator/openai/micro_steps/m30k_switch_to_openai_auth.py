import asyncio, nodriver as uc, sys, os


async def run():
    otp_needed = (
        open("/tmp/m30_otp_needed.txt").read().strip()
        if os.path.exists("/tmp/m30_otp_needed.txt")
        else "0"
    )
    if otp_needed != "1":
        print("M30k SKIP: Kein 2. OTP noetig.")
        return True
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "auth.openai" in getattr(tab, "url", getattr(tab.target, "url", ""))
            or "email-verification"
            in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        print("M30k FAIL: Kein auth.openai Tab.")
        return False
    await t.activate()
    await asyncio.sleep(0.5)
    print("M30k OK: Zurueck auf OpenAI Auth Tab.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
