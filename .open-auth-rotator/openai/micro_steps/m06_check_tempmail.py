import asyncio, os, sys, json
import nodriver as uc
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "watcher-core" / ".env")

_HAS_DELETE = """(function(){
    var btns = Array.from(document.querySelectorAll('button, a'));
    return btns.some(b => (b.innerText||b.textContent||'').toLowerCase().includes('delete') && b.offsetParent !== null);
})()"""

_HAS_GENERATE = """(function(){
    var btns = Array.from(document.querySelectorAll('button, a'));
    return btns.some(b => (b.innerText||b.textContent||'').toLowerCase().includes('generate new') && b.offsetParent !== null);
})()"""

_GET_EMAIL = """(function(){
    var el = document.getElementById('mail');
    return el ? el.value : null;
})()"""

_DUMP_STATE = """(function(){
    var modal = document.getElementById('premiumModal');
    var loginBtn = document.getElementById('loginBtn');
    var premiumNavBtn = Array.from(document.querySelectorAll('a,button')).find(b =>
        (b.innerText||b.textContent||'').trim().toLowerCase()==='premium' && b.offsetParent!==null);
    var email = document.getElementById('mail') ? document.getElementById('mail').value : null;
    var visibleBtns = Array.from(document.querySelectorAll('button,a'))
        .filter(b => b.offsetParent!==null)
        .map(b => (b.id?'#'+b.id:'')+'['+(b.className||'').split(' ').slice(0,2).join('.')+']:'+(b.innerText||b.textContent||'').trim().substring(0,20))
        .slice(0,12);
    return JSON.stringify({
        url: window.location.href,
        email: email,
        modalExists: !!modal,
        modalShow: modal ? modal.classList.contains('show') : false,
        modalDisplay: modal ? window.getComputedStyle(modal).display : 'n/a',
        loginBtnExists: !!loginBtn,
        loginBtnVisible: loginBtn ? loginBtn.offsetParent!==null : false,
        premiumNavBtnExists: !!premiumNavBtn,
        visibleBtns: visibleBtns
    });
})()"""

_CLICK_PREMIUM_NAV = """(function(){
    // DEVTOOLS-VERIFIED selector: button.tm-btn.btn-outline-dark.goPremium.goPremiumBtn
    // NOTE: innerText contains SVG icon chars + "Premium" -> exact text match FAILS -> use class!
    var p = document.querySelector('button.goPremiumBtn, button.goPremium, a.goPremiumBtn, a.goPremium');
    if(p && p.offsetParent !== null){
        var info = p.tagName+'#'+(p.id||'')+'['+p.className+']';
        p.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        p.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        p.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
        p.click();
        return 'clicked_by_class:'+info;
    }
    var btns = Array.from(document.querySelectorAll('a,button'));
    var p2 = btns.find(b => (b.innerText||b.textContent||'').toLowerCase().includes('premium') && b.offsetParent!==null);
    if(p2){
        var info2 = p2.tagName+'#'+(p2.id||'')+'['+p2.className+']';
        p2.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        p2.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        p2.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
        p2.click();
        return 'clicked_text_fallback:'+info2;
    }
    var dump = btns.filter(b=>b.offsetParent!==null)
        .map(b=>'['+b.tagName+'#'+(b.id||'')+'.'+b.className.split(' ').slice(0,3).join('.')+']='+(b.innerText||'').trim().substring(0,15))
        .join(' | ');
    return 'NOT_FOUND. all_visible='+dump;
})()"""

_CLICK_LOGIN_BTN = """(function(){
    var btn = document.getElementById('loginBtn');
    if(btn){
        btn.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        btn.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
        btn.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
        btn.click();
        return 'clicked_loginBtn_id:visible='+String(btn.offsetParent!==null);
    }
    var modal = document.getElementById('premiumModal');
    if(modal){
        var lb = modal.querySelector('button.login,a.login');
        if(lb){ lb.click(); return 'clicked_modal_class_login'; }
    }
    var lb2 = Array.from(document.querySelectorAll('button,a')).find(b =>
        (b.innerText||b.textContent||'').trim().toLowerCase()==='login' && b.offsetParent!==null);
    if(lb2){ lb2.click(); return 'clicked_text_login:'+lb2.tagName+'#'+lb2.id; }
    return 'not_found';
})()"""

