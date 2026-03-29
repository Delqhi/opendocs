import asyncio, nodriver as uc, sys, urllib.request, json

_AUTH = """(function(){
    var btns = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]'));
    var b = btns.find(x => {
        var txt = (x.innerText || x.textContent || x.value || '').trim().toLowerCase();
        return /authorize|erlauben|allow|zulassen|continue|fortfahren|accept|akzeptieren|weiter/i.test(txt);
    });
    if(!b) {
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


def _all_tab_urls(port=9336):
    try:
        with urllib.request.urlopen(
            f"http://127.0.0.1:{port}/json/list", timeout=3
        ) as r:
            return [t.get("url", "") for t in json.load(r)]
    except Exception:
        return []


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

    for i in range(60):
        # Prüfe alle CDP-Targets direkt — fängt auch neue Tabs/Redirects
        all_urls = _all_tab_urls()
        if any("localhost:1455" in u for u in all_urls):
            print("M30m OK: Callback auf localhost:1455 erkannt!")
            return True

        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "localhost:1455" in curr:
            print("M30m OK: Callback bereits erreicht!")
            return True

        try:
            clicked = await t.evaluate(_AUTH)
            if clicked:
                print(f"M30m OK: Authorize-Button geklickt (Versuch {i})")
                await asyncio.sleep(2)
                continue
        except Exception:
            pass

        await asyncio.sleep(0.5)

    print("M30m WARN: Kein Authorize Button, aber Auto-Redirect erwartet.")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
