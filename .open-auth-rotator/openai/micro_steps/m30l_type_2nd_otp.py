import asyncio, nodriver as uc, sys, os
import nodriver.cdp.input_ as input_cdp


async def run():
    otp_needed = (
        open("/tmp/m30_otp_needed.txt").read().strip()
        if os.path.exists("/tmp/m30_otp_needed.txt")
        else "0"
    )
    if otp_needed != "1":
        print("M30l SKIP: Kein 2. OTP noetig.")
        return True

    b = await uc.start(host="127.0.0.1", port=9334)

    # Prefer the verification tab, fall back to any auth.openai tab
    t = next(
        (
            tab for tab in b.tabs
            if any(x in getattr(tab, "url", getattr(tab.target, "url", "")) for x in ["auth.openai", "email-verification", "log-in", "chatgpt.com/auth"])
        ),
        None,
    )
    if not t:
        print("M30l FAIL: Kein passender OpenAI Tab.")
        return False

    await t.bring_to_front()

    with open("/tmp/current_otp2.txt", "r") as f:
        otp = f.read().strip()

    # ── Wait up to 15s for the OTP input field to exist and be visible ──
    print("M30l: Warte auf OTP-Input-Feld (max 15s)...")
    found = False
    for _ in range(50):
        try:
            ready = await t.evaluate("""(function(){
                var inp = document.querySelector(
                    'input[inputmode="numeric"], input[type="number"], input[autocomplete="one-time-code"], input[name="code"]'
                );
                if (!inp) return false;
                var r = inp.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
            })()""")
            if ready is True:
                found = True
                break
        except Exception:
            pass
        await asyncio.sleep(0.3)

    if not found:
        # Fallback: any visible input
        print("M30l: Kein spezifisches OTP-Feld, versuche generisches input...")
        for _ in range(20):
            try:
                ready = await t.evaluate("""(function(){
                    var inp = document.querySelector('input:not([type="hidden"])');
                    if (!inp) return false;
                    var r = inp.getBoundingClientRect();
                    return r.width > 0 && r.height > 0;
                })()""")
                if ready is True:
                    found = True
                    break
            except Exception:
                pass
            await asyncio.sleep(0.3)

    if not found:
        print("M30l FAIL: OTP-Input-Feld erschien nicht innerhalb von 15s.")
        return False

    # ── Clear, focus, and type the OTP ──
    await t.evaluate("""(function(){
        var inp = document.querySelector(
            'input[inputmode="numeric"], input[type="number"], input[autocomplete="one-time-code"], input[name="code"]'
        ) || document.querySelector('input:not([type="hidden"])');
        if (inp) {
            inp.value = '';
            inp.focus();
            inp.dispatchEvent(new Event('input', {bubbles: true}));
        }
    })()""")
    await asyncio.sleep(0.3)

    for char in otp:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.12)

    print(f"M30l OK: 2. OTP {otp} getippt.")
    await asyncio.sleep(0.8)

    # ── Robust React-compatible submit ──
    submitted = await t.evaluate("""(function(){
        var btn = document.querySelector('button[type="submit"]');
        if (btn && !btn.disabled) {
            btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
            btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            btn.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
            btn.click();
            return 'button';
        }
        var inp = document.querySelector(
            'input[inputmode="numeric"], input[type="number"], input[autocomplete="one-time-code"], input[name="code"]'
        ) || document.querySelector('input:not([type="hidden"])');
        if (inp && inp.form) {
            inp.form.submit();
            return 'form';
        }
        return 'none';
    })()""")
    print(f"M30l OK: Weiter geklickt ({submitted}).")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
