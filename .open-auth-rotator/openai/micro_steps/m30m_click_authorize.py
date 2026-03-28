import asyncio, nodriver as uc, sys

_AUTH = """(function(){
    var btns = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]'));
    // Weite die Suche aus, inkl. 'weiter' (sehr wichtig fuer deutsche UI!)
    var b = btns.find(x => {
        var txt = (x.innerText || x.textContent || x.value || '').trim().toLowerCase();
        return /authorize|erlauben|allow|zulassen|continue|fortfahren|accept|akzeptieren|weiter/i.test(txt);
    });
    if(!b) {
        // Fallback: Primaerer Button (oft .btn-primary)
        b = document.querySelector('button[type="submit"]:not([name="cancel"]), .btn-primary, button[data-action="authorize"]');
    }
    if(b && !b.disabled) { 
        b.dispatchEvent(new MouseEvent('mousedown', {bubbles:true}));
        b.dispatchEvent(new MouseEvent('mouseup', {bubbles:true}));
        b.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
        b.click(); 
        return true; 
    }
    return false;
})()"""


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "authorize" in getattr(tab, "url", getattr(tab.target, "url", ""))
            or "consent" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        t = next(
            (
                tab
                for tab in b.tabs
                if "auth.openai" in getattr(tab, "url", getattr(tab.target, "url", ""))
            ),
            None,
        )
    if not t:
        t = next(
            (
                tab
                for tab in b.tabs
                if "openai" in getattr(tab, "url", getattr(tab.target, "url", ""))
            ),
            None,
        )
    if not t:
        print("M30m FAIL: Kein OpenAI Tab.")
        return False

    await t.bring_to_front()

    for _ in range(30):
        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "localhost:1455" in curr:
            print("M30m OK: Callback bereits erreicht!")
            return True
        if await t.evaluate(_AUTH):
            print("M30m OK: Authorize (oder Continue/Accept/Weiter) geklickt!")
            await asyncio.sleep(1.5)
        else:
            await asyncio.sleep(0.5)

    print("M30m WARN: Kein Authorize Button gefunden oder Klick hatte keinen Effekt.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
