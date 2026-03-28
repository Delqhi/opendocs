import asyncio, nodriver as uc, sys, os
import nodriver.cdp.input_ as input_cdp


async def run():
    if os.path.exists("/tmp/m30_skip_login.txt"):
        print("M30b SKIP: Kein Re-Login noetig.")
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
        print("M30b FAIL: Kein log-in Tab.")
        return False
    with open("/tmp/current_email.txt", "r") as f:
        email = f.read().strip()
    await t.evaluate("""(function(){
        var inp = document.querySelector('input[type="email"], input[name="email"]');
        if(inp) { inp.value=''; inp.focus(); }
    })()""")
    await asyncio.sleep(0.3)
    for char in email:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.04)
    print(f"M30b OK: Email '{email}' getippt.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
