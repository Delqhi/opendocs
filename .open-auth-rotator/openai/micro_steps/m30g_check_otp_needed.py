import asyncio, nodriver as uc, sys, os


async def run():
    if os.path.exists("/tmp/m30_skip_login.txt"):
        print("M30g SKIP: Kein Re-Login noetig.")
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
        print("M30g FAIL: Kein auth.openai Tab.")
        return False
    for _ in range(40):
        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "localhost:1455" in curr:
            print("M30g OK: Direkt Callback! Kein OTP noetig.")
            with open("/tmp/m30_otp_needed.txt", "w") as f:
                f.write("0")
            return True
        has_otp = await t.evaluate(
            '!!document.querySelector(\'input[inputmode="numeric"], input[type="number"], input[autocomplete="one-time-code"], input[name="code"]\')'
        )
        if has_otp or "email-verification" in curr:
            print("M30g OK: OTP-Seite erkannt. 2. OTP noetig!")
            with open("/tmp/m30_otp_needed.txt", "w") as f:
                f.write("1")
            return True
        has_auth = await t.evaluate("""(function(){
            var b = document.querySelectorAll('button');
            return Array.from(b).some(x => /authorize|erlauben|allow/i.test(x.textContent));
        })()""")
        if has_auth:
            print("M30g OK: Authorize Seite. Kein OTP noetig.")
            with open("/tmp/m30_otp_needed.txt", "w") as f:
                f.write("0")
            return True
        await asyncio.sleep(0.5)
    print("M30g WARN: Timeout nach 20s. Versuche ohne OTP.")
    with open("/tmp/m30_otp_needed.txt", "w") as f:
        f.write("0")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
