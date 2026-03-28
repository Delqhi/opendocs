import asyncio, sys, os


async def run():
    if (
        not os.path.exists("/tmp/m30_otp_needed.txt")
        or open("/tmp/m30_otp_needed.txt").read().strip() != "1"
    ):
        print("M30j SKIP")
        return True
    if not os.path.exists("/tmp/current_otp2.txt"):
        print("M30j FAIL: /tmp/current_otp2.txt fehlt.")
        return False
    otp2 = open("/tmp/current_otp2.txt").read().strip()
    old = (
        open("/tmp/current_otp.txt").read().strip()
        if os.path.exists("/tmp/current_otp.txt")
        else ""
    )
    if otp2 == old:
        print(f"M30j FAIL: 2. OTP ({otp2}) == 1. OTP! Stale Code.")
        return False
    if len(otp2) != 6 or not otp2.isdigit():
        print(f"M30j FAIL: Ungueltiger Code: {otp2}")
        return False
    print(f"M30j OK: 2. OTP={otp2} (verschieden von 1. OTP={old})")
    return True


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(run()) else 1)
