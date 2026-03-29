import asyncio, nodriver as uc, sys
import nodriver.cdp.input_ as input_cdp


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if any(
                x in getattr(tab, "url", getattr(tab.target, "url", ""))
                for x in ["create-account", "auth.openai", "chatgpt.com/auth"]
            )
        ),
        None,
    )
    if not t:
        return False

    with open("/tmp/current_email.txt", "r") as f:
        email = f.read().strip()

    await t.evaluate("""(function(){
        var inp = document.querySelector('input[type="email"], input[name="email"]');
        if(!inp) return;
        inp.focus();
        inp.select();
    })()""")
    await asyncio.sleep(0.2)

    # Ctrl+A dann Delete — leert das Feld vollständig bevor wir tippen
    await t.send(input_cdp.dispatch_key_event(type_="keyDown", key="a", modifiers=2))
    await t.send(input_cdp.dispatch_key_event(type_="keyUp", key="a", modifiers=2))
    await asyncio.sleep(0.05)
    await t.send(
        input_cdp.dispatch_key_event(
            type_="keyDown", key="Delete", windows_virtual_key_code=46
        )
    )
    await t.send(
        input_cdp.dispatch_key_event(
            type_="keyUp", key="Delete", windows_virtual_key_code=46
        )
    )
    await asyncio.sleep(0.1)

    for char in email:
        await t.send(input_cdp.dispatch_key_event(type_="char", text=char))
        await asyncio.sleep(0.05)

    print(f"M13 OK: Email '{email}' getippt.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
