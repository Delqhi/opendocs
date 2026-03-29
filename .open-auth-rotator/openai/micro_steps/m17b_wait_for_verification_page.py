import asyncio, nodriver as uc, sys, urllib.request, json


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
            if any(
                x in getattr(tab, "url", getattr(tab.target, "url", ""))
                for x in [
                    "create-account",
                    "email-verification",
                    "auth.openai",
                    "chatgpt.com/auth",
                ]
            )
        ),
        None,
    )
    if not t:
        return False

    print("M17b: Warte auf erfolgreiches Submit (Wechsel zu /email-verification)...")
    for i in range(40):
        all_urls = _all_tab_urls()
        if any("email-verification" in u for u in all_urls):
            print("M17b OK: OpenAI hat das Passwort akzeptiert und die Mail gesendet!")
            return True

        curr = getattr(t, "url", getattr(t.target, "url", "")) or ""
        if "email-verification" in curr:
            print("M17b OK: OpenAI hat das Passwort akzeptiert und die Mail gesendet!")
            return True

        html = await t.evaluate("document.body.innerHTML")
        if (
            "arkose" in html.lower()
            or "puzzle" in html.lower()
            or "prove you are human" in html.lower()
        ):
            print("M17b FAIL: CAPTCHA / PUZZLE aufgetaucht!")
            return False

        await asyncio.sleep(0.5)

    print(
        "M17b FAIL: Timeout. Seite haengt fest (weder Captcha noch Verification-Screen)."
    )
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
