import asyncio, nodriver as uc, sys

_CHECK = """(function(){
    try {
        var txt = document.body.innerText.toLowerCase();
        var links = Array.from(document.querySelectorAll('a, button'));
        var reg = links.some(l => (l.innerText||'').toLowerCase().includes('registrieren') || (l.innerText||'').toLowerCase().includes('sign up') || (l.innerText||'').toLowerCase().includes('log in') || (l.innerText||'').toLowerCase().includes('anmelden'));
        if (reg || txt.includes('anmelden') || txt.includes('log in') || txt.includes('sign in') || txt.includes('welcome back')) return true;
        if (window.location.href.includes('login') || window.location.href.includes('auth')) return true;
        return false;
    } catch(e) { return false; }
})()"""


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (
            tab
            for tab in b.tabs
            if "auth.openai" in getattr(tab, "url", getattr(tab.target, "url", ""))
            or "chatgpt.com" in getattr(tab, "url", getattr(tab.target, "url", ""))
        ),
        None,
    )
    if not t:
        if b.tabs:
            t = b.tabs[0]
        else:
            return False

    await t.bring_to_front()
    for i in range(60):
        try:
            if await t.evaluate(_CHECK):
                print(f"M02 OK: Geladen nach {i * 0.5}s.")
                return True
        except Exception:
            pass
        await asyncio.sleep(0.5)
    print("M02 FAIL: Timeout auf OpenAI Landingpage.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
