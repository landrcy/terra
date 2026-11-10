import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'shots');
const PORT = 8765;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.txt': 'text/plain', '.md': 'text/plain', '.json': 'application/json' };
fs.mkdirSync(SHOTS, { recursive: true });

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(PORT, r));
const url = `http://127.0.0.1:${PORT}/?local=1`;
const errors = [];

function hook(page) {
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));
}

async function seed(page) {
  await page.evaluate(async () => {
    localStorage.removeItem('terra:planets:v1');
    localStorage.removeItem('terra:mine');
    const store = TERRA.openStore({ forceLocal: true });
    const demos = [
      { name: 'Verdant Vale', author: 'Landry', msg: 'First light on a kind world.', biome: 'garden', land: 0.62, clouds: 0.5, cloudPat: 'wispy', atmo: 0.7, atmoHue: 0.33, iceCaps: 0.35, city: 0.4, aurora: 0.1, size: 0.55, seed: 0x11a11e, mine: true },
      { name: 'Quiet Meridian', author: 'A.', msg: 'Walk the dunes at dusk.', biome: 'desert', land: 0.8, clouds: 0.2, atmo: 0.5, atmoHue: 0.08, iceCaps: 0.1, craters: 0.45, size: 0.4, seed: 0x44d4e,
        rings: [{ inner: 0.12, outer: 0.42, tilt: 0.35, color: 'gold', banding: 0.4, density: 0.7 }], moons: [{ size: 0.5, type: 'rocky', dist: 0.4, speed: 0.5, seed: 9 }] },
      { name: 'North Ice', biome: 'ice', land: 0.75, clouds: 0.4, cloudPat: 'banded', atmo: 0.8, atmoHue: 0.55, iceCaps: 1, aurora: 0.85, glow: 0.25, size: 0.7, seed: 0x1cec010,
        rings: [{ inner: 0.08, outer: 0.3, tilt: -0.2, color: 'ice', banding: 0.2, density: 0.8 }, { inner: 0.4, outer: 0.62, tilt: -0.2, color: 'ice', banding: 0.5, density: 0.5 }] },
      { name: 'Ember Reach', biome: 'lava', land: 1, clouds: 0.25, volcanoes: 0.8, glow: 0.7, atmo: 0.55, atmoHue: 0.02, iceCaps: 0, size: 0.5, seed: 0x1a0a010,
        moons: [{ size: 0.4, type: 'lava', dist: 0.35, speed: 0.7, seed: 3 }, { size: 0.6, type: 'cratered', dist: 0.7, speed: 0.3, seed: 4 }] },
      { name: 'Soft Orchard', biome: 'forest', land: 0.7, clouds: 0.55, cloudPat: 'cells', atmo: 0.65, atmoHue: 0.3, city: 0.2, size: 0.48, seed: 0x50f7 },
      { name: 'Little Heart', author: 'Finley', msg: 'A drawn world, popped into 3D.', biome: 'garden', land: 0.7, clouds: 0.35, atmo: 0.6, atmoHue: 0.85, size: 0.6, seed: 0x4ea12, shape: TERRA.planet.packMask(TERRA.planet.presetMask('heart')) }
    ];
    for (const d of demos) {
      const mine = d.mine; delete d.mine;
      const r = await store.add(d);
      if (mine) TERRA.rememberMine(r.planet.id);
    }
  });
  await page.evaluate(async () => { if (window.TERRA && TERRA.debug && TERRA.debug.reload) await TERRA.debug.reload(); });
}

async function openShot(name, width, height, isMobile, fn) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: !!isMobile, hasTouch: !!isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
  hook(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.TERRA && TERRA.debug, null, { timeout: 8000 });
  await seed(page);
  await page.waitForTimeout(400);
  if (fn) await fn(page);
  await page.waitForTimeout(700);
  const dest = path.join(SHOTS, name + '.png');
  await page.screenshot({ path: dest });
  await page.close();
  console.log('shot', name);
  return dest;
}

const browser = await chromium.launch({ args: ['--use-gl=swiftshader'] });

await openShot('title', 1280, 800, false);

await openShot('builder', 1280, 800, false, async (page) => {
  await page.click('#btn-shape');
  await page.waitForTimeout(800);
});

await openShot('builder-3d', 1280, 800, false, async (page) => {
  await page.click('#btn-shape');
  await page.click('[data-shape="heart"]');
  await page.waitForTimeout(1200);
});

const launchPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
hook(launchPage);
await launchPage.goto(url, { waitUntil: 'domcontentloaded' });
await launchPage.waitForFunction(() => window.TERRA && TERRA.debug);
await seed(launchPage);
await launchPage.click('#btn-shape');
await launchPage.click('#tabs [data-tab="note"]');
await launchPage.fill('#p-name', 'Preview World');
const frameDir = path.join(SHOTS, '_launch-frames');
fs.mkdirSync(frameDir, { recursive: true });
await launchPage.click('#btn-launch');
for (let i = 0; i < 20; i++) {
  await launchPage.waitForTimeout(110);
  await launchPage.screenshot({ path: path.join(frameDir, String(i).padStart(3, '0') + '.png') });
}
await launchPage.screenshot({ path: path.join(SHOTS, 'launch.png') });
await launchPage.close();
console.log('shot launch');

await openShot('system', 1280, 800, false, async (page) => {
  await page.click('#btn-visit');
  await page.waitForTimeout(900);
});

await openShot('closeup', 1280, 800, false, async (page) => {
  await page.click('#btn-visit');
  await page.waitForTimeout(400);
  await page.evaluate(() => TERRA.debug.open(1));
  await page.waitForTimeout(800);
});

await openShot('surface', 1280, 800, false, async (page) => {
  await page.click('#btn-visit');
  await page.evaluate(() => {
    const mine = (JSON.parse(localStorage.getItem('terra:mine') || '[]'))[0];
    TERRA.debug.land(mine);
  });
  await page.waitForTimeout(700);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
});

await openShot('surface-build', 1280, 800, false, async (page) => {
  await page.click('#btn-visit');
  await page.evaluate(async () => {
    const mine = (JSON.parse(localStorage.getItem('terra:mine') || '[]'))[0];
    TERRA.debug.land(mine);
    TERRA.debug.setTool('house');
    await TERRA.debug.place();
    TERRA.debug.setTool('tree');
    TERRA.surface.player.x = (TERRA.surface.player.x + 24) % 480;
    await TERRA.debug.place();
    TERRA.debug.setTool('lamp');
    TERRA.surface.player.x = (TERRA.surface.player.x + 18) % 480;
    await TERRA.debug.place();
  });
  await page.waitForTimeout(600);
});

await openShot('surface-gift', 1280, 800, false, async (page) => {
  await page.click('#btn-visit');
  await page.evaluate(async () => {
    const list = JSON.parse(localStorage.getItem('terra:planets:v1') || '[]');
    const mine = JSON.parse(localStorage.getItem('terra:mine') || '[]');
    const other = list.find((p) => mine.indexOf(p.id) < 0) || list[1];
    TERRA.debug.land(other.id);
    TERRA.debug.setTool('flag');
    await TERRA.debug.place();
    TERRA.surface.player.x = (TERRA.surface.player.x + 16) % 480;
    TERRA.debug.setTool('gift');
    await TERRA.debug.place();
    TERRA.surface.player.x = (TERRA.surface.player.x + 14) % 480;
    TERRA.debug.setTool('sign');
    await TERRA.debug.place();
  });
  await page.waitForTimeout(600);
});

await openShot('mobile', 390, 844, true, async (page) => {
  await page.click('#btn-visit');
  await page.waitForTimeout(800);
});

await openShot('mobile-builder', 390, 844, true, async (page) => {
  await page.click('#btn-shape');
  await page.waitForTimeout(800);
});

await browser.close();

const frames = fs.readdirSync(frameDir).filter((f) => f.endsWith('.png')).sort();
if (frames.length) {
  const r = spawnSync('ffmpeg', ['-y', '-framerate', '10', '-i', path.join(frameDir, '%03d.png'), '-vf', 'scale=960:-1:flags=neighbor', '-pix_fmt', 'yuv420p', path.join(SHOTS, 'launch.mp4')], { encoding: 'utf8' });
  const r2 = spawnSync('ffmpeg', ['-y', '-framerate', '10', '-i', path.join(frameDir, '%03d.png'), '-vf', 'scale=640:-1:flags=neighbor,split[s][p];[p]palettegen=max_colors=64[pl];[s][pl]paletteuse', path.join(SHOTS, 'launch.gif')], { encoding: 'utf8' });
  console.log('ffmpeg mp4', r.status, 'gif', r2.status, r.stderr.split('\n').slice(-4).join(' | '), r2.stderr.split('\n').slice(-3).join(' | '));
}

server.close();
console.log('ERRORS', errors.length ? errors : 'none');
console.log('SHOTS', fs.readdirSync(SHOTS).join(', '));
if (errors.length) process.exitCode = 1;