_MODAL_VISIBLE = """(function(){
    var m = document.getElementById('premiumModal');
    if(!m) return false;
    var s = window.getComputedStyle(m);
    return s.display!=='none' && m.classList.contains('show');
})()"""

_LOGIN_MODAL_VISIBLE = """(function(){
    var m = document.getElementById('loginModal');
    if(!m) return false;
    var s = window.getComputedStyle(m);
    return s.display!=='none' && m.classList.contains('show');
})()"""

_LOGIN_ERROR_VISIBLE = """(function(){
    var alerts = document.querySelectorAll('#loginModal .alert-danger, #loginExpiredErrorAlert');
    for(var i=0; i<alerts.length; i++){
        if(!alerts[i].classList.contains('hidden') && alerts[i].offsetParent !== null){
            return (alerts[i].innerText || alerts[i].textContent || 'error').trim();
        }
    }
    return '';
})()"""

_CLICK_OPEN_LOGIN_IN_PREMIUM = """(function(){
    var modal = document.getElementById('premiumModal');
    if(!modal) return 'no_premiumModal';
    var lb = modal.querySelector('button.login, a.login, [data-target="#loginModal"]');
    if(lb){ lb.click(); return 'clicked:'+lb.tagName+'#'+(lb.id||'')+'.'+(lb.className||''); }
    var btns = Array.from(modal.querySelectorAll('button, a'));
    var loginLink = btns.find(function(b){ return (b.innerText||b.textContent||'').trim().toLowerCase()==='login' && b.offsetParent!==null; });
    if(loginLink){ loginLink.click(); return 'clicked_text:'+loginLink.tagName+'#'+(loginLink.id||''); }
    var dump = btns.filter(function(b){return b.offsetParent!==null;}).map(function(b){return b.tagName+'#'+(b.id||'')+'='+(b.innerText||'').trim().substring(0,15);}).join('|');
    return 'not_found:'+dump;
})()"""


def _make_fill_login_js(email, password):
    """Build JS to fill #email and #password inputs inside #loginModal (form#loginForm)."""
    e = email.replace("\\", "\\\\").replace("'", "\\'")
    p = password.replace("\\", "\\\\").replace("'", "\\'")
    return (
        "(function(){"
        "var ei=document.getElementById('email');"
        "var pi=document.getElementById('password');"
        "if(!ei||!pi) return JSON.stringify({ok:false,error:'fields_missing',e:!!ei,p:!!pi});"
        "ei.focus(); ei.value='" + e + "';"
        "ei.dispatchEvent(new Event('input',{bubbles:true}));"
        "ei.dispatchEvent(new Event('change',{bubbles:true}));"
        "pi.focus(); pi.value='" + p + "';"
        "pi.dispatchEvent(new Event('input',{bubbles:true}));"
        "pi.dispatchEvent(new Event('change',{bubbles:true}));"
        "return JSON.stringify({ok:true,emailSet:ei.value,passLen:pi.value.length});"
        "})()"
    )


async def _is_logged_in(t):
    url = getattr(t, "url", getattr(t.target, "url", ""))
    if "login" in url or "sign-in" in url or "premium/login" in url:
        print(f"M06 _is_logged_in: FALSE (login URL detected: {url})")
        return False
    email = await t.evaluate(_GET_EMAIL)
    has_delete = await t.evaluate(_HAS_DELETE)
    has_generate = await t.evaluate(_HAS_GENERATE)
    print(
        f"M06 _is_logged_in CHECK: email='{email}' has_delete={has_delete} has_generate={has_generate} url={url[:60]}"
    )
    if email and "@" in str(email) and "Loading" not in str(email):
        print(f"M06 _is_logged_in: TRUE (valid email: {email})")
        return True
    print(
        f"M06 _is_logged_in: FALSE (email='{email}' is not valid - Loading or missing)"
    )
    return False


