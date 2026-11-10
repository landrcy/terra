import http.server, socketserver, threading, os, json, time, subprocess, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'shots'
SHOTS.mkdir(exist_ok=True)
PORT = int(__import__("os").environ.get("TERRA_PORT", "8770"))
os.chdir(ROOT)

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(('127.0.0.1', PORT), H)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}/?local=1'
errors = []

SEED_JS = r'''
async () => {
  localStorage.removeItem('terra:planets:v1');
  localStorage.removeItem('terra:mine');
  const store = TERRA.openStore({ forceLocal: true });
  const demos = [
    { name: 'Verdant Vale', author: 'Landry', msg: 'First light on a kind world.', biome: 'garden', land: 0.62, clouds: 0.5, cloudPat: 'wispy', atmo: 0.7, atmoHue: 0.33, iceCaps: 0.35, city: 0.4, aurora: 0.1, size: 0.55, seed: 0x11a11e, mine: true },
    { name: 'Quiet Meridian', author: 'A.', msg: 'Walk the dunes at dusk.', biome: 'desert', land: 0.8, clouds: 0.2, atmo: 0.5, atmoHue: 0.08, iceCaps: 0.1, craters: 0.45, size: 0.4, seed: 0x44d4e1,
      rings: [{ inner: 0.12, outer: 0.42, tilt: 0.35, color: 'gold', banding: 0.4, density: 0.7 }], moons: [{ size: 0.5, type: 'rocky', dist: 0.4, speed: 0.5, seed: 9 }] },
    { name: 'North Ice', biome: 'ice', land: 0.75, clouds: 0.4, cloudPat: 'banded', atmo: 0.8, atmoHue: 0.55, iceCaps: 1, aurora: 0.85, glow: 0.25, size: 0.7, seed: 0x1cec01,
      rings: [{ inner: 0.08, outer: 0.3, tilt: -0.2, color: 'ice', banding: 0.2, density: 0.8 }, { inner: 0.4, outer: 0.62, tilt: -0.2, color: 'ice', banding: 0.5, density: 0.5 }] },
    { name: 'Ember Reach', biome: 'lava', land: 1, clouds: 0.25, volcanoes: 0.8, glow: 0.7, atmo: 0.55, atmoHue: 0.02, iceCaps: 0, size: 0.5, seed: 0x1a0a01,
      moons: [{ size: 0.4, type: 'lava', dist: 0.35, speed: 0.7, seed: 3 }, { size: 0.6, type: 'cratered', dist: 0.7, speed: 0.3, seed: 4 }] },
    { name: 'Soft Orchard', biome: 'forest', land: 0.7, clouds: 0.55, cloudPat: 'cells', atmo: 0.65, atmoHue: 0.3, city: 0.2, size: 0.48, seed: 0x50f700 },
    { name: 'Little Heart', author: 'Finley', msg: 'A drawn world, popped into 3D.', biome: 'garden', land: 0.7, clouds: 0.35, atmo: 0.6, atmoHue: 0.85, size: 0.6, seed: 0x4ea12, shape: TERRA.planet.packMask(TERRA.planet.presetMask('heart')) }
  ];
  for (const d of demos) {
    const mine = d.mine; delete d.mine;
    const r = await store.add(d);
    if (mine) TERRA.rememberMine(r.planet.id);
  }
  if (TERRA.debug && TERRA.debug.reload) await TERRA.debug.reload();
  const list = TERRA.debug.planets && TERRA.debug.planets();
  if (list && list[0]) {
    for (let k = 0; k < 14; k++) TERRA.stampPaint(list[0], k * 0.45, Math.sin(k * 1.2) * 0.25, (k % 14) + 1, 2.2);
  }
}
'''

def hook(page):
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.on('pageerror', lambda err: errors.append(str(err)))

def open_page(browser, width, height, mobile=False):
    page = browser.new_page(viewport={'width': width, 'height': height}, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1)
    hook(page)
    page.goto(URL, wait_until='domcontentloaded', timeout=20000)
    page.wait_for_function('() => window.TERRA && TERRA.debug', timeout=8000)
    page.evaluate(SEED_JS)
    page.wait_for_timeout(400)
    return page

