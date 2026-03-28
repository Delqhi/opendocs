import asyncio, nodriver as uc, sys, os

_GET_CODE_FROM_BODY = """(function(){
    var v = document.querySelector('.inbox-data-content') || document.body;
    var m = v.innerText.match(/([0-9]{6})/);
    return m ? m[1] : null;
})()"""

_CLICK_NEW_EMAIL_BY_CODE = """(function(old){
    var seen = {};
    var items = Array.from(document.querySelectorAll('a[href*="/view/"]'));
    items.forEach(function(el){
        var href = el.href;
        var txt = (el.innerText||el.textContent||'').trim();
        if(!seen[href]) seen[href] = [];
        if(txt) seen[href].push(txt);
    });
    for(var href in seen){
        var combined = seen[href].join(' ');
        var m = combined.match(/([0-9]{6})/);
        if(m && m[1] !== old){
            var el = document.querySelector('a[href="'+href+'"]');
            if(el && el.offsetParent !== null){
                el.click();
                return JSON.stringify({href:href, code:m[1], text:combined.substring(0,60)});
            }
        }
    }
    var allHrefs = Object.keys(seen).length;
    var allTxt = Object.values(seen).map(function(v){return v.join(' ').substring(0,30);}).join(' || ');
    return JSON.stringify({not_found:true, hrefs:allHrefs, texts:allTxt});
})"""


async def run():
    if (
        not os.path.exists("/tmp/m30_otp_needed.txt")
        or open("/tmp/m30_otp_needed.txt").read().strip() != "1"
    ):
        print("M30i SKIP")
        return True

    old = (
        open("/tmp/current_otp.txt").read().strip()
        if os.path.exists("/tmp/current_otp.txt")
        else ""
    )
    print(f"M30i: 1. OTP={old}. Suche NEUE Email mit anderem Code...")

    b = await uc.start(host="127.0.0.1", port=9334)
    t = next(
        (tab for tab in b.tabs if "temp-mail" in getattr(tab, "url", getattr(tab.target, "url", ""))),
        None,
    )
    if not t:
        print("M30i FAIL: Kein Temp-Mail Tab.")
        return False

    # DevTools-verified: reload inbox first
    await t.get("https://temp-mail.org/en/")
    await asyncio.sleep(3)

    for i in range(60):
        # Click the email that contains a NEW 6-digit code (different from old OTP)
        js_call = _CLICK_NEW_EMAIL_BY_CODE + f'("{old}")'
        r = await t.evaluate(js_call)
        print(f"M30i t+{i}s CLICK_NEW_EMAIL: {r}")

        try:
            import json
            data = json.loads(r)
        except Exception:
            data = {}

        if data.get("not_found"):
            # No new email yet — reload and wait
            await t.get("https://temp-mail.org/en/")
            await asyncio.sleep(2)
            continue

        # Found new email - extract code from body
        await asyncio.sleep(1.5)
        code = await t.evaluate(_GET_CODE_FROM_BODY)
        if not code:
            code = data.get("code")

        if code and code != old:
            open("/tmp/current_otp2.txt", "w").write(code)
            print(f"M30i OK: 2. OTP={code} nach {i}s")
            return True

        print(f"M30i: Body-Code={code} gleich alt oder leer. Inbox neu laden...")
        await t.get("https://temp-mail.org/en/")
        await asyncio.sleep(2)

    print("M30i FAIL: Timeout auf 2. OTP Email.")
    return False


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
