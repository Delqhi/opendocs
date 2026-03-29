import asyncio, importlib, json, os, sys, signal, time
import nodriver as uc
import functools
import subprocess
import urllib.request

IS_DOCKER = os.environ.get("IS_DOCKER") == "1"
CHROME_PORT = 9222 if IS_DOCKER else 9336
ROTATOR_USER_DATA_DIR = "/tmp/chrome_sym_profile"
ROTATOR_PID_FILE = "/tmp/chrome_rotator.pid"


def _chrome_cdp_alive(port=CHROME_PORT):
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=2)
        return True
    except Exception:
        return False


def _list_cdp_targets(port=CHROME_PORT):
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=3) as r:
        return json.load(r)


def _has_page_target(port=CHROME_PORT):
    try:
        return any(t.get("type") == "page" for t in _list_cdp_targets(port))
    except Exception:
        return False


def _ensure_page_target(port=CHROME_PORT):
    if _has_page_target(port):
        return
    req = urllib.request.Request(
        f"http://127.0.0.1:{port}/json/new?about:blank", method="PUT"
    )
    with urllib.request.urlopen(req, timeout=5):
        pass
    for _ in range(10):
        if _has_page_target(port):
            return
        time.sleep(0.5)
    raise RuntimeError(f"Chrome on port {port} has no page target")


