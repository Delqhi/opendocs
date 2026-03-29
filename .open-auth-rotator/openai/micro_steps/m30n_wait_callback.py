import asyncio, nodriver as uc, sys, urllib.request, json, os, time


def _all_tab_urls(port=9336):
    try:
        with urllib.request.urlopen(
            f"http://127.0.0.1:{port}/json/list", timeout=3
        ) as r:
            return [t.get("url", "") for t in json.load(r)]
    except Exception:
        return []


def _auth_json_has_fresh_token():
    path = os.path.expanduser("~/.local/share/opencode/auth.json")
    try:
        mtime = os.path.getmtime(path)
        if time.time() - mtime > 300:
            return False
        with open(path) as f:
            auth = json.load(f)
        return bool(auth.get("openai", {}).get("access"))
    except Exception:
        return False


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    for i in range(80):
        if _auth_json_has_fresh_token():
            print("M30n OK: auth.json hat frischen OpenAI Token!")
            return True

        all_urls = _all_tab_urls()
        if any("localhost:1455" in u for u in all_urls):
            print("M30n OK: Callback auf localhost:1455 erkannt!")
            await asyncio.sleep(2)
            return True

        for tab in b.tabs:
            curr = getattr(tab, "url", getattr(tab.target, "url", "")) or ""
            if "localhost:1455" in curr:
                print("M30n OK: Callback Tab erkannt!")
                await asyncio.sleep(2)
                return True

        await asyncio.sleep(0.5)

    print("M30n FAIL: Callback nicht erreicht nach 40s.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