async def _do_premium_login(t):
    tm_email = os.getenv("TEMPMAIL_EMAIL", "")
    tm_pass = os.getenv("TEMPMAIL_PASSWORD", "")
    tm_pass_alt = os.getenv("TEMPMAIL_PASSWORD_ALT", "")
    if not tm_email or not tm_pass:
        print("M06 LOGIN FATAL: TEMPMAIL_EMAIL or TEMPMAIL_PASSWORD not set in .env!")
        return False
    print(f"M06 LOGIN: creds loaded (email={tm_email}, pass_len={len(tm_pass)})")

    print("M06 LOGIN: Navigiere zu temp-mail.org...")
    await t.get("https://temp-mail.org/en/")
    await asyncio.sleep(4)

    s = await t.evaluate(_DUMP_STATE)
    print(f"M06 LOGIN STATE_AFTER_RELOAD: {s}")

    if await _is_logged_in(t):
        print("M06 LOGIN: Bereits eingeloggt nach Reload.")
        return True

    login_modal_open = await t.evaluate(_LOGIN_MODAL_VISIBLE)
    print(f"M06 LOGIN: loginModal already open? {login_modal_open}")

    if not login_modal_open:
        print("M06 LOGIN STEP1: Klicke Premium-Nav-Button...")
        r = await t.evaluate(_CLICK_PREMIUM_NAV)
        print(f"M06 LOGIN PREMIUM_CLICK: {r}")
        if "NOT_FOUND" in str(r):
            await t.save_screenshot("/tmp/m06_no_premium_btn.png")
            return False

        print("M06 LOGIN STEP2: Warte auf premiumModal...")
        for i in range(12):
            await asyncio.sleep(0.5)
            modal_ok = await t.evaluate(_MODAL_VISIBLE)
            if modal_ok:
                print(f"M06 LOGIN: premiumModal visible after {(i + 1) * 0.5:.1f}s")
                break
        else:
            await t.save_screenshot("/tmp/m06_premium_modal_not_visible.png")
            print("M06 LOGIN WARN: premiumModal not visible after 6s")

        await asyncio.sleep(0.3)

        print("M06 LOGIN STEP3: Klicke Login-Link im premiumModal...")
        r2 = await t.evaluate(_CLICK_OPEN_LOGIN_IN_PREMIUM)
        print(f"M06 LOGIN OPEN_LOGIN_CLICK: {r2}")

        if "not_found" in str(r2) and "no_premiumModal" not in str(r2):
            r2b = await t.evaluate(_CLICK_LOGIN_BTN)
            print(f"M06 LOGIN FALLBACK_CLICK_LOGIN_BTN: {r2b}")

        print("M06 LOGIN STEP4: Warte auf loginModal...")
        for i in range(12):
            await asyncio.sleep(0.5)
            login_modal_open = await t.evaluate(_LOGIN_MODAL_VISIBLE)
            if login_modal_open:
                print(f"M06 LOGIN: loginModal visible after {(i + 1) * 0.5:.1f}s")
                break
        else:
            await t.save_screenshot("/tmp/m06_login_modal_not_visible.png")
            print(
                "M06 LOGIN WARN: loginModal not visible after 6s - try direct #loginBtn path"
            )
            r3 = await t.evaluate(_CLICK_LOGIN_BTN)
            print(f"M06 LOGIN DIRECT_LOGIN_BTN: {r3}")
            await asyncio.sleep(1)
            login_modal_open = await t.evaluate(_LOGIN_MODAL_VISIBLE)

    await t.save_screenshot("/tmp/m06_before_fill_creds.png")

    print("M06 LOGIN STEP5: Fülle Email + Password in loginModal...")
    fill_js = _make_fill_login_js(tm_email, tm_pass)
    fill_result = await t.evaluate(fill_js)
    print(f"M06 LOGIN FILL_RESULT: {fill_result}")

    try:
        fill_data = json.loads(fill_result) if fill_result else {}
    except Exception:
        fill_data = {}

    if not fill_data.get("ok"):
        print(f"M06 LOGIN FILL FAILED: {fill_result}")
        await t.save_screenshot("/tmp/m06_fill_failed.png")
        return False

    await asyncio.sleep(0.5)
    await t.save_screenshot("/tmp/m06_after_fill_creds.png")

    print("M06 LOGIN STEP6: Klicke Login-Submit-Button (#loginBtn)...")
    r4 = await t.evaluate(_CLICK_LOGIN_BTN)
    print(f"M06 LOGIN SUBMIT_CLICK: {r4}")

    await asyncio.sleep(3)
    await t.save_screenshot("/tmp/m06_after_login_submit.png")

    err = await t.evaluate(_LOGIN_ERROR_VISIBLE)
    if err:
        print(f"M06 LOGIN ERROR DETECTED: '{err}' - trying alt password...")
        if tm_pass_alt:
            fill_js_alt = _make_fill_login_js(tm_email, tm_pass_alt)
            fill_r2 = await t.evaluate(fill_js_alt)
            print(f"M06 LOGIN ALT_FILL: {fill_r2}")
            await asyncio.sleep(0.3)
            r5 = await t.evaluate(_CLICK_LOGIN_BTN)
            print(f"M06 LOGIN ALT_SUBMIT: {r5}")
            await asyncio.sleep(3)
            err2 = await t.evaluate(_LOGIN_ERROR_VISIBLE)
            if err2:
                print(f"M06 LOGIN ALT ALSO FAILED: '{err2}'")
                await t.save_screenshot("/tmp/m06_login_both_passwords_failed.png")
                return False

    for i in range(20):
        if await _is_logged_in(t):
            email = await t.evaluate(_GET_EMAIL)
            print(f"M06 LOGIN OK: Eingeloggt nach {i}s! Email={email}")
            await t.save_screenshot("/tmp/m06_login_success.png")
            return True
        await asyncio.sleep(1)
        if i % 5 == 4:
            s6 = await t.evaluate(_DUMP_STATE)
            print(f"M06 LOGIN WAIT t+{i + 1}s: {s6}")

    await t.save_screenshot("/tmp/m06_login_failed_final.png")
    print("M06 LOGIN FAIL: Nicht eingeloggt nach 20s.")
    return False