def _kill_port_occupant(port):
    try:
        result = subprocess.run(
            ["lsof", "-ti", f"TCP:{port}", "-sTCP:LISTEN"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        pids = [p for p in result.stdout.strip().split() if p.isdigit()]
        for pid in pids:
            print(f"Killing port {port} occupant PID {pid}")
            try:
                os.kill(int(pid), signal.SIGTERM)
            except ProcessLookupError:
                pass
        if pids:
            time.sleep(2)
            for pid in pids:
                try:
                    os.kill(int(pid), signal.SIGKILL)
                except ProcessLookupError:
                    pass
    except Exception as e:
        print(f"Warning: could not kill port {port} occupant: {e}")


def _ensure_chrome_running(port=CHROME_PORT):
    if _chrome_cdp_alive(port):
        print(f"Rotator Chrome already alive on port {port}, reusing...")
        _ensure_page_target(port)
        return

    _kill_port_occupant(port)
    time.sleep(0.5)

    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    proc = subprocess.Popen(
        [
            chrome,
            f"--remote-debugging-port={port}",
            f"--user-data-dir={ROTATOR_USER_DATA_DIR}",
            "--profile-directory=Default",
            "--no-first-run",
            "--no-default-browser-check",
            "--new-window",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        with open(ROTATOR_PID_FILE, "w") as f:
            f.write(str(proc.pid))
    except Exception:
        pass

    for _ in range(30):
        time.sleep(1)
        if _chrome_cdp_alive(port):
            _ensure_page_target(port)
            print(f"Rotator Chrome started (PID {proc.pid}, port {port})")
            # Extra stabilization — let WS stack settle before nodriver connects
            print("Waiting 4s for Chrome WebSocket stack to stabilize...")
            time.sleep(4)
            return
    raise RuntimeError(f"Chrome failed to start on port {port}")


async def _cleanup_rotator_chrome():
    print("Cleaning up rotator Chrome...")
    killed = False

    try:
        if os.path.exists(ROTATOR_PID_FILE):
            with open(ROTATOR_PID_FILE) as f:
                pid = int(f.read().strip())
            os.kill(pid, signal.SIGTERM)
            print(f"Sent SIGTERM to rotator Chrome PID {pid}")
            killed = True
            await asyncio.sleep(2)
            try:
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            os.remove(ROTATOR_PID_FILE)
    except (ProcessLookupError, FileNotFoundError, ValueError):
        pass
    except Exception as e:
        print(f"PID file cleanup warning: {e}")

    if not killed and not IS_DOCKER:
        _kill_port_occupant(CHROME_PORT)

    print("Rotator Chrome cleanup done")


_orig_start = uc.start
_browser_singleton = None


@functools.wraps(_orig_start)
async def _patched_start(*args, **kwargs):
    global _browser_singleton
    if _browser_singleton is not None:
        return _browser_singleton

    kwargs["host"] = "127.0.0.1"
    kwargs["port"] = CHROME_PORT
    if IS_DOCKER:
        kwargs["sandbox"] = False
        kwargs["browser_executable_path"] = "/usr/bin/google-chrome"
        if "browser_args" not in kwargs:
            kwargs["browser_args"] = []
        for flag in [
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ]:
            if flag not in kwargs["browser_args"]:
                kwargs["browser_args"].append(flag)
    else:
        _ensure_chrome_running(CHROME_PORT)

    _browser_singleton = await _orig_start(*args, **kwargs)
    return _browser_singleton


def _reset_browser_singleton():
    global _browser_singleton
    _browser_singleton = None


uc.start = _patched_start


STEPS = [
    "m00_clear_openai_cookies",
    "m01_goto_openai_login",
    "m02_check_openai_login",
    "m03_click_register",
    "m04_check_register_page",
    "m05_goto_tempmail",
    "m06_check_tempmail",
    "m07_click_tempmail_delete",
    "m08_check_delete_confirm",
    "m09_click_delete_yes",
    "m10_click_generate_new",
    "m11_wait_and_get_email",
    "m12_switch_to_openai",
    "m13_type_email",
    "m14_click_continue",
    "m15_wait_for_password",
    "m16_type_password",
    "m17_click_continue",
    "m17b_wait_for_verification_page",
    "m18_switch_to_tempmail",
    "m19_wait_for_otp_email",
    "m20_extract_otp",
    "m21_switch_to_openai_again",
    "m22_type_otp",
    "m23_wait_for_about_you",
    "m24_type_name",
    "m25_click_bday_link",
    "m26_type_bday",
    "m27_start_opencode_auth",
    "m28_submit_about_you",
    "m29_handle_consent",
    "m30a_open_oauth_url",
    "m30b_type_email_relogin",
    "m30c_click_continue_relogin",
    "m30d_wait_password_or_otp",
    "m30e_type_password_relogin",
    "m30f_click_continue_password",
    "m30g_check_otp_needed",
    "m30h_switch_tempmail_2nd",
    "m30i_wait_2nd_otp_email",
    "m30j_extract_2nd_otp",
    "m30k_switch_to_openai_auth",
    "m30l_type_2nd_otp",
    "m30m_click_authorize",
    "m30n_wait_callback",
]

if os.environ.get("IS_DOCKER"):
    sys.path.insert(0, "/app")
    sys.path.insert(0, "/app/micro_steps")
else:
    sys.path.insert(0, "/Users/jeremy/.open-auth-rotator/openai")
    sys.path.insert(0, "/Users/jeremy/.open-auth-rotator/openai/micro_steps")


async def take_error_screenshots(step_name):
    print(f"Nehme Error-Screenshots fuer {step_name} auf...")
    try:
        b = await uc.start(host="127.0.0.1", port=CHROME_PORT)
        for i, t in enumerate(b.tabs):
            path = f"/tmp/fail_{step_name}_tab_{i}.png"
            await t.bring_to_front()
            await asyncio.sleep(0.5)
            await t.save_screenshot(path)
            url = getattr(t, "url", getattr(t.target, "url", ""))
            print(f"Screenshot gespeichert: {path} (URL: {url})")
    except Exception as e:
        print(f"Konnte Screenshot nicht erstellen: {e}")


async def run_all():
    print("=== FAST MICRO-STEP ROTATOR ===")
    os.system("rm -f /tmp/fail_*.png")
    _reset_browser_singleton()
    if not IS_DOCKER:
        _ensure_chrome_running(CHROME_PORT)
    for module_name in STEPS:
        print(f"-> EXECUTING: {module_name}")
        mod = importlib.import_module(module_name)
        success = await mod.run()
        if not success:
            print(f"!!! FEHLER BEI {module_name} !!!")
            await take_error_screenshots(module_name)
            sys.exit(1)
        await asyncio.sleep(0.05)

    try:
        from push_to_pool import run_push

        run_push()
    except Exception as e:
        print(f"WARN: push_to_pool failed or not found: {e}")

    await _cleanup_rotator_chrome()
    print("=== PIPELINE ERFOLGREICH BEENDET ===")


if __name__ == "__main__":
    asyncio.run(run_all())
