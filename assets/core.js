/* Terra — pixel math, dither, seeded noise. Chunky pixels only: no smooth blending on canvas. */
(function (root) {
  'use strict';
  var T = root.TERRA = root.TERRA || {};
  var TAU = T.TAU = Math.PI * 2;
  T.reduced = false;
  try { T.reduced = !!(root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}

  T.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  T.hex = function (c) {
    if (typeof c !== 'string') return c;
    var n = parseInt(c.charAt(0) === '#' ? c.slice(1) : c, 16);
    if ((c.length === 4) || (c.length === 3)) return [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17];
    return [n >> 16, (n >> 8) & 255, n & 255];
  };
  T.pack = function (c) { return (255 << 24) | ((c[2] & 255) << 16) | ((c[1] & 255) << 8) | (c[0] & 255); };
  T.lerp = function (a, b, t) { return a + (b - a) * t; };
  T.mix3 = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };

  var B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + 0.5) / 16; });
  T.bayer = function (x, y) { return B4[((y & 3) << 2) + (x & 3)]; };
  T.lineTh = function (x, y) { return [0.12, 0.62, 0.37, 0.87][y & 3]; };

  /* Pick a colour from a ramp with v in [0,1], using a Bayer (or other) threshold so blends stay chunky pixels. */
  T.dq = function (ramp, v, x, y, th) {
    th = th || T.bayer;
    var n = ramp.length - 1;
    v = T.clamp(v, 0, 1) * n;
    var i = v | 0;
    if (v - i > th(x | 0, y | 0)) i++;
    return ramp[i > n ? n : i];
  };
  T.dqc = function (ramp, v, x, y, th) {
    var c = T.dq(ramp, v, x, y, th);
    return typeof c === 'string' ? T.hex(c) : c;
  };

  T.hash = function (a, b, c) {
    var h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul((c | 0), 1440668977)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  T.ihash = function (a, b, c) {
    var h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul((c | 0), 1440668977)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };
  T.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  T.noise2 = function (x, y, s) {
    s = s | 0;
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = fade(xf), w = fade(yf);
    return lerp(lerp(T.hash(xi, yi, s), T.hash(xi + 1, yi, s), u), lerp(T.hash(xi, yi + 1, s), T.hash(xi + 1, yi + 1, s), u), w);
  };
  T.noise3 = function (x, y, z, s) {
    s = s | 0;
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi, u = fade(xf), v = fade(yf), w = fade(zf);
    var z0 = zi + s, z1 = zi + 1 + s;
    return lerp(
      lerp(lerp(T.hash(xi, yi, z0), T.hash(xi + 1, yi, z0), u), lerp(T.hash(xi, yi + 1, z0), T.hash(xi + 1, yi + 1, z0), u), v),
      lerp(lerp(T.hash(xi, yi, z1), T.hash(xi + 1, yi, z1), u), lerp(T.hash(xi, yi + 1, z1), T.hash(xi + 1, yi + 1, z1), u), v),
      w
    );
  };
  T.fbm2 = function (x, y, s, oct) {
    var v = 0, a = 0.5, f = 1, i, n = 0, o = oct || 5;
    for (i = 0; i < o; i++) { v += T.noise2(x * f, y * f, s + i * 19) * a; n += a; a *= 0.5; f *= 2.02; }
    return v / n;
  };
  T.fbm3 = function (x, y, z, s, oct) {
    var v = 0, a = 0.5, f = 1, i, n = 0, o = oct || 5;
    for (i = 0; i < o; i++) { v += T.noise3(x * f, y * f, z * f, s + i * 19) * a; n += a; a *= 0.5; f *= 2.03; }
    return v / n;
  };
  T.ridged3 = function (x, y, z, s, oct) {
    var v = 0, a = 0.5, f = 1, i, n = 0, o = oct || 4;
    for (i = 0; i < o; i++) { v += (1 - Math.abs(T.noise3(x * f, y * f, z * f, s + i * 19) * 2 - 1)) * a; n += a; a *= 0.5; f *= 2.1; }
    return v / n;
  };

  T.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };
  T.BIOMES = ['ocean', 'forest', 'garden', 'desert', 'tundra', 'ice', 'lava', 'storm'];
  T.BIOME_LABEL = { ocean: 'Ocean', forest: 'Forest', garden: 'Garden', desert: 'Desert', tundra: 'Tundra', ice: 'Ice', lava: 'Lava', storm: 'Storm' };

  T.make = function (w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    T.setSmooth(g, false);
    return { c: c, g: g, img: g.createImageData(w, h) };
  };
  T.setSmooth = function (g, on) {
    g.imageSmoothingEnabled = !!on;
    g.mozImageSmoothingEnabled = !!on;
    g.webkitImageSmoothingEnabled = !!on;
    g.msImageSmoothingEnabled = !!on;
  };

  /* Tiny pixel-font word renderer used by title + labels drawn on the buffer. */
  T.GLYPH = {
    A: '01100100111110011001', B: '11101001111010011110', C: '01111000100010000111', D: '11101001100110011110',
    E: '11111000111010001111', F: '11111000111010001000', G: '01111000101110010111', H: '10011001111110011001',
    I: '11100100010001001110', J: '01110010001010100100', K: '10011010110010101001', L: '10001000100010001111',
    M: '10011111110110011001', N: '10011101101110011001', O: '01101001100110010110', P: '11101001111010001000',
    Q: '01101001100110100101', R: '11101001111010101001', S: '01111000011000011110', T: '11110100010001000100',
    U: '10011001100110010110', V: '10011001100110100100', W: '10011001110111111001', X: '10011001011010011001',
    Y: '10011001011001000100', Z: '11110001001001001111',
    '0': '01101001100110010110', '1': '01001100010001001110', '2': '01101001001001001111', '3': '11100001011000011110',
    '4': '10011001111100010001', '5': '11111000111000011110', '6': '01111000111010010110', '7': '11110001001001000100',
    '8': '01101001011010010110', '9': '01101001011100010110', '#': '10101111010111101010',
    ' ': '00000000000000000000', '.': '00000000000000000100', ',': '00000000000001000100',
    "'": '00100010000000000000', '!': '01000100010000000100', '?': '01100001001000000100',
    '-': '00000000011100000000', ':': '00000100000001000000'
  };
  T.blitText = function (u32, W, H, text, x, y, col, scale) {
    scale = scale || 1;
    text = String(text).toUpperCase();
    var i, j, k, r, c, g, ch, px, py, p = typeof col === 'number' ? col : T.pack(col);
    var cx = x;
    for (i = 0; i < text.length; i++) {
      g = T.GLYPH[text.charAt(i)] || T.GLYPH['?'];
      for (r = 0; r < 5; r++) for (c = 0; c < 4; c++) if (g.charAt(r * 4 + c) === '1') {
        for (j = 0; j < scale; j++) for (k = 0; k < scale; k++) {
          px = cx + c * scale + k; py = y + r * scale + j;
          if (px >= 0 && py >= 0 && px < W && py < H) u32[py * W + px] = p;
        }
      }
      cx += 5 * scale;
    }
    return cx - x;
  };
  T.textWidth = function (text, scale) { return String(text).length * 5 * (scale || 1) - 1 * (scale || 1); };

  var PREFIX = ['Amber', 'Pale', 'Quiet', 'Moss', 'Ember', 'Soft', 'Hollow', 'Bright', 'Dust', 'Rain', 'Copper', 'Little', 'New', 'Old', 'Twin', 'Far', 'Warm', 'Silver', 'Cedar', 'Coral', 'Ivory', 'Rust', 'Fern', 'Golden', 'Ashen', 'North', 'Low', 'High', 'Inner', 'Verdant'];
  var SUFFIX = ['Vale', 'Meridian', 'Hearth', 'Orchard', 'Drift', 'Reach', 'Hollow', 'Garden', 'Shore', 'Peak', 'Fen', 'Heath', 'Moor', 'Glade', 'Well', 'Field', 'Haven', 'March', 'Cove', 'Ridge', 'Dune', 'Isle', 'Cradle', 'Meadow', 'Wold', 'Knoll', 'Delta', 'Atoll', 'Basin', 'Refrain'];
  T.autoName = function (seed) {
    var r = T.rng((seed >>> 0) ^ 0x9e3779b9);
    return PREFIX[(r() * PREFIX.length) | 0] + ' ' + SUFFIX[(r() * SUFFIX.length) | 0];
  };

  T.MOON_TYPES = ['rocky', 'icy', 'cratered', 'lava'];
  T.CLOUD_PATS = ['wispy', 'banded', 'swirl', 'cells'];
  T.RING_COLORS = ['gold', 'ice', 'rose', 'dust', 'jade', 'violet'];
  T.SHAPE_N = 48;

  T.PAINT_W = 48; T.PAINT_H = 24;
  T.PAINT_PAL = [null, '#c02828', '#e07030', '#f0d040', '#5a9a48', '#2a6a88', '#7030a0', '#f4ead4', '#1a1008', '#d0d0d4', '#e070a0', '#8a5a20', '#48c0d0', '#ffffff', '#3a2410', '#80f0a0'];
  T.packPaint = function (arr) {
    if (!arr) return '';
    var n = T.PAINT_W * T.PAINT_H, i, empty = 1, b = new Uint8Array((n + 1) >> 1);
    for (i = 0; i < n; i++) { if (arr[i] & 15) empty = 0; if (i % 2 === 0) b[i >> 1] = arr[i] & 15; else b[i >> 1] |= (arr[i] & 15) << 4; }
    if (empty) return '';
    var bin = '';
    for (i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
    try { return btoa(bin); } catch (e) { return ''; }
  };
  T.unpackPaint = function (s) {
    var n = T.PAINT_W * T.PAINT_H, a = new Uint8Array(n), i, b, bin;
    if (!s || typeof s !== 'string') return a;
    try { bin = atob(s); } catch (e) { return a; }
    b = new Uint8Array(bin.length);
    for (i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i) & 255;
    for (i = 0; i < n; i++) a[i] = (i % 2 === 0 ? (b[i >> 1] || 0) & 15 : ((b[i >> 1] || 0) >> 4) & 15);
    return a;
  };
  T.paintArr = function (spec) {
    if (!spec) return T.unpackPaint('');
    if (spec._paintArr && spec._paintSrc === (spec.paint || '')) return spec._paintArr;
    spec._paintArr = T.unpackPaint(spec.paint);
    spec._paintSrc = spec.paint || '';
    return spec._paintArr;
  };
  T.samplePaint = function (spec, lon, lat) {
    if (!spec || !spec.paint) return 0;
    var a = T.paintArr(spec), u = ((lon / T.TAU) % 1 + 1) % 1 * T.PAINT_W, v = T.clamp((lat + Math.PI / 2) / Math.PI, 0, 0.99999) * T.PAINT_H;
    return a[(v | 0) * T.PAINT_W + (u | 0)] & 15;
  };
  T.stampPaint = function (spec, lon, lat, color, radius) {
    var a = T.paintArr(spec), r = Math.max(0.6, radius || 1.2), u0 = ((lon / T.TAU) % 1 + 1) % 1 * T.PAINT_W, v0 = T.clamp((lat + Math.PI / 2) / Math.PI, 0, 0.99999) * T.PAINT_H;
    var x, y, dx, dy, w = T.PAINT_W, h = T.PAINT_H, c = color & 15;
    var x0 = Math.floor(u0 - r - 1), x1 = Math.ceil(u0 + r + 1), y0 = Math.max(0, Math.floor(v0 - r - 1)), y1 = Math.min(h - 1, Math.ceil(v0 + r + 1));
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      dx = x + 0.5 - u0; dy = y + 0.5 - v0;
      if (dx * dx + dy * dy <= r * r) a[y * w + ((x % w) + w) % w] = c;
    }
    spec.paint = T.packPaint(a);
    spec._paintArr = a;
    spec._paintSrc = spec.paint;
    return spec.paint;
  };
  T.paintKey = function (spec) { var s = (spec && spec.paint) || ''; return s ? (s.length + ':' + s.slice(0, 8) + s.slice(-6)) : ''; };



  T.defaultMoon = function (seed, i) {
    var r = T.rng(((seed >>> 0) + (i + 1) * 9973) >>> 0);
    return { size: 0.35 + r() * 0.5, type: T.MOON_TYPES[(r() * T.MOON_TYPES.length) | 0], dist: 0.25 + r() * 0.7, speed: 0.25 + r() * 0.7, seed: (r() * 0xffffffff) | 0 };
  };
  T.defaultRing = function (seed, i) {
    var r = T.rng(((seed >>> 0) + (i + 1) * 13291) >>> 0);
    return { inner: 0.08 + i * 0.18 + r() * 0.08, outer: 0.28 + i * 0.2 + r() * 0.16, tilt: (r() * 2 - 1) * 0.7, color: T.RING_COLORS[(r() * T.RING_COLORS.length) | 0], banding: r() * 0.8, density: 0.45 + r() * 0.5 };
  };

  /* Default planet spec. Amounts are 0..1 unless noted. shape is null for a sphere, or a base64 bit-mask. */
  T.defaultSpec = function (seed) {
    var r = T.rng(seed || (Math.random() * 0xffffffff) | 0);
    var s = (seed || ((r() * 0xffffffff) | 0)) >>> 0;
    var biome = T.BIOMES[(r() * T.BIOMES.length) | 0];
    var land = biome === 'ocean' ? 0.22 + r() * 0.25 : biome === 'ice' ? 0.7 + r() * 0.25 : biome === 'storm' ? 0 : 0.4 + r() * 0.45;
    var nM = (r() * 4) | 0, nR = (r() < 0.22 || (biome === 'storm' && r() < 0.5)) ? (1 + ((r() < 0.35) | 0) + ((r() < 0.15) | 0)) : 0;
    var moons = [], rings = [], i;
    for (i = 0; i < nM; i++) moons.push(T.defaultMoon(s, i));
    for (i = 0; i < nR; i++) rings.push(T.defaultRing(s, i));
    return {
      seed: s, size: 0.35 + r() * 0.45, biome: biome, land: land,
      clouds: biome === 'desert' ? r() * 0.35 : biome === 'lava' ? r() * 0.4 : 0.25 + r() * 0.55,
      cloudPat: T.CLOUD_PATS[(r() * T.CLOUD_PATS.length) | 0],
      atmo: 0.35 + r() * 0.6, atmoHue: r(),
      aurora: biome === 'ice' || biome === 'tundra' ? 0.4 + r() * 0.6 : r() < 0.2 ? r() * 0.5 : 0,
      city: biome === 'lava' || biome === 'storm' || biome === 'ice' ? 0 : r() < 0.45 ? r() * 0.85 : 0,
      craters: biome === 'ice' || biome === 'desert' || biome === 'tundra' ? 0.3 + r() * 0.6 : r() * 0.4,
      volcanoes: biome === 'lava' ? 0.55 + r() * 0.45 : r() < 0.2 ? r() * 0.5 : 0,
      iceCaps: biome === 'ice' ? 0.8 + r() * 0.2 : biome === 'lava' || biome === 'storm' ? r() * 0.15 : 0.2 + r() * 0.55,
      glow: biome === 'lava' ? 0.4 + r() * 0.5 : r() * 0.4,
      rings: rings, moons: moons, shape: null, shapeKind: null, paint: '',
      name: '', author: '', msg: ''
    };
  };

  T.blankSpec = function (seed) {
    seed = (seed >>> 0) || 1;
    return T.cleanSpec({
      seed: seed, size: 0.5, biome: 'slate', land: 1,
      clouds: 0, cloudPat: 'wispy', atmo: 0, atmoHue: 0.55,
      aurora: 0, city: 0, craters: 0, volcanoes: 0, iceCaps: 0, glow: 0,
      rings: [], moons: [], shape: null, shapeKind: null, paint: '',
      name: '', author: '', msg: ''
    });
  };

  function num(v, a, b, d) { v = +v; return isFinite(v) ? T.clamp(v, a, b) : d; }
  function str(v, n) { return (typeof v === 'string' ? v : '').slice(0, n); }
  T.cleanMoon = function (m, seed, i) {
    if (!m || typeof m !== 'object') return T.defaultMoon(seed, i);
    var type = str(m.type, 12);
    if (T.MOON_TYPES.indexOf(type) < 0) type = 'rocky';
    return { size: num(m.size, 0.15, 1, 0.5), type: type, dist: num(m.dist, 0.05, 1, 0.5), speed: num(m.speed, 0.05, 1, 0.5), seed: (m.seed >>> 0) || (((seed || 1) + i * 9973) >>> 0) };
  };
  T.cleanRing = function (r, seed, i) {
    if (!r || typeof r !== 'object') return T.defaultRing(seed, i);
    var color = str(r.color, 12);
    if (T.RING_COLORS.indexOf(color) < 0) color = 'gold';
    var inner = num(r.inner, 0, 0.85, 0.1 + i * 0.18), outer = num(r.outer, inner + 0.06, 1, Math.min(1, inner + 0.22));
    return { inner: inner, outer: outer, tilt: num(r.tilt, -1, 1, 0.2), color: color, banding: num(r.banding, 0, 1, 0.3), density: num(r.density, 0.08, 1, 0.7) };
  };
  T.cleanSpec = function (s) {
    s = s || {};
    var d = T.defaultSpec((s.seed >>> 0) || 1), i, biome = str(s.biome, 12);
    var slate = biome === 'slate';
    if (!slate && T.BIOMES.indexOf(biome) < 0) biome = d.biome;
    var pat = str(s.cloudPat, 12); if (T.CLOUD_PATS.indexOf(pat) < 0) pat = d.cloudPat;
    var moons = [], rings = [];
    if (Array.isArray(s.moons)) { for (i = 0; i < s.moons.length && i < 3; i++) moons.push(T.cleanMoon(s.moons[i], d.seed, i)); }
    else if (typeof s.moons === 'number') { for (i = 0; i < Math.min(3, s.moons | 0); i++) moons.push(T.defaultMoon(d.seed, i)); }
    if (Array.isArray(s.rings)) { for (i = 0; i < s.rings.length && i < 3; i++) rings.push(T.cleanRing(s.rings[i], d.seed, i)); }
    else if (s.rings) rings.push(T.defaultRing(d.seed, 0));
    var shape = null;
    if (typeof s.shape === 'string' && s.shape.length > 8 && s.shape.length < 4000) shape = s.shape.replace(/[^A-Za-z0-9+/=]/g, '').slice(0, 2000);
    var kind = str(s.shapeKind, 12);
    if (['heart', 'pear', 'bean', 'diamond', 'square'].indexOf(kind) < 0) kind = null;
    var landD = slate ? 1 : d.land, cloudD = slate ? 0 : d.clouds, atmoD = slate ? 0 : d.atmo;
    var craterD = slate ? 0 : d.craters, iceD = slate ? 0 : d.iceCaps, sizeD = slate ? 0.5 : d.size;
    return {
      seed: d.seed, size: num(s.size, 0, 1, sizeD), biome: biome, land: num(s.land, 0, 1, landD),
      clouds: num(s.clouds, 0, 1, cloudD), cloudPat: pat,
      atmo: num(s.atmo, 0, 1, atmoD), atmoHue: num(s.atmoHue, 0, 1, slate ? 0.55 : d.atmoHue),
      aurora: num(s.aurora, 0, 1, 0), city: num(s.city, 0, 1, 0),
      craters: num(s.craters, 0, 1, craterD), volcanoes: num(s.volcanoes, 0, 1, 0),
      iceCaps: num(s.iceCaps, 0, 1, iceD), glow: num(s.glow, 0, 1, 0),
      rings: rings, moons: moons, shape: shape, shapeKind: kind,
      paint: (typeof s.paint === 'string' ? s.paint.replace(/[^A-Za-z0-9+/=]/g, '').slice(0, 1200) : ''),
      name: str(s.name, 24).replace(/\n/g, ' ').trim(),
      author: str(s.author, 24).replace(/\n/g, ' ').trim(),
      msg: str(s.msg, 160).trim()
    };
  };

  T.visitorId = function () {
    var id = '';
    try { id = localStorage.getItem('terra:visitor') || ''; } catch (e) {}
    if (!id) { id = T.uid(); try { localStorage.setItem('terra:visitor', id); } catch (e2) {} }
    return id;
  };
  T.mine = function () {
    try { return JSON.parse(localStorage.getItem('terra:mine') || '[]'); } catch (e) { return []; }
  };
  T.rememberMine = function (id) {
    var m = T.mine();
    if (m.indexOf(id) < 0) { m.push(id); try { localStorage.setItem('terra:mine', JSON.stringify(m)); } catch (e) {} }
  };
  T.isMine = function (id) { return T.mine().indexOf(id) >= 0; };
})(typeof window !== 'undefined' ? window : globalThis);
