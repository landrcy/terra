/* Terra — game loop, title, builder, launch, shared solar system, landing. */
(function () {
  'use strict';
  var T = window.TERRA, TAU = T.TAU;
  var canvas, ctx, scale = 3, W = 320, H = 180;
  var mode = 'title', last = 0, time = 0;
  var spec = T.defaultSpec((Math.random() * 0xffffffff) | 0);
  var mask = T.planet.circleMask(T.SHAPE_N), inflate = 1, popT = -1, popFrom = 0;
  var planets = [], store = null, cam = { x: 0, y: 0, z: 1 }, drag = null, pinch0 = null;
  var hover = null, selected = null, keys = { left: 0, right: 0, jump: 0 };
  var world = null, tool = null, erase = false, painting = false;
  var launch = null, titleSpec, titlePlanet = 0;
  var orbitMap = null, orbitTrails = {}, hoverP = null;
  var paintColor = 1, paintBrush = 2, paintDrag = false, builderTab = 'body';

  var SIZE_L = ['tiny', 'small', 'medium', 'large', 'huge'];
  function $(id) { return document.getElementById(id); }
  function say(s) { var el = $('live'); if (el) el.textContent = s; }
  function toast(s) {
    var el = $('toast'); if (!el) return;
    el.hidden = false; el.textContent = s;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function resize() {
    var vw = innerWidth, vh = innerHeight;
    scale = vw < 520 ? 2 : vw < 1100 ? 3 : 4;
    if (vw / scale < 280) scale = Math.max(2, scale - 1);
    W = Math.max(200, Math.floor(vw / scale));
    H = Math.max(140, Math.floor(vh / scale));
    canvas.width = W; canvas.height = H;
    canvas.style.width = (W * scale) + 'px';
    canvas.style.height = (H * scale) + 'px';
    T.setSmooth(ctx, false);
    document.documentElement.style.setProperty('--px', scale + 'px');
    if (T.ui && T.ui._sizeDust) T.ui._sizeDust();
    if (mode === 'system') frameSystem();
  }

  /* ---------- music icon ---------- */
  function syncMusic() {
    var btn = $('music-btn'); if (!btn) return;
    var muted = T.music && T.music.muted;
    var rows = muted
      ? ['.......ww...', '......www...', '..wwwwwww.x.', '.wwwwwwww..x', '.wwwwwwww.x.', '..wwwwwww..x', '......www...', '.......ww...']
      : ['.......ww...', '......www..w', '..wwwwwww...', '.wwwwwwww.w.', '.wwwwwwww.w.', '..wwwwwww...', '......www..w', '.......ww...'];
    var c = btn.querySelector('canvas'), g = c.getContext('2d'), x, y, ch;
    c.width = 12; c.height = 8;
    T.setSmooth(g, false);
    g.clearRect(0, 0, 12, 8);
    for (y = 0; y < 8; y++) for (x = 0; x < 12; x++) {
      ch = rows[y].charAt(x);
      if (ch === 'w') { g.fillStyle = '#e8f0d8'; g.fillRect(x, y, 1, 1); }
      if (ch === 'x') { g.fillStyle = '#f0c45c'; g.fillRect(x, y, 1, 1); }
    }
    btn.setAttribute('aria-pressed', String(!muted));
    btn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
  }
  T.ui = T.ui || {};
  T.ui.syncMusic = syncMusic;

  /* ---------- stars + sun ---------- */
  var stars = [], shoot = { t: 6, x: 0, y: 0.2, vx: 0.4, vy: 0.1 }, trails = [];
  function seedStars() {
    stars = [];
    var r = T.rng(0x5eed), n = 160, i;
    for (i = 0; i < n; i++) stars.push({ x: r(), y: r(), b: r() < 0.5 ? 0 : r() < 0.82 ? 1 : 2, ph: r() * TAU, band: r() < 0.22 });
  }
  function drawStars() {
    var i, s, x, y, c, tw;
    if (!T.reduced) {
      for (y = (H * 0.28) | 0; y < (H * 0.62) | 0; y++) {
        var band = 1 - Math.abs(y / H - 0.45) / 0.17;
        for (x = 0; x < W; x++) {
          if (T.bayer(x, y) < band * 0.12 * T.fbm2(x * 0.04, y * 0.05, 7, 3)) {
            ctx.fillStyle = (x + y) % 5 ? '#3a2a28' : '#5a4038';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      x = ((s.x * W + time * 1.2 * (s.b + 1) * 0.4) % W + W) % W;
      y = (s.y * H) | 0;
      if (T.reduced) x = (s.x * W) | 0;
      tw = 0.55 + 0.45 * Math.sin(time * (1.4 + s.ph) + s.ph);
      c = s.b === 0 ? '#5a4a40' : s.b === 1 ? '#c8b8a0' : (tw > 0.85 ? '#ffffff' : '#fff8e8');
      if (!T.reduced && s.b === 2 && tw < 0.28) continue;
      if (s.band) { y = ((y * 0.35 + H * 0.4) | 0); c = s.b ? '#e8d8c0' : '#6a5a50'; }
      ctx.fillStyle = c;
      ctx.fillRect(x | 0, y, 1, 1);
      if (!T.reduced && s.b === 2 && tw > 0.9) {
        ctx.fillRect((x | 0) - 1, y, 3, 1);
        ctx.fillRect(x | 0, y - 1, 1, 3);
      }
    }
    if (!T.reduced && shoot) {
      shoot.t -= 0.016;
      if (shoot.t < 0) {
        var sx = ((shoot.x * W + (0.4 - shoot.t) * shoot.vx * W) % (W + 40));
        var sy = shoot.y * H + (0.4 - shoot.t) * shoot.vy * H;
        if (shoot.t > -0.45 && sy < H && sx < W) {
          ctx.fillStyle = '#fff8e8';
          ctx.fillRect(sx | 0, sy | 0, 2, 1);
          ctx.fillStyle = '#c8a878';
          ctx.fillRect((sx - 4) | 0, (sy - 1) | 0, 4, 1);
        }
        if (shoot.t < -0.5) { shoot.t = 5 + Math.random() * 10; shoot.x = Math.random(); shoot.y = Math.random() * 0.4; }
      }
    }
  }
  function drawSun(x, y, R) {
    var img = ctx.getImageData(0, 0, W, H), d = img.data, i, j, k;
    var ramp = ['#3a0800', '#7a1804', '#c43808', '#ee5a18', '#fa8a2c', '#ffc070', '#ffe8c0', '#fff6e0'];
    var reach = R * SUN_CORONA;
    var x0 = Math.max(0, (x - reach) | 0), x1 = Math.min(W - 1, (x + reach) | 0);
    var y0 = Math.max(0, (y - reach) | 0), y1 = Math.min(H - 1, (y + reach) | 0);
    for (j = y0; j <= y1; j++) for (i = x0; i <= x1; i++) {
      var dx = i + 0.5 - x, dy = j + 0.5 - y, r = Math.hypot(dx, dy), col = null, ang = Math.atan2(dy, dx);
      if (r <= R) {
        var nz = Math.sqrt(Math.max(0, 1 - (r / R) * (r / R)));
        var g = T.fbm2((ang + time * 0.07) * 4, nz * 5, 9, 4);
        var v = 0.18 + nz * 0.58 + (g - 0.5) * 0.34;
        /* sunspots */
        var spot = T.fbm2(ang * 2.2, nz * 6 + time * 0.02, 21, 3);
        if (spot < 0.34 && nz > 0.25 && nz < 0.85) v -= (0.34 - spot) * 0.7;
        /* faculae */
        if (g > 0.72 && nz > 0.45) v += 0.12;
        col = T.dqc(ramp, T.clamp(v, 0, 1), i, j);
      } else if (r < R * 1.7) {
        var cv = 1 - (r - R) / (R * 0.7);
        if (cv * 0.78 > T.bayer(i, j) * 0.9 + 0.05) col = T.dqc(['#4a0803', '#8a1606', '#c42a0a', '#ff8a1e', '#ffc070'], cv, i, j);
      }
      if (!col && r < R * SUN_CORONA) {
        var flare = 0;
        for (k = 0; k < 10; k++) {
          var fa = k * Math.PI / 5 + Math.sin(time * 0.32 + k) * 0.1;
          var da = Math.abs(Math.atan2(Math.sin(ang - fa), Math.cos(ang - fa)));
          var fw = 0.07 + 0.05 * (k % 2);
          if (da < fw) flare = Math.max(flare, (1 - da / fw) * (1 - (r - R) / (R * 1.15)));
        }
        if (flare > T.bayer(i, j) * 0.85 + 0.12) col = T.dqc(['#7a1804', '#ee5a18', '#ffc070'], flare, i, j);
      }
      if (col) { var o = (j * W + i) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
  }

  function blit(text, x, y, col, sc) {
    var img = ctx.getImageData(0, 0, W, H), u32 = new Uint32Array(img.data.buffer);
    T.blitText(u32, W, H, text, x, y, T.hex(col || '#ffffff'), sc || 1);
    ctx.putImageData(img, 0, 0);
  }

  /* ---------- orbits ---------- */
  var SUN_WORLD = 96, VIEW_R = 26, ORBIT_ASPECT = 0.46, SUN_CORONA = 1.72;
  var TINT = { ocean: '#3a8ab0', forest: '#3e8a30', garden: '#6aba50', desert: '#c4944c', tundra: '#6a8098', ice: '#88b0d0', lava: '#e05020', storm: '#8a7aa0' };
  function planetTint(p) {
    var b = (p && p.biome) || 'forest';
    return TINT[b] || '#c8b898';
  }
  function ensureOrbits() {
    var list = planets.slice().sort(function (a, b) { return (a.n || 0) - (b.n || 0); });
    var map = {}, i, r = 0, prev = 0, p, ext;
    var clearR = (SUN_WORLD * SUN_CORONA + 18) / ORBIT_ASPECT;
    for (i = 0; i < list.length; i++) {
      p = list[i];
      ext = T.planet.maxExtent(p, VIEW_R);
      if (i === 0) r = clearR + ext + 8;
      else r += prev + ext + 120;
      map[p.id || ('n' + p.n)] = { radius: r, phase: i * 2.05 + 0.45, period: 55 + r * 0.12, ext: ext };
      prev = ext;
    }
    orbitMap = map;
  }
  function orbitOf(p) {
    if (!orbitMap) ensureOrbits();
    var key = (p && (p.id || ('n' + p.n))) || 'n1';
    if (!orbitMap[key]) ensureOrbits();
    return orbitMap[key] || { radius: 230, phase: 0, period: 70, ext: 30 };
  }
  function planetPos(p, tt) {
    var o = orbitOf(p);
    var a = o.phase + (T.reduced ? 0 : (tt / o.period) * TAU);
    return { x: Math.cos(a) * o.radius, y: Math.sin(a) * o.radius * ORBIT_ASPECT, a: a, o: o };
  }
  function frameSystem() {
    ensureOrbits();
    cam.x = 0; cam.y = 0;
    var view = SUN_WORLD * SUN_CORONA + 40, i, o, minR = 1e9, first = null;
    for (i = 0; i < planets.length; i++) {
      o = orbitOf(planets[i]);
      if (o.radius < minR) { minR = o.radius; first = o; }
    }
    if (first) view = Math.max(view, first.radius + (first.ext || 30) + 20);
    cam.z = T.clamp(Math.min((W / 2 - 8) / view, (H / 2 - 8) / Math.max(40, view * ORBIT_ASPECT)), 0.12, 1.4);
  }
  function worldToScreen(wx, wy) {
    return { x: W / 2 + (wx - cam.x) * cam.z, y: H / 2 + (wy - cam.y) * cam.z };
  }

  /* ---------- UI: builder ---------- */
  function setTab(name) {
    builderTab = name;
    document.querySelectorAll('#tabs [role=tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === name)); });
    document.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pane') === name); });
    if (T.ui && T.ui.skinAll) T.ui.skinAll();
  }
  function valLabel(id, text) { var e = $('v-' + id); if (e) e.textContent = text; }
  function slider(id, v) { var e = $('p-' + id); if (e) e.value = String((v * 100) | 0); }

  function paintDrawbox() {
    var c = $('drawbox'); if (!c) return;
    var g = c.getContext('2d'), n = T.SHAPE_N, i, j;
    c.width = n; c.height = n;
    T.setSmooth(g, false);
    var img = g.createImageData(n, n), d = img.data;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
      var o = (j * n + i) * 4, on = mask[j * n + i];
      if (on) { d[o] = 90; d[o + 1] = 150; d[o + 2] = 80; d[o + 3] = 255; }
      else { var gch = ((i + j) & 1) ? 22 : 16; d[o] = gch; d[o + 1] = gch - 2; d[o + 2] = 14; d[o + 3] = 255; }
    }
    g.putImageData(img, 0, 0);
  }
  function applyMaskToSpec() {
    var circ = T.planet.circleMask(T.SHAPE_N), i, same = 0;
    for (i = 0; i < mask.length; i++) if (mask[i] === circ[i]) same++;
    spec.shape = (same / mask.length > 0.96) ? null : T.planet.packMask(mask);
  }
  function startPop() {
    applyMaskToSpec();
    if (T.reduced) { inflate = 1; popT = -1; }
    else { popFrom = 0; inflate = 0.04; popT = 0; }
    if (T.sfx) T.sfx.pop3d();
    say('The silhouette becomes a planet.');
  }

  function renderRingsUI() {
    var box = $('ring-list'); if (!box) return;
    box.innerHTML = '';
    spec.rings.forEach(function (rg, i) {
      var d = document.createElement('div'); d.className = 'mini';
      d.innerHTML = '<h3>Ring ' + (i + 1) + ' <button type="button" class="chipbtn" data-del="ring" data-i="' + i + '">remove</button></h3>' +
        '<div class="row"><label>Inner <span>' + Math.round(rg.inner * 100) + '</span></label><input type="range" min="0" max="80" value="' + (rg.inner * 100 | 0) + '" data-ring="' + i + '" data-k="inner"></div>' +
        '<div class="row"><label>Outer <span>' + Math.round(rg.outer * 100) + '</span></label><input type="range" min="10" max="100" value="' + (rg.outer * 100 | 0) + '" data-ring="' + i + '" data-k="outer"></div>' +
        '<div class="row"><label>Tilt <span>' + Math.round(rg.tilt * 100) + '</span></label><input type="range" min="-100" max="100" value="' + (rg.tilt * 100 | 0) + '" data-ring="' + i + '" data-k="tilt"></div>' +
        '<div class="row"><label>Banding <span>' + Math.round(rg.banding * 100) + '</span></label><input type="range" min="0" max="100" value="' + (rg.banding * 100 | 0) + '" data-ring="' + i + '" data-k="banding"></div>' +
        '<div class="row"><label>Density <span>' + Math.round(rg.density * 100) + '</span></label><input type="range" min="8" max="100" value="' + (rg.density * 100 | 0) + '" data-ring="' + i + '" data-k="density"></div>' +
        '<div class="swatches" data-ringcol="' + i + '"></div>';
      box.appendChild(d);
      var sw = d.querySelector('[data-ringcol]'), pal = { gold: '#d4c080', ice: '#c0d8e8', rose: '#d4909a', dust: '#c0a888', jade: '#78b090', violet: '#a090d0' };
      T.RING_COLORS.forEach(function (c) {
        var b = document.createElement('button'); b.className = 'swatch' + (rg.color === c ? ' on' : ''); b.style.background = pal[c]; b.title = c; b.setAttribute('data-rc', c);
        b.addEventListener('click', function () { spec.rings[i].color = c; if (T.sfx) T.sfx.click(); renderRingsUI(); });
        sw.appendChild(b);
      });
    });
  }
  function renderMoonsUI() {
    var box = $('moon-list'); if (!box) return;
    box.innerHTML = '';
    spec.moons.forEach(function (m, i) {
      var d = document.createElement('div'); d.className = 'mini';
      d.innerHTML = '<h3>Moon ' + (i + 1) + ' <button type="button" class="chipbtn" data-del="moon" data-i="' + i + '">remove</button></h3>' +
        '<div class="presets" data-mtype="' + i + '"></div>' +
        '<div class="row"><label>Size <span>' + Math.round(m.size * 100) + '</span></label><input type="range" min="15" max="100" value="' + (m.size * 100 | 0) + '" data-moon="' + i + '" data-k="size"></div>' +
        '<div class="row"><label>Distance <span>' + Math.round(m.dist * 100) + '</span></label><input type="range" min="5" max="100" value="' + (m.dist * 100 | 0) + '" data-moon="' + i + '" data-k="dist"></div>' +
        '<div class="row"><label>Speed <span>' + Math.round(m.speed * 100) + '</span></label><input type="range" min="5" max="100" value="' + (m.speed * 100 | 0) + '" data-moon="' + i + '" data-k="speed"></div>';
      box.appendChild(d);
      var sw = d.querySelector('[data-mtype]');
      T.MOON_TYPES.forEach(function (tp) {
        var b = document.createElement('button'); b.className = 'chipbtn' + (m.type === tp ? ' on' : ''); b.textContent = tp;
        b.addEventListener('click', function () { spec.moons[i].type = tp; if (T.sfx) T.sfx.click(); renderMoonsUI(); });
        sw.appendChild(b);
      });
    });
  }
  function bindDynamic() {
    $('builder').addEventListener('input', function (e) {
      var el = e.target, i, k, v;
      if (el.dataset.ring != null) {
        i = +el.dataset.ring; k = el.dataset.k; v = +el.value / (k === 'tilt' ? 100 : 100);
        if (spec.rings[i]) spec.rings[i][k] = k === 'tilt' ? (+el.value / 100) : T.clamp(+el.value / 100, 0, 1);
        if (spec.rings[i] && spec.rings[i].outer <= spec.rings[i].inner) spec.rings[i].outer = Math.min(1, spec.rings[i].inner + 0.08);
        if (T.sfx) T.sfx.tick();
        var lab = el.parentNode.querySelector('span'); if (lab) lab.textContent = el.value;
      }
      if (el.dataset.moon != null) {
        i = +el.dataset.moon; k = el.dataset.k;
        if (spec.moons[i]) spec.moons[i][k] = T.clamp(+el.value / 100, 0.05, 1);
        if (T.sfx) T.sfx.tick();
        var lab2 = el.parentNode.querySelector('span'); if (lab2) lab2.textContent = el.value;
      }
    });
    $('builder').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]'); if (!b) return;
      var i = +b.getAttribute('data-i');
      if (b.getAttribute('data-del') === 'ring') spec.rings.splice(i, 1);
      else spec.moons.splice(i, 1);
      if (T.sfx) T.sfx.click();
      renderRingsUI(); renderMoonsUI();
    });
  }

  function syncFromSpec() {
    slider('size', spec.size); valLabel('size', SIZE_L[(spec.size * 4.99) | 0]);
    slider('land', spec.land); valLabel('land', String((spec.land * 100) | 0));
    slider('craters', spec.craters); valLabel('craters', String((spec.craters * 100) | 0));
    slider('volcanoes', spec.volcanoes); valLabel('volcanoes', String((spec.volcanoes * 100) | 0));
    slider('iceCaps', spec.iceCaps); valLabel('iceCaps', String((spec.iceCaps * 100) | 0));
    slider('clouds', spec.clouds); valLabel('clouds', String((spec.clouds * 100) | 0));
    slider('atmo', spec.atmo); valLabel('atmo', String((spec.atmo * 100) | 0));
    slider('aurora', spec.aurora); valLabel('aurora', String((spec.aurora * 100) | 0));
    slider('city', spec.city); valLabel('city', String((spec.city * 100) | 0));
    slider('glow', spec.glow); valLabel('glow', String((spec.glow * 100) | 0));
    $('p-name').value = spec.name || '';
    $('p-author').value = spec.author || '';
    $('p-msg').value = spec.msg || '';
    $('msg-count').textContent = (spec.msg || '').length + '/160';
    document.querySelectorAll('#biomes button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-biome') === spec.biome); });
    document.querySelectorAll('#cloudpats button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-pat') === spec.cloudPat); });
    document.querySelectorAll('#atmo-hues button').forEach(function (b) { b.classList.toggle('on', Math.abs(+b.getAttribute('data-hue') - spec.atmoHue) < 0.06); });
    renderRingsUI(); renderMoonsUI();
    if (spec.shape) mask = T.planet.unpackMask(spec.shape, T.SHAPE_N);
    paintDrawbox();
  }
  function readFields() {
    spec.size = $('p-size').value / 100;
    spec.land = $('p-land').value / 100;
    spec.craters = $('p-craters').value / 100;
    spec.volcanoes = $('p-volcanoes').value / 100;
    spec.iceCaps = $('p-iceCaps').value / 100;
    spec.clouds = $('p-clouds').value / 100;
    spec.atmo = $('p-atmo').value / 100;
    spec.aurora = $('p-aurora').value / 100;
    spec.city = $('p-city').value / 100;
    spec.glow = $('p-glow').value / 100;
    valLabel('size', SIZE_L[(spec.size * 4.99) | 0]);
    ['land', 'craters', 'volcanoes', 'iceCaps', 'clouds', 'atmo', 'aurora', 'city', 'glow'].forEach(function (k) { valLabel(k, String((spec[k] * 100) | 0)); });
    var F = T.filter, n = $('p-name').value, a = $('p-author').value, m = $('p-msg').value;
    if (F) { n = F.clean(n).text; a = F.clean(a).text; m = F.clean(m).text; }
    spec.name = n; spec.author = a; spec.msg = m;
    $('msg-count').textContent = m.length + '/160';
  }

  function showMode(next) {
    mode = next;
    $('title-ui').hidden = next !== 'title';
    $('builder').hidden = next !== 'builder';
    $('back-btn').hidden = next === 'title' || next === 'launch' || next === 'surface';
    $('make-btn').hidden = next !== 'system' && next !== 'inspect';
    $('card').hidden = next !== 'inspect';
    $('surface-ui').hidden = next !== 'surface';
    $('music-credit').hidden = next === 'builder' || next === 'surface';
    $('back-btn').hidden = next === 'title' || next === 'launch' || next === 'surface';
    $('back-btn').textContent = next === 'builder' ? 'Back' : 'Title';
    if (next === 'system') frameSystem();
    say(next === 'title' ? 'Terra.' : next === 'builder' ? 'Make a planet.' : next === 'system' ? 'The shared solar system.' : '');
  }

  /* ---------- store / system ---------- */
  async function loadPlanets() {
    try { planets = await store.list(); } catch (e) { planets = []; }
    orbitMap = null; ensureOrbits();
  }
  function hitPlanet(sx, sy) {
    var best = null, i, p, pos, sp, r, d;
    for (i = 0; i < planets.length; i++) {
      p = planets[i]; pos = planetPos(p, time); sp = worldToScreen(pos.x, pos.y);
      r = T.planet.bodyRadius(VIEW_R * cam.z, p.size) + 8;
      d = Math.hypot(sx - sp.x, sy - sp.y);
      if (d < r && (!best || d < best.d)) best = { p: p, d: d, sp: sp, pos: pos };
    }
    return best;
  }
  function openCard(p) {
    selected = p;
    showMode('inspect');
    cam.x = planetPos(p, time).x; cam.y = planetPos(p, time).y; cam.z = Math.max(cam.z, 2.2);
    $('c-title').firstChild.textContent = (p.name || 'Planet') + ' ';
    $('c-num').textContent = '#' + p.n;
    var d = new Date(p.ts);
    $('c-when').textContent = isFinite(p.ts) ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    $('c-from').textContent = p.author ? ('signed, ' + p.author) : '';
    $('c-body').textContent = p.msg || '';
    if (T.sfx) T.sfx.open();
  }

  async function launchPlanet() {
    readFields(); applyMaskToSpec();
    var F = T.filter;
    if (F && (F.has(spec.name) || F.has(spec.author) || F.has(spec.msg))) { $('note').textContent = 'Please keep it kind.'; if (T.sfx) T.sfx.deny(); return; }
    $('note').textContent = '';
    if (!spec.name || !spec.name.trim()) spec.name = T.autoName(spec.seed);
    if (T.sfx) T.sfx.takeoff();
    var from = { x: (W * 0.38) | 0, y: (H * 0.5) | 0, r: Math.min(W, H) * 0.28 };
    showMode('launch');
    launch = { t: 0, from: from, spec: T.cleanSpec(spec), waiting: true };
    try {
      var res = await store.add(spec);
      planets = res.all || planets.concat([res.planet]);
      T.rememberMine(res.planet.id);
      launch.planet = res.planet;
      launch.waiting = false;
    } catch (e) {
      toast('Saved only on this device.');
      var local = Object.assign({ id: T.uid(), n: planets.length + 1, ts: Date.now(), builds: [], gifts: [] }, T.cleanSpec(spec));
      planets.push(local); T.rememberMine(local.id);
      launch.planet = local; launch.waiting = false;
    }
  }

  function landOn(p, instant) {
    selected = p;
    world = T.surface.makeWorld(p);
    T.surface.resetPlayer(world, W, H);
    T.surface._py = null;
    if (instant) { T.surface.landT = 1; T.surface.player.on = 1; }
    tool = null;
    showMode('surface');
    buildSurfaceTools();
    $('s-title').textContent = (p.name || 'Planet') + '  #' + p.n;
    if (T.sfx) T.sfx.land();
    say('Landed on ' + (p.name || 'a planet') + '.');
  }
  function buildSurfaceTools() {
    var box = $('s-tools'); box.innerHTML = '';
    var own = T.isMine(selected && selected.id), kinds = own ? T.BUILD_KINDS : T.GIFT_KINDS, i;
    kinds.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ibtn'; b.setAttribute('data-tool', k); b.setAttribute('data-ico', k); b.title = k; b.setAttribute('aria-label', k);
        var img = document.createElement('img'); img.className = 'ico-px'; img.alt = ''; img.width = 8; img.height = 8;
        if (T.ui && T.ui.iconURL) img.src = T.ui.iconURL(k);
        b.appendChild(img);
      b.addEventListener('click', function () {
        tool = k;
        document.querySelectorAll('#s-tools .ibtn').forEach(function (x) { x.classList.toggle('on', x === b); });
        if (T.sfx) T.sfx.select();
      });
      box.appendChild(b);
    });
    var help = document.createElement('span');
    help.className = 'help';
    help.style.color = '#fff';
    help.textContent = own ? '  place on your planet' : '  leave a small thing (3 per visitor)';
    box.appendChild(help);
    if (T.ui && T.ui.skinAll) T.ui.skinAll();
  }
  async function placeHere() {
    if (!tool || !selected || !world) return;
    var x = T.surface.placeX();
    var own = T.isMine(selected.id);
    var rec = { kind: tool, x: x };
    if (!own) {
      rec.author = ($('p-author') && $('p-author').value) || '';
      if (tool === 'sign') {
        var msg = prompt('A short note for the sign?') || '';
        if (T.filter) msg = T.filter.clean(msg).text;
        rec.msg = msg.slice(0, 120);
      }
    }
    var res;
    try {
      res = own ? await store.addBuild(selected.id, rec) : await store.addGift(selected.id, rec, T.visitorId());
    } catch (e) { res = { ok: false, state: 'failed' }; }
    if (!res.ok) {
      if (T.sfx) T.sfx.deny();
      toast(res.state === 'limit' ? 'You already left a few things here.' : res.state === 'full' ? 'This planet is full.' : 'Could not place that.');
      return;
    }
    planets = res.all || planets;
    var fresh = planets.filter(function (p) { return p.id === selected.id; })[0];
    if (fresh) { selected = fresh; world.planet = fresh; }
    if (T.sfx) T.sfx.place();
    if (T.surface && T.surface.burst) T.surface.burst(x, (T.surface._py || 80) + 12, 16);
    tool = null;
    document.querySelectorAll('#s-tools .ibtn').forEach(function (x) { x.classList.remove('on'); });
    if (T.ui && T.ui.skinAll) T.ui.skinAll();
  }

  /* ---------- input ---------- */
  function canvasPos(e) {
    var r = canvas.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: (cx - r.left) / scale, y: (cy - r.top) / scale };
  }
  function drawAt(e, cnv) {
    var r = cnv.getBoundingClientRect(), n = T.SHAPE_N;
    var x = Math.floor((e.clientX - r.left) / r.width * n);
    var y = Math.floor((e.clientY - r.top) / r.height * n);
    var rad = 1.6, i, j;
    for (j = -2; j <= 2; j++) for (i = -2; i <= 2; i++) {
      var xx = x + i, yy = y + j;
      if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
      if (i * i + j * j <= rad * rad) mask[yy * n + xx] = erase ? 0 : 1;
    }
    paintDrawbox();
  }

  function onKey(e, down) {
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = down;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = down;
    if ((k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') && down) keys.jump = 1;
    if (mode === 'surface' && down && (k === 'e' || k === 'E' || k === 'Enter')) { placeHere(); e.preventDefault(); }
    if (down && k === 'Escape') goBack();
  }

  function goBack() {
    if (mode === 'surface') { showMode(selected ? 'inspect' : 'system'); if (T.sfx) T.sfx.close(); return; }
    if (mode === 'inspect') { showMode('system'); selected = null; if (T.sfx) T.sfx.close(); return; }
    if (mode === 'system' || mode === 'builder') { showMode('title'); if (T.sfx) T.sfx.close(); }
  }

  /* ---------- frames ---------- */
  function letterMask(ch, w, h) {
    var m = new Uint8Array(w * h), x, y, s = Math.max(2, (h * 0.22) | 0);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var px = x + 0.5, py = y + 0.5, on = false;
      if (ch === 'T') on = py < h * 0.26 || (px >= (w - s) / 2 && px < (w + s) / 2);
      else if (ch === 'E') on = px < s * 1.15 || py < h * 0.22 || py >= h * 0.78 || (py >= h * 0.42 && py < h * 0.58 && px < w * 0.88);
      else if (ch === 'R') {
        on = px < s * 1.15;
        if (py < h * 0.5) on = on || py < h * 0.22 || px >= w - s * 1.15;
        else {
          var leg = (py - h * 0.48) / (h * 0.52);
          var lx = s * 0.9 + leg * (w - s * 1.5);
          on = on || (px >= lx && px < lx + s * 1.1);
        }
      } else if (ch === 'A') {
        var t = py / h, half = (w * 0.12) + t * (w * 0.38), mid = w / 2;
        on = (px >= mid - half && px < mid - half + s * 1.05) || (px >= mid + half - s * 1.05 && px < mid + half);
        if (py >= h * 0.52 && py < h * 0.68 && px >= mid - half && px <= mid + half) on = true;
      }
      m[y * w + x] = on ? 1 : 0;
    }
    return m;
  }
  function drawTerraLogo(ox, oy, h, t) {
    var letters = ['T', 'E', 'R', 'R', 'A'], i, x, y, n, gap = Math.max(2, (h * 0.1) | 0), w = Math.round(h * 0.72);
    var total = letters.length * w + (letters.length - 1) * gap;
    var x0 = ox - ((total / 2) | 0);
    var grass = ['#2a6a28', '#3a8a34', '#4aaa40', '#1e5020'], dirt = ['#5a3a18', '#3a2410', '#7a5428', '#2a1808'];
    var ore = ['#e8c868', '#80d0e8', '#c070ff'], drip = 0;
    if (!T.reduced) drip = ((t * 18) | 0) % (h + 6);
    for (n = 0; n < letters.length; n++) {
      var m = letterMask(letters[n], w, h), lx = x0 + n * (w + gap);
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        /* 1px dark outline for readability */
        ctx.fillStyle = '#140e0a';
        if (!m[y * w + x - 1]) ctx.fillRect(lx + x - 1, oy + y, 1, 1);
        if (!m[y * w + x + 1]) ctx.fillRect(lx + x + 1, oy + y, 1, 1);
        if (y === 0 || !m[(y - 1) * w + x]) ctx.fillRect(lx + x, oy + y - 1, 1, 1);
        if (y === h - 1 || !m[(y + 1) * w + x]) ctx.fillRect(lx + x, oy + y + 1, 1, 1);
      }
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        var layer = (y / Math.max(1, h * 0.28)) | 0;
        var col;
        if (y <= 2) col = grass[T.hash(x + n * 9, y, 3) * grass.length | 0];
        else if (n === 0 && y <= 4 && x < w * 0.55) col = (y <= 2 ? '#e8f0f8' : '#c8d4e0');
        else if (T.hash(x + n, y, 7) < 0.05) col = ore[T.hash(x, y, 8) * ore.length | 0];
        else col = dirt[Math.min(dirt.length - 1, layer + (T.hash(x, (y / 3) | 0, 5) < 0.2 ? 1 : 0))];
        if (y > 2 && T.hash(x + 2, y, 13) < 0.08) col = '#2a4a20';
        ctx.fillStyle = col;
        ctx.fillRect(lx + x, oy + y, 1, 1);
      }
      /* grass tufts, maybe swaying */
      for (x = 0; x < w; x++) if (m[x] || (h > 1 && m[w + x])) {
        if (T.hash(x, n, 19) < 0.45) {
          var sway = (!T.reduced && T.hash(x, n, 21) < 0.7) ? ((Math.sin(t * 2.2 + x + n) > 0) ? 1 : 0) : 0;
          ctx.fillStyle = grass[2];
          ctx.fillRect(lx + x + sway, oy - 1, 1, 1);
        }
      }
      /* tiny waterfall on the first R */
      if (n === 2 && !T.reduced) {
        var fx = lx + (w * 0.55) | 0, fy = oy + (h * 0.22) | 0;
        ctx.fillStyle = '#48b0d0';
        ctx.fillRect(fx, fy, 1, 2);
        var dy = fy + (drip % (h - 4));
        ctx.fillStyle = '#a0e0f0';
        ctx.fillRect(fx, dy, 1, 1);
        ctx.fillStyle = '#e8f8ff';
        ctx.fillRect(fx, dy + 1, 1, 1);
      }
      /* hanging roots */
      for (x = 1; x < w - 1; x++) {
        if (m[(h - 1) * w + x] && T.hash(x, n, 31) < 0.2) {
          ctx.fillStyle = '#3a2410';
          ctx.fillRect(lx + x, oy + h, 1, 1 + (T.hash(x, n, 32) < 0.5 ? 1 : 0));
        }
      }
    }
    /* crystal sparkle / fireflies */
    if (!T.reduced) {
      for (i = 0; i < 6; i++) {
        if (Math.sin(t * 4 + i * 1.7) > 0.3) {
          ctx.fillStyle = i % 2 ? '#fff8c0' : '#d8f080';
          ctx.fillRect(x0 + ((i * 17 + t * 3) % total) | 0, oy + 2 + (i * 5) % h, 1, 1);
        }
      }
    }
  }
  function drawTitle() {
    var cx = (W / 2) | 0, cy = (H * 0.58) | 0, i, x, y;
    drawSun(W * 0.14, H * 0.28, Math.max(7, Math.min(W, H) * 0.07));
    T.planet.draw(ctx, cx, cy + 6, Math.min(W, H) * 0.24, titleSpec, time, [-0.55, -0.4, 0.7], { live: true });
    if (!T.reduced) {
      for (i = 0; i < 5; i++) {
        var wx = ((time * (5 + i) + i * 40) % (W + 40)) - 20, wy = H * 0.34 + i * 7 + Math.sin(time * 0.4 + i) * 3;
        ctx.fillStyle = '#d8e0d8';
        for (y = 0; y < 3; y++) for (x = 0; x < 12; x++) if (T.fbm2(x * 0.3 + i, y, 4, 2) > 0.5) ctx.fillRect((wx + x) | 0, (wy + y) | 0, 1, 1);
      }
      for (i = 0; i < 8; i++) {
        if (Math.sin(time * 3 + i * 1.7) > 0.2) {
          ctx.fillStyle = i % 2 ? '#d8f080' : '#fff8c0';
          ctx.fillRect((cx + Math.sin(time * 0.6 + i) * 40) | 0, (cy + 4 + Math.cos(time * 0.8 + i * 0.9) * 22) | 0, 1, 1);
        }
      }
    }
    var lh = Math.max(22, Math.min(34, (H * 0.2) | 0));
    drawTerraLogo((W / 2) | 0, Math.max(8, ((H * 0.08) | 0)), lh, time);
  }

  function drawBuilder() {
    var cx = (W * 0.36) | 0, cy = (H * 0.5) | 0, R = Math.min(W, H) * 0.32;
    if (W < 420) { cx = (W / 2) | 0; cy = Math.round(H * 0.32); R = Math.min(W, H) * 0.22; }
    if (popT >= 0 && inflate < 0.2) T.planet.flatDraw(ctx, cx, cy, R, spec, mask);
    else T.planet.draw(ctx, cx, cy, R, spec, time, [-0.62, -0.4, 0.66], { live: true, inflate: inflate < 1 ? inflate : undefined });
  }

  function drawSystem(focus) {
    var c = worldToScreen(0, 0);
    drawSun(c.x, c.y, Math.max(18, SUN_WORLD * cam.z));
    ensureOrbits();
    var i, k, it, hex, rgb;
    function hexRgb(h) { return T.hex(h); }
    /* each planet's own tinted orbit, glow, sparkles */
    for (i = 0; i < planets.length; i++) {
      var p = planets[i], o = orbitOf(p), rx = o.radius * cam.z, ry = o.radius * 0.46 * cam.z;
      rgb = hexRgb(planetTint(p));
      var steps = Math.max(64, (rx * 6) | 0), hot = hoverP && hoverP.id === p.id;
      for (k = 0; k < steps; k++) {
        var a = (k / steps) * TAU, px = (c.x + Math.cos(a) * rx) | 0, py = (c.y + Math.sin(a) * ry) | 0;
        var glow = hot ? 0.9 : 0.45;
        if (T.bayer(px, py) < glow) {
          ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
          ctx.fillRect(px, py, 1, 1);
        }
        if (hot && T.bayer(px + 1, py) < 0.35) ctx.fillRect(px, py - 1, 1, 1);
      }
      /* sparkle motes along the path */
      if (!T.reduced) {
        for (k = 0; k < 6; k++) {
          var sa = T.hash(k, p.n || 1, 9) * TAU + time * 0.15 * (0.5 + k * 0.1);
          var tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 3 + k + (p.n || 0)));
          if (tw > 0.55) {
            ctx.fillStyle = tw > 0.85 ? '#fff' : 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
            ctx.fillRect((c.x + Math.cos(sa) * rx) | 0, (c.y + Math.sin(sa) * ry) | 0, 1, 1);
          }
        }
      }
    }
    var order = planets.map(function (p) { var pos = planetPos(p, time); return { p: p, pos: pos, sp: worldToScreen(pos.x, pos.y) }; });
    order.sort(function (a, b) { return a.pos.y - b.pos.y; });
    for (i = 0; i < order.length; i++) {
      it = order[i];
      rgb = hexRgb(planetTint(it.p));
      /* fading trail behind the planet */
      var id = it.p.id || ('n' + it.p.n);
      if (!orbitTrails[id]) orbitTrails[id] = [];
      var tr = orbitTrails[id];
      tr.push({ x: it.sp.x, y: it.sp.y, t: 0 });
      if (tr.length > 18) tr.shift();
      if (!T.reduced) {
        var ti;
        for (ti = 0; ti < tr.length; ti++) {
          var fade = ti / tr.length;
          if (T.bayer(tr[ti].x | 0, tr[ti].y | 0) < fade) {
            ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
            ctx.fillRect(tr[ti].x | 0, tr[ti].y | 0, 1 + (fade > 0.7 ? 1 : 0), 1);
          }
        }
      }
      var lightDist = Math.hypot(it.pos.x, it.pos.y) || 1;
      var light = [-it.pos.x / lightDist, -it.pos.y / lightDist, 0.62];
      var viewR = VIEW_R * cam.z;
      var custom = !!it.p.shape;
      T.planet.draw(ctx, it.sp.x, it.sp.y, viewR, it.p, time, light, { sheet: custom && cam.z < 1.5, mine: T.isMine(it.p.id), live: !custom || cam.z >= 1.5 });
      if (hoverP && hoverP.id === it.p.id) {
        var rr = T.planet.bodyRadius(viewR, it.p.size) + 4, aa, hx, hy;
        ctx.fillStyle = '#fff8c0';
        for (aa = 0; aa < 16; aa++) {
          hx = (it.sp.x + Math.cos(aa / 16 * TAU + time) * rr) | 0;
          hy = (it.sp.y + Math.sin(aa / 16 * TAU + time) * rr) | 0;
          ctx.fillRect(hx, hy, 1, 1);
        }
      }
    }
  }

  function drawLaunch(dt) {
    if (!launch) return;
    launch.t += dt;
    var u = T.clamp(launch.t / (T.reduced ? 0.6 : 2.3), 0, 1);
    var ease = u * u * (3 - 2 * u);
    var p = launch.planet;
    var dest = p ? planetPos(p, time) : { x: 80, y: 0 };
    var ds = worldToScreen(dest.x, dest.y);
    var x = T.lerp(launch.from.x, ds.x, ease);
    var y = T.lerp(launch.from.y, ds.y, ease);
    var r = T.lerp(launch.from.r, VIEW_R * cam.z, ease);
    cam.x = T.lerp(0, dest.x, Math.max(0, ease - 0.3) / 0.7);
    cam.y = T.lerp(0, dest.y, Math.max(0, ease - 0.3) / 0.7);
    cam.z = T.lerp(1.6, 1.05, ease);
    if (ease > 0.25) drawSystem();
    else drawSun(T.lerp(W * 1.2, worldToScreen(0, 0).x, ease), T.lerp(H * 0.3, worldToScreen(0, 0).y, ease), Math.max(18, SUN_WORLD * cam.z));
    if (!T.reduced) {
      trails.push({ x: x, y: y, t: 0, r: r * 0.5 });
      var ti;
      for (ti = trails.length - 1; ti >= 0; ti--) {
        trails[ti].t += 0.04;
        if (trails[ti].t > 0.55) { trails.splice(ti, 1); continue; }
        var fade = 1 - trails[ti].t / 0.55;
        ctx.fillStyle = fade > 0.6 ? '#ffe8c0' : (fade > 0.3 ? '#fa8a2c' : '#c43808');
        ctx.fillRect(trails[ti].x | 0, trails[ti].y | 0, 2, 2);
        ctx.fillRect((trails[ti].x - 3) | 0, (trails[ti].y + 2) | 0, 3, 1);
      }
    }
    T.planet.draw(ctx, x, y, r, launch.spec, time, [-0.62, -0.4, 0.66], { live: true });
    if (u >= 1 && !launch.waiting) {
      trails = [];
      if (p) { cam.x = dest.x; cam.y = dest.y; cam.z = 1.35; }
      if (T.sfx) T.sfx.arrive();
      showMode('system');
      launch = null;
    }
  }

  function drawSurface(dt) {
    T.surface.step(world, dt, keys, W, H);
    var camX = playerCam();
    T.surface.draw(ctx, world, camX, W, H, time);
  }
  function playerCam() {
    var x = T.surface.player.x - W / 2;
    return x;
  }

  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    if (popT >= 0) {
      popT += dt / 0.7;
      var u = T.clamp(popT, 0, 1), e = 1 - Math.pow(1 - u, 3);
      inflate = e < 1 ? e * 1.16 : 1 - (1 - Math.min(1, (popT - 1) / 0.18)) * 0.16;
      if (popT >= 1.18) { inflate = 1; popT = -1; }
    }
    ctx.fillStyle = '#120e0c';
    ctx.fillRect(0, 0, W, H);
    if (mode !== 'surface') drawStars();
    if (mode === 'title') drawTitle();
    else if (mode === 'builder') drawBuilder();
    else if (mode === 'launch') drawLaunch(dt);
    else if (mode === 'system' || mode === 'inspect') drawSystem();
    else if (mode === 'surface') drawSurface(dt);
    requestAnimationFrame(loop);
  }

  /* ---------- boot ---------- */
  function builderLayout() {
    var cx = (W * 0.36) | 0, cy = (H * 0.5) | 0, R = Math.min(W, H) * 0.32;
    if (W < 420) { cx = (W / 2) | 0; cy = Math.round(H * 0.32); R = Math.min(W, H) * 0.22; }
    return { cx: cx, cy: cy, viewR: R, bodyR: T.planet.bodyRadius(R, spec.size), rot: time * (T.reduced ? 0.12 : 0.28) };
  }
  function tryPaintAt(sx, sy) {
    var L = builderLayout(), uv = T.planet.pickUV(sx, sy, L.cx, L.cy, L.bodyR, L.rot);
    if (!uv) return false;
    T.stampPaint(spec, uv.lon, uv.lat, paintColor, paintBrush);
    return true;
  }
  function fillPaint() {
    var box = $('paint-pal'); if (!box) return;
    box.innerHTML = '';
    var i;
    for (i = 0; i < T.PAINT_PAL.length; i++) {
      if (!T.PAINT_PAL[i]) {
        var er = document.createElement('button');
        er.type = 'button'; er.className = 'swatch'; er.title = 'Erase';
        er.style.background = '#1a1008'; er.setAttribute('data-paint', '0');
        if (paintColor === 0) er.classList.add('on');
        er.addEventListener('click', function () { paintColor = 0; fillPaint(); if (T.sfx) T.sfx.click(); });
        box.appendChild(er);
        continue;
      }
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'swatch';
        b.style.background = T.PAINT_PAL[idx];
        b.setAttribute('data-paint', String(idx));
        if (paintColor === idx) b.classList.add('on');
        b.addEventListener('click', function () { paintColor = idx; fillPaint(); if (T.sfx) T.sfx.click(); });
        box.appendChild(b);
      })(i);
    }
    document.querySelectorAll('#paint-brush [data-brush]').forEach(function (b) {
      b.classList.toggle('on', +b.getAttribute('data-brush') === paintBrush);
    });
    if (T.ui && T.ui.skinAll) T.ui.skinAll();
  }
  function fillChoices() {
    var box = $('biomes');
    T.BIOMES.forEach(function (b) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = T.BIOME_LABEL[b] || b; btn.setAttribute('data-biome', b);
      btn.addEventListener('click', function () { spec.biome = b; if (T.sfx) T.sfx.click(); syncFromSpec(); });
      box.appendChild(btn);
    });
    var cp = $('cloudpats');
    T.CLOUD_PATS.forEach(function (p) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = p; btn.setAttribute('data-pat', p);
      btn.addEventListener('click', function () { spec.cloudPat = p; if (T.sfx) T.sfx.click(); syncFromSpec(); });
      cp.appendChild(btn);
    });
    var ah = $('atmo-hues'), i;
    for (i = 0; i < 8; i++) {
      var h = i / 8, col = (function (hh) {
        var a = hh * 6, k = a | 0, f = a - k, v = 1, s = 0.55, p = v * (1 - s), q = v * (1 - f * s), t2 = v * (1 - (1 - f) * s), r, g, b;
        if (k === 0) { r = v; g = t2; b = p; } else if (k === 1) { r = q; g = v; b = p; } else if (k === 2) { r = p; g = v; b = t2; }
        else if (k === 3) { r = p; g = q; b = v; } else if (k === 4) { r = t2; g = p; b = v; } else { r = v; g = p; b = q; }
        return 'rgb(' + (r * 255 | 0) + ',' + (g * 255 | 0) + ',' + (b * 255 | 0) + ')';
      })(h);
      var btn = document.createElement('button'); btn.className = 'swatch'; btn.style.background = col; btn.setAttribute('data-hue', String(h));
      btn.addEventListener('click', function (hh) { return function () { spec.atmoHue = hh; if (T.sfx) T.sfx.click(); syncFromSpec(); }; }(h));
      ah.appendChild(btn);
    }
  }

  async function boot() {
    canvas = $('view'); ctx = canvas.getContext('2d', { willReadFrequently: true });
    resize(); seedStars();
    titleSpec = T.defaultSpec(0x71ee4a2);
    titleSpec.biome = 'garden'; titleSpec.land = 0.62; titleSpec.clouds = 0.5; titleSpec.iceCaps = 0.35; titleSpec.atmoHue = 0.55; titleSpec.aurora = 0.28; titleSpec.city = 0.3;
    titleSpec.glow = 0.35; titleSpec.volcanoes = 0.05; titleSpec.ringOn = 1;
    titleSpec.rings = [{ inner: 0.14, outer: 0.4, tilt: 0.38, color: 'gold', banding: 0.45, density: 0.62 }];
    titleSpec.moons = [T.defaultMoon(0x71ee4a2, 0)];
    titleSpec.moons[0].type = 'icy'; titleSpec.moons[0].size = 0.42; titleSpec.moons[0].dist = 0.82;
    spec = T.defaultSpec(0x51a7e0);
    spec.biome = 'garden'; spec.land = 0.6; spec.clouds = 0.4; spec.cloudPat = 'wispy';
    spec.atmo = 0.65; spec.atmoHue = 0.55; spec.iceCaps = 0.35; spec.city = 0.2;
    spec.craters = 0.15; spec.volcanoes = 0; spec.aurora = 0.1; spec.glow = 0.1;
    spec.size = 0.5; spec.rings = []; spec.moons = [T.defaultMoon(spec.seed, 0)];
    spec.moons[0].type = 'rocky'; spec.name = '';
    mask = T.planet.circleMask(T.SHAPE_N); spec.shape = null;
    fillChoices(); fillPaint(); bindDynamic(); syncFromSpec(); syncMusic();
    showMode('title');
    store = T.openStore();
    await loadPlanets();

    $('music-btn').addEventListener('click', function () { T.music.toggle(); syncMusic(); if (T.sfx) T.sfx.click(); });
    $('btn-shape').addEventListener('click', function () { if (T.sfx) T.sfx.open(); showMode('builder'); });
    $('btn-visit').addEventListener('click', function () { if (T.sfx) T.sfx.open(); cam = { x: 0, y: 0, z: 1 }; showMode('system'); });
    $('make-btn').addEventListener('click', function () { if (T.sfx) T.sfx.open(); showMode('builder'); });
    $('back-btn').addEventListener('click', goBack);
    $('tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; setTab(b.getAttribute('data-tab')); if (T.sfx) T.sfx.click(); });
    ['p-size','p-land','p-craters','p-volcanoes','p-iceCaps','p-clouds','p-atmo','p-aurora','p-city','p-glow'].forEach(function (id) {
      $(id).addEventListener('input', function () { readFields(); if (T.sfx) T.sfx.tick(); });
    });
    ['p-name','p-author','p-msg'].forEach(function (id) { $(id).addEventListener('input', readFields); });
    document.querySelectorAll('#paint-brush [data-brush]').forEach(function (b) {
      b.addEventListener('click', function () {
        paintBrush = +b.getAttribute('data-brush') || 2;
        var lab = paintBrush <= 1 ? 'fine' : paintBrush >= 4 ? 'broad' : 'medium';
        if ($('v-brush')) $('v-brush').textContent = lab;
        fillPaint();
        if (T.sfx) T.sfx.click();
      });
    });
    if ($('paint-clear')) $('paint-clear').addEventListener('click', function () {
      spec.paint = ''; spec._paintArr = null; spec._paintSrc = '';
      if (T.sfx) T.sfx.click();
    });
    $('btn-rand').addEventListener('click', function () {
      var keepAuthor = $('p-author').value;
      spec = T.defaultSpec((Math.random() * 0xffffffff) | 0);
      spec.author = keepAuthor; spec.name = T.autoName(spec.seed);
      mask = T.planet.circleMask(T.SHAPE_N); spec.shape = null; inflate = 1;
      if (T.sfx) T.sfx.whoosh();
      syncFromSpec();
    });
    $('add-ring').addEventListener('click', function () {
      if (spec.rings.length >= 3) { toast('Three rings is enough.'); if (T.sfx) T.sfx.deny(); return; }
      spec.rings.push(T.defaultRing(spec.seed, spec.rings.length));
      if (T.sfx) T.sfx.click(); renderRingsUI();
    });
    $('add-moon').addEventListener('click', function () {
      if (spec.moons.length >= 3) { toast('Three moons is enough.'); if (T.sfx) T.sfx.deny(); return; }
      spec.moons.push(T.defaultMoon(spec.seed, spec.moons.length));
      if (T.sfx) T.sfx.click(); renderMoonsUI();
    });
    $('btn-launch').addEventListener('click', launchPlanet);
    $('c-close').addEventListener('click', goBack);
    $('c-land').addEventListener('click', function () { if (selected) landOn(selected); });
    $('s-leave').addEventListener('click', goBack);

    document.querySelectorAll('#shape-presets [data-shape]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#shape-presets [data-shape]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var k = b.getAttribute('data-shape');
        mask = T.planet.presetMask(k, T.SHAPE_N);
        applyMaskToSpec();
        paintDrawbox();
        if (k !== 'sphere') startPop(); else { inflate = 1; popT = -1; if (T.sfx) T.sfx.click(); }
      });
    });
    $('brush-draw').addEventListener('click', function () { erase = false; $('brush-draw').classList.add('on'); $('brush-erase').classList.remove('on'); if (T.sfx) T.sfx.click(); });
    $('brush-erase').addEventListener('click', function () { erase = true; $('brush-erase').classList.add('on'); $('brush-draw').classList.remove('on'); if (T.sfx) T.sfx.click(); });
    $('brush-clear').addEventListener('click', function () { mask = new Uint8Array(T.SHAPE_N * T.SHAPE_N); paintDrawbox(); if (T.sfx) T.sfx.click(); });
    $('btn-pop').addEventListener('click', startPop);

    var db = $('drawbox');
    db.addEventListener('pointerdown', function (e) { painting = true; db.setPointerCapture(e.pointerId); drawAt(e, db); });
    db.addEventListener('pointermove', function (e) { if (painting) drawAt(e, db); });
    db.addEventListener('pointerup', function () { painting = false; });
    db.addEventListener('pointerleave', function () { painting = false; });

    addEventListener('keydown', function (e) { onKey(e, 1); });
    addEventListener('keyup', function (e) { onKey(e, 0); });
    function hold(id, key) {
      var el = $(id); if (!el) return;
      var set = function (v) { keys[key] = v; };
      el.addEventListener('pointerdown', function (e) { e.preventDefault(); set(1); if (key === 'jump') keys.jump = 1; });
      el.addEventListener('pointerup', function () { set(0); });
      el.addEventListener('pointerleave', function () { if (key !== 'jump') set(0); });
    }
    hold('pad-left', 'left'); hold('pad-right', 'right'); hold('pad-jump', 'jump');

    canvas.addEventListener('pointerdown', function (e) {
      if (mode === 'surface') { if (tool) placeHere(); return; }
      var p = canvasPos(e);
      if (mode === 'builder' && builderTab === 'paint') {
        paintDrag = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        if (tryPaintAt(p.x, p.y) && T.sfx) T.sfx.tick();
        return;
      }
      if (mode !== 'system' && mode !== 'inspect') return;
      drag = { x: p.x, y: p.y, cx: cam.x, cy: cam.y, moved: 0 };
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = canvasPos(e);
      if (mode === 'builder' && paintDrag && builderTab === 'paint') { tryPaintAt(p.x, p.y); return; }
      if (drag && (mode === 'system' || mode === 'inspect')) {
        var dx = (p.x - drag.x) / cam.z, dy = (p.y - drag.y) / cam.z;
        cam.x = drag.cx - dx; cam.y = drag.cy - dy;
        if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = 1;
      }
      if (mode === 'system') {
        var hit = hitPlanet(p.x, p.y);
        var chip = $('hoverchip');
        hoverP = hit && hit.p;
        if (hit) {
          chip.hidden = false;
          chip.textContent = (hit.p.name || 'Planet') + '  #' + hit.p.n;
          var r = canvas.getBoundingClientRect();
          chip.style.left = (r.left + hit.sp.x * scale) + 'px';
          chip.style.top = (r.top + hit.sp.y * scale) + 'px';
          canvas.style.cursor = 'pointer';
        } else { hoverP = null; chip.hidden = true; canvas.style.cursor = 'default'; }
      }
    });
    canvas.addEventListener('pointerup', function (e) {
      paintDrag = false;
      if (drag && !drag.moved && (mode === 'system' || mode === 'inspect')) {
        var p = canvasPos(e), hit = hitPlanet(p.x, p.y);
        if (hit) openCard(hit.p);
        else if (mode === 'inspect') goBack();
      }
      drag = null;
    });
    canvas.addEventListener('wheel', function (e) {
      if (mode !== 'system' && mode !== 'inspect') return;
      e.preventDefault();
      var p = canvasPos(e), before = cam.z;
      cam.z = T.clamp(cam.z * (e.deltaY > 0 ? 0.9 : 1.11), 0.12, 6);
    }, { passive: false });

    addEventListener('resize', resize);
    T.debug = {
      get mode() { return mode; },
      show: showMode,
      land: function (id, instant) {
        var p = planets.filter(function (x) { return x.id === id || x.n === id; })[0] || planets[0];
        if (p) landOn(p, instant);
        return p;
      },
      open: function (id) {
        var p = planets.filter(function (x) { return x.id === id || x.n === id; })[0] || planets[0];
        if (p) openCard(p);
        return p;
      },
      planets: function () { return planets; },
      world: function () { return world; },
      reload: loadPlanets,
      place: placeHere,
      setTool: function (k) { tool = k; document.querySelectorAll('#s-tools .ibtn').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-tool') === k); }); if (T.ui && T.ui.skinAll) T.ui.skinAll(); },
      paint: function (lon, lat, color, r) { T.stampPaint(spec, lon, lat, color == null ? paintColor : color, r || paintBrush); },
      setTab: setTab,
      frameSystem: frameSystem
    };
    last = performance.now();
    requestAnimationFrame(loop);
    setInterval(function () { if (mode === 'system' || mode === 'inspect') loadPlanets(); }, 20000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
