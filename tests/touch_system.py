"""Playwright touch tests for solar-system pinch, pan, and double-tap."""
import http.server, socketserver, threading, socket, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)

def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', port), H)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, port

def fire(page, typ, pid, x, y, primary=None):
    page.evaluate(
        """([typ, pid, x, y, primary]) => {
          const c = document.getElementById('view');
          c.dispatchEvent(new PointerEvent(typ, {
            pointerId: pid, pointerType: 'touch', isPrimary: primary == null ? pid === 11 : !!primary,
            clientX: x, clientY: y, bubbles: true, cancelable: true
          }));
        }""",
        [typ, pid, x, y, primary],
    )

def cam(page):
    return page.evaluate("""() => { const c = TERRA.debug.cam; return {x:c.x,y:c.y,z:c.z, mode: TERRA.debug.mode}; }""")

def main():
    httpd, port = serve()
    url = f'http://127.0.0.1:{port}/?local=1'
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--use-gl=swiftshader'])
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=2,
        )
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url, wait_until='domcontentloaded', timeout=20000)
        page.wait_for_function('() => window.TERRA && TERRA.debug', timeout=10000)
        # prevent page zoom already in meta
        ta = page.evaluate("() => getComputedStyle(document.getElementById('view')).touchAction")
        if ta != 'none':
            errors.append(f'touch-action is {ta!r}, expected none')
        page.click('#btn-visit')
        page.wait_for_timeout(400)
        page.evaluate('() => TERRA.debug.show("system")')
        page.wait_for_timeout(200)
        before = cam(page)
        # pinch out around center
        cx, cy = 195, 400
        fire(page, 'pointerdown', 11, cx - 40, cy - 20)
        fire(page, 'pointerdown', 12, cx + 40, cy + 20)
        fire(page, 'pointermove', 11, cx - 90, cy - 50)
        fire(page, 'pointermove', 12, cx + 90, cy + 50)
        mid = cam(page)
        fire(page, 'pointerup', 11, cx - 90, cy - 50)
        fire(page, 'pointerup', 12, cx + 90, cy + 50)
        page.wait_for_timeout(100)
        after_pinch = cam(page)
        if after_pinch['mode'] != 'system':
            errors.append(f'pinch opened mode {after_pinch["mode"]}')
        if after_pinch['z'] <= before['z'] * 1.15:
            errors.append(f'pinch did not zoom: {before["z"]} -> {after_pinch["z"]}')
        # a leftover tap must not open a card immediately after pinch
        fire(page, 'pointerdown', 13, cx, cy)
        fire(page, 'pointerup', 13, cx, cy)
        page.wait_for_timeout(400)
        if cam(page)['mode'] != 'system':
            errors.append(f'post-pinch tap changed mode to {cam(page)["mode"]}')
        # pan
        z0 = cam(page)['z']
        x0, y0 = cam(page)['x'], cam(page)['y']
        fire(page, 'pointerdown', 21, 200, 420)
        fire(page, 'pointermove', 21, 120, 360)
        fire(page, 'pointermove', 21, 80, 330)
        fire(page, 'pointerup', 21, 80, 330)
        page.wait_for_timeout(80)
        pan = cam(page)
        if pan['mode'] != 'system':
            errors.append(f'pan opened mode {pan["mode"]}')
        if abs(pan['x'] - x0) < 0.5 and abs(pan['y'] - y0) < 0.5:
            errors.append(f'pan did not move camera {x0},{y0} -> {pan["x"]},{pan["y"]}')
        if abs(pan['z'] - z0) > 0.05:
            errors.append(f'pan changed zoom {z0} -> {pan["z"]}')
        # double-tap zoom
        z1 = cam(page)['z']
        fire(page, 'pointerdown', 31, 200, 400)
        fire(page, 'pointerup', 31, 200, 400)
        page.wait_for_timeout(80)
        fire(page, 'pointerdown', 32, 204, 402)
        fire(page, 'pointerup', 32, 204, 402)
        page.wait_for_timeout(400)
        z2 = cam(page)['z']
        if cam(page)['mode'] != 'system':
            errors.append(f'double-tap opened mode {cam(page)["mode"]}')
        if z2 <= z1 * 1.2:
            errors.append(f'double-tap did not zoom: {z1} -> {z2}')
        print('before', before, 'after_pinch', after_pinch, 'pan', pan, 'double', z1, z2, 'touch-action', ta)
        browser.close()
    httpd.shutdown()
    if errors:
        print('FAIL')
        for e in errors: print(' -', e)
        sys.exit(1)
    print('OK')

if __name__ == '__main__':
    main()
