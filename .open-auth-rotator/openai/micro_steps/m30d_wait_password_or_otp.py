import asyncio, nodriver as uc, sys, os


async def run():
    if os.path.exists("/tmp/m30_skip_login.txt"):
        print("M30d SKIP: Kein Re-Login noetig.")
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
        print("M30d FAIL: Kein auth.openai Tab.")
        return False
    for _ in range(40):
        found = await t.evaluate("""(function(){
            var pw = document.querySelector('input[type="password"]');
            var otp = document.querySelector('input[inputmode="numeric"], input[type="number"], input[autocomplete="one-time-code"], input[name="code"]');
            if(pw) return 'password';
            if(otp) return 'otp';
            return '';
        })()""")
        if found == "password":
            print("M30d OK: Password-Seite erkannt.")
            with open("/tmp/m30_login_mode.txt", "w") as f:
                f.write("password")
            return True
        if found == "otp":
            print("M30d OK: OTP-Seite erkannt (kein Passwort).")
            with open("/tmp/m30_login_mode.txt", "w") as f:
                f.write("otp")
            return True
        # Auch URL-basierte OTP-Erkennung (email-verification Seite)
        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "email-verification" in curr:
            print("M30d OK: OTP-Seite via URL erkannt (email-verification).")
            with open("/tmp/m30_login_mode.txt", "w") as f:
                f.write("otp")
            return True
        await asyncio.sleep(0.5)
    print("M30d FAIL: Weder Password noch OTP Seite nach 20s.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
