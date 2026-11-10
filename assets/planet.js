/* Terra — chunky pixel planets. Dithered shaded bodies, terrain texture, clouds, atmosphere,
   city lights, aurora, glow, custom rings and moons. A drawn 2D silhouette is inflated into a
   rotating 3D voxel body; rotation frames are pre-rendered to a sprite sheet for the system view. */
(function () {
  'use strict';
  var T = window.TERRA, TAU = T.TAU, P = T.planet = {};
  var SHD = [36, 26, 48];
  var MW = 192, MH = 96;

  var PAL = {
    ocean:  { deep:['#041428','#0a2a58','#114a86','#1a6eaa'], shallow:['#1a6eaa','#2a94c8','#48c0d8','#8ae0ec'], sand:['#8a6a32','#c4a05a','#e8d48a'], land:['#143818','#245a24','#3a7a32','#5a9a3c'], rock:['#3a3a38','#5a564e','#7a766c'], snow:['#b8c8d4','#e4eef4','#ffffff'], cloud:['#7a90a4','#c0d0dc','#f4f8fc'], atmo:['#0a3058','#2a70a8','#7ec8e8','#d0f0ff'] },
    forest: { deep:['#041820','#0a3040','#15586a','#1a7080'], shallow:['#1a7080','#2a98a0','#50c0b8'], sand:['#6a5828','#a09050','#d4c878'], land:['#0e2810','#1a4a18','#2a6e24','#3e8a30','#5aac40'], rock:['#3a342c','#5a5246','#7a7264'], snow:['#c8d4c8','#e8f0e8','#ffffff'], cloud:['#7a8c7a','#c4d4c0','#f2f8f0'], atmo:['#0a3020','#2a7050','#7ec8a0','#d0f8e8'] },
    garden: { deep:['#082028','#12485a','#1a7088','#2898b0'], shallow:['#2898b0','#48c0c8','#88e0d8'], sand:['#8a6a3a','#c8a868','#f0e0a8'], land:['#1a4018','#2e6828','#4a9038','#6ab848','#9ad868'], rock:['#4a4034','#6a6050','#8a8070'], snow:['#d0dcc8','#eef4e8','#ffffff'], cloud:['#8a9a80','#d0dcc8','#f8fcf4'], atmo:['#143820','#3a8048','#8ad878','#dcfcce'] },
    desert: { deep:['#1a2030','#243448','#305060'], shallow:['#305060','#4a7a80','#80b0a8'], sand:['#5a2e14','#8a4a22','#b86a34','#d89048','#ebb676','#f7d9a0'], land:['#6a3a18','#9a5a28','#c48440','#e0b060'], rock:['#4a3020','#6a4a32','#8a6a48'], snow:['#e8dcc8','#f4eee0','#ffffff'], cloud:['#a09070','#d8ccb0','#f8f0dc'], atmo:['#4a2010','#a05820','#e0a050','#ffe8c0'] },
    tundra: { deep:['#0c1828','#183048','#2a4a68'], shallow:['#2a4a68','#4a78a0','#88b4c8'], sand:['#6a5a40','#9a8a68','#c8c0a0'], land:['#2a3428','#4a5840','#6a7a58','#8a9a70'], rock:['#3a3a3c','#5a5a5e','#7a7a80'], snow:['#c0c8d0','#e4eaf0','#ffffff'], cloud:['#8890a0','#c8d0d8','#f4f6fa'], atmo:['#182838','#3a5878','#88b0c8','#d8eef8'] },
    ice:    { deep:['#0a2040','#183868','#2a5890'], shallow:['#2a5890','#4a88c0','#88c4e8'], sand:['#88a0b8','#c0d4e0','#e8f2f8'], land:['#4a6a88','#7a9ab8','#b0cce0'], rock:['#3a4a5a','#5a6a7a','#8a9aaa'], snow:['#c8d8e8','#e8f2fa','#ffffff'], cloud:['#90a8c0','#d0e0ec','#f8fcff'], atmo:['#102848','#3a70a8','#90d0f0','#e8f8ff'] },
    lava:   { deep:['#140808','#2a1010','#3a1814'], shallow:['#3a1814','#5a2420'], sand:['#3a2018','#5a3020'], land:['#18090f','#2c1219','#43202a','#5a2c30','#6a4030'], rock:['#1a1010','#2c1a18','#4a2c28'], snow:['#6a6058','#9a9088'], cloud:['#4a3030','#8a6860','#c8a8a0'], atmo:['#2a0808','#8a2010','#e05018','#ffb040'] },
    storm:  { deep:['#1a1020','#2a1840'], shallow:['#2a1840'], sand:['#6b3a22'], land:['#6b3a22','#9a5a30','#c98a52','#e8b886','#f4dcb4','#fff2da'], rock:['#4a3020','#7a5840'], snow:['#e8dcc8','#fff8ec'], cloud:['#c0a070','#e8d8b0','#fff8e0'], atmo:['#3a2010','#8a5030','#d4a070','#ffe8c8'] }
  };
  var RINGPAL = {
    gold:['#3a2a14','#6a4a24','#a88848','#d4c080','#f0e8c0'],
    ice:['#1a2a40','#3a5878','#7aa0b8','#c0d8e8','#f0f8ff'],
    rose:['#3a1824','#6a3040','#a85868','#d4909a','#f8d8dc'],
    dust:['#2a2420','#5a4c40','#8a7860','#c0a888','#e8d8c0'],
    jade:['#0e2418','#1e4830','#3a7860','#78b090','#d0e8d8'],
    violet:['#1a1230','#3a2860','#6850a0','#a090d0','#e0d8f8']
  };
  var MOONPAL = {
    rocky:['#2a2a32','#45454f','#6a6a76','#908f9c','#b4b3c0','#d6d5df'],
    icy:['#3d4f98','#6a7fc4','#a0b0e6','#d0d8f6','#f2f4ff'],
    cratered:['#2f211c','#503630','#785048','#a07260','#c89c84','#e4c4ac'],
    lava:['#18090f','#2c1219','#5a2c30','#ff5a1c','#ff9a2e','#ffe27a']
  };

  function hsv(h, s, v) {
    h = ((h % 1) + 1) % 1 * 6;
    var i = h | 0, f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), r, g, b;
    if (i === 0) { r = v; g = t; b = p; } else if (i === 1) { r = q; g = v; b = p; }
    else if (i === 2) { r = p; g = v; b = t; } else if (i === 3) { r = p; g = q; b = v; }
    else if (i === 4) { r = t; g = p; b = v; } else { r = v; g = p; b = q; }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  function atmoRamp(hue) {
    return [hsv(hue, 0.72, 0.16), hsv(hue, 0.55, 0.42), hsv(hue, 0.32, 0.72), hsv(hue, 0.12, 0.96)];
  }
  function pack(c) { return (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]; }

  /* ---------- terrain maps ---------- */
  var mapCache = {}, mapKeys = [];
  function mapKey(s) {
    return [s.seed, s.biome, s.land|0, ((s.land*100)|0), ((s.clouds*50)|0), s.cloudPat, ((s.craters*40)|0), ((s.volcanoes*40)|0), ((s.iceCaps*40)|0), ((s.city*40)|0)].join('|');
  }
  P.mapFor = function (spec) {
    spec = T.cleanSpec(spec);
    var key = mapKey(spec);
    if (mapCache[key]) return mapCache[key];
    var seed = spec.seed >>> 0, r = T.rng(seed), pal = PAL[spec.biome] || PAL.forest;
    var H = new Uint8Array(MW * MH), C = new Uint8Array(MW * MH), E = new Uint8Array(MW * MH), L = new Uint8Array(MW * MH), S = new Uint8Array(MW * MH);
    var ox = r() * 40, oy = r() * 40, oz = r() * 40, sea = 0.28 + (1 - spec.land) * 0.5;
    if (spec.biome === 'storm') sea = 2;
    if (spec.biome === 'ocean') sea = 0.52 + (1 - spec.land) * 0.28;
    var craters = [], vols = [], i, j, k;
    var nc = Math.round(spec.craters * 22);
    for (k = 0; k < nc; k++) {
      var a = r() * TAU, zc = r() * 2 - 1, q = Math.sqrt(Math.max(0, 1 - zc * zc));
      craters.push([Math.cos(a) * q, zc, Math.sin(a) * q, 0.05 + Math.pow(r(), 2.2) * 0.22]);
    }
    var nv = Math.round(spec.volcanoes * 10);
    for (k = 0; k < nv; k++) {
      var a2 = r() * TAU, z2 = (r() * 1.2 - 0.6), q2 = Math.sqrt(Math.max(0, 1 - z2 * z2));
      vols.push([Math.cos(a2) * q2, z2, Math.sin(a2) * q2, 0.06 + r() * 0.1]);
    }
    for (j = 0; j < MH; j++) {
      var lat = (j + 0.5) / MH * Math.PI - Math.PI / 2, cl = Math.cos(lat), y = Math.sin(lat);
      for (i = 0; i < MW; i++) {
        var lon = (i + 0.5) / MW * TAU, x = cl * Math.cos(lon), z = cl * Math.sin(lon), idx = j * MW + i;
        var el, h, cld = 0, em = 0, land = 0, city = 0;
        if (spec.biome === 'storm') {
          var warp = T.fbm3(x * 2.2 + ox, y * 5 + oy, z * 2.2, seed, 4) - 0.5;
          var bl = lat / (Math.PI / 2) + warp * 0.32;
          var bnd = Math.sin(bl * 9.5 + ox) * 0.5 + Math.sin(bl * 5 + oy) * 0.3 + 0.5;
          var tex = T.fbm3(x * 9, y * 22, z * 9, seed + 7, 3);
          h = T.clamp(bnd * 200 + tex * 55, 0, 255) | 0;
          cld = T.clamp((T.fbm3(x * 3, y * 8, z * 3, seed + 21, 3) - (0.62 - spec.clouds * 0.25)) * 600, 0, 255);
        } else {
          el = T.fbm3(x * 1.5 + ox, y * 1.5 + oy, z * 1.5 + oz, seed, 5) + 0.22 * T.fbm3(x * 5 + oz, y * 5 + ox, z * 5, seed + 9, 3);
          for (k = 0; k < craters.length; k++) {
            var cr = craters[k], ang = Math.acos(T.clamp(x * cr[0] + y * cr[1] + z * cr[2], -1, 1)) / cr[3];
            if (ang < 1.2) { if (ang < 0.82) el -= (0.82 - ang) * 0.45; else el += (1.2 - ang) * 0.28; }
          }
          for (k = 0; k < vols.length; k++) {
            var vo = vols[k], va = Math.acos(T.clamp(x * vo[0] + y * vo[1] + z * vo[2], -1, 1)) / vo[3];
            if (va < 1.4) { el += Math.max(0, 1 - va) * 0.55; if (va < 0.35) em = 255; else if (va < 0.7) em = 140; }
          }
          if (spec.biome === 'lava') {
            var lv = Math.abs(T.fbm3(x * 2.6 + ox, y * 2.6 + oy, z * 2.6 + oz, seed, 4) - 0.5);
            if (lv < 0.04) { h = lv < 0.02 ? 250 : 210; em = 255; land = 1; }
            else { h = T.clamp(40 + el * 140, 0, 180) | 0; land = 1; }
          } else if (el < sea) {
            h = T.clamp((el / sea) * 90, 0, 90) | 0;
          } else {
            land = 1;
            var t = (el - sea) / Math.max(0.05, 1 - sea), mo = T.fbm3(x * 2.2, y * 2.2, z * 2.2, seed + 3, 4);
            if (t < 0.045) h = 100 + ((t * 200) | 0);
            else if (spec.biome === 'desert') h = 120 + T.clamp(t * 80 + T.ridged3(x * 3, y * 0.8, z * 3, seed + 4, 3) * 40, 0, 100) | 0;
            else if (t > 0.72 || Math.abs(y) > 0.88) h = 200 + ((t * 40) | 0);
            else if (spec.biome === 'forest' || spec.biome === 'garden') h = 130 + T.clamp(mo * 70 + t * 40, 0, 90) | 0;
            else if (spec.biome === 'tundra') h = 140 + T.clamp(t * 50 + (1 - mo) * 30, 0, 80) | 0;
            else if (spec.biome === 'ice') h = 180 + ((t * 50) | 0);
            else h = 130 + T.clamp(mo * 40 + t * 50, 0, 80) | 0;
          }
          var cap = spec.iceCaps * (Math.pow(Math.abs(y), 1.6) * 1.15 + Math.max(0, (h - 190) / 80));
          if (land && cap > 0.55) { h = 210 + ((cap * 40) | 0); }
        }
        var cn;
        if (spec.cloudPat === 'banded') cn = T.fbm3(x * 1.2, y * 7, z * 1.2, seed + 21, 4);
        else if (spec.cloudPat === 'swirl') { var sw = Math.atan2(z, x) + y * 2.4; cn = T.fbm3(Math.cos(sw) * 2, y * 1.4, Math.sin(sw) * 2, seed + 21, 4); }
        else if (spec.cloudPat === 'cells') {
          var cx2 = Math.floor(x * 4 + 8), cy2 = Math.floor(y * 4 + 8), cz2 = Math.floor(z * 4 + 8), best = 9, ii, jj, kk;
          for (ii = -1; ii <= 1; ii++) for (jj = -1; jj <= 1; jj++) for (kk = -1; kk <= 1; kk++) {
            var hx = cx2 + ii, hy = cy2 + jj, hz = cz2 + kk, px = hx + T.hash(hx, hy, hz + seed), py = hy + T.hash(hy, hz, hx + seed), pz = hz + T.hash(hz, hx, hy + seed);
            var dd = (x * 4 + 8 - px) * (x * 4 + 8 - px) + (y * 4 + 8 - py) * (y * 4 + 8 - py) + (z * 4 + 8 - pz) * (z * 4 + 8 - pz);
            if (dd < best) best = dd;
          }
          cn = T.clamp(1 - Math.sqrt(best) * 0.7, 0, 1);
        } else cn = T.fbm3(x * 2.6 + oy, y * 3.2 + oz, z * 2.6 + ox, seed + 21, 5);
        cld = T.clamp((cn - (0.64 - spec.clouds * 0.22)) * 700, 0, 255);
        if (land && spec.city > 0 && spec.biome !== 'storm' && spec.biome !== 'lava') {
          var urb = T.fbm3(x * 8, y * 8, z * 8, seed + 40, 3);
          if (urb > 0.58 - spec.city * 0.15) city = T.clamp((urb - 0.4) * 400 * spec.city, 0, 255);
        }
        H[idx] = T.clamp(h, 0, 255) | 0; C[idx] = cld | 0; E[idx] = em | 0; L[idx] = city | 0; S[idx] = land;
      }
    }
    var map = { w: MW, h: MH, H: H, C: C, E: E, L: L, S: S, pal: pal, key: key };
    if (mapKeys.length > 28) delete mapCache[mapKeys.shift()];
    mapKeys.push(key); mapCache[key] = map;
    return map;
  };

  function sample(map, lon, lat) {
    var u = ((lon / TAU) % 1 + 1) % 1 * map.w, v = T.clamp((lat + Math.PI / 2) / Math.PI, 0, 0.99999) * map.h;
    return (v | 0) * map.w + (u | 0);
  }
  function terrainColor(map, spec, lon, lat, x, y) {
    var pal = map.pal, idx = sample(map, lon, lat), h = map.H[idx], em = map.E[idx], land = map.S[idx];
    var ramp, v;
    if (spec.biome === 'storm') { ramp = pal.land; v = h / 255; }
    else if (!land) { ramp = h < 55 ? pal.deep : pal.shallow; v = h / 90; }
    else if (h >= 200) { ramp = pal.snow; v = (h - 200) / 55; }
    else if (h < 115) { ramp = pal.sand; v = (h - 90) / 30; }
    else { ramp = pal.land; v = (h - 115) / 90; if (h > 175 && pal.rock) { ramp = pal.rock; v = (h - 175) / 30; } }
    var col = T.dqc(ramp, v + (T.bayer(x, y) - 0.5) * 0.08, x, y);
    var pv = T.samplePaint(spec, lon, lat);
    if (pv && T.PAINT_PAL[pv]) {
      var pc = T.hex(T.PAINT_PAL[pv]), k = 0.72;
      col = [(col[0] * (1 - k) + pc[0] * k + 0.5) | 0, (col[1] * (1 - k) + pc[1] * k + 0.5) | 0, (col[2] * (1 - k) + pc[2] * k + 0.5) | 0];
    }
    return { col: col, em: em, land: land, idx: idx, h: h, paint: pv };
  }

  /* ---------- sphere (default body) ---------- */
  function shade(col, raw, x, y, emit) {
    if (emit > 160) return [Math.min(255, col[0] + 40), Math.min(255, col[1] + 10), Math.min(255, Math.max(col[2], 20))];
    var sv = raw + (T.bayer(x, y) - 0.5) * 0.08;
    if (sv < 0.36) {
      var k = sv < 0.16 ? 0.62 : 0.4;
      return [col[0] + (SHD[0] - col[0]) * k, col[1] + (SHD[1] - col[1]) * k, col[2] + (SHD[2] - col[2]) * k].map(Math.round);
    }
    if (raw > 0.82) return col.map(function (v) { return Math.min(255, Math.round(v * 1.1 + 16)); });
    return col;
  }

  function paintSphere(img, cx, cy, R, spec, map, rot, light, t) {
    var W = img.width, H = img.height, d = img.data, lx = light[0], ly = light[1], lz = light[2];
    var atmW = Math.max(2, R * (0.1 + spec.atmo * 0.18)), glowW = atmW + R * spec.glow * 0.22;
    var ar = atmoRamp(spec.atmoHue), pal = map.pal;
    var x0 = Math.max(0, (cx - R - glowW - 1) | 0), x1 = Math.min(W - 1, (cx + R + glowW + 1) | 0);
    var y0 = Math.max(0, (cy - R - glowW - 1) | 0), y1 = Math.min(H - 1, (cy + R + glowW + 1) | 0);
    var x, y, o;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      var dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, r2 = dx * dx + dy * dy, col = null;
      if (r2 <= 1) {
        var nz = Math.sqrt(1 - r2), raw = Math.max(0, dx * lx + dy * ly + nz * lz);
        var lit = Math.max(0, Math.min(1, Math.floor(raw * 7 + (T.bayer(x, y) - 0.5) * 0.5) / 7 + 0.08));
        var lat = Math.asin(T.clamp(dy, -1, 1)), lon = Math.atan2(dx, nz) + rot;
        var sm = terrainColor(map, spec, lon, lat, x, y);
        col = shade(sm.col, lit, x, y, sm.em);
        var ci = sample(map, lon + (spec.cloudPat === 'swirl' ? t * 0.15 : t * 0.05), lat);
        if (map.C[ci] > 80 + (1 - spec.clouds) * 40) {
          var cc = T.dqc(pal.cloud, 0.35 + lit * 0.65, x, y);
          var a = T.clamp((map.C[ci] - 80) / 140, 0, 1);
          if (T.bayer(x, y) < a * 0.92 + 0.08) col = shade(cc, Math.min(1, lit + 0.12), x, y, 0);
        }
        if (sm.land && spec.city > 0 && lit < 0.28 && map.L[sm.idx] > 70 && T.hash(x, y, spec.seed) < map.L[sm.idx] / 320) {
          col = T.bayer(x, y) < 0.55 ? [255, 220, 110] : [255, 150, 50];
        }
        if (r2 > Math.pow(1 - 1.6 / R, 2) && dx * lx + dy * ly > 0.35 && lit > 0.5) col = col.map(function (v) { return Math.min(255, Math.round(v * 1.16 + 20)); });
      } else {
        var e = (Math.sqrt(r2) - 1) * R;
        if (e < glowW) {
          var side = 0.45 + 0.55 * Math.max(0, -(dx * lx + dy * ly) / Math.sqrt(r2));
          var v = (1 - e / (e < atmW ? atmW : glowW)) * side;
          if (e < atmW && v * 1.25 > T.bayer(x, y) * 0.9 + 0.08) col = T.dqc(ar, v * 1.1, x, y);
          if (!col && spec.glow > 0 && e < glowW && v * spec.glow > T.bayer(x + 2, y) * 0.85 + 0.12) col = T.dqc(ar, 0.35 + v * 0.5, x, y);
          if (spec.aurora > 0) {
            var lat2 = Math.asin(T.clamp(dy * R / (R + e), -1, 1));
            if (Math.abs(lat2) > 0.55 && e < atmW + 3) {
              var au = Math.sin(Math.atan2(dx, 1) * 8 + t * 1.8 + lat2 * 10);
              if (au > 0.25 && T.bayer(x, y) < spec.aurora * (au - 0.1) * (Math.abs(lat2) - 0.5) * 2) {
                col = T.dqc(Math.abs(lat2) > 0.8 ? ['#143018','#2a9048','#80f0a0','#e8ffe8'] : ['#201040','#6030a0','#c080ff','#f8e8ff'], au, x, y);
              }
            }
          }
        }
      }
      if (col) { o = (y * W + x) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
    }
  }

  /* ---------- 2D shape → 3D inflate ---------- */
  P.circleMask = function (n) {
    n = n || T.SHAPE_N;
    var m = new Uint8Array(n * n), r = n / 2 - 1.15, cx = n / 2, cy = n / 2, i, j, dx, dy;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) { dx = i + 0.5 - cx; dy = j + 0.5 - cy; if (dx * dx + dy * dy <= r * r) m[j * n + i] = 1; }
    return m;
  };
  P.presetMask = function (kind, n) {
    n = n || T.SHAPE_N;
    if (!kind || kind === 'sphere') return P.circleMask(n);
    var m = new Uint8Array(n * n), i, j;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
      var x = (i + 0.5) / n * 2 - 1, y = -((j + 0.5) / n * 2 - 1), on = 0;
      if (kind === 'heart') {
        x *= 1.15; y = y * 1.15 - 0.05;
        on = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;
      } else if (kind === 'pear') {
        var yy = y * 1.05 - 0.05, r1 = 0.38 - yy * 0.18; if (r1 < 0.18) r1 = 0.18;
        on = x * x + (yy - 0.15) * (yy - 0.15) / 1.35 <= r1 * r1 || (x * x + (yy + 0.42) * (yy + 0.42) <= 0.22 * 0.22);
      } else if (kind === 'bean') {
        on = (x + 0.18) * (x + 0.18) / 0.72 + y * y / 0.5 <= 0.38 || (x - 0.22) * (x - 0.22) / 0.55 + (y - 0.08) * (y - 0.08) / 0.42 <= 0.28;
      } else if (kind === 'diamond') {
        on = Math.abs(x) + Math.abs(y) * 1.15 <= 0.92;
      }
      if (on) m[j * n + i] = 1;
    }
    return m;
  };
  P.packMask = function (m) {
    var bytes = [], i, k, b;
    for (i = 0; i < m.length; i += 8) { b = 0; for (k = 0; k < 8; k++) if (m[i + k]) b |= 1 << k; bytes.push(b); }
    var s = '';
    for (i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  };
  P.unpackMask = function (b64, n) {
    n = n || T.SHAPE_N;
    if (!b64) return P.circleMask(n);
    try {
      var s = atob(b64), m = new Uint8Array(n * n), i, k, b, idx;
      for (i = 0; i < s.length; i++) { b = s.charCodeAt(i); for (k = 0; k < 8; k++) { idx = i * 8 + k; if (idx < m.length && (b & (1 << k))) m[idx] = 1; } }
      return m;
    } catch (e) { return P.circleMask(n); }
  };
  P.sdf = function (m, n) {
    var d = new Float32Array(n * n), INF = n * 2, i, j, v;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
      if (!m[j * n + i]) { d[j * n + i] = 0; continue; }
      v = INF;
      if (i) v = Math.min(v, d[j * n + i - 1] + 1);
      if (j) v = Math.min(v, d[(j - 1) * n + i] + 1);
      if (i && j) v = Math.min(v, d[(j - 1) * n + i - 1] + 1.414);
      if (i < n - 1 && j) v = Math.min(v, d[(j - 1) * n + i + 1] + 1.414);
      d[j * n + i] = v;
    }
    for (j = n - 1; j >= 0; j--) for (i = n - 1; i >= 0; i--) {
      if (!m[j * n + i]) continue;
      v = d[j * n + i];
      if (i < n - 1) v = Math.min(v, d[j * n + i + 1] + 1);
      if (j < n - 1) v = Math.min(v, d[(j + 1) * n + i] + 1);
      if (i < n - 1 && j < n - 1) v = Math.min(v, d[(j + 1) * n + i + 1] + 1.414);
      if (i && j < n - 1) v = Math.min(v, d[(j + 1) * n + i - 1] + 1.414);
      d[j * n + i] = v;
    }
    return d;
  };

  function sdfAt(d, n, i, j) { if (i < 0 || j < 0 || i >= n || j >= n) return 0; return d[j * n + i]; }

  function sdfB(d, n, fx, fy) {
    var x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    return (1 - tx) * (1 - ty) * sdfAt(d, n, x0, y0) + tx * (1 - ty) * sdfAt(d, n, x0 + 1, y0)
      + (1 - tx) * ty * sdfAt(d, n, x0, y0 + 1) + tx * ty * sdfAt(d, n, x0 + 1, y0 + 1);
  }

  /* Per-pixel orthographic raycast into the inflated SDF. Solid coverage, no scanline gaps. */
  function paintVoxel(img, cx, cy, R, spec, map, rot, light, t, inflate) {
    var mask = P.unpackMask(spec.shape, T.SHAPE_N), n = T.SHAPE_N, sdf = P.sdf(mask, n);
    var W = img.width, H = img.height, d = img.data;
    var zbuf = new Float32Array(W * H), i;
    for (i = 0; i < zbuf.length; i++) zbuf[i] = -1e9;
    inflate = inflate == null ? 1 : inflate;
    var sc = (R * 2) / n, lx = light[0], ly = light[1], lz = light[2], ca = Math.cos(rot), sa = Math.sin(rot);
    var mid = n / 2, rad = mid + 1.2;
    var step = sc >= 2.2 ? 0.4 : sc >= 1.2 ? 0.5 : 0.65;
    var x0 = Math.max(0, (cx - R - 2) | 0), x1 = Math.min(W - 1, (cx + R + 2) | 0);
    var y0 = Math.max(0, (cy - R - 2) | 0), y1 = Math.min(H - 1, (cy + R + 2) | 0);
    var x, y, zr, wx, wy, wz, fx, fy, zm, hit, hx, hy, hz, hwz, ix, iy;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      var xr = (x + 0.5 - cx) / sc, yr = (y + 0.5 - cy) / sc;
      if (xr * xr + yr * yr > rad * rad * 1.2) continue;
      hit = 0;
      for (zr = rad; zr >= -rad; zr -= step) {
        wx = xr * ca + zr * sa; wz = -xr * sa + zr * ca; wy = yr;
        fx = wx + mid; fy = wy + mid;
        if (fx < 0 || fy < 0 || fx >= n - 0.001 || fy >= n - 0.001) continue;
        ix = fx | 0; iy = fy | 0;
        if (!mask[iy * n + ix]) continue;
        zm = sdfB(sdf, n, fx, fy) * inflate;
        if (Math.abs(wz) <= zm + 0.45) { hit = 1; hx = wx; hy = wy; hz = zr; hwz = wz; break; }
      }
      if (!hit) continue;
      zbuf[y * W + x] = hz;
      var e = 0.7;
      var ddx = (sdfB(sdf, n, hx + mid + e, hy + mid) - sdfB(sdf, n, hx + mid - e, hy + mid)) / (2 * e);
      var ddy = (sdfB(sdf, n, hx + mid, hy + mid + e) - sdfB(sdf, n, hx + mid, hy + mid - e)) / (2 * e);
      var ddz = hwz >= 0 ? -1 : 1;
      var nrx = ddx * ca - ddz * sa, nrz = ddx * sa + ddz * ca, nry = ddy;
      var len = Math.hypot(nrx, nry, nrz) || 1;
      var raw = Math.max(0, (nrx * lx + nry * ly + nrz * lz) / len);
      var lit = Math.max(0, Math.min(1, Math.floor(raw * 7 + (T.bayer(x, y) - 0.5) * 0.55) / 7 + 0.08));
      var rr = Math.hypot(hx, hy, hwz) || 1;
      var lat = Math.asin(T.clamp(hy / rr, -1, 1)), lon = Math.atan2(hx, hwz);
      var sm = terrainColor(map, spec, lon, lat, x, y);
      var col = shade(sm.col, lit, x, y, sm.em);
      var ci = sample(map, lon, lat);
      if (map.C[ci] > 90) {
        var cc = T.dqc(map.pal.cloud, 0.35 + lit * 0.65, x, y);
        if (T.bayer(x, y) < (map.C[ci] / 255)) col = shade(cc, lit, x, y, 0);
      }
      if (sm.land && spec.city > 0 && lit < 0.28 && map.L[sm.idx] > 70 && T.hash(x, y, spec.seed) < map.L[sm.idx] / 320) col = [255, 214, 96];
      var o = (y * W + x) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    /* atmosphere: dilate only the true silhouette */
    var atmW = Math.max(2, Math.min(10, R * (0.1 + spec.atmo * 0.16))), ar = atmoRamp(spec.atmoHue), q = [];
    if (spec.atmo > 0.05 || spec.glow > 0 || spec.aurora > 0) {
      var dist = new Float32Array(W * H), i2;
      for (i2 = 0; i2 < dist.length; i2++) dist[i2] = 1e9;
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (zbuf[y * W + x] > -1e8) { dist[y * W + x] = 0; q.push(x, y); }
      for (var qi = 0; qi < q.length; qi += 2) {
        var px = q[qi], py = q[qi + 1], pd = dist[py * W + px];
        if (pd >= atmW) continue;
        var nb = [1, 0, -1, 0, 0, 1, 0, -1], k2;
        for (k2 = 0; k2 < 8; k2 += 2) {
          var nx2 = px + nb[k2], ny2 = py + nb[k2 + 1];
          if (nx2 < 0 || ny2 < 0 || nx2 >= W || ny2 >= H) continue;
          var nd = pd + 1;
          if (nd < dist[ny2 * W + nx2] && nd <= atmW) { dist[ny2 * W + nx2] = nd; q.push(nx2, ny2); }
        }
      }
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        if (d[(y * W + x) * 4 + 3]) continue;
        var near = dist[y * W + x];
        if (near > atmW) continue;
        var vv = 1 - near / atmW, dx = (x - cx) / R, dy = (y - cy) / R;
        var side = 0.45 + 0.55 * Math.max(0, -(dx * lx + dy * ly) / (Math.hypot(dx, dy) || 1));
        if (vv * side > T.bayer(x, y) * 0.9 + 0.08) {
          var c2 = T.dqc(ar, vv * side, x, y), o2 = (y * W + x) * 4;
          d[o2] = c2[0]; d[o2 + 1] = c2[1]; d[o2 + 2] = c2[2]; d[o2 + 3] = 255;
        }
      }
    }
  }

  /* ---------- rings ---------- */
  function maxRingScale(spec) {
    var m = 1, i; if (!spec.rings) return m;
    for (i = 0; i < spec.rings.length; i++) m = Math.max(m, 1.05 + spec.rings[i].outer * 1.35);
    return m;
  }
  function paintRings(img, cx, cy, R, spec, light, behind) {
    if (!spec.rings || !spec.rings.length) return;
    var W = img.width, H = img.height, d = img.data, i, x, y;
    for (i = 0; i < spec.rings.length; i++) {
      var rg = spec.rings[i], tilt = rg.tilt * 0.85, inn = R * (1.12 + rg.inner * 0.9), out = R * (1.2 + rg.outer * 1.35);
      if (out <= inn) out = inn + 3;
      var pal = RINGPAL[rg.color] || RINGPAL.gold, dens = rg.density, band = rg.banding;
      var yb = Math.max(0, (cy - out * (0.25 + Math.abs(tilt) * 0.9) - 2) | 0), ye = Math.min(H - 1, (cy + out * (0.25 + Math.abs(tilt) * 0.9) + 2) | 0);
      var xb = Math.max(0, (cx - out - 2) | 0), xe = Math.min(W - 1, (cx + out + 2) | 0);
      for (y = yb; y <= ye; y++) for (x = xb; x <= xe; x++) {
        var dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        var ey = dy / Math.max(0.18, 0.28 + Math.abs(tilt) * 0.7);
        var rr = Math.hypot(dx, ey);
        if (rr < inn || rr > out) continue;
        var front = dy > 0;
        if (behind && front) continue;
        if (!behind && !front) continue;
        var u = (rr - inn) / (out - inn);
        if (band > 0.08 && Math.abs(Math.sin(u * (3 + band * 8) * Math.PI)) < band * 0.28) continue;
        if (T.bayer(x, y) > dens * 0.92 + 0.05) continue;
        var lit = 0.45 + 0.55 * Math.max(0, (dx / (out || 1)) * light[0] + 0.3);
        if (T.hash(x, y + i * 3, spec.seed) > 0.14 + dens * 0.7) continue;
        var col = T.dqc(pal, u * 0.7 + lit * 0.3, x, y);
        var o = (y * W + x) * 4;
        if (!behind && d[o + 3] > 128) continue;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
  }

  /* ---------- moons ---------- */
  var moonSpr = {};
  function moonCanvas(type, seed, sz) {
    var key = type + ':' + (seed & 255) + ':' + sz;
    if (moonSpr[key]) return moonSpr[key];
    var S = T.make(sz, sz), pal = MOONPAL[type] || MOONPAL.rocky, R = sz * 0.38, cx = sz / 2, cy = sz / 2;
    var img = S.img, d = img.data, x, y, s = seed;
    for (y = 0; y < sz; y++) for (x = 0; x < sz; x++) {
      var dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, r2 = dx * dx + dy * dy;
      if (r2 > 1) continue;
      var nz = Math.sqrt(1 - r2), raw = Math.max(0, dx * -0.6 + dy * -0.4 + nz * 0.6);
      var lon = Math.atan2(dx, nz), lat = Math.asin(dy);
      var h = T.fbm2(lon * 3 + 2, lat * 3, s, 4);
      if (type === 'cratered' || type === 'rocky') {
        var cr = T.noise2(lon * 5, lat * 5, s + 4);
        if (cr > 0.72) raw *= 0.55;
      }
      if (type === 'lava' && T.noise2(lon * 6, lat * 6, s + 2) > 0.74) { h = 0.95; raw = Math.max(raw, 0.7); }
      var col = T.dqc(pal, h * 0.55 + raw * 0.5, x, y);
      col = shade(col, raw, x, y, type === 'lava' && h > 0.85 ? 200 : 0);
      var o = (y * sz + x) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    S.g.putImageData(img, 0, 0);
    moonSpr[key] = S.c;
    return S.c;
  }
  function moonPos(cx, cy, R, spec, moon, t, i) {
    var ext = maxRingScale(spec);
    var dist = R * (ext + 0.4 + moon.dist * 1.7);
    var spd = 0.25 + moon.speed * 1.15;
    var ang = t * spd + (moon.seed & 1023) * 0.01 + i * 1.7;
    return { x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist * 0.32, z: Math.sin(ang), ang: ang, dist: dist };
  }
  function paintMoons(ctx, cx, cy, R, spec, t, behind) {
    if (!spec.moons) return;
    for (var i = 0; i < spec.moons.length; i++) {
      var m = spec.moons[i], p = moonPos(cx, cy, R, spec, m, t, i);
      if (behind && p.z > 0) continue;
      if (!behind && p.z <= 0) continue;
      var sz = Math.max(6, Math.round(R * (0.16 + m.size * 0.22)));
      if (sz % 2) sz++;
      var spr = moonCanvas(m.type, m.seed, Math.min(32, Math.max(10, sz)));
      T.setSmooth(ctx, false);
      ctx.drawImage(spr, Math.round(p.x - sz / 2), Math.round(p.y - sz / 2), sz, sz);
    }
  }

  /* ---------- compositing / sheets ---------- */
  function padFor(R, spec) { return Math.ceil(R * maxRingScale(spec) + R * 1.1 + 8); }

  P.bodyRadius = function (viewR, size) { return Math.max(6, Math.round(viewR * (0.62 + size * 0.5))); };

  function renderBody(S, cx, cy, R, spec, map, rot, light, t, inflate) {
    S.g.clearRect(0, 0, S.c.width, S.c.height);
    var img = S.g.createImageData(S.c.width, S.c.height);
    paintRings(img, cx, cy, R, spec, light, true);
    if (spec.shape && inflate !== 0) paintVoxel(img, cx, cy, R, spec, map, rot, light, t, inflate == null ? 1 : inflate);
    else if (!spec.shape) paintSphere(img, cx, cy, R, spec, map, rot, light, t);
    else {
      /* inflate 0: flat 2D silhouette */
      var mask = P.unpackMask(spec.shape, T.SHAPE_N), n = T.SHAPE_N, sc = (R * 2) / n, mid = n / 2, i, j;
      var d = img.data, W = img.width;
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) if (mask[j * n + i]) {
        var sx = Math.round(cx + (i + 0.5 - mid) * sc), sy = Math.round(cy + (j + 0.5 - mid) * sc);
        if (sx < 0 || sy < 0 || sx >= img.width || sy >= img.height) continue;
        var lat = ((j + 0.5) / n * Math.PI - Math.PI / 2), lon = (i + 0.5) / n * TAU;
        var sm = terrainColor(map, spec, lon, lat, sx, sy), o = (sy * W + sx) * 4;
        d[o] = sm.col[0]; d[o + 1] = sm.col[1]; d[o + 2] = sm.col[2]; d[o + 3] = 255;
        if (sc > 1.1 && sx + 1 < img.width && sy + 1 < img.height) {
          var p = (sy * W + sx + 1) * 4; d[p] = sm.col[0]; d[p + 1] = sm.col[1]; d[p + 2] = sm.col[2]; d[p + 3] = 255;
        }
      }
    }
    paintRings(img, cx, cy, R, spec, light, false);
    S.g.putImageData(img, 0, 0);
  }

  var sheets = {}, sheetOrder = [];
  function sheetKey(spec, size, n) {
    return [spec.seed, spec.biome, ((spec.size * 20) | 0), size, n, spec.shape || '-', spec.rings && spec.rings.length, spec.atmoHue, ((spec.land * 20) | 0), ((spec.clouds * 20) | 0), spec.cloudPat, ((spec.city * 10) | 0), ((spec.aurora * 10) | 0), ((spec.glow * 10) | 0), ((spec.iceCaps * 10) | 0), ((spec.craters * 10) | 0), ((spec.volcanoes * 10) | 0), T.paintKey(spec)].join('|');
  }
  P.invalidate = function () { sheets = {}; sheetOrder = []; mapCache = {}; mapKeys = []; };
  P.sheet = function (spec, size) {
    spec = T.cleanSpec(spec);
    size = size || (spec.shape ? 96 : 80);
    var n = T.reduced ? 12 : 24;
    var key = sheetKey(spec, size, n);
    if (sheets[key]) return sheets[key];
    var pad = padFor(Math.round(size * 0.36), spec) * 2;
    pad = Math.max(size, Math.min(120, pad));
    var map = P.mapFor(spec), light = [-0.62, -0.4, 0.66], S = T.make(pad * n, pad), tmp = T.make(pad, pad), i;
    for (i = 0; i < n; i++) {
      renderBody(tmp, pad / 2, pad / 2, Math.round(size * 0.36), spec, map, i / n * TAU, light, 0, 1);
      S.g.drawImage(tmp.c, i * pad, 0);
    }
    var sh = { c: S.c, n: n, pad: pad, size: size, key: key };
    if (sheetOrder.length > 18) { delete sheets[sheetOrder.shift()]; }
    sheetOrder.push(key); sheets[key] = sh;
    return sh;
  };

  var tmpScratch = null;
  function scratch(w, h) {
    if (!tmpScratch || tmpScratch.c.width < w || tmpScratch.c.height < h) tmpScratch = T.make(w, h);
    else tmpScratch.g.clearRect(0, 0, w, h);
    return tmpScratch;
  }

  P.draw = function (ctx, x, y, viewR, spec, t, light, opts) {
    opts = opts || {};
    spec = T.cleanSpec(spec);
    var R = P.bodyRadius(viewR, spec.size);
    light = light || [-0.62, -0.4, 0.66];
    var map = P.mapFor(spec);
    var rot = (opts.rot != null ? opts.rot : t * (T.reduced ? 0.12 : 0.28));
    var inflate = opts.inflate;
    var pad = padFor(R, spec), dim = pad * 2;
    var useSheet = !opts.live && inflate == null && (opts.sheet || (spec.shape && R <= 28));
    T.setSmooth(ctx, false);
    if (useSheet && spec.shape) {
      var sh = P.sheet(spec, 72), fi = ((Math.floor(((rot % TAU) + TAU) % TAU / TAU * sh.n)) % sh.n);
      var flip = light && light[0] > 0.15;
      ctx.save();
      if (flip) { ctx.translate(Math.round(x * 2), 0); ctx.scale(-1, 1); }
      var dw = pad * 2, dx = Math.round((flip ? -x : x) - pad), dy = Math.round(y - pad);
      ctx.drawImage(sh.c, fi * sh.pad, 0, sh.pad, sh.pad, dx, dy, dw, dw);
      ctx.restore();
    } else {
      var S = scratch(dim, dim);
      renderBody(S, pad, pad, R, spec, map, rot, light, t, inflate);
      ctx.drawImage(S.c, Math.round(x - pad), Math.round(y - pad));
    }
    paintMoons(ctx, x, y, R, spec, t, true);
    /* moons in front were skipped if we already drew the body on top... draw front moons now */
    paintMoons(ctx, x, y, R, spec, t, false);
    if (opts.mine) {
      ctx.save();
      ctx.strokeStyle = '#f0c45c';
      ctx.lineWidth = 1;
      var g = Math.max(2, (R * 0.08) | 0), k;
      for (k = 0; k < 8; k++) {
        var a = k / 8 * TAU + t * 0.4;
        ctx.fillStyle = '#f0c45c';
        ctx.fillRect(Math.round(x + Math.cos(a) * (R + 3)), Math.round(y + Math.sin(a) * (R + 3)), 1, 1);
      }
      ctx.restore();
    }
  };

  P.flatDraw = function (ctx, x, y, viewR, spec, mask) {
    spec = T.cleanSpec(spec);
    var R = P.bodyRadius(viewR, spec.size), map = P.mapFor(spec);
    var pad = padFor(R, spec), S = scratch(pad * 2, pad * 2);
    var old = spec.shape;
    spec.shape = P.packMask(mask || P.circleMask(T.SHAPE_N));
    renderBody(S, pad, pad, R, spec, map, 0, [-0.4, -0.3, 0.8], 0, 0);
    spec.shape = old;
    T.setSmooth(ctx, false);
    ctx.drawImage(S.c, Math.round(x - pad), Math.round(y - pad));
  };

  P.maxExtent = function (spec, viewR) {
    spec = T.cleanSpec(spec);
    var R = P.bodyRadius(viewR, spec.size);
    var ext = maxRingScale(spec);
    if (spec.moons && spec.moons.length) ext += 0.4 + 1.7;
    return R * ext + 8;
  };
  P.atmoRamp = atmoRamp;
  P.hsv = hsv;

  /* Screen pixel on a drawn body -> lon/lat in the same space as paintSphere. */
  P.pickUV = function (sx, sy, cx, cy, R, rot) {
    var dx = (sx + 0.5 - cx) / R, dy = (sy + 0.5 - cy) / R, r2 = dx * dx + dy * dy;
    if (r2 > 1) return null;
    var nz = Math.sqrt(Math.max(0, 1 - r2));
    return { lon: Math.atan2(dx, nz) + (rot || 0), lat: Math.asin(T.clamp(dy, -1, 1)), r: Math.sqrt(r2) };
  };
})();
