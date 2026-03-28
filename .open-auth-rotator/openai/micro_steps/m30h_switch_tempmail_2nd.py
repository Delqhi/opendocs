import asyncio, nodriver as uc, sys, os


async def run():
    otp_needed = "0"
    if os.path.exists("/tmp/m30_otp_needed.txt"):
        otp_needed = open("/tmp/m30_otp_needed.txt").read().strip()
    if otp_needed != "1":
        print("M30h SKIP: Kein 2. OTP noetig.")
        return True
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "temp-mail" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        print("M30h WARN: Kein Temp-Mail Tab. Oeffne neuen...")
        t = await b.get("https://temp-mail.org/en/", new_tab=True)
        await asyncio.sleep(2)
    else:
        await t.activate()
        await asyncio.sleep(0.5)
    print("M30h OK: Temp-Mail Tab aktiv.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