def shot(page, name):
    page.wait_for_timeout(700)
    dest = SHOTS / f'{name}.png'
    page.screenshot(path=str(dest))
    page.close()
    print('shot', name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--use-gl=swiftshader'])

    page = open_page(browser, 1280, 800)
    shot(page, 'title')

    page = open_page(browser, 1280, 800)
    page.click('#btn-shape')
    page.wait_for_timeout(300)
    page.click('[data-tab="paint"]')
    page.wait_for_timeout(200)
    page.evaluate('''() => {
      if (TERRA.debug && TERRA.debug.paint) {
        for (let k = 0; k < 10; k++) TERRA.debug.paint(k * 0.5, Math.sin(k) * 0.2, (k % 14) + 1, 2);
      }
      if (TERRA.debug && TERRA.debug.setTab) TERRA.debug.setTab('paint');
    }''')
    page.wait_for_timeout(700)
    shot(page, 'builder')

    page = open_page(browser, 1280, 800)
    page.click('#btn-shape')
    page.click('[data-shape="heart"]')
    page.wait_for_timeout(1200)
    shot(page, 'builder-3d')

    page = open_page(browser, 1280, 800)
    page.click('#btn-shape')
    page.click('#tabs [data-tab="note"]')
    page.fill('#p-name', 'Preview World')
    frame_dir = SHOTS / '_launch-frames'
    frame_dir.mkdir(exist_ok=True)
    page.click('#btn-launch')
    for i in range(20):
        page.wait_for_timeout(110)
        page.screenshot(path=str(frame_dir / f'{i:03d}.png'))
    page.screenshot(path=str(SHOTS / 'launch.png'))
    page.close()
    print('shot launch', flush=True)

    page = open_page(browser, 1280, 800)
    page.click('#btn-visit')
    page.wait_for_timeout(900)
    shot(page, 'system')

    page = open_page(browser, 1280, 800)
    page.click('#btn-visit')
    page.wait_for_timeout(400)
    page.evaluate('() => TERRA.debug.open(1)')
    page.wait_for_timeout(800)
    shot(page, 'closeup')

    page = open_page(browser, 1280, 800)
    page.click('#btn-visit')
    page.evaluate("() => { const mine = JSON.parse(localStorage.getItem('terra:mine')||'[]')[0]; TERRA.debug.land(mine, true); }")
    page.wait_for_timeout(400)
    page.keyboard.down('ArrowRight')
    page.wait_for_timeout(500)
    page.keyboard.up('ArrowRight')
    shot(page, 'surface')

    page = open_page(browser, 1280, 800)
    page.click('#btn-visit')
    page.evaluate('''async () => {
      const mine = JSON.parse(localStorage.getItem('terra:mine')||'[]')[0];
      TERRA.debug.land(mine, true);
      TERRA.debug.setTool('house');
      await TERRA.debug.place();
      TERRA.debug.setTool('tree');
      TERRA.surface.player.x = (TERRA.surface.player.x + 24) % 640;
      await TERRA.debug.place();
      TERRA.debug.setTool('lamp');
      TERRA.surface.player.x = (TERRA.surface.player.x + 18) % 640;
      await TERRA.debug.place();
    }''')
    page.wait_for_timeout(600)
    shot(page, 'surface-build')

    page = open_page(browser, 1280, 800)
    page.click('#btn-visit')
    page.evaluate('''async () => {
      const list = JSON.parse(localStorage.getItem('terra:planets:v1')||'[]');
      const mine = JSON.parse(localStorage.getItem('terra:mine')||'[]');
      const other = list.find(p => mine.indexOf(p.id) < 0) || list[1];
      TERRA.debug.land(other.id, true);
      TERRA.debug.setTool('flag');
      await TERRA.debug.place();
      TERRA.surface.player.x = (TERRA.surface.player.x + 16) % 640;
      TERRA.debug.setTool('gift');
      await TERRA.debug.place();
      TERRA.surface.player.x = (TERRA.surface.player.x + 14) % 640;
      TERRA.debug.setTool('sign');
      await TERRA.debug.place();
    }''')
    page.wait_for_timeout(600)
    shot(page, 'surface-gift')

    page = open_page(browser, 390, 844, mobile=True)
    page.click('#btn-visit')
    page.wait_for_timeout(800)
    shot(page, 'mobile')

    page = open_page(browser, 390, 844, mobile=True)
    page.click('#btn-shape')
    page.wait_for_timeout(800)
    shot(page, 'mobile-builder')

    # launch-and-land video frames
    page = open_page(browser, 1280, 800)
    page.click('#btn-shape')
    page.click('[data-tab="note"]')
    page.fill('#p-name', 'Preview Planet')
    land_dir = SHOTS / '_land-frames'
    land_dir.mkdir(exist_ok=True)
    page.click('#btn-launch')
    combo = SHOTS / '_combo-frames'
    combo.mkdir(exist_ok=True)
    n = 0
    for i in range(18):
        page.wait_for_timeout(110)
        page.screenshot(path=str(combo / f'{n:03d}.png')); n += 1
    page.wait_for_timeout(400)
    page.evaluate("() => { const mine = JSON.parse(localStorage.getItem('terra:mine')||'[]')[0]; TERRA.debug.land(mine, false); }")
    for i in range(16):
        page.wait_for_timeout(90)
        page.screenshot(path=str(combo / f'{n:03d}.png')); n += 1
    page.keyboard.down('ArrowRight')
    for i in range(8):
        page.wait_for_timeout(80)
        page.screenshot(path=str(combo / f'{n:03d}.png')); n += 1
    page.keyboard.up('ArrowRight')
    page.close()

    browser.close()

frames = sorted(frame_dir.glob('*.png')) if 'frame_dir' in dir() else []
# frame_dir always set
frame_dir = SHOTS / '_launch-frames'
if list(frame_dir.glob('*.png')):
    r = subprocess.run(['ffmpeg','-y','-framerate','10','-i',str(frame_dir/'%03d.png'),'-vf','scale=960:-1:flags=neighbor','-pix_fmt','yuv420p',str(SHOTS/'launch.mp4')], capture_output=True, text=True)
    r2 = subprocess.run(['ffmpeg','-y','-framerate','10','-i',str(frame_dir/'%03d.png'),'-vf','scale=640:-1:flags=neighbor,split[s][p];[p]palettegen=max_colors=64[pl];[s][pl]paletteuse',str(SHOTS/'launch.gif')], capture_output=True, text=True)
    print('ffmpeg', r.returncode, r2.returncode, (r.stderr or '')[-300:], (r2.stderr or '')[-200:])
combo = SHOTS / '_combo-frames'
if list(combo.glob('*.png')):
    r3 = subprocess.run(['ffmpeg','-y','-framerate','10','-i',str(combo/'%03d.png'),'-vf','scale=960:-1:flags=neighbor','-pix_fmt','yuv420p',str(SHOTS/'launch-and-land.mp4')], capture_output=True, text=True)
    print('ffmpeg combo', r3.returncode, (r3.stderr or '')[-300:])
    # landing-only clip: last 24 combo frames if present
    frames = sorted(combo.glob('*.png'))
    if len(frames) >= 16:
        # already have combo; also encode a landing-focused copy from the descent frames (after launch's 18)
        r4 = subprocess.run(['ffmpeg','-y','-framerate','10','-start_number','18','-i',str(combo/'%03d.png'),'-vf','scale=960:-1:flags=neighbor','-pix_fmt','yuv420p','-frames:v','24',str(SHOTS/'landing.mp4')], capture_output=True, text=True)
        print('ffmpeg landing', r4.returncode, (r4.stderr or '')[-200:])

httpd.shutdown()
print('ERRORS', errors if errors else 'none')
print('SHOTS', ', '.join(sorted(x.name for x in SHOTS.iterdir())))
if errors:
    sys.exit(1)