async def run():
    b = await uc.start(host="127.0.0.1", port=9334)
    t = None
    for _ in range(10):
        t = next(
            (
                tab
                for tab in b.tabs
                if "temp-mail.org" in getattr(tab, "url", getattr(tab.target, "url", ""))
                and "checksync" not in getattr(tab, "url", getattr(tab.target, "url", ""))
                and "criteo" not in getattr(tab, "url", getattr(tab.target, "url", ""))
            ),
            None,
        )
        if t:
            break
        await asyncio.sleep(0.5)
    if not t:
        print("M06 FAIL: Kein temp-mail.org Tab gefunden!")
        return False

    tab_url = getattr(t, "url", getattr(t.target, "url", ""))
    print(f"M06: Tab gefunden: {tab_url}")

    for i in range(6):
        if await _is_logged_in(t):
            email = await t.evaluate(_GET_EMAIL)
            print(f"M06 OK: Premium eingeloggt (Email={email}, nach {i}s).")
            return True
        await asyncio.sleep(1)

    print("M06: Nicht eingeloggt. Starte Premium Login Flow...")
    success = await _do_premium_login(t)
    if success:
        email = await t.evaluate(_GET_EMAIL)
        print(f"M06 OK: Premium Login erfolgreich! Email={email}")
        return True

    print(
        "M06 FAIL: Premium Login fehlgeschlagen. HARD STOP - kein Premium kein Rotator."
    )
    sys.exit(1)


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
