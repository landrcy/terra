/* Terra — landed surface. Multi-layer parallax pixel world, biome-distinct, with a landing cinematic. */
(function () {
  'use strict';
  var T = window.TERRA, S = T.surface = {};
  var WORLD = 640;

  var SPR = {
    house: { pal:{ k:'#1a1008', r:'#8a3020', s:'#c05030', h:'#6a2014', w:'#e8d8b8', c:'#d0c09a', y:'#ffe080', d:'#4a3020', g:'#2a6a30', m:'#6a8aaa', n:'#3a2010', f:'#c07838', o:'#fff6c8' },
      rows:[
        '..kk................',
        '..knk...kkkkkkkk....',
        '..kfk..krrrrrrrrk...',
        '..kfk.krrsrrsrrrk...',
        '..kkk.krsrrsrrsrrk..',
        '.....krrsrrsrrsrrrk.',
        '....krrrrsrrsrrrrrrk',
        '...kkkkkkkkkkkkkkkkk',
        '...kwwwwwwwwwwwwwwwk',
        '...kwcwwcwwcwwcwwcwk',
        '...kwmywwmywwmywwmyk',
        '...kwmywwmywwmywwmyk',
        '...kwcwwcwwcwwcwwcwk',
        '...kwwwwwwdwwwwwwwwk',
        '...kwwwwwdnodwwwwwwk',
        '...kwwwwwdnnndwwwwwk',
        '...kkkkkkkkkkkkkkkkk',
        'ggg...............gg'
      ]},
    cabin: { pal:{ k:'#1a0c04', r:'#6a3a14', s:'#8a5020', w:'#c4a06a', d:'#3a2410', y:'#ffe080', c:'#a07040', n:'#2a1808', l:'#d8b878' },
      rows:[
        '......kkkkkkkk......',
        '.....krrrrrrrrk.....',
        '....krrsrrsrrrrk....',
        '...krrsrrsrrsrrrk...',
        '..kkkkkkkkkkkkkkkk..',
        '..klwwwwwwwwwwwwlk..',
        '..kwywwcwwcwwywwwk..',
        '..kwywwcwwcwwywwwk..',
        '..kwwwwwdnnndwwwwk..',
        '..kwwwwwdnnndwwwwk..',
        '..kkkkkkkkkkkkkkkk..'
      ]},
    tower: { pal:{ s:'#6a6a74', l:'#9a9aa4', d:'#2a2a30', y:'#ffe080', r:'#8a3020', k:'#1a1a20', w:'#c8c8d0', o:'#fff4b0' },
      rows:[
        '...krrrk...',
        '...ksssk...',
        '..kswlwsk..',
        '..ksssssk..',
        '..ksyoyk...',
        '..ksssssk..',
        '..ksldlsk..',
        '..ksssssk..',
        '..ksyoyk...',
        '..ksssssk..',
        '.kkssssskk.',
        'kkssssssskk'
      ]},
    flag: { pal:{ p:'#d0d0d4', r:'#e04040', d:'#801010', t:'#5a4030', w:'#f0f0f4', k:'#2a1a10' },
      rows:['ktrrrrw','ktrrrrd','ktrrww.','ktrr...','kt.....','kt.....','kt.....','kk.....'] },
    lamp: { pal:{ t:'#3a3a40', y:'#ffe080', o:'#f0c040', w:'#fff6c0', k:'#1a1a20' },
      rows:['.kok.','.ywy.','.oyo.','..t..','..t..','..t..','.ktk.'] },
    well: { pal:{ s:'#6a6a70', d:'#3a3a40', b:'#2a4a6a', w:'#8a5a30', l:'#8a8a90', k:'#1a1a20' },
      rows:['.wk.kw.', 'wwwlwww', '.kssssk.', '.sdbds.', '.sldls.', '.kssssk.'] },
    bench: { pal:{ w:'#8a5a30', d:'#5a3a18', l:'#c48a50', k:'#2a1808' }, rows:['.......','lllllll','wdkdkdw','d.....d'] },
    windmill: { pal:{ w:'#e8e0d0', d:'#6a5a40', r:'#8a3020', s:'#c8c0b0', k:'#2a2010' },
      rows:['w.....w','.w.s.w.','.wsrsw.','wwkwwsw','.wdwdw.','.wdwdw.','.kdddk.'] },
    sign: { pal:{ w:'#c4a06a', d:'#5a3a18', i:'#2a1a10', l:'#d8b878', k:'#1a1008' },
      rows:['.kwwwk.','.wiiiw.','.wlllw.','.kwwwk.','...d...','...d...'] },
    gift: { pal:{ r:'#c02828', g:'#f0d060', b:'#8a1818', w:'#fff0b0', k:'#6a1010' },
      rows:['.gwg.', 'grrrg','gbrbg','krrrk'] },
    print: { pal:{ s:'#3a2a20' }, rows:['s.s','.s.','s.s'] }
  };

  var BUILD = { house:1, cabin:1, tower:1, flag:1, lamp:1, well:1, bench:1, windmill:1, sign:1, gift:1, print:1 };
  var sprCache = {};
  function asciiSprite(kind) {
    if (sprCache[kind]) return sprCache[kind];
    var def = SPR[kind] || SPR.flag, rows = def.rows, pal = def.pal, w = rows[0].length, h = rows.length;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data, x, y, ch, col, o, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      ch = rows[y].charAt(x); if (!ch || ch === '.') continue;
      col = T.hex(pal[ch] || '#fff'); o = (y * w + x) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    /* buildings keep a thin dark edge so they read on grass; vegetation does not */
    var o2 = new Uint8Array(d);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      o = (y * w + x) * 4;
      if (d[o + 3] === 255) continue;
      var n, hit = 0;
      for (n = 0; n < 4; n++) {
        var nx = x + (n === 0 ? 1 : n === 1 ? -1 : 0), ny = y + (n === 2 ? 1 : n === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (d[(ny * w + nx) * 4 + 3] === 255) hit = 1;
      }
      if (hit) { o2[o] = 28; o2[o + 1] = 20; o2[o + 2] = 12; o2[o + 3] = 255; }
    }
    for (i = 0; i < o2.length; i++) d[i] = o2[i];
    g.putImageData(img, 0, 0); return (sprCache[kind] = c);
  }

  function vegPal(biome) {
    if (biome === 'desert') return {
      leaf: ['#1f4a2a', '#2f7a3a', '#56a84a', '#9ad65a'],
      trunk: ['#5a3a18', '#8a5a30', '#b88850', '#d0a870'],
      grass: ['#8a7a3a', '#b8a050', '#dcc878'],
      flower: ['#ff6a8a', '#ffe03a', '#ff8a30'], fruit: '#e07040'
    };
    if (biome === 'ice' || biome === 'tundra') return {
      leaf: ['#0e2818', '#1a4a30', '#2a6a44', '#4a8860'],
      trunk: ['#3a2a20', '#5a4030', '#7a5a40', '#9a7860'],
      grass: ['#4a5a50', '#6a7a70', '#8aa098'],
      snow: ['#8aa0c8', '#c8d8f0', '#ffffff'],
      flower: ['#e8f0ff', '#c0d0f0', '#ffe8f0'], fruit: '#c8d8f0'
    };
    if (biome === 'lava') return {
      leaf: ['#3a2210', '#5a3a18', '#8a5424', '#b87838'],
      trunk: ['#2a1010', '#4a2018', '#6a3020', '#8a4030'],
      grass: ['#3a1810', '#5a2414', '#7a3018'],
      flower: ['#ff6a30', '#ffd040', '#ff8030'], fruit: '#ff5030'
    };
    if (biome === 'ocean') return {
      leaf: ['#0e3a24', '#1a6a38', '#2ea04a', '#70d870'],
      trunk: ['#5a3a18', '#8a5a30', '#c49050', '#d8b070'],
      grass: ['#186828', '#28a040', '#58c860'],
      flower: ['#ffe03a', '#ff6a8a', '#88e0ff'], fruit: '#ff8040'
    };
    if (biome === 'storm') return {
      leaf: ['#143020', '#1e4a30', '#2a6840', '#3a8850'],
      trunk: ['#2a2018', '#4a3828', '#6a5038', '#8a6a50'],
      grass: ['#2a3a28', '#3a4a38', '#5a6a50'],
      flower: ['#c0a0d0', '#e0c0ff', '#ffe08a'], fruit: '#c07080'
    };
    /* forest / garden — bright leafy greens like The Void */
    return {
      leaf: biome === 'garden'
        ? ['#145028', '#228038', '#3aa848', '#6ad058']
        : ['#12301c', '#1f5a2c', '#2f8038', '#58a84a'],
      trunk: ['#4a3020', '#7a5a38', '#a88050', '#d0a870'],
      grass: biome === 'garden'
        ? ['#228038', '#3aa848', '#6ad058']
        : ['#1f5a2c', '#2f8038', '#58a84a'],
      flower: ['#ff6a8a', '#ffe03a', '#ff8a30', '#8a5aff'], fruit: '#d04030'
    };
  }

  function rngAt(a, b, seed) {
    var n = 0;
    return function () { n += 1; return T.hash(a + n * 17, b, seed); };
  }
  function ri(r, a, b) { return a + ((r() * (b - a + 1)) | 0); }
  function rr(r, a, b) { return a + r() * (b - a); }

  function tonePal(pal, v, x, y) {
    var n = pal.length - 1, t = T.clamp(v, 0, 1) * n, i = t | 0;
    if (i >= n) return pal[n];
    return (t - i) > T.bayer(x | 0, y | 0) ? pal[i + 1] : pal[i];
  }
  function asHex(c) { return typeof c === 'string' ? c : ('#' + [c[0], c[1], c[2]].map(function (n) { n = T.clamp(n, 0, 255) | 0; return (n < 16 ? '0' : '') + n.toString(16); }).join('')); }
  function setPx(d, w, h, x, y, col) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    var c = typeof col === 'string' ? T.hex(col) : col;
    var o = (y * w + x) * 4;
    d[o] = c[0] | 0; d[o + 1] = c[1] | 0; d[o + 2] = c[2] | 0; d[o + 3] = 255;
  }
  function getA(d, w, h, x, y) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= w || y >= h) return 0;
    return d[(y * w + x) * 4 + 3];
  }
  function leafBlob(d, w, h, cx, cy, rx, ry, pal) {
    var x, y, dx, dy, x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx), y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      dx = (x + 0.5 - cx) / Math.max(0.6, rx); dy = (y + 0.5 - cy) / Math.max(0.6, ry);
      if (dx * dx + dy * dy <= 1) setPx(d, w, h, x, y, tonePal(pal, (1 - dy) * 0.45 + (-dx) * 0.22 + 0.22, x, y));
    }
  }
  function mkCan(d, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h);
    img.data.set(d); g.putImageData(img, 0, 0); return c;
  }
  function alloc(w, h) { return new Uint8ClampedArray(w * h * 4); }

  var vegCache = {};
  function procVeg(kind, variant, biome) {
    var key = kind + ':' + (variant | 0) + ':' + (biome || 'garden');
    if (vegCache[key]) return vegCache[key];
    var pal = vegPal(biome), r = rngAt(variant | 0, kind.length * 13, (variant * 997) ^ (kind.charCodeAt(0) * 131));
    var snowy = (biome === 'ice' || biome === 'tundra');
    var c;
    if (kind === 'pine' || kind === 'tallpine') c = makePine(r, pal, snowy, kind === 'tallpine');
    else if (kind === 'palm') c = makePalm(r, pal);
    else if (kind === 'cactus' || kind === 'saguaro') c = makeCactus(r, pal, kind === 'saguaro');
    else if (kind === 'bush') c = makeBush(r, pal);
    else if (kind === 'fern') c = makeFern(r, pal);
    else if (kind === 'mush') c = makeMush(r, pal, biome);
    else if (kind === 'tuft') c = makeTuft(r, pal);
    else if (kind === 'flower' || kind === 'garden') c = makeFlower(r, pal, kind === 'garden');
    else if (kind === 'spire') c = makeSpire(r, pal, snowy, biome);
    else if (kind === 'rock') c = makeRock(r, pal, biome);
    else if (kind === 'willow') c = makeWillow(r, pal);
    else if (kind === 'birch') c = makeOak(r, pal, { birch: 1 });
    else if (kind === 'fruit') c = makeOak(r, pal, { fruit: 1 });
    else c = makeOak(r, pal, {}); /* tree, oak, default */
    return (vegCache[key] = c);
  }

  function makeOak(r, pal, opt) {
    opt = opt || {};
    var H = ri(r, 30, 44), W = ri(r, 22, 34), d = alloc(W, H), cx = W / 2, tw = ri(r, 3, 4), th = ri(r, 10, 15), x, y, i;
    var trunk = opt.birch ? ['#f0ece0', '#d8d0c0', '#c0b8a8', '#3a2a20'] : pal.trunk;
    for (y = 0; y < th; y++) for (x = 0; x < tw + (y > th - 3 ? 1 : 0); x++) {
      var tx = (cx - tw / 2 + x) | 0, ty = H - 1 - y;
      var col = tonePal(trunk, 0.8 - x / tw * 0.7, tx, ty);
      if (opt.birch && y % 5 === 2) col = trunk[3];
      setPx(d, W, H, tx, ty, col);
    }
    /* short forks into the canopy */
    var topY = H - th;
    for (i = 0; i < 2; i++) {
      var dir = i ? 1 : -1, fx = cx | 0, fy = topY + 3, k;
      for (k = 0; k < 5; k++) { fx += dir; fy -= 1; setPx(d, W, H, fx, fy, trunk[1]); }
    }
    var n = ri(r, 5, 7);
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + rr(r, 0, 1), dist = i === 0 ? 0 : rr(r, W * 0.12, W * 0.28);
      leafBlob(d, W, H, cx + Math.cos(a) * dist, topY * 0.55 + Math.sin(a) * dist * 0.6 + 2, rr(r, W * 0.22, W * 0.34), rr(r, W * 0.2, W * 0.3), pal.leaf);
    }
    for (i = 0; i < 16; i++) {
      x = ri(r, 2, W - 3); y = ri(r, 2, topY + 2);
      if (getA(d, W, H, x, y)) setPx(d, W, H, x, y, pal.leaf[i % 2 ? 3 : 0]);
    }
    if (opt.fruit) {
      for (i = 0; i < 5; i++) {
        x = ri(r, 5, W - 6); y = ri(r, 4, topY + 4);
        if (getA(d, W, H, x, y)) { setPx(d, W, H, x, y, pal.fruit || '#d04030'); setPx(d, W, H, x + 1, y, pal.fruit || '#d04030'); }
      }
    }
    return mkCan(d, W, H);
  }
  function makeWillow(r, pal) {
    var H = ri(r, 30, 42), W = ri(r, 26, 36), d = alloc(W, H), cx = W / 2, th = 12, x, y, i, s;
    for (y = 0; y < th; y++) for (x = 0; x < 3; x++) setPx(d, W, H, (cx - 1 + x) | 0, H - 1 - y, tonePal(pal.trunk, 0.7 - x * 0.25, x, y));
    leafBlob(d, W, H, cx, 8, W * 0.38, 7, pal.leaf);
    for (i = 0; i < 7; i++) {
      var ax = 3 + i * ((W - 6) / 6), len = 10 + (i % 3) * 3;
      for (s = 0; s < len; s++) setPx(d, W, H, ax + Math.sin(s * 0.4) * 0.6, 12 + s, pal.leaf[s % 3 === 0 ? 2 : 1]);
    }
    return mkCan(d, W, H);
  }
  function makePine(r, pal, snowy, tall) {
    var H = ri(r, tall ? 38 : 32, tall ? 52 : 44), W = Math.round(H * rr(r, 0.48, 0.6)) | 1, d = alloc(W, H);
    var cx = (W - 1) / 2, tiers = ri(r, 4, 6), tH = (H - 4) / tiers, x, y;
    for (y = 0; y < H - 4; y++) {
      var t = y / (H - 4), tier = Math.floor(y / tH), ty = (y - tier * tH) / tH;
      var hw = (0.18 + ty * 0.82) * cx * (0.3 + 0.7 * (tier + 1) / tiers) + 0.6;
      for (x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        var v = 0.5 - (x - cx) / (cx + 1) * 0.5 + (ty < 0.22 ? 0.14 : 0) - ty * 0.15;
        var col = tonePal(pal.leaf, v, x, y);
        if (snowy && ty < 0.38 && Math.abs(x - cx) < hw - 0.5) col = tonePal(pal.snow || ['#c8d8f0', '#ffffff'], 0.6 - (x - cx) / (cx + 1) * 0.25 + (1 - ty) * 0.3, x, y);
        setPx(d, W, H, x, y, col);
      }
    }
    setPx(d, W, H, cx | 0, H - 3, pal.trunk[1]); setPx(d, W, H, (cx | 0) + 1, H - 3, pal.trunk[0]);
    setPx(d, W, H, cx | 0, H - 2, pal.trunk[1]); setPx(d, W, H, (cx | 0) + 1, H - 2, pal.trunk[1]);
    setPx(d, W, H, cx | 0, H - 1, pal.trunk[0]); setPx(d, W, H, (cx | 0) + 1, H - 1, pal.trunk[0]);
    return mkCan(d, W, H);
  }
  function makePalm(r, pal) {
    var H = ri(r, 32, 44), W = 36, d = alloc(W, H), lean = rr(r, -5, 5), bx = W / 2 - lean * 0.4, i, s, pts = [];
    for (i = 0; i <= H - 6; i++) {
      var t = i / (H - 6), x = bx + lean * t * t * 1.4, y = H - 1 - i;
      pts.push([x, y]); setPx(d, W, H, x, y, pal.trunk[i % 4 < 2 ? 1 : 0]); setPx(d, W, H, x + 1, y, pal.trunk[i % 4 < 2 ? 2 : 1]);
    }
    var top = pts[pts.length - 1], n = 7;
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI - Math.PI, len = rr(r, 9, 13);
      var ex = top[0] + Math.cos(a) * len, ey = top[1] + Math.sin(a) * len * 0.35 + len * 0.45 * Math.abs(Math.cos(a));
      var mx = (top[0] + ex) / 2, my = Math.min(top[1], ey) - 3 - rr(r, 0, 2);
      for (s = 0; s <= 18; s++) {
        var u = s / 18;
        var xx = (1 - u) * (1 - u) * top[0] + 2 * u * (1 - u) * mx + u * u * ex;
        var yy = (1 - u) * (1 - u) * top[1] + 2 * u * (1 - u) * my + u * u * ey;
        setPx(d, W, H, xx, yy, pal.leaf[2 - (s % 5 === 0 ? 1 : 0)]);
        setPx(d, W, H, xx, yy + 1, pal.leaf[1]);
        if (s % 3 === 0) setPx(d, W, H, xx, yy + 2, pal.leaf[0]);
      }
    }
    return mkCan(d, W, H);
  }
  function makeCactus(r, pal, tall) {
    var H = ri(r, tall ? 24 : 16, tall ? 36 : 28), W = 18, d = alloc(W, H), cx = 9, cols = pal.leaf;
    function stem(x, y0, y1, wd) {
      var y, i;
      for (y = y0; y <= y1; y++) for (i = 0; i < wd; i++) setPx(d, W, H, x + i, y, tonePal(cols, 0.85 - i / wd * 0.7 + (i === 1 && y % 3 === 0 ? -0.05 : 0), x + i, y));
      setPx(d, W, H, x + 1, y0 - 1, cols[2]); setPx(d, W, H, x + wd - 2, y0 - 1, cols[1]);
    }
    stem(cx - 2, 2, H - 1, 4); setPx(d, W, H, cx - 1, 1, cols[2]); setPx(d, W, H, cx, 1, cols[2]);
    var arms = ri(r, 1, tall ? 2 : 2), a;
    for (a = 0; a < arms; a++) {
      var side = a ? 1 : -1, ay = ri(r, (H * 0.4) | 0, (H * 0.7) | 0), len = ri(r, 4, 6), i;
      for (i = 0; i < len; i++) setPx(d, W, H, side < 0 ? cx - 2 - i - 1 : cx + 2 + i, ay, cols[side < 0 ? 2 : 1]);
      stem(side < 0 ? cx - 2 - len - 1 : cx + 2 + len - 1, ay - ri(r, 4, 7), ay + 2, 3);
    }
    if (pal.flower && r() < 0.7) { var fl = pal.flower[0] || pal.flower; setPx(d, W, H, cx - 1, 0, fl); setPx(d, W, H, cx, 0, fl); }
    return mkCan(d, W, H);
  }
  function makeBush(r, pal) {
    var W = ri(r, 12, 18), H = ri(r, 8, 12), d = alloc(W, H), i;
    for (i = 0; i < 3; i++) leafBlob(d, W, H, W * (0.28 + i * 0.22), H * 0.62, W * 0.3, H * 0.42, pal.leaf);
    for (i = 0; i < 8; i++) {
      var x = ri(r, 1, W - 2), y = ri(r, 1, H - 2);
      if (getA(d, W, H, x, y)) setPx(d, W, H, x, y, i < 3 && pal.fruit ? pal.fruit : pal.leaf[3]);
    }
    return mkCan(d, W, H);
  }
  function makeFern(r, pal) {
    var W = 16, H = 12, d = alloc(W, H), i, s;
    for (i = 0; i < 6; i++) {
      var a = -Math.PI + (i / 5) * Math.PI, len = rr(r, 6, 9);
      for (s = 0; s <= len; s++) {
        var u = s / len, x = 8 + Math.cos(a) * s, y = H - 2 + Math.sin(a) * s * 0.9 + u * u * 4 * Math.abs(Math.cos(a));
        setPx(d, W, H, x, y, pal.leaf[s % 3 === 0 ? 2 : 1]);
        if (s % 2 === 0) setPx(d, W, H, x, y + 1, pal.leaf[0]);
      }
    }
    return mkCan(d, W, H);
  }
  function makeMush(r, pal, biome) {
    var W = 9, H = 10, d = alloc(W, H);
    var cap = biome === 'ice' ? ['#7aa0c8', '#c0d8f0', '#ffffff'] : (biome === 'lava' ? ['#7a1a12', '#c04028', '#ff8060'] : ['#7a2a2a', '#e05050', '#ff9a9a']);
    var y, x;
    for (y = 4; y < H; y++) { setPx(d, W, H, 4, y, '#e8e0d0'); setPx(d, W, H, 5, y, '#d8d0c0'); }
    for (y = 1; y <= 5; y++) for (x = 1; x <= 7; x++) {
      var dx = (x - 4) / 3.4, dy = (y - 3) / 2.6;
      if (dx * dx + dy * dy <= 1 && dy < 0.35) setPx(d, W, H, x, y, tonePal(cap, (1 - dy) * 0.5 + 0.2, x, y));
    }
    setPx(d, W, H, 2, 2, '#fff'); setPx(d, W, H, 6, 3, '#fff');
    return mkCan(d, W, H);
  }
  function makeTuft(r, pal) {
    var W = 9, H = ri(r, 5, 9), d = alloc(W, H), i, y, g = pal.grass || pal.leaf;
    for (i = 0; i < 6; i++) {
      var bx = ri(r, 1, W - 2), bh = ri(r, 3, H), sw = ri(r, -1, 1);
      for (y = 0; y < bh; y++) setPx(d, W, H, bx + (y > bh * 0.5 ? sw : 0), H - 1 - y, g[Math.min(g.length - 1, 1 + (y > bh * 0.6 ? 1 : 0))]);
    }
    return mkCan(d, W, H);
  }
  function makeFlower(r, pal, bed) {
    var W = bed ? 15 : 9, H = bed ? 8 : 8, d = alloc(W, H), fl = pal.flower || ['#ff6a8a', '#ffe03a'], g = pal.grass || pal.leaf, i, y;
    var n = bed ? 4 : 1;
    for (i = 0; i < n; i++) {
      var x = bed ? 2 + i * 3 : 4, col = fl[i % fl.length];
      for (y = 0; y < 4; y++) setPx(d, W, H, x, H - 1 - y, g[1]);
      setPx(d, W, H, x, H - 5, col); setPx(d, W, H, x - 1, H - 4, col); setPx(d, W, H, x + 1, H - 4, col); setPx(d, W, H, x, H - 4, '#ffe27a'); setPx(d, W, H, x, H - 3, col);
    }
    return mkCan(d, W, H);
  }
  function makeSpire(r, pal, snowy, biome) {
    var W = ri(r, 10, 18), H = ri(r, 18, 32), d = alloc(W, H);
    var cols = biome === 'lava'
      ? ['#2a0e0c', '#5a2010', '#8a3a18', '#c06028']
      : (snowy ? (pal.snow || ['#3a6aa0', '#7ab8e8', '#c8ecff', '#ffffff']) : ['#3a6aa0', '#7ab8e8', '#c8ecff', '#ffffff']);
    var n = ri(r, 2, 4), i, x, y;
    for (i = 0; i < n; i++) {
      var bx = W * (0.2 + 0.6 * (i / (n - 1 || 1))), h = H * rr(r, 0.5, 1), w = rr(r, 2, 3.5);
      for (y = 0; y < h; y++) {
        var t = y / h, hw = w * (1 - t);
        for (x = -hw; x <= hw; x++) setPx(d, W, H, bx + x, H - 1 - y, cols[x < -0.5 ? 2 : (x < w * 0.4 ? 1 : 0)]);
      }
      setPx(d, W, H, bx - 1, H - h + 2, cols[3] || cols[2]);
    }
    return mkCan(d, W, H);
  }
  function makeRock(r, pal, biome) {
    var W = ri(r, 8, 16), H = ri(r, 5, 10), d = alloc(W, H);
    var cols = biome === 'ice' ? ['#6a7a8a', '#8aa0b0', '#c0d0dc', '#e8f0f6']
      : biome === 'lava' ? ['#2a1210', '#5a2a1a', '#8a4a2a', '#c07040']
      : biome === 'desert' ? ['#5a3a2a', '#8a5a3a', '#bc8a5a', '#e0b888']
      : ['#3a3548', '#6a6478', '#a49cb4', '#d4cce0'];
    var x, y;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var dx = (x + 0.5 - W / 2) / (W / 2), dy = (y + 0.5 - H * 0.65) / (H * 0.65);
      if (dx * dx + dy * dy <= 1 && y > H * 0.15) setPx(d, W, H, x, y, tonePal(cols, 0.85 - x / W * 0.5 - y / H * 0.2, x, y));
    }
    return mkCan(d, W, H);
  }

  S.sprite = function (kind, variant, biome) {
    if (BUILD[kind] || SPR[kind]) return asciiSprite(kind);
    return procVeg(kind, variant == null ? 1 : variant, biome || 'garden');
  };

  var SKY_DAY = {
    ocean:  ['#2a70c8', '#4a98d8', '#7ec8f0', '#c0ecff'],
    forest: ['#3a78d8', '#4a8ae0', '#7ab8f0', '#bfe6ff'],
    garden: ['#3a80d8', '#58a0e8', '#90d0f8', '#d0f0ff'],
    desert: ['#4a90d8', '#78b0e0', '#c8d8e8', '#ffe4b8'],
    tundra: ['#4a80c8', '#6aa0dc', '#a8d0f0', '#e0f0fc'],
    ice:    ['#5a98e0', '#7ab4ec', '#b8e0f8', '#e8f6ff'],
    lava:   ['#3a0c0c', '#6a1c10', '#a83814', '#d06020'],
    storm:  ['#4a6888', '#6a88a8', '#98b0c4', '#c8d8e4']
  };
  var SKY_NIGHT = {
    ocean:  ['#040a18', '#0c1830', '#142848', '#1a3860'],
    forest: ['#04051a', '#0a1028', '#141a3a', '#1a1a4a'],
    garden: ['#04051a', '#0a1028', '#141a3a', '#1a1a4a'],
    desert: ['#050818', '#101028', '#1c1838', '#2a2040'],
    tundra: ['#040a22', '#0c1428', '#14203a', '#1a2a5a'],
    ice:    ['#040a22', '#0c1428', '#14203a', '#1a2a5a'],
    lava:   ['#120404', '#220808', '#3a0e08', '#4a1608'],
    storm:  ['#080814', '#101020', '#1a1a30', '#24243a']
  };
  var SKY_DUSK = {
    ocean:  ['#2a2a6a', '#5a3a8a', '#c07060', '#ffa060'],
    forest: ['#4a3a8a', '#6a3a7a', '#e08050', '#ffa060'],
    garden: ['#4a3a8a', '#6a3a7a', '#e08050', '#ffa060'],
    desert: ['#5a3a7a', '#8a3a5a', '#ff8850', '#ffc080'],
    tundra: ['#5a4a9a', '#8a5080', '#ffb0a0', '#ffe0c0'],
    ice:    ['#5a4a9a', '#8a5080', '#ffb0a0', '#ffe0c0'],
    lava:   ['#2a0808', '#5a1408', '#a83a12', '#e06020'],
    storm:  ['#2a2a48', '#4a3a68', '#8a6080', '#c09080']
  };
  var FAR = {
    ocean:  ['#88b8c8', '#6a9aa8', '#4a7a88'],
    forest: ['#a8c0d8', '#88a8b8', '#5a8a78'],
    garden: ['#a8d0c8', '#88b8a0', '#5a9a78'],
    desert: ['#c8c0a8', '#b0a888', '#8a7a58'],
    tundra: ['#b0c4d4', '#90a8b8', '#708890'],
    ice:    ['#c0d4e8', '#a0b8d0', '#88a0b8'],
    lava:   ['#8a3a22', '#6a2a1a', '#4a1a10'],
    storm:  ['#8a90a0', '#6a7080', '#4a5060']
  };
  var MID = {
    ocean:  ['#4a9a68', '#2a7a48', '#1a5a34'],
    forest: ['#5a9a68', '#3a7a48', '#2a5a34'],
    garden: ['#4aaa60', '#2a8a40', '#1a6a30'],
    desert: ['#c4a068', '#a08048', '#7a6030'],
    tundra: ['#7a8a80', '#5a6a64', '#3a4a48'],
    ice:    ['#90b0c4', '#7090a8', '#507088'],
    lava:   ['#8a3a24', '#6a2818', '#4a1c10'],
    storm:  ['#4a5a48', '#3a4a38', '#2a3a28']
  };
  var GRASS = {
    ocean:  ['#186828', '#28a040', '#48c058', '#70d878'],
    forest: ['#1a5820', '#2a7830', '#3c9a40', '#58b850'],
    garden: ['#228038', '#3aa848', '#58c860', '#7ae070'],
    desert: ['#8a7a3a', '#b8a050', '#dcc878', '#f0e090'],
    tundra: ['#4a5a44', '#6a7a64', '#8a9a84', '#a8b8a4'],
    ice:    ['#c0d0dc', '#d8e4ec', '#e8f0f6', '#f6fafc'],
    lava:   ['#3a1810', '#5a2414', '#7a3018', '#9a3c1c'],
    storm:  ['#3a4a38', '#4a5a48', '#5a6a58', '#6a7a68']
  };
  var DIRT = {
    ocean:  ['#5a3e24', '#4a301c', '#3a2414', '#2a180c'],
    forest: ['#5a3e24', '#4a301c', '#3a2414', '#2a180c'],
    garden: ['#6a4a28', '#5a3a1c', '#4a2c14', '#2a180c'],
    desert: ['#c49058', '#a07038', '#8a5828', '#6a4018'],
    tundra: ['#5a544c', '#4a443c', '#3a3430', '#2a2420'],
    ice:    ['#8a9aaa', '#6a7a8a', '#5a6a7a', '#4a5a6a'],
    lava:   ['#3a1810', '#2a1010', '#1c0c0a', '#100606'],
    storm:  ['#4a3424', '#3a281c', '#2a1c14', '#1c120c']
  };
  var WATER = ['#1a5a88', '#2a80b0', '#48b0d0', '#70d0e8', '#a0e4f4'];
  var RINGCOL = { gold:['#e8c868','#c4a040'], ice:['#c0d8e8','#88a8c0'], rose:['#e8a0b0','#c07080'], dust:['#c8b898','#8a7a60'], jade:['#88c898','#408060'], violet:['#b898d0','#685088'] };
  var CLOUD_PAL = {
    ocean:  ['#c4d0ea', '#e6ecf8', '#ffffff'],
    forest: ['#c4d0ea', '#e6ecf8', '#ffffff'],
    garden: ['#c4d0ea', '#e6ecf8', '#ffffff'],
    desert: ['#e8d0b0', '#f8ecd8', '#ffffff'],
    tundra: ['#c0d4f0', '#e4f0ff', '#ffffff'],
    ice:    ['#c0d4f0', '#e4f0ff', '#ffffff'],
    lava:   ['#4a2018', '#7a3a28', '#a06048'],
    storm:  ['#9aa8bc', '#c0c8d8', '#e4e8f0']
  };

  var WALK_F = 0.63, RELIEF_BASE = 8;
  function heightAt(x, seed, land, biome) {
    var n = T.fbm2(x * 0.018, seed * 0.01, seed, 5);
    var h = RELIEF_BASE + n * 10;
    if (biome === 'desert') h = 7 + T.ridged3(x * 0.025, 0, 2, seed, 3) * 8;
    if (biome === 'ice') h = 9 + n * 6;
    if (biome === 'lava') h = 7 + T.fbm2(x * 0.035, 1, seed, 3) * 10;
    if (biome === 'ocean') h = 6 + n * 8;
    var sea = 5 + (1 - land) * 8;
    return { ground: h, sea: sea };
  }
  function walkLine(H) { return (H * WALK_F) | 0; }
  function dirtBottom(H, walk) { return Math.min(H, walk + Math.max(28, (H * 0.22) | 0)); }
  function wrapDist(a, b) { var d = Math.abs(a - b); return Math.min(d, WORLD - d); }

  S.makeWorld = function (planet) {
    var spec = T.cleanSpec(planet);
    var seed = spec.seed >>> 0, h = new Float32Array(WORLD), sea, i, info;
    for (i = 0; i < WORLD; i++) { info = heightAt(i, seed, spec.land, spec.biome); h[i] = info.ground; sea = info.sea; }
    for (var pass = 0; pass < 3; pass++) {
      var h2 = h.slice();
      for (i = 0; i < WORLD; i++) {
        var l = h[(i + WORLD - 1) % WORLD], rgt = h[(i + 1) % WORLD];
        if (h[i] > sea && l <= sea && rgt <= sea && h[i] - sea < 4) h2[i] = Math.min(l, rgt);
        else if (h[i] <= sea && l > sea && rgt > sea) h2[i] = Math.min(l, rgt);
      }
      h = h2;
    }
    var decor = [];
    function kindAt(i) {
      var b = spec.biome, r = T.hash(i, 2, seed);
      if (b === 'desert') return r < 0.22 ? 'cactus' : (r < 0.36 ? 'saguaro' : (r < 0.5 ? 'bush' : (r < 0.68 ? 'tuft' : (r < 0.84 ? 'rock' : 'flower'))));
      if (b === 'ice') return r < 0.3 ? 'spire' : (r < 0.5 ? 'tallpine' : (r < 0.68 ? 'pine' : (r < 0.82 ? 'rock' : 'tuft')));
      if (b === 'tundra') return r < 0.28 ? 'pine' : (r < 0.46 ? 'tallpine' : (r < 0.6 ? 'bush' : (r < 0.78 ? 'tuft' : 'rock')));
      if (b === 'ocean') return r < 0.28 ? 'palm' : (r < 0.42 ? 'bush' : (r < 0.58 ? 'tuft' : (r < 0.74 ? 'flower' : (r < 0.88 ? 'rock' : 'tree'))));
      if (b === 'lava') return r < 0.28 ? 'rock' : (r < 0.48 ? 'spire' : (r < 0.68 ? 'cactus' : (r < 0.84 ? 'saguaro' : 'tuft')));
      if (b === 'forest') return r < 0.1 ? 'mush' : (r < 0.2 ? 'fern' : (r < 0.32 ? 'tuft' : (r < 0.42 ? 'flower' : (r < 0.52 ? 'bush' : (r < 0.64 ? 'tallpine' : (r < 0.76 ? 'oak' : (r < 0.86 ? 'pine' : 'birch')))))));
      /* garden */
      return r < 0.1 ? 'garden' : (r < 0.22 ? 'flower' : (r < 0.36 ? 'bush' : (r < 0.46 ? 'tuft' : (r < 0.54 ? 'mush' : (r < 0.66 ? 'oak' : (r < 0.76 ? 'fruit' : (r < 0.86 ? 'willow' : 'tree')))))));
    }
    for (i = 0; i < WORLD; ) {
      var step = 4 + ((T.hash(i, seed, 3) * 8) | 0);
      if (h[i] > sea + 1 && T.hash(i, 9, seed) < 0.82 && wrapDist(i, 120) > 20) {
        decor.push({ kind: kindAt(i), x: i, sc: 1, flip: T.hash(i, 12, seed) > 0.5, v: i });
      }
      i += step;
    }
    /* extra ground cover so the lip isn't bare between trees */
    var bfill = spec.biome;
    for (i = 2; i < WORLD; i += 2 + ((T.hash(i, 21, seed) * 4) | 0)) {
      if (h[i] <= sea + 1) continue;
      if (wrapDist(i, 120) < 8) continue;
      if (T.hash(i, 22, seed) < 0.55) {
        var rr2 = T.hash(i, 23, seed), fill;
        if (bfill === 'desert') fill = rr2 < 0.55 ? 'tuft' : (rr2 < 0.85 ? 'rock' : 'flower');
        else if (bfill === 'lava') fill = rr2 < 0.65 ? 'rock' : 'tuft';
        else if (bfill === 'ice' || bfill === 'tundra') fill = rr2 < 0.65 ? 'tuft' : 'rock';
        else if (bfill === 'ocean') fill = rr2 < 0.55 ? 'tuft' : (rr2 < 0.88 ? 'flower' : 'rock');
        else fill = rr2 < 0.52 ? 'tuft' : (rr2 < 0.88 ? 'flower' : 'mush');
        decor.push({ kind: fill, x: i, sc: 1, flip: false, v: i + 50 });
      }
    }
    var waters = [];
    if (spec.biome !== 'lava' && spec.land < 0.95) {
      var best = 40, bestSum = 1e9, j, s, pondW, drop;
      for (i = 20; i < WORLD - 20; i++) {
        s = 0;
        for (j = 0; j < 56; j++) s += h[(i + j) % WORLD];
        if (s < bestSum) { bestSum = s; best = i; }
      }
      pondW = 44 + ((T.hash(best, 3, seed) * 28) | 0);
      for (j = 0; j < pondW; j++) {
        var edge = Math.min(j, pondW - 1 - j);
        drop = sea - (edge < 5 ? 0.6 : (edge < 12 ? 2.2 : 3.4));
        h[(best + j) % WORLD] = Math.min(h[(best + j) % WORLD], drop);
      }
      waters.push({ type: 'pond', x: best, w: pondW });
      if (spec.land > 0.35) {
        var dir = T.hash(best, 8, seed) < 0.5 ? 1 : -1, sx = best + (dir > 0 ? pondW : 0), sl = 28 + ((T.hash(best, 9, seed) * 36) | 0);
        for (j = 0; j < sl; j++) {
          var si = (sx + dir * j + WORLD) % WORLD;
          h[si] = Math.min(h[si], sea - 0.8 - Math.sin(j * 0.2) * 0.4);
        }
        waters.push({ type: 'stream', x: (sx + WORLD) % WORLD, w: sl, dir: dir });
      }
    }
    return { w: WORLD, h: h, sea: sea, spec: spec, planet: planet, decor: decor, seed: seed, waters: waters };
  };

  function groundY(world, x, H, horizon) {
    var i = ((Math.round(x) % WORLD) + WORLD) % WORLD;
    return horizon - (world.h[i] - RELIEF_BASE);
  }

  var player = { x: 120, vx: 0, vy: 0, on: 1, walk: 0, face: 1, idle: 0 };
  S.player = player;
  S.landT = 1;
  S.camY = 0;
  S.fx = [];

  S.burst = function (x, y, n, cols) {
    n = n || 16;
    cols = cols || [[232, 220, 180], [180, 140, 80], [255, 255, 240], [120, 90, 50]];
    var i;
    for (i = 0; i < n; i++) {
      S.fx.push({ x: x + (Math.random() * 10 - 5), y: y, vx: Math.random() * 70 - 35, vy: -24 - Math.random() * 50, life: 0.4 + Math.random() * 0.45, t: 0, c: cols[(Math.random() * cols.length) | 0] });
    }
  };

  S.takeT = -1;
  S.resetPlayer = function (world, W, H) {
    player.x = 120; player.vx = 0; player.vy = 0; player.on = 0; player.walk = 0; player.face = 1; player.idle = 0;
    S.landT = T.reduced ? 1 : 0;
    S.takeT = -1;
    S.camY = T.reduced ? 0 : (H * 0.42);
    S.fx = [];
    S._py = null;
  };
  S.beginTakeoff = function (H) {
    S.takeT = 0;
    S.takeH = H;
    player.vx = 0;
  };

  S.step = function (world, dt, keys, W, H) {
    var horizon = walkLine(H);
    if (S.takeT >= 0 && S.takeT < 1) {
      S.takeT = Math.min(1, S.takeT + dt / 1.65);
      var te = S.takeT * S.takeT * (3 - 2 * S.takeT);
      S.camY = (H * 0.55) * te;
      var gyT = groundY(world, player.x, H, horizon) - 16;
      S._py = gyT - te * H * 0.85;
      player.on = 0;
    } else if (S.landT < 1) {
      S.landT = Math.min(1, S.landT + dt / 2.35);
      var u = S.landT, e = 1 - Math.pow(1 - u, 2.2);
      S.camY = (H * 0.42) * (1 - e);
      if (u > 0.92 && S.camY < 2) S.camY = 0;
      var startY = horizon - H * 0.9, gy = groundY(world, player.x, H, horizon) - 16;
      var drop = T.clamp((u - 0.28) / 0.62, 0, 1);
      drop = 1 - Math.pow(1 - drop, 2);
      S._py = startY + (gy - startY) * drop;
      if (S.landT >= 1) {
        player.on = 1; S._py = gy; S.camY = 0;
        S.burst(player.x, gy + 16, 28, [[200, 180, 140], [120, 90, 50], [240, 230, 200], [80, 60, 40]]);
        if (T.sfx && T.sfx.land) T.sfx.land();
      }
    } else {
      S.camY *= Math.exp(-10 * dt);
      if (S.camY < 0.5) S.camY = 0;
      var ax = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      if (ax) player.face = ax;
      player.vx = ax * 58;
      if (keys.jump && player.on) { player.vy = -168; player.on = 0; if (T.sfx) T.sfx.jump(); }
      player.vy += 440 * dt;
      player.x = (player.x + player.vx * dt + WORLD) % WORLD;
      player.walk += Math.abs(player.vx) * dt * 0.2;
      player.idle += dt;
      var gy2 = groundY(world, player.x, H, horizon);
      var py = (S._py == null ? gy2 - 16 : S._py) + player.vy * dt;
      if (world.h[((Math.round(player.x) % WORLD) + WORLD) % WORLD] <= world.sea + 0.5 && py + 16 > horizon - (world.sea - RELIEF_BASE)) {
        py = Math.min(py, horizon - (world.sea - RELIEF_BASE) - 12);
        player.vy = Math.min(player.vy, 20);
      }
      if (py + 16 >= gy2 && player.vy >= 0) { py = gy2 - 16; player.vy = 0; player.on = 1; }
      else player.on = 0;
      S._py = py;
    }
    var i, p;
    for (i = S.fx.length - 1; i >= 0; i--) {
      p = S.fx[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt;
      if (p.t > p.life) S.fx.splice(i, 1);
    }
    keys.jump = 0;
  };
  S.placeX = function () { return player.x; };

  function wrapX(x, camX, W) {
    var sx = x - camX;
    if (sx < -32) sx += WORLD; if (sx > W + 32) sx -= WORLD;
    return sx;
  }

  function put(d, W, H, x, y, r, g, b) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    var o = (y * W + x) * 4;
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
  }

  /* 16x20 adventurer: walk 4, idle bob, jump */
  function drawPlayer(ctx, x, y, t) {
    var px = (x | 0) - 8, py = (y | 0);
    var walk = Math.abs(player.vx) > 1 && player.on;
    var frame = walk ? ((player.walk * 1.4) | 0) % 4 : 0;
    var bob = player.on && !walk ? (((t * 2) | 0) % 2) : 0;
    if (walk) py += (frame === 1 || frame === 3) ? 1 : 0;
    py += bob;
    px = Math.round(px); py = Math.round(py);
    var f = player.face < 0;
    function p(xx, yy, c) { ctx.fillStyle = c; ctx.fillRect(px + (f ? 15 - xx : xx), py + yy, 1, 1); }
    var skin = '#e8c89a', hair = '#3a2410', shirt = '#3a6a48', lite = '#5a8a60', pant = '#2a2a38', boot = '#2a1a10', ink = '#1a1008', pack = '#5a4030', blush = '#c08070';
    ctx.fillStyle = 'rgba(10,6,4,.4)';
    ctx.fillRect(px + 4, py + 19, 8, 1);
    /* hair / hat */
    var hx;
    for (hx = 4; hx <= 11; hx++) p(hx, 1, hair);
    for (hx = 3; hx <= 12; hx++) p(hx, 2, hair);
    p(3, 3, hair); p(12, 3, hair); p(4, 0, hair); p(5, 0, hair); p(10, 0, hair);
    /* face */
    for (hx = 5; hx <= 10; hx++) { p(hx, 3, skin); p(hx, 4, skin); p(hx, 5, skin); }
    p(f ? 9 : 6, 4, ink); p(f ? 6 : 9, 4, ink);
    p(7, 5, blush); p(8, 5, blush);
    /* scarf / shirt */
    for (hx = 4; hx <= 11; hx++) { p(hx, 6, shirt); p(hx, 7, lite); p(hx, 8, shirt); p(hx, 9, shirt); }
    p(3, 7, shirt); p(12, 7, shirt);
    p(f ? 12 : 3, 6, pack); p(f ? 12 : 3, 7, pack); p(f ? 13 : 2, 7, pack);
    /* arms */
    var arm = walk ? (frame === 0 || frame === 1 ? 1 : -1) : 0;
    if (!player.on) arm = 1;
    p(2, 7 + arm, skin); p(13, 7 - arm, skin);
    p(2, 8 + arm, shirt); p(13, 8 - arm, shirt);
    /* legs */
    var l = 0, r = 0;
    if (walk) { l = (frame === 0 ? -1 : frame === 1 ? 0 : frame === 2 ? 1 : 0); r = -l; }
    if (!player.on) { l = -1; r = 1; }
    p(6, 10, pant); p(6, 11, pant); p(6 + l, 12, pant); p(6 + l, 13, boot); p(6 + l, 14, boot);
    p(9, 10, pant); p(9, 11, pant); p(9 + r, 12, pant); p(9 + r, 13, boot); p(9 + r, 14, boot);
    p(5, 6, lite);
  }

  function hillH(wx, seed, freq, amp, off) {
    return T.fbm2(wx * freq, 4 + off, seed, 3) * amp + amp * 0.3;
  }


  function skyTod(planet, spec) {
    var t = (planet && (planet.tod || planet.sky || planet.dayNight)) || spec.tod || spec.sky || 'day';
    if (t === 'night' || t === 'dusk') return t;
    return 'day';
  }

  S.draw = function (ctx, world, camX, W, H, t) {
    var spec = world.spec, biome = spec.biome;
    var grass = GRASS[biome] || GRASS.forest, dirt = DIRT[biome] || DIRT.forest;
    var farC = FAR[biome] || FAR.forest, midC = MID[biome] || MID.forest;
    var seed = world.seed || spec.seed;
    var horizon = walkLine(H);
    var camY = (S.camY | 0);
    camX = camX | 0;
    var tod = skyTod(world.planet, spec);
    var skyPal = (tod === 'night' ? SKY_NIGHT : (tod === 'dusk' ? SKY_DUSK : SKY_DAY))[biome] || SKY_DAY.forest;
    var img = ctx.createImageData(W, H), d = img.data;
    var x, y, i, k, c0, c1;

    /* bright, airy daytime gradient (or dusk/night if the planet set one) */
    var nStops = skyPal.length, stops = [], st;
    for (st = 0; st < nStops; st++) stops.push(T.hex(skyPal[st]));
    /* light atmo-hue wash, never darkening the zenith */
    if (tod === 'day' && spec.atmoHue != null && biome !== 'lava') {
      var hsv = (T.planet && T.planet.hsv) ? T.planet.hsv : function (h, s, v) { return [180, 200, 230]; };
      var tint = hsv(spec.atmoHue, 0.35, 0.85);
      for (st = 1; st < nStops - 1; st++) {
        var bm = 0.10;
        stops[st] = [
          (stops[st][0] * (1 - bm) + tint[0] * bm) | 0,
          (stops[st][1] * (1 - bm) + tint[1] * bm) | 0,
          (stops[st][2] * (1 - bm) + tint[2] * bm) | 0
        ];
      }
    }
    var sunX = (W * (biome === 'desert' ? 0.28 : 0.22) - camX * 0.06) | 0;
    var sunY = ((horizon * (biome === 'desert' || biome === 'lava' || tod !== 'day' ? 0.22 : 0.16)) - camY * 0.25) | 0;
    if (tod === 'night') { sunX = -80; sunY = -80; }
    var sr = biome === 'desert' ? 11 : (biome === 'lava' ? 10 : 9);
    var bloomR = sr * 8;
    var skyHaze = stops[nStops - 1];
    for (y = 0; y < H; y++) {
      var uy = (y + camY * 0.1) / Math.max(1, horizon + 6);
      var si = T.clamp(uy, 0, 1) * (nStops - 1), a = si | 0, f = si - a;
      c0 = stops[Math.min(nStops - 1, a)];
      c1 = stops[Math.min(nStops - 1, a + 1)];
      for (x = 0; x < W; x++) {
        var rr = (c0[0] + (c1[0] - c0[0]) * f);
        var gg = (c0[1] + (c1[1] - c0[1]) * f);
        var bb = (c0[2] + (c1[2] - c0[2]) * f);
        if (tod !== 'night' && biome !== 'storm') {
          var dist = Math.hypot(x - sunX, y - sunY);
          var bloom = T.clamp(1 - dist / bloomR, 0, 1);
          bloom = bloom * bloom;
          if (bloom > 0.01) {
            var bc = biome === 'lava' ? [255, 140, 40] : (biome === 'desert' || tod === 'dusk' ? [255, 220, 140] : [255, 250, 220]);
            var bk = bloom * 0.55;
            rr = rr * (1 - bk) + bc[0] * bk;
            gg = gg * (1 - bk) + bc[1] * bk;
            bb = bb * (1 - bk) + bc[2] * bk;
          }
        }
        put(d, W, H, x, y, rr | 0, gg | 0, bb | 0);
      }
    }

    function phex(x, y, hex) { var c = T.hex(hex); put(d, W, H, x, y, c[0], c[1], c[2]); }

    /* stars at night, or a few faint ones at dusk / ice nights */
    if (tod === 'night' || tod === 'dusk' || biome === 'lava') {
      for (i = 0; i < (tod === 'night' ? 80 : 36); i++) {
        var sx = ((T.hash(i, 3, seed) * (W + 60) - camX * 0.08) % (W + 60) + (W + 60)) % (W + 60) - 10;
        var sy = 2 + T.hash(i, 7, seed) * (horizon * 0.5) - camY * 0.2;
        var tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1.1 + i * 0.07) + i));
        if (T.bayer(sx | 0, sy | 0) < tw) phex(sx | 0, sy | 0, tw > 0.85 ? '#ffffff' : (i % 5 ? '#e8f0d8' : '#c8d8ff'));
      }
    }
    if ((biome === 'ice' || biome === 'tundra') && spec.aurora > 0.05) {
      for (y = 4; y < horizon * 0.45; y++) for (x = 0; x < W; x++) {
        var au = Math.sin((x + camX * 0.2) * 0.03 + t * 0.6) * 0.5 + 0.5;
        au *= (1 - y / (horizon * 0.45)) * spec.aurora * (tod === 'day' ? 0.45 : 1);
        if (au > 0.28 && T.bayer(x, y) < au) phex(x, y, y < horizon * 0.2 ? '#80f0a0' : '#6030a0');
      }
    }
    ctx.putImageData(img, 0, 0);

    /* sun disc + short pixel rays (hidden at night) */
    if (tod !== 'night' && biome !== 'storm') {
      var sc0 = T.hex(biome === 'lava' ? '#ffd070' : '#fff8e8');
      var sc1 = T.hex(biome === 'desert' || tod === 'dusk' ? '#ffe08a' : '#ffe6a8');
      var sc2 = T.hex(biome === 'lava' ? '#e05018' : '#ffb060');
      var breath = T.reduced ? 1 : (0.96 + 0.04 * Math.sin(t * 0.45));
      var cell = Math.max(3, sr * 0.28);
      var img2 = ctx.getImageData(0, 0, W, H), d2 = img2.data;
      var x0 = Math.max(0, (sunX - sr * 5) | 0), x1 = Math.min(W - 1, (sunX + sr * 5) | 0);
      var y0s = Math.max(0, (sunY - sr * 5) | 0), y1s = Math.min(H - 1, (sunY + sr * 5) | 0);
      for (y = y0s; y <= y1s; y++) for (x = x0; x <= x1; x++) {
        var dx = x + 0.5 - sunX, dy = y + 0.5 - sunY, rad = Math.hypot(dx, dy);
        var o = (y * W + x) * 4;
        if (rad <= sr) {
          var nr = rad / sr, nz = Math.sqrt(Math.max(0, 1 - nr * nr));
          var g = T.fbm2(dx / cell, dy / cell, 11, 2);
          var v = 0.35 + nz * 0.55 + (g - 0.5) * 0.08;
          var col = v > 0.62 ? T.mix3(sc1, sc0, (v - 0.62) / 0.38) : T.mix3(sc2, sc1, v / 0.62);
          var limb = Math.pow(T.clamp((nr - 0.72) / 0.28, 0, 1), 1.4);
          if (limb > 0) col = T.mix3(col, sc2, limb * 0.55);
          d2[o] = col[0] | 0; d2[o + 1] = col[1] | 0; d2[o + 2] = col[2] | 0; d2[o + 3] = 255;
        } else {
          var fall = Math.pow(T.clamp(1 - (rad - sr) / (sr * 2.15), 0, 1), 2.15) * breath;
          if (fall > 0.01) {
            var aa = fall * 0.85;
            d2[o] = (d2[o] * (1 - aa) + sc2[0] * aa) | 0;
            d2[o + 1] = (d2[o + 1] * (1 - aa) + sc2[1] * aa) | 0;
            d2[o + 2] = (d2[o + 2] * (1 - aa) + sc2[2] * aa) | 0;
          }
        }
      }
      ctx.putImageData(img2, 0, 0);
      /* short pixel rays */
      if (tod === 'day') {
        ctx.fillStyle = 'rgba(255,248,220,0.7)';
        for (i = 0; i < 8; i++) {
          var ang = i * Math.PI / 4 + 0.2, inner = sr + 3, outer = sr + 7 + (i % 2);
          ctx.fillRect((sunX + Math.cos(ang) * inner) | 0, (sunY + Math.sin(ang) * inner) | 0, 1, 1);
          ctx.fillRect((sunX + Math.cos(ang) * (inner + 2)) | 0, (sunY + Math.sin(ang) * (inner + 2)) | 0, 1, 1);
          if (i % 2 === 0) ctx.fillRect((sunX + Math.cos(ang) * outer) | 0, (sunY + Math.sin(ang) * outer) | 0, 1, 1);
        }
      }
    }

    if (spec.rings && spec.rings.length) {
      var rg = RINGCOL[spec.rings[0].color] || RINGCOL.dust;
      var tilt = (spec.rings[0].tilt || 0.4) * 28;
      var midY = (horizon * 0.26 - camY * 0.3) | 0;
      var tilt2 = tilt * 1.15;
      for (x = 0; x < W; x++) {
        var ry = (midY + Math.sin((x + camX * 0.12) * 0.01) * tilt2) | 0;
        var dens = 0.55 + (spec.rings[0].density || 0.6) * 0.4;
        var band, bd;
        for (band = -3; band <= 4; band++) {
          bd = dens * (band === 0 || band === 1 ? 0.95 : (Math.abs(band) === 2 ? 0.55 : 0.28));
          if (spec.rings[0].banding > 0.3 && (band === 2 || band === -2)) bd *= 0.45;
          if (T.bayer(x, ry + band) < bd) { ctx.fillStyle = (band + 3) % 2 ? rg[0] : rg[1]; ctx.fillRect(x, ry + band, 1, 1); }
        }
      }
    }
    var moons = spec.moons || [];
    for (i = 0; i < moons.length; i++) {
      var m = moons[i], mr = 10 + (m.size || 0.5) * 12;
      var mx = (W * (0.16 + i * 0.26) + Math.cos(t * (0.1 + (m.speed || 0.5) * 0.07) + i) * 14 - camX * 0.05) | 0;
      var my = (12 + i * 14 + Math.sin(t * 0.08 + i) * 5 - camY * 0.28) | 0;
      var mp = m.type === 'icy' ? ['#e8f0f8', '#88a0b8', '#d0e0f0'] : m.type === 'lava' ? ['#e07030', '#6a2010', '#c05020'] : m.type === 'cratered' ? ['#c0b8a8', '#5a5048', '#8a8070'] : ['#d0c8b8', '#6a6058', '#b0a898'];
      for (y = -mr - 2; y <= mr + 2; y++) for (x = -mr - 2; x <= mr + 2; x++) {
        var r2 = x * x + y * y;
        if (r2 <= mr * mr) {
          ctx.fillStyle = (x + y < -1) ? mp[0] : (x + y > 3 ? mp[1] : mp[2] || mp[1]);
          if (m.type === 'cratered' && T.hash(x + 20, y + 20, i) < 0.1 && r2 < (mr - 2) * (mr - 2)) ctx.fillStyle = '#3a342c';
          ctx.fillRect(mx + x, my + y, 1, 1);
        } else if (r2 < (mr + 2) * (mr + 2) && T.bayer(mx + x, my + y) < 0.3) {
          ctx.fillStyle = mp[0]; ctx.fillRect(mx + x, my + y, 1, 1);
        }
      }
    }

    /* soft fluffy multi-tone clouds (Void-style stacked ellipses, lit tops) */
    var cpal = CLOUD_PAL[biome] || CLOUD_PAL.forest;
    if (!S._clouds) S._clouds = {};
    function cloudSprite(idx) {
      var key = biome + ':' + tod + ':' + seed + ':' + idx;
      if (S._clouds[key]) return S._clouds[key];
      var r = rngAt(idx, 40, seed);
      var w = 40 + ((r() * 50) | 0), h = 14 + ((r() * 10) | 0);
      var cd = alloc(w, h), n = 4 + ((r() * 4) | 0), ci;
      for (ci = 0; ci < n; ci++) {
        var cxb = w * (0.18 + 0.64 * (n === 1 ? 0.5 : ci / (n - 1)));
        var rx = w * (0.14 + r() * 0.1), ry = h * (0.3 + r() * 0.22);
        var cyb = h * 0.62 - r() * h * 0.15;
        var px, py, dx, dy;
        for (py = Math.floor(cyb - ry); py <= Math.ceil(cyb + ry); py++) {
          for (px = Math.floor(cxb - rx); px <= Math.ceil(cxb + rx); px++) {
            dx = (px + 0.5 - cxb) / rx; dy = (py + 0.5 - cyb) / ry;
            if (dx * dx + dy * dy <= 1) {
              var v = (1 - dy) * 0.55 + 0.25 - (py > h * 0.7 ? 0.25 : 0);
              setPx(cd, w, h, px, py, tonePal(cpal, v, px, py));
            }
          }
        }
      }
      /* flatten the very bottom so they don't look like hard slabs */
      for (px = 0; px < w; px++) for (py = Math.floor(h * 0.82); py < h; py++) {
        var o = (py * w + px) * 4; cd[o + 3] = 0;
      }
      return (S._clouds[key] = mkCan(cd, w, h));
    }
    function drawCloudLayer(count, par, y0, ySpan, speed) {
      var ci, spr, cx, cy, n = count;
      if (spec.clouds < 0.05 && biome !== 'storm') n = Math.max(2, (count * 0.35) | 0);
      if (tod === 'night') n = Math.max(1, (n * 0.5) | 0);
      for (ci = 0; ci < n; ci++) {
        spr = cloudSprite(ci + ((par * 10) | 0));
        cx = ((T.hash(ci, 11 + par * 9, seed) * (W + spr.width + 80) + t * speed * (0.35 + spec.clouds * 0.45) - camX * par) % (W + spr.width + 80) + (W + spr.width + 80)) % (W + spr.width + 80) - spr.width;
        cy = y0 + T.hash(ci, 13 + par * 7, seed) * ySpan - camY * par;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spr, cx | 0, cy | 0);
      }
    }
    drawCloudLayer(6, 0.08, 4, horizon * 0.16, 1.1);

    /* layered atmospheric ranges — noise-shaded, no flat rectangles */
    function asRgb(c) {
      if (!c) return [0, 0, 0];
      if (typeof c !== 'string') return c;
      if (c.charAt(0) === 'r') { var m = c.match(/(\d+)/g); return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0]; }
      return T.hex(c);
    }
    function mix3(a, b, k) {
      a = asRgb(a); b = asRgb(b);
      return [(a[0] * (1 - k) + b[0] * k) | 0, (a[1] * (1 - k) + b[1] * k) | 0, (a[2] * (1 - k) + b[2] * k) | 0];
    }

    img = ctx.getImageData(0, 0, W, H); d = img.data;

    function drawRange(par, yBase, cols, amp, freq, off, haze) {
      var hx, top, hh, hs = new Float32Array(W), sunRight = sunX > W * 0.5;
      var snowOn = (biome === 'ice' || biome === 'tundra' || (biome !== 'desert' && biome !== 'lava' && amp > 24));
      var ramp = cols.map(function (c) { return asRgb(c); });
      for (hx = 0; hx < W; hx++) {
        hh = hillH(camX * par + hx, seed, freq, amp, off);
        if (biome === 'ice' || biome === 'tundra') hh += Math.max(0, T.ridged3((camX * par + hx) * 0.02, 2, 0, seed, 2) * amp * 0.55 - amp * 0.12);
        if (biome === 'desert') hh += Math.max(0, T.ridged3((camX * par + hx) * 0.014, 1, 1, seed, 2) * amp * 0.45 - amp * 0.18);
        hs[hx] = hh;
      }
      for (hx = 0; hx < W; hx++) {
        hh = hs[hx];
        var bow = Math.pow((hx + 0.5) / W * 2 - 1, 2) * (H * (0.04 + haze * 0.22));
        top = (yBase - hh - camY * par + bow) | 0;
        var slope = hh - (hx ? hs[hx - 1] : hh);
        var facing = sunRight ? (slope < -0.25) : (slope > 0.25);
        var fillH = Math.max(1, (horizon + camY + 8) - top);
        if (top >= H) continue;
        var y2, rel, col, v;
        for (y2 = 0; y2 < fillH; y2++) {
          if (top + y2 < 0 || top + y2 >= H) continue;
          rel = y2 / fillH;
          v = 0.62 - rel * 0.45 + (facing ? 0.12 : -0.08) + (T.hash(hx + (camX * par) | 0, top + y2, seed) - 0.5) * 0.16;
          if (y2 === 0) v += 0.18;
          col = T.hex(tonePal(ramp.map(asHex), v, hx, top + y2));
          if (haze > 0.02) col = mix3(col, skyHaze, haze * (0.5 + rel * 0.35));
          put(d, W, H, hx, top + y2, col[0], col[1], col[2]);
        }
        if (snowOn && haze < 0.45 && hh > amp * 0.58) {
          var cap = 1 + ((hh - amp * 0.58) / 10) | 0;
          for (y2 = 0; y2 < cap; y2++) if (T.bayer(hx, top + y2) < 0.75) {
            var sc = mix3(skyHaze, [235, 242, 255], 0.7);
            put(d, W, H, hx, top + y2, sc[0], sc[1], sc[2]);
          }
        }
      }
    }
    drawRange(0.10, horizon - 36, farC, 38, 0.014, 2, 0.58);
    ctx.putImageData(img, 0, 0);
    drawCloudLayer(5, 0.16, 6, Math.max(8, horizon * 0.18), 1.5);
    img = ctx.getImageData(0, 0, W, H); d = img.data;
    drawRange(0.26, horizon - 18, midC, 26, 0.024, 5, 0.22);
    drawRange(0.48, horizon - 6, [midC[1] || grass[0], grass[1] || grass[0], grass[0]], 14, 0.038, 9, 0.06);

    /* water, thick grass lip, dithered soil with depth — no flat horizontal stripes */
    var seaY = (horizon - (world.sea - RELIEF_BASE) + camY) | 0;
    var stripEnd = dirtBottom(H, horizon) + camY;
    var wind = Math.sin(t * 0.7);
    for (x = 0; x < W; x++) {
      var wi = ((Math.floor(camX + x) % WORLD) + WORLD) % WORLD;
      var gh = world.h[wi], gy = (horizon - (gh - RELIEF_BASE) + camY) | 0, wet = gh <= world.sea + 0.5;
      if (wet) {
        var top = seaY, bot = Math.min(stripEnd, Math.max(gy, seaY + 1));
        var wx = camX + x, foamy = Math.sin(wx * 0.2 + t * 2.2) * 0.5 + 0.5;
        var hh = 1 + ((Math.sin(wx * 0.35 + t * 0.9) + 1) * 0.8) | 0;
        if (biome !== 'lava' && top - hh >= 0) {
          var foam = T.hex(foamy > 0.7 ? WATER[4] : WATER[1]);
          for (k = 0; k < hh; k++) put(d, W, H, x, top - hh + k, foam[0], foam[1], foam[2]);
        }
        for (y = top; y < bot; y++) {
          var wv = (y - top) / Math.max(1, bot - top);
          var wii = Math.min(WATER.length - 1, (wv * (WATER.length - 1) + T.bayer(x, y) * 0.5) | 0);
          var shimmer = Math.sin((camX + x) * 0.4 + t * 0.9 + y * 0.2);
          var wc;
          if (biome === 'lava') wc = T.bayer(x, y) < 0.4 ? T.hex('#c04010') : T.hex('#6a1808');
          else if (biome === 'ice') wc = T.bayer(x, y) < 0.5 ? T.hex('#b0d0e8') : T.hex(WATER[wii]);
          else wc = T.hex(WATER[Math.min(WATER.length - 1, wii + (shimmer > 0.6 && T.bayer(x, y) < 0.5 ? 1 : 0))]);
          var rfy = top - (y - top) - 1;
          if (rfy >= 0 && rfy < H && biome !== 'lava') {
            var ro = (rfy * W + x) * 4;
            var rk = 0.38 + (shimmer > 0 ? 0.12 : 0);
            wc = [wc[0] * (1 - rk) + d[ro] * rk, wc[1] * (1 - rk) + d[ro + 1] * rk, wc[2] * (1 - rk) + d[ro + 2] * rk];
          }
          put(d, W, H, x, y, wc[0] | 0, wc[1] | 0, wc[2] | 0);
        }
      }
      if (gy >= H) continue;
      var pv = T.samplePaint(spec, (wi / WORLD) * T.TAU, 0.05);
      var topT = (biome === 'desert' || biome === 'ice' ? 3 : 5) + (T.hash(wi, 4, seed) > 0.65 ? 1 : 0);
      if (!wet) {
        var sway = (!T.reduced && biome !== 'ice' && biome !== 'desert') ? ((wind + Math.sin(t * 0.8 + wi * 0.2)) > 0.55 ? 1 : 0) : 0;
        for (y = gy; y < gy + topT && y < H; y++) {
          var dn = y - gy;
          var gv = 0.95 - dn / (topT + 1) * 0.55 + (T.hash(wi, y, seed) - 0.5) * 0.45;
          if (dn === 0) gv = 1;
          var gc = T.hex(tonePal(grass, gv, x, y));
          if (pv && T.PAINT_PAL[pv]) {
            var pc = T.hex(T.PAINT_PAL[pv]);
            gc = [(gc[0] * 0.45 + pc[0] * 0.55) | 0, (gc[1] * 0.45 + pc[1] * 0.55) | 0, (gc[2] * 0.45 + pc[2] * 0.55) | 0];
          }
          put(d, W, H, x, y, gc[0], gc[1], gc[2]);
        }
        /* tufts poking above the lip */
        if (biome === 'ice' || biome === 'tundra') {
          if (T.hash(wi, 8, seed) < 0.3) put(d, W, H, x, gy - 1, 255, 255, 255);
        } else if (biome === 'lava') {
          if (T.hash(wi, 8, seed) < 0.14) { var lv = T.bayer(x, (t * 2) | 0) < 0.5 ? [255, 96, 24] : [192, 48, 16]; put(d, W, H, x, gy, lv[0], lv[1], lv[2]); }
        } else if (biome === 'desert') {
          if (T.hash(wi, 8, seed) < 0.2) put(d, W, H, x, gy, 232, 200, 120);
        } else {
          if (T.hash(wi, 8, seed) < 0.7) {
            var blade = T.hex(grass[grass.length - 1]);
            var bh = T.hash(wi, 9, seed) < 0.4 ? 3 : (T.hash(wi, 9, seed) < 0.75 ? 2 : 1);
            for (k = 1; k <= bh; k++) put(d, W, H, x + (k > 1 ? sway : 0), gy - k, blade[0], blade[1], blade[2]);
          }
        }
      }
      var dirtStart = wet ? gy : gy + topT;
      var yMax = Math.min(H, Math.max(dirtStart, stripEnd));
      for (y = Math.max(dirtStart, 0); y < yMax; y++) {
        var depth = y - dirtStart;
        var fn = T.fbm2(wi * 0.07, y * 0.09, seed + 7, 2);
        var v = 0.72 - Math.min(depth, 80) / 80 * 0.42 + (fn - 0.5) * 0.7;
        /* faint irregular beds, not flat screen-wide stripes */
        if ((((y + ((T.fbm2(wi * 0.02, 3, seed, 2) * 5) | 0)) / 9) | 0) % 5 === 0) v -= 0.10;
        var dc = T.hex(tonePal(dirt, v, x, y));
        put(d, W, H, x, y, dc[0], dc[1], dc[2]);
      }
      var dark = T.hex(dirt[dirt.length - 1]);
      for (y = Math.max(yMax, 0); y < H; y++) {
        var dv = 0.35 - (y - yMax) / Math.max(1, H - yMax) * 0.15;
        put(d, W, H, x, y, (dark[0] * dv * 2) | 0, (dark[1] * dv * 2) | 0, (dark[2] * dv * 2) | 0);
      }
    }
    function mark(px, py, hex) { var c = T.hex(hex); put(d, W, H, px, py, c[0], c[1], c[2]); }
    /* pebbles */
    for (i = 0; i < 36; i++) {
      var sx = ((T.hash(i, 99, seed) * WORLD) | 0);
      var screenX = wrapX(sx, camX, W);
      if (screenX < 1 || screenX >= W - 2) continue;
      var sgy = (horizon - (world.h[sx | 0] - RELIEF_BASE) + camY) | 0;
      var sy = sgy + 7 + ((T.hash(i, 100, seed) * 18) | 0);
      if (sy >= stripEnd - 2 || sy <= sgy + 4) continue;
      var stc = biome === 'ice' ? ['#8aa0b0', '#c0d0dc', '#6a7a8a'][i % 3] : ['#6a5a48', '#8a7a68', '#4a3a30'][i % 3];
      mark(screenX | 0, sy, stc); mark((screenX + 1) | 0, sy, stc);
      mark(screenX | 0, sy + 1, stc); if (i % 3) mark((screenX + 1) | 0, sy + 1, '#3a2e24');
    }
    /* ore flecks */
    for (i = 0; i < 16; i++) {
      var ox = ((T.hash(i, 41, seed) * WORLD) | 0);
      var osx = wrapX(ox, camX, W);
      if (osx < 0 || osx >= W) continue;
      var ogy = (horizon - (world.h[ox | 0] - RELIEF_BASE) + camY) | 0;
      var oy = ogy + 10 + ((T.hash(i, 42, seed) * 14) | 0);
      if (oy >= stripEnd - 1) continue;
      mark(osx | 0, oy, biome === 'lava' ? '#ff8018' : (i % 2 ? '#e8c868' : '#80d0e8'));
      if (i % 2 === 0) mark((osx + 1) | 0, oy, biome === 'lava' ? '#ffd040' : '#fff0a0');
    }
    /* roots snaking down from the grass lip */
    for (i = 0; i < 14; i++) {
      var rxi = ((T.hash(i, 77, seed) * WORLD) | 0);
      var rsx = wrapX(rxi, camX, W);
      if (rsx < 0 || rsx >= W) continue;
      var rgy = (horizon - (world.h[rxi] - RELIEF_BASE) + camY) | 0;
      for (k = 0; k < 10; k++) {
        if (rgy + 5 + k >= stripEnd) break;
        mark((rsx + ((k / 3) | 0) * ((i % 2) ? 1 : -1)) | 0, rgy + 5 + k, k % 3 ? '#3a2410' : '#2a4a20');
      }
    }
    ctx.putImageData(img, 0, 0);

    function blitAt(kind, worldX, footY, flip, variant) {
      var spr = S.sprite(kind, variant == null ? worldX : variant, biome), sx = wrapX(worldX, camX, W);
      if (sx < -50 || sx > W + 50) return;
      var dw = spr.width, dh = spr.height;
      var dx = Math.round(sx - dw / 2), dy = Math.round(footY - dh);
      ctx.imageSmoothingEnabled = false;
      if (flip) {
        ctx.save();
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(spr, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(spr, dx, dy);
      }
    }
    var items = world.decor.slice();
    if (world.planet.builds) for (i = 0; i < world.planet.builds.length; i++) items.push(world.planet.builds[i]);
    if (world.planet.gifts) for (i = 0; i < world.planet.gifts.length; i++) items.push(world.planet.gifts[i]);
    items.sort(function (a, b) { return a.x - b.x; });
    /* draw tall vegetation first, then the player later so they are never hidden */
    for (i = 0; i < items.length; i++) {
      var it = items[i], ix = ((it.x % WORLD) + WORLD) % WORLD, iy = groundY(world, ix, H, horizon) + camY;
      if (world.h[ix | 0] <= world.sea + 0.5 && it.kind !== 'print') iy = horizon - (world.sea - RELIEF_BASE) + camY;
      blitAt(it.kind, ix, iy, it.flip, it.v != null ? it.v : ix);
    }

    /* ambient life — dt/time based, biome-tinted */
    if (!T.reduced) {
      if (biome === 'garden' || biome === 'forest' || biome === 'ocean') {
        for (i = 0; i < 14; i++) {
          var bx = wrapX((T.hash(i, 30, seed) * WORLD + t * (5 + i * 1.4)) % WORLD, camX, W);
          var by = horizon * 0.22 + Math.sin(t * 0.55 + i) * 8 + T.hash(i, 31, seed) * 32 - camY * 0.3;
          var wing = ((t * 4 + i) | 0) % 2;
          ctx.fillStyle = i % 4 === 0 ? '#c04060' : (i % 4 === 1 ? '#e0c040' : '#1a1a18');
          ctx.fillRect(bx | 0, by | 0, 3, 1);
          ctx.fillRect((bx | 0) + (wing ? 3 : -2), (by | 0) - 1, 2, 1);
        }
        for (i = 0; i < 4; i++) {
          var dx2 = wrapX((T.hash(i, 55, seed) * WORLD + t * 7) % WORLD, camX, W);
          var dy2 = horizon * 0.48 + Math.sin(t * 0.7 + i) * 5 - camY * 0.25;
          ctx.fillStyle = '#4a6a80'; ctx.fillRect(dx2 | 0, dy2 | 0, 5, 1);
          ctx.fillStyle = '#c8e0f0';
          var fl = ((t * 5 + i) | 0) % 2;
          ctx.fillRect((dx2 | 0) + 1, (dy2 | 0) - 1 - fl, 2, 1);
          ctx.fillRect((dx2 | 0) + 1, (dy2 | 0) + 1 + fl, 2, 1);
        }
      }
      if (biome === 'garden' || biome === 'forest') {
        for (i = 0; i < 28; i++) {
          var fx = wrapX((T.hash(i, 40, seed) * WORLD + Math.sin(t * 0.8 + i) * 10 + t * 8) % WORLD, camX, W);
          var fy = horizon - 10 - T.hash(i, 41, seed) * 50 + Math.sin(t * 0.7 + i * 1.3) * 5 + camY;
          if ((Math.sin(t * 1.6 + i * 2) + 1) * 0.5 > 0.22) {
            ctx.fillStyle = i % 4 === 0 ? '#fff8c0' : (i % 4 === 1 ? '#d8f080' : (i % 4 === 2 ? '#f0d0e0' : '#e8f8d0'));
            ctx.fillRect(fx | 0, fy | 0, 1, 1);
          }
        }
      }
      if (biome !== 'lava') {
        for (i = 0; i < 8; i++) {
          var fix = (T.hash(i, 73, seed) * WORLD + t * (2.4 + i * 0.25)) % WORLD;
          if (world.h[fix | 0] > world.sea + 0.5) continue;
          var fsy = (horizon - (world.sea - RELIEF_BASE) + camY) + 2 + (i % 3) * 2 + Math.sin(t * 0.7 + i) * 1;
          var fsx = wrapX(fix, camX, W);
          ctx.fillStyle = i % 2 ? '#2a6080' : '#48a0b8';
          ctx.fillRect(fsx | 0, fsy | 0, 4, 2);
          ctx.fillRect((fsx + (((t * 2 + i) | 0) % 2 ? 4 : -1)) | 0, fsy | 0, 1, 1);
        }
      }
      if (biome !== 'lava') {
        for (i = 0; i < 8; i++) {
          var cx2 = (T.hash(i, 88, seed) * WORLD + t * (2.5 + i * 0.8) * (i % 2 ? 1 : -1) + WORLD) % WORLD;
          if (world.h[cx2 | 0] <= world.sea + 0.5) continue;
          var cy2 = groundY(world, cx2, H, horizon) + camY - (i % 3 === 0 ? 3 : 2);
          var csx = wrapX(cx2, camX, W);
          ctx.fillStyle = i % 3 === 0 ? '#c8b090' : (biome === 'ice' ? '#d0d8e0' : (biome === 'desert' ? '#c4a06a' : '#2a1a10'));
          if (i % 3 === 0) {
            ctx.fillRect(csx | 0, cy2 | 0, 4, 3);
            ctx.fillRect((csx + 1) | 0, (cy2 - 2) | 0, 1, 2);
            ctx.fillRect((csx + 3) | 0, (cy2 - 2) | 0, 1, 2);
          } else {
            ctx.fillRect(csx | 0, cy2 | 0, 3, 2);
            ctx.fillRect((csx + (((t * 2.5 + i) | 0) % 2)) | 0, (cy2 + 2) | 0, 1, 1);
          }
        }
      }
      if (biome === 'lava') {
        for (i = 0; i < 20; i++) {
          var ex = wrapX((T.hash(i, 50, seed) * WORLD) % WORLD, camX, W);
          var ey = (horizon * 0.35 + ((t * (5 + i * 0.3) + T.hash(i, 51, seed) * 80) % (horizon * 0.55))) - camY * 0.2;
          ctx.fillStyle = i % 2 ? '#ff8018' : '#ffd040';
          ctx.fillRect(ex | 0, ey | 0, 1, 1);
        }
      }
      if (biome === 'ice' || biome === 'tundra') {
        for (i = 0; i < 24; i++) {
          var snx = wrapX((T.hash(i, 60, seed) * WORLD + t * (3.5 + (i % 5) * 0.4)) % WORLD, camX, W);
          var sny = ((t * (5 + (i % 7) * 0.4) + T.hash(i, 61, seed) * horizon) % horizon) + camY * 0.15;
          ctx.fillStyle = '#f4f8fc'; ctx.fillRect(snx | 0, sny | 0, 1, 1);
        }
      }
      if (biome === 'storm' && T.bayer((t * 20) | 0, 3) > 0.92) {
        ctx.fillStyle = 'rgba(230,230,255,.35)';
        ctx.fillRect(0, 0, W, horizon);
      }
    }

    var ppx = wrapX(player.x, camX, W);
    var ppy = (S._py == null ? groundY(world, player.x, H, horizon) - 16 : S._py) + camY;
    if (S.landT < 1 && S.landT > 0.2) {
      var trail = 1 - S.landT;
      ctx.fillStyle = '#f0c45c';
      for (i = 0; i < 10; i++) if (T.bayer((ppx | 0) + i, 2) < trail) ctx.fillRect((ppx | 0), (ppy + 20 + i * 5) | 0, 2, 2);
    }
    if (S.landT > 0.25) drawPlayer(ctx, ppx, ppy, t);

    for (i = 0; i < S.fx.length; i++) {
      var p = S.fx[i], pxp = wrapX(p.x, camX, W);
      if (pxp < -2 || pxp > W + 2) continue;
      ctx.fillStyle = 'rgb(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ')';
      ctx.fillRect(pxp | 0, (p.y + camY) | 0, 1, 1);
    }

    if (S.landT < 1) {
      var u = S.landT, veil = u < 0.45 ? (1 - u / 0.45) : 0;
      if (veil > 0) {
        var ac = skyHaze;
        ctx.fillStyle = 'rgba(' + ac[0] + ',' + ac[1] + ',' + ac[2] + ',' + (veil * 0.75).toFixed(3) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      if (u < 0.72) {
        var skyLim = Math.max(12, (horizon + camY) - 10);
        var rushA = T.clamp((0.72 - u) / 0.72, 0, 1) * 0.55;
        ctx.save();
        ctx.globalAlpha = rushA;
        ctx.imageSmoothingEnabled = false;
        for (i = 0; i < 8; i++) {
          var csp = cloudSprite(i % 8);
          var clx = ((T.hash(i, 3, seed) * W + t * (18 + i * 3) * (1.3 - u)) % (W + 80)) - 40;
          var cly = ((T.hash(i, 4, seed) * skyLim + t * (14 + i * 3) * (1.15 - u)) % skyLim) - 4;
          if (cly > skyLim - 6) continue;
          ctx.drawImage(csp, clx | 0, cly | 0);
        }
        ctx.restore();
      }
    }
  };

  S.nearGift = function (world) {
    var g = world.planet.gifts || [], i, best = null, dd;
    for (i = 0; i < g.length; i++) {
      dd = Math.min(Math.abs(g[i].x - player.x), WORLD - Math.abs(g[i].x - player.x));
      if (dd < 12 && (!best || dd < best.d)) best = { g: g[i], d: dd };
    }
    return best && best.g;
  };
})();
