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
    tree: { pal:{ l:'#145018', m:'#2a7a30', h:'#4aaa40', d:'#0e3010', t:'#5a3a14', k:'#3a2410', f:'#d04040' },
      rows:['.....h.....','....hmh....','...hmmmh...','..hmhhmhh..','.hmmhmmhmh.','hmhdhmmhmhh','hhmhttthmh.','..hktkhh...','...ttt.....','...ttt.....','...kkk.....']},
    pine: { pal:{ l:'#0e2814', m:'#245a30', h:'#3a7840', t:'#4a3020', k:'#2a1c10', d:'#0a1c10' },
      rows:['.....h.....','....hdh....','...hmlmh...','..hmlmlmh..','.hmlmmlmmh.','hmlmlmlmlmh','.mmtttttmm.','....ktk....','....ttt....']},
    palm: { pal:{ l:'#2a7a30', h:'#4aaa40', t:'#8a5a20', k:'#5a3a14', d:'#1a4a20' },
      rows:['h...h...h','.hd.h.dh.','..hhhhh..','...hlh...','....t....','....t....','....t....','....k....']},
    flag: { pal:{ p:'#d0d0d4', r:'#e04040', d:'#801010', t:'#5a4030', w:'#f0f0f4', k:'#2a1a10' },
      rows:['ktrrrrw','ktrrrrd','ktrrww.','ktrr...','kt.....','kt.....','kt.....','kk.....'] },
    lamp: { pal:{ t:'#3a3a40', y:'#ffe080', o:'#f0c040', w:'#fff6c0', k:'#1a1a20' },
      rows:['.kok.','.ywy.','.oyo.','..t..','..t..','..t..','.ktk.'] },
    well: { pal:{ s:'#6a6a70', d:'#3a3a40', b:'#2a4a6a', w:'#8a5a30', l:'#8a8a90', k:'#1a1a20' },
      rows:['.wk.kw.', 'wwwlwww', '.kssssk.', '.sdbds.', '.sldls.', '.kssssk.'] },
    bench: { pal:{ w:'#8a5a30', d:'#5a3a18', l:'#c48a50', k:'#2a1808' }, rows:['.......','lllllll','wdkdkdw','d.....d'] },
    garden: { pal:{ l:'#2a7a30', p:'#e070a0', y:'#f0d040', b:'#4060c0', w:'#f8f0e0', r:'#d04060', k:'#1a4018' },
      rows:['.p.y.b.r.','wlwlwlwlw','.k.k.k.k.'] },
    windmill: { pal:{ w:'#e8e0d0', d:'#6a5a40', r:'#8a3020', s:'#c8c0b0', k:'#2a2010' },
      rows:['w.....w','.w.s.w.','.wsrsw.','wwkwwsw','.wdwdw.','.wdwdw.','.kdddk.'] },
    sign: { pal:{ w:'#c4a06a', d:'#5a3a18', i:'#2a1a10', l:'#d8b878', k:'#1a1008' },
      rows:['.kwwwk.','.wiiiw.','.wlllw.','.kwwwk.','...d...','...d...'] },
    gift: { pal:{ r:'#c02828', g:'#f0d060', b:'#8a1818', w:'#fff0b0', k:'#6a1010' },
      rows:['.gwg.', 'grrrg','gbrbg','krrrk'] },
    print: { pal:{ s:'#3a2a20' }, rows:['s.s','.s.','s.s'] },
    cactus: { pal:{ g:'#2a7a3a', l:'#48a048', d:'#1a5020', k:'#0e3014' },
      rows:['.l...l.','.gl.lg.','..gdg..','..gdg..','..gdg..','..kdk..'] },
    spire: { pal:{ i:'#d0e4f0', s:'#8ab0c8', d:'#4a7088', k:'#2a4050' },
      rows:['..i..','.isi.','.isi.','isdsi','isdsi','.kdk.'] },
    mush: { pal:{ c:'#d05040', s:'#f0d0c0', t:'#c8b090', k:'#6a2018', d:'#8a3020' },
      rows:['.kck.', 'cdcsc', '.tst.', '..t..'] },
    oak: { pal:{ l:'#1a4818', m:'#2a6a28', h:'#3e8a38', d:'#0c2810', t:'#5a3a14', k:'#2a1c0c' },
      rows:['....hhhhhh....','...hhmhmmhh...','..hmhmmhmhmh..','.hmhmhdhmhmhh.','hhmhmmhmmhmhh.','hhhmmttthmmhh.','..hhktkthh....','....tttt......','....tttt......','....kkkk......']},
    birch: { pal:{ l:'#2a7a30', m:'#4aaa40', h:'#6acc58', t:'#f0ece0', k:'#2a2418', s:'#c8c0b0', d:'#1a4018' },
      rows:['....m....','...mlm...','..mhlhm..','.mlhdhlm.','mhlmlmlhm','.mmstkmm.','....sts...','....sts...','....kkk...']},
    willow: { pal:{ l:'#245a28', m:'#3a7a38', h:'#58a448', t:'#6a4a20', k:'#3a2810', d:'#163818' },
      rows:['..hhhhhhhhh..','.hmlmlmlmlmh.','hmlhmlhmlhmlh','hd.m.t.m.dh..','.l..ttt..l...','l...ttt...l..','....ttt......','....kkk......']},
    bush: { pal:{ l:'#1a5820', m:'#2e7a30', h:'#4a9a40', f:'#e070a0', y:'#f0d040', k:'#1a1008' },
      rows:['..h.y.h..','.hmfhmhmh','hmhmhmhmh','.kkkkkkk.']},
    fruit: { pal:{ l:'#1a5818', m:'#2a7a28', h:'#48a040', r:'#d04030', y:'#f0c040', t:'#5a3a14', k:'#3a2410' },
      rows:['....h.r....','...hmhrmh..','..hrhmmhrh.','hhmryhmmrhh','.hhmtttmbh.','...ktk.....','...ttt.....','...kkk.....']},
    tallpine: { pal:{ l:'#0a2410', m:'#1e4a24', h:'#326838', t:'#4a3020', k:'#2a1c10', d:'#081808' },
      rows:['.....h.....','....hdh....','....hmh....','...hmlmh...','...hmhmh...','..hmlmlmh..','..hmhmmmh..','.hmlmlmlmh.','hmlmmlmlmmh','.mmtttttmm.','....ktk....','....ttt....','....kkk....']},
    fern: { pal:{ l:'#1a5820', m:'#2e7a30', h:'#4a9a40', k:'#1a1008' },
      rows:['h...h...h','.h.hmh.h.','..hmhmh..','...mkm...']},
    saguaro: { pal:{ g:'#2a7a3a', l:'#48a048', d:'#1a5020', k:'#0e3014', f:'#e070a0' },
      rows:['.l.....l.','.gl.f.lg.','..g.l.g..','..glglg..','...gdg...','...gdg...','...gdg...','...kdk...'] }
  };

  var sprCache = {};
  function sprite(kind) {
    if (sprCache[kind]) return sprCache[kind];
    var def = SPR[kind] || SPR.flag, rows = def.rows, pal = def.pal, w = rows[0].length, h = rows.length;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data, x, y, ch, col, o, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      ch = rows[y].charAt(x); if (!ch || ch === '.') continue;
      col = T.hex(pal[ch] || '#fff'); o = (y * w + x) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    /* dark outline on transparent edges */
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
      if (hit) { o2[o] = 18; o2[o + 1] = 12; o2[o + 2] = 6; o2[o + 3] = 255; }
    }
    for (i = 0; i < o2.length; i++) d[i] = o2[i];
    g.putImageData(img, 0, 0); return (sprCache[kind] = c);
  }
  S.sprite = sprite;

  var SKY = {
    ocean:  ['#071018','#0c2034','#163850','#1e5470','#2a7090','#3a90b0','#58b0c8','#7cc8d8'],
    forest: ['#081410','#0c2018','#143028','#1c4434','#245840','#2e6c4c','#3a8058','#4a9468'],
    garden: ['#102018','#183428','#204838','#286048','#347858','#489068','#64a878','#88c090'],
    desert: ['#1c1010','#2c1814','#4a2820','#6a3c24','#8a5428','#b07038','#d09048','#e8b868'],
    tundra: ['#0c141c','#141c2c','#1c2838','#283848','#344858','#446070','#587888','#7090a0'],
    ice:    ['#0a101c','#101c30','#182c48','#204060','#2c5878','#3c7498','#5890b4','#78b0d0'],
    lava:   ['#140404','#200808','#2c0c0c','#3a1410','#4a2014','#6a2c14','#8a3c18','#b05020'],
    storm:  ['#100c18','#181424','#241c30','#302438','#3c3048','#4c3c58','#5c4c68','#6c5c78']
  };
  var FAR = {
    ocean:  ['#0a2438','#123044'], forest: ['#0c241c','#163428'], garden: ['#143c28','#1e4c34'],
    desert: ['#4a2818','#6a3c20'], tundra: ['#1c2834','#2a3844'], ice: ['#203848','#2c4c60'],
    lava:   ['#1c0c0c','#2c1410'], storm: ['#1c1424','#2a1c30']
  };
  var MID = {
    ocean:  ['#143c30','#1c4c3c'], forest: ['#143828','#1c4a34'], garden: ['#1c5034','#286840'],
    desert: ['#6a3c20','#8a5028'], tundra: ['#2a3840','#3a4c54'], ice: ['#305060','#406878'],
    lava:   ['#2c1410','#3c1c14'], storm: ['#2a1c2c','#382838']
  };
  var GRASS = {
    ocean:  ['#164a24','#226830','#2e8440','#3a9a48'],
    forest: ['#12481c','#1c6428','#288034','#349c40'],
    garden: ['#186828','#288838','#3aa848','#58c860'],
    desert: ['#8a5828','#b07838','#c4944c','#d8b060'],
    tundra: ['#3a4a34','#54684c','#6a8070','#88a090'],
    ice:    ['#c0d0dc','#d8e4ec','#e8f0f6','#f6fafc'],
    lava:   ['#241410','#341c14','#4a2418','#5c2c18'],
    storm:  ['#3a2c20','#56402c','#6e5438','#8a6a48']
  };
  var DIRT = {
    ocean:  ['#3a2a18','#2a1c10','#4a3420','#1e140c'],
    forest: ['#2a1c10','#1c1208','#3a2818','#140c08'],
    garden: ['#3a2414','#2a180c','#4a301c','#1c1008'],
    desert: ['#6a4018','#4a2c10','#8a5828','#3a200c'],
    tundra: ['#2a2420','#1c1814','#3a3430','#141210'],
    ice:    ['#8a9aaa','#6a7a8a','#a8b8c8','#4a5a6a'],
    lava:   ['#1a0c0c','#100606','#2a1410','#3a1810'],
    storm:  ['#2a1c14','#1c120c','#3a281c','#140c08']
  };
  var WATER = ['#0a2048','#123868','#1a5a88','#2a80b0','#48b0d0','#70d0e8'];
  var RINGCOL = { gold:['#e8c868','#c4a040'], ice:['#c0d8e8','#88a8c0'], rose:['#e8a0b0','#c07080'], dust:['#c8b898','#8a7a60'], jade:['#88c898','#408060'], violet:['#b898d0','#685088'] };

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
  function dirtBottom(H, walk) { return Math.min(H, walk + Math.max(22, (H * 0.17) | 0)); }

  S.makeWorld = function (planet) {
    var spec = T.cleanSpec(planet);
    var seed = spec.seed >>> 0, h = new Float32Array(WORLD), sea, i, info;
    for (i = 0; i < WORLD; i++) { info = heightAt(i, seed, spec.land, spec.biome); h[i] = info.ground; sea = info.sea; }
    for (var pass = 0; pass < 3; pass++) {
      var h2 = h.slice();
      for (i = 0; i < WORLD; i++) {
        var l = h[(i + WORLD - 1) % WORLD], r = h[(i + 1) % WORLD];
        if (h[i] > sea && l <= sea && r <= sea && h[i] - sea < 4) h2[i] = Math.min(l, r);
        else if (h[i] <= sea && l > sea && r > sea) h2[i] = Math.min(l, r);
      }
      h = h2;
    }
    var decor = [];
    function kindAt(i) {
      var b = spec.biome, r = T.hash(i, 2, seed);
      if (b === 'desert') return r < 0.45 ? 'cactus' : (r < 0.8 ? 'saguaro' : (r < 0.92 ? 'bush' : 'bench'));
      if (b === 'ice') return r < 0.55 ? 'spire' : (r < 0.85 ? 'tallpine' : 'pine');
      if (b === 'tundra') return r < 0.4 ? 'pine' : (r < 0.7 ? 'tallpine' : (r < 0.88 ? 'tree' : 'bush'));
      if (b === 'ocean') return r < 0.5 ? 'palm' : (r < 0.75 ? 'bush' : 'tree');
      if (b === 'lava') return r < 0.4 ? 'spire' : (r < 0.75 ? 'cactus' : 'saguaro');
      if (b === 'forest') return r < 0.12 ? 'mush' : (r < 0.22 ? 'fern' : (r < 0.4 ? 'tallpine' : (r < 0.55 ? 'pine' : (r < 0.7 ? 'oak' : (r < 0.85 ? 'birch' : 'tree')))));
      return r < 0.1 ? 'garden' : (r < 0.22 ? 'bush' : (r < 0.38 ? 'oak' : (r < 0.5 ? 'fruit' : (r < 0.62 ? 'willow' : (r < 0.75 ? 'tree' : (r < 0.88 ? 'pine' : 'fern'))))));
    }
    for (i = 0; i < WORLD; i += 5 + (T.hash(i, seed, 3) * 9) | 0) {
      if (h[i] <= sea + 1) continue;
      if (T.hash(i, 9, seed) < 0.7) {
        var rs = T.hash(i, 11, seed);
        decor.push({ kind: kindAt(i), x: i, sc: rs < 0.18 ? 3 : (rs < 0.7 ? 2 : 1), flip: T.hash(i, 12, seed) > 0.5 });
      }
    }
    /* carve a pond / stream when the planet has water, so landed views aren't dry flats */
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
      /* short stream running out of the pond if there is land enough */
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

  S.resetPlayer = function (world, W, H) {
    player.x = 120; player.vx = 0; player.vy = 0; player.on = 0; player.walk = 0; player.face = 1; player.idle = 0;
    S.landT = T.reduced ? 1 : 0;
    S.camY = T.reduced ? 0 : (H * 0.95);
    S.fx = [];
    S._py = null;
  };

  S.step = function (world, dt, keys, W, H) {
    var horizon = walkLine(H);
    if (S.landT < 1) {
      S.landT = Math.min(1, S.landT + dt / 2.35);
      var u = S.landT, e = 1 - Math.pow(1 - u, 2.2);
      S.camY = (H * 0.95) * (1 - e);
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
      S.camY *= 0.85;
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

  S.draw = function (ctx, world, camX, W, H, t) {
    var spec = world.spec, pal = SKY[spec.biome] || SKY.forest, grass = GRASS[spec.biome] || GRASS.forest;
    var dirt = DIRT[spec.biome] || DIRT.forest, farC = FAR[spec.biome] || FAR.forest, midC = MID[spec.biome] || MID.forest;
    var seed = world.seed || spec.seed, biome = spec.biome;
    var horizon = walkLine(H);
    var camY = (S.camY | 0);
    camX = camX | 0;
    var img = ctx.createImageData(W, H), d = img.data;
    var x, y, i, k, col, c0, c1, hexc;

    /* multi-stop atmosphere sky: deep zenith, pale horizon haze, slight biome tint, Bayer dither */
    var hsv = (T.planet && T.planet.hsv) ? T.planet.hsv : function (h, s, v) {
      return [v * 255, v * 255, v * 255];
    };
    var hue = (spec.atmoHue == null ? 0.55 : spec.atmoHue);
    var stops = [], st, nStops = 10, zt, zh, zs, zv;
    for (st = 0; st < nStops; st++) {
      zt = st / (nStops - 1);
      zh = hue + (0.08 * (1 - zt)); /* zenith leans a little bluer */
      if (zh >= 1) zh -= 1;
      zs = 0.62 - zt * 0.54;
      zv = 0.07 + zt * 0.90;
      if (biome === 'lava') { zs = 0.7 - zt * 0.25; zv = 0.06 + zt * 0.55; }
      if (biome === 'storm') { zs = 0.45 - zt * 0.2; zv = 0.08 + zt * 0.5; }
      var rgb = hsv(zh, zs, zv);
      /* light biome wash in the middle stops only */
      var bp = T.hex(pal[Math.min(pal.length - 1, (zt * (pal.length - 1)) | 0)]);
      var bm = (zt > 0.15 && zt < 0.75) ? 0.14 : 0.06;
      rgb = [
        (rgb[0] * (1 - bm) + bp[0] * bm) | 0,
        (rgb[1] * (1 - bm) + bp[1] * bm) | 0,
        (rgb[2] * (1 - bm) + bp[2] * bm) | 0
      ];
      stops.push(rgb);
    }
    /* warm / pale horizon haze */
    var hz = stops[nStops - 1];
    hz[0] = Math.min(255, hz[0] + (biome === 'desert' || biome === 'lava' ? 36 : 22));
    hz[1] = Math.min(255, hz[1] + (biome === 'desert' ? 22 : 28));
    hz[2] = Math.min(255, hz[2] + (biome === 'desert' ? 8 : 32));
    var sunX = (W * (biome === 'desert' ? 0.62 : 0.74) - camX * 0.06) | 0;
    var sunY = ((horizon * (biome === 'desert' || biome === 'lava' ? 0.22 : 0.2)) - camY * 0.25) | 0;
    var sr = biome === 'desert' ? 14 : (biome === 'lava' ? 12 : 10);
    var bloomR = sr * 7;
    for (y = 0; y < H; y++) {
      var uy = (y + camY * 0.1) / Math.max(1, horizon + 6);
      var si = T.clamp(uy, 0, 1) * (nStops - 1), a = si | 0, f = si - a;
      c0 = stops[Math.min(nStops - 1, a)];
      c1 = stops[Math.min(nStops - 1, a + 1)];
      for (x = 0; x < W; x++) {
        var ff = T.clamp(f + (T.bayer(x, y) - 0.5) * 0.75, 0, 1);
        var rr = (c0[0] + (c1[0] - c0[0]) * ff);
        var gg = (c0[1] + (c1[1] - c0[1]) * ff);
        var bb = (c0[2] + (c1[2] - c0[2]) * ff);
        if (biome !== 'storm') {
          var dist = Math.hypot(x - sunX, y - sunY);
          var bloom = T.clamp(1 - dist / bloomR, 0, 1);
          bloom = bloom * bloom;
          if (bloom > 0.02 && T.bayer(x + 3, y) < 0.5 + bloom * 0.5) {
            var bc = biome === 'lava' ? [255, 140, 40] : (biome === 'desert' ? [255, 220, 140] : [255, 248, 210]);
            var bk = bloom * 0.72;
            rr = rr * (1 - bk) + bc[0] * bk;
            gg = gg * (1 - bk) + bc[1] * bk;
            bb = bb * (1 - bk) + bc[2] * bk;
          }
        }
        put(d, W, H, x, y, rr | 0, gg | 0, bb | 0);
      }
    }
    var skyHaze = stops[nStops - 1];

    function pset(x, y, rgb) { put(d, W, H, x, y, rgb[0], rgb[1], rgb[2]); }
    function phex(x, y, hex) { var c = T.hex(hex); put(d, W, H, x, y, c[0], c[1], c[2]); }

    /* upper stars / aurora */
    if (biome === 'tundra' || biome === 'ice' || biome === 'storm' || biome === 'lava' || biome === 'ocean') {
      for (i = 0; i < 64; i++) {
        var sx = ((T.hash(i, 3, seed) * (W + 60) - camX * 0.08) % (W + 60) + (W + 60)) % (W + 60) - 10;
        var sy = 2 + T.hash(i, 7, seed) * (horizon * 0.42) - camY * 0.2;
        var tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1.1 + i * 0.07) + i));
        if (T.bayer(sx | 0, sy | 0) < tw) phex(sx | 0, sy | 0, tw > 0.85 ? '#ffffff' : (i % 5 ? '#e8f0d8' : '#c8d8ff'));
      }
    }
    if ((biome === 'ice' || biome === 'tundra') && spec.aurora > 0.05) {
      for (y = 4; y < horizon * 0.45; y++) for (x = 0; x < W; x++) {
        var au = Math.sin((x + camX * 0.2) * 0.03 + t * 0.6) * 0.5 + 0.5;
        au *= (1 - y / (horizon * 0.45)) * spec.aurora;
        if (au > 0.28 && T.bayer(x, y) < au) phex(x, y, y < horizon * 0.2 ? '#80f0a0' : '#6030a0');
      }
    }

    ctx.putImageData(img, 0, 0);

    /* sun — soft disk and corona; bloom already lives in the sky gradient */
    if (biome !== 'storm') {
      var sc0 = biome === 'lava' ? '#ffb040' : '#fff8e0', sc1 = biome === 'desert' ? '#ffe08a' : '#ffe8b0', sc2 = biome === 'lava' ? '#e05018' : '#ffc070';
      var breath = T.reduced ? 1 : (0.94 + 0.06 * Math.sin(t * 0.55));
      for (y = -sr * 3; y <= sr * 3; y++) for (x = -sr * 3; x <= sr * 3; x++) {
        var rr = Math.hypot(x, y), px = sunX + x, py = sunY + y;
        if (rr <= sr) {
          var nr = rr / sr, limb = Math.pow(T.clamp((nr - 0.72) / 0.28, 0, 1), 1.3);
          ctx.fillStyle = nr < 0.5 ? sc0 : (limb > 0.45 ? sc2 : sc1);
          ctx.fillRect(px, py, 1, 1);
        } else {
          var fall = Math.pow(T.clamp(1 - (rr - sr) / (sr * 2.1), 0, 1), 2.2) * breath;
          if (fall > 0.06) { ctx.fillStyle = sc2; ctx.globalAlpha = fall * 0.85; ctx.fillRect(px, py, 1, 1); ctx.globalAlpha = 1; }
        }
      }
    }

    /* rings — big arc across the sky */
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

    /* moons — large in the sky */
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

    /* shaded, dithered-edge pixel clouds (3–4 tones, lit top, shadowed bottom) */
    var CLOUD_PAL = biome === 'lava' ? ['#d0a090', '#a07068', '#6a4840', '#3a2820']
      : biome === 'storm' ? ['#c8c8d8', '#8a8aa0', '#5a5468', '#3a3448']
      : biome === 'desert' ? ['#fff6e0', '#f0e0c0', '#d4c09a', '#a89070']
      : biome === 'ice' ? ['#ffffff', '#e8f0f8', '#c8d8e8', '#88a0b8']
      : ['#f8fcff', '#e4eef4', '#c8d4de', '#8a9eae'];
    if (!S._clouds) S._clouds = {};
    function cloudSprite(idx) {
      var key = biome + ':' + seed + ':' + idx;
      if (S._clouds[key]) return S._clouds[key];
      var w = 34 + ((T.hash(idx, 1, seed) * 30) | 0);
      var h = 11 + ((T.hash(idx, 2, seed) * 8) | 0);
      var c = document.createElement('canvas'); c.width = w; c.height = h + 3;
      var g2 = c.getContext('2d'), bumps = 3 + (idx % 4), discs = [], j;
      for (j = 0; j < bumps; j++) {
        var cxb = 5 + (w - 10) * (j + 0.25 * T.hash(idx, 10 + j, seed)) / Math.max(1, bumps - 1);
        var rb = 3.5 + T.hash(idx, 20 + j, seed) * (h * 0.5);
        var cyb = h - 1 - rb * 0.3 - T.hash(idx, 30 + j, seed) * 2.5;
        discs.push({ x: cxb, y: cyb, r: rb });
      }
      function inside(px, py) {
        var k2, dx, dy;
        for (k2 = 0; k2 < discs.length; k2++) {
          dx = px - discs[k2].x; dy = py - discs[k2].y;
          if (dx * dx + dy * dy <= discs[k2].r * discs[k2].r) return 1;
        }
        return 0;
      }
      var px, py, edge, tn, col;
      for (py = 0; py < h + 3; py++) for (px = 0; px < w; px++) {
        if (!inside(px, py)) continue;
        edge = !inside(px - 1, py) || !inside(px + 1, py) || !inside(px, py - 1) || !inside(px, py + 1);
        if (edge && T.bayer(px + idx, py) < 0.4) continue;
        tn = py / Math.max(1, h);
        col = tn < 0.22 ? CLOUD_PAL[0] : tn < 0.48 ? CLOUD_PAL[1] : tn < 0.74 ? CLOUD_PAL[2] : CLOUD_PAL[3];
        if (edge && tn < 0.45) col = CLOUD_PAL[1];
        if (!edge && tn < 0.18 && px < w * 0.55) col = CLOUD_PAL[0];
        g2.fillStyle = col; g2.fillRect(px, py, 1, 1);
      }
      return (S._clouds[key] = c);
    }
    function drawCloudLayer(count, par, y0, ySpan, speed) {
      var ci, spr, cx, cy, n = count;
      if (spec.clouds < 0.05 && biome !== 'storm') n = Math.max(2, (count * 0.35) | 0);
      for (ci = 0; ci < n; ci++) {
        spr = cloudSprite(ci + ((par * 10) | 0));
        cx = ((T.hash(ci, 11 + par * 9, seed) * (W + spr.width + 80) + t * speed * (spec.clouds * 4 + 2) - camX * par) % (W + spr.width + 80) + (W + spr.width + 80)) % (W + spr.width + 80) - spr.width;
        cy = y0 + T.hash(ci, 13 + par * 7, seed) * ySpan - camY * par;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spr, cx | 0, cy | 0);
      }
    }
    drawCloudLayer(7, 0.10, 2, horizon * 0.14, 4);

    /* mountains: slope shading, ridgelines, snow/rock, atmospheric perspective */
    function asRgb(c) {
      if (!c) return [0, 0, 0];
      if (typeof c !== 'string') return c;
      if (c.charAt(0) === 'r') { var m = c.match(/(\d+)/g); return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0]; }
      return T.hex(c);
    }
    function mixRgb(a, b, k) {
      a = asRgb(a); b = asRgb(b);
      return 'rgb(' + ((a[0] * (1 - k) + b[0] * k) | 0) + ',' + ((a[1] * (1 - k) + b[1] * k) | 0) + ',' + ((a[2] * (1 - k) + b[2] * k) | 0) + ')';
    }
    function drawRange(par, yBase, cols, amp, freq, off, haze) {
      var hx, top, hh, hs = new Float32Array(W), sunRight = sunX > W * 0.5;
      var lit = cols[1] || cols[0], midt = cols[0], shade = cols[0], snowOn = (biome === 'ice' || biome === 'tundra' || (biome !== 'desert' && biome !== 'lava' && amp > 24));
      for (hx = 0; hx < W; hx++) {
        hh = hillH(camX * par + hx, seed, freq, amp, off);
        if (biome === 'ice' || biome === 'tundra') hh += Math.max(0, T.ridged3((camX * par + hx) * 0.02, 2, 0, seed, 2) * amp * 0.55 - amp * 0.12);
        if (biome === 'desert') hh += Math.max(0, T.ridged3((camX * par + hx) * 0.014, 1, 1, seed, 2) * amp * 0.45 - amp * 0.18);
        hs[hx] = hh;
      }
      for (hx = 0; hx < W; hx++) {
        hh = hs[hx];
        top = (yBase - hh - camY * par) | 0;
        var slope = hh - (hx ? hs[hx - 1] : hh);
        var facing = sunRight ? (slope < -0.2) : (slope > 0.2);
        var ridge = hh >= (hx ? hs[hx - 1] : 0) && hh >= (hx < W - 1 ? hs[hx + 1] : 0) && hh > amp * 0.4;
        var fillH = Math.max(1, (horizon + 4) - top);
        if (top >= H) continue;
        var y2, rel, col;
        for (y2 = 0; y2 < fillH; y2++) {
          if (top + y2 < 0 || top + y2 >= H) continue;
          rel = y2 / fillH;
          if (facing) col = rel < 0.18 ? lit : (rel < 0.55 ? midt : shade);
          else col = rel < 0.12 ? midt : shade;
          if (T.bayer(hx, top + y2) < 0.28 && rel > 0.2) col = facing ? shade : midt;
          if (haze > 0.02) col = mixRgb(col, skyHaze, haze * (0.45 + rel * 0.35));
          else if (typeof col !== 'string' || col.charAt(0) === '#') { ctx.fillStyle = col; }
          ctx.fillStyle = (typeof col === 'string') ? col : mixRgb(col, col, 0);
          ctx.fillRect(hx, top + y2, 1, 1);
        }
        if (ridge && haze < 0.3) {
          ctx.fillStyle = mixRgb(lit, midt, 0.28);
          ctx.fillRect(hx, top, 1, 1);
        }
        if (snowOn && haze < 0.35 && hh > amp * 0.62 && y2) {
          var cap = 1 + ((hh - amp * 0.62) / 10) | 0;
          ctx.fillStyle = biome === 'lava' ? '#c8b8a8' : mixRgb(lit, '#e8eef4', 0.45);
          for (y2 = 0; y2 < cap; y2++) if (T.bayer(hx, top + y2) < 0.7) ctx.fillRect(hx, top + y2, 1, 1);
        }
        if (biome === 'desert' && T.hash((camX * par + hx) | 0, (top / 6) | 0, seed) < 0.08) {
          ctx.fillStyle = '#8a6a48'; ctx.fillRect(hx, top + 4 + ((T.hash(hx, 3, seed) * 8) | 0), 1, 2);
        }
      }
    }
    var farLit = mixRgb(farC[1] || farC[0], skyHaze, 0.2);
    var midLit = mixRgb(midC[1] || midC[0], skyHaze, 0.08);
    drawRange(0.10, horizon - 36, [mixRgb(farC[0], skyHaze, 0.42), farLit], 38, 0.014, 2, 0.62);
    drawCloudLayer(5, 0.16, 2, Math.max(8, horizon * 0.16), 6);
    drawRange(0.26, horizon - 18, [mixRgb(midC[0], skyHaze, 0.16), midLit], 26, 0.024, 5, 0.22);

    drawRange(0.48, horizon - 6, [midC[1] || grass[0], grass[1] || grass[0]], 14, 0.038, 9, 0.06);

    /* landmark silhouettes on the mid range */
    for (i = 0; i < 8; i++) {
      var lx = ((T.hash(i, 70, seed) * WORLD - camX * 0.26) % WORLD + WORLD) % WORLD;
      var lsx = wrapX(lx, camX * 0.26, W);
      if (lsx < -20 || lsx > W + 20) continue;
      var lbase = (horizon - 18 - hillH(lx, seed, 0.024, 26, 5) - camY * 0.26) | 0;
      ctx.fillStyle = midC[0];
      var lw, lh, ly;
      if (biome === 'desert') {
        for (lw = 0; lw < 18; lw++) { lh = 8 + ((lw > 3 && lw < 15) ? 10 : 0); ctx.fillRect((lsx + lw) | 0, lbase - lh, 1, lh); }
      } else if (biome === 'lava') {
        for (ly = 0; ly < 22; ly++) ctx.fillRect((lsx + (ly < 8 ? 3 : 1)) | 0, lbase - 22 + ly, ly < 8 ? 5 : 9, 1);
        ctx.fillStyle = '#c04010'; ctx.fillRect((lsx + 4) | 0, lbase - 24, 3, 3);
      } else if (biome === 'ice' || biome === 'tundra') {
        for (ly = 0; ly < 20; ly++) ctx.fillRect((lsx + 8 - (ly / 3) | 0) | 0, lbase - 20 + ly, 2 + ((ly / 3) | 0) * 2, 1);
        ctx.fillStyle = '#e8f0f8'; ctx.fillRect((lsx + 7) | 0, lbase - 20, 3, 2);
      } else {
        /* pine cluster */
        for (lw = 0; lw < 3; lw++) {
          var ph = 10 + lw * 4;
          for (ly = 0; ly < ph; ly++) ctx.fillRect((lsx + lw * 7 + 4 - (ly / 4) | 0) | 0, lbase - ph + ly, 1 + ((ly / 4) | 0) * 2, 1);
        }
      }
    }

    /* a few mid-sky clouds, kept above the mountain line */
    drawCloudLayer(4, 0.28, horizon * 0.10, horizon * 0.14, 8);

    /* water in valleys only, then a short clean ground / strata strip */
    img = ctx.getImageData(0, 0, W, H); d = img.data;
    var seaY = (horizon - (world.sea - RELIEF_BASE) + camY) | 0;
    var stripEnd = dirtBottom(H, horizon) + camY;
    var bed = Math.max(5, ((stripEnd - (horizon + camY)) / 4) | 0);
    var wind = Math.sin(t * 2.1);
    for (x = 0; x < W; x++) {
      var wi = ((Math.floor(camX + x) % WORLD) + WORLD) % WORLD;
      var gh = world.h[wi], gy = (horizon - (gh - RELIEF_BASE) + camY) | 0, wet = gh <= world.sea + 0.5;
      var floor = gy;
      if (wet) {
        var top = seaY, bot = Math.min(stripEnd, Math.max(floor, seaY + 1));
        var wx = camX + x, foamy = Math.sin(wx * 0.2 + t * 2.2) * 0.5 + 0.5;
        var hh = 1 + ((Math.sin(wx * 0.35 + t * 3) + 1) * 0.8) | 0;
        if (biome !== 'lava' && top - hh >= 0) {
          var foam = T.hex(foamy > 0.7 ? WATER[4] : WATER[1]);
          for (k = 0; k < hh; k++) put(d, W, H, x, top - hh + k, foam[0], foam[1], foam[2]);
        }
        for (y = top; y < bot; y++) {
          var wv = (y - top) / Math.max(1, bot - top);
          var wii = Math.min(WATER.length - 1, (wv * (WATER.length - 1) + T.bayer(x, y) * 0.5) | 0);
          var shimmer = Math.sin((camX + x) * 0.4 + t * 3 + y * 0.2);
          var wc;
          if (biome === 'lava') wc = T.bayer(x, y) < 0.4 ? T.hex('#c04010') : T.hex('#6a1808');
          else if (biome === 'ice') wc = T.bayer(x, y) < 0.5 ? T.hex('#b0d0e8') : T.hex(WATER[wii]);
          else wc = T.hex(WATER[Math.min(WATER.length - 1, wii + (shimmer > 0.6 && T.bayer(x, y) < 0.5 ? 1 : 0))]);
          /* sky reflection */
          var ry = top - (y - top) - 1;
          if (ry >= 0 && ry < H && biome !== 'lava') {
            var ro = (ry * W + x) * 4;
            var rk = 0.38 + (shimmer > 0 ? 0.12 : 0);
            wc = [wc[0] * (1 - rk) + d[ro] * rk, wc[1] * (1 - rk) + d[ro + 1] * rk, wc[2] * (1 - rk) + d[ro + 2] * rk];
          }
          put(d, W, H, x, y, wc[0] | 0, wc[1] | 0, wc[2] | 0);
        }
      }
      if (gy >= H) continue;
      var dirtStart = wet ? gy : gy + 3;
      var pv = T.samplePaint(spec, (wi / WORLD) * T.TAU, 0.05);
      if (!wet) {
        var gi = (T.hash(wi, 4, seed) * grass.length) | 0;
        var gc = T.hex(grass[gi]);
        if (pv && T.PAINT_PAL[pv]) {
          var pc = T.hex(T.PAINT_PAL[pv]);
          gc = [(gc[0] * 0.4 + pc[0] * 0.6) | 0, (gc[1] * 0.4 + pc[1] * 0.6) | 0, (gc[2] * 0.4 + pc[2] * 0.6) | 0];
        }
        for (y = gy; y < dirtStart && y < H; y++) put(d, W, H, x, y, gc[0], gc[1], gc[2]);
        var sway = (!T.reduced && (biome !== 'ice' && biome !== 'desert')) ? ((wind + Math.sin(t * 2.4 + wi * 0.2)) > 0.3 ? 1 : 0) : 0;
        if (biome === 'ice' || biome === 'tundra') {
          if (T.hash(wi, 8, seed) < 0.28) put(d, W, H, x, gy - 1, 255, 255, 255);
        } else if (biome === 'lava') {
          if (T.hash(wi, 8, seed) < 0.14) { var lv = T.bayer(x, (t * 8) | 0) < 0.5 ? [255, 96, 24] : [192, 48, 16]; put(d, W, H, x, gy, lv[0], lv[1], lv[2]); }
        } else if (biome === 'desert') {
          if (T.hash(wi, 8, seed) < 0.18) put(d, W, H, x, gy, 224, 192, 112);
        } else {
          if (T.hash(wi, 8, seed) < 0.62) {
            var blade = T.hex(grass[grass.length - 1]);
            put(d, W, H, x + sway, gy - 1, blade[0], blade[1], blade[2]);
            if (T.hash(wi, 9, seed) < 0.35) put(d, W, H, x + sway, gy - 2, blade[0], blade[1], blade[2]);
          }
          if (T.hash(wi, 19, seed) < 0.12) {
            var fl = T.hex(['#e070a0', '#f0d040', '#4060c0', '#ffffff'][(T.hash(wi, 20, seed) * 4) | 0]);
            put(d, W, H, x + sway, gy - 3, fl[0], fl[1], fl[2]);
          }
        }
      }
      /* four clean dithered beds, then a solid dark floor — no per-pixel speckles */
      var yMax = Math.min(H, Math.max(dirtStart, stripEnd));
      for (y = Math.max(dirtStart, 0); y < yMax; y++) {
        var depth = y - dirtStart;
        var layer = Math.min(dirt.length - 1, Math.max(0, (depth / bed) | 0));
        var dc = T.hex(dirt[layer]);
        var edge = depth % bed;
        if (edge === 0 && layer > 0 && T.bayer(x, y) < 0.55) dc = T.hex(dirt[layer - 1]);
        else if (edge === 1 && T.bayer(x + 2, y) < 0.3) dc = T.hex(dirt[Math.min(dirt.length - 1, layer + 1)]);
        put(d, W, H, x, y, dc[0], dc[1], dc[2]);
      }
      /* solid dark bed under the cutaway */
      var dark = T.hex(dirt[dirt.length - 1]);
      for (y = Math.max(yMax, 0); y < H; y++) put(d, W, H, x, y, (dark[0] * 0.7) | 0, (dark[1] * 0.7) | 0, (dark[2] * 0.7) | 0);
    }
    /* sparse intentional stones, roots, fossils, ore — clustered, not noisy */
    function mark(px, py, hex) { var c = T.hex(hex); put(d, W, H, px, py, c[0], c[1], c[2]); }
    for (i = 0; i < 28; i++) {
      var sx = ((T.hash(i, 99, seed) * WORLD) | 0);
      var screenX = wrapX(sx, camX, W);
      if (screenX < 1 || screenX >= W - 2) continue;
      var sgy = (horizon - (world.h[sx | 0] - RELIEF_BASE) + camY) | 0;
      var sy = sgy + 6 + ((T.hash(i, 100, seed) * 14) | 0);
      if (sy >= stripEnd - 2 || sy <= sgy + 3) continue;
      var stc = ['#6a5a48', '#8a7a68', '#4a3a30'][i % 3];
      mark(screenX | 0, sy, stc); mark((screenX + 1) | 0, sy, stc);
      mark(screenX | 0, sy + 1, stc); if (i % 3) mark((screenX + 1) | 0, sy + 1, '#3a2e24');
    }
    for (i = 0; i < 16; i++) {
      var ox = ((T.hash(i, 41, seed) * WORLD) | 0);
      var osx = wrapX(ox, camX, W);
      if (osx < 0 || osx >= W) continue;
      var ogy = (horizon - (world.h[ox | 0] - RELIEF_BASE) + camY) | 0;
      var oy = ogy + 8 + ((T.hash(i, 42, seed) * 12) | 0);
      if (oy >= stripEnd - 1) continue;
      mark(osx | 0, oy, biome === 'lava' ? '#ff8018' : (i % 2 ? '#e8c868' : '#80d0e8'));
      if (i % 2 === 0) mark((osx + 1) | 0, oy, biome === 'lava' ? '#ffd040' : '#fff0a0');
    }
    for (i = 0; i < 10; i++) {
      var rxi = ((T.hash(i, 77, seed) * WORLD) | 0);
      var rsx = wrapX(rxi, camX, W);
      if (rsx < 0 || rsx >= W) continue;
      var rgy = (horizon - (world.h[rxi] - RELIEF_BASE) + camY) | 0;
      for (k = 0; k < 8; k++) {
        if (rgy + 4 + k >= stripEnd) break;
        mark((rsx + ((k / 3) | 0) * ((i % 2) ? 1 : -1)) | 0, rgy + 4 + k, k % 3 ? '#3a2410' : '#2a4a20');
      }
    }
    for (i = 0; i < 5; i++) {
      var fxi = ((T.hash(i, 61, seed) * WORLD) | 0);
      var fsx = wrapX(fxi, camX, W);
      var fgy = ((horizon - (world.h[fxi] - RELIEF_BASE) + camY) | 0) + 12;
      if (fgy + 2 < stripEnd && fsx > 1 && fsx < W - 5) {
        mark(fsx | 0, fgy, '#d8d0c0'); mark((fsx + 1) | 0, fgy, '#e8e0d0');
        mark((fsx + 2) | 0, fgy + 1, '#d8d0c0'); mark((fsx + 3) | 0, fgy, '#c8c0b0');
        mark((fsx + 4) | 0, fgy - 1, '#d8d0c0');
      }
    }
    ctx.putImageData(img, 0, 0);

    function blitAt(kind, worldX, footY, sc, flip) {
      var spr = sprite(kind), sx = wrapX(worldX, camX, W);
      sc = sc || 2;
      if (sx < -32 || sx > W + 32) return;
      var dw = spr.width * sc, dh = spr.height * sc;
      var dx = (sx - (dw / 2)) | 0, dy = (footY - dh) | 0;
      ctx.imageSmoothingEnabled = false;
      if (flip) {
        ctx.save();
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(spr, 0, 0, spr.width, spr.height, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(spr, 0, 0, spr.width, spr.height, dx, dy, dw, dh);
      }
    }
    var items = world.decor.slice();
    if (world.planet.builds) for (i = 0; i < world.planet.builds.length; i++) items.push(world.planet.builds[i]);
    if (world.planet.gifts) for (i = 0; i < world.planet.gifts.length; i++) items.push(world.planet.gifts[i]);
    items.sort(function (a, b) { return a.x - b.x; });
    for (i = 0; i < items.length; i++) {
      var it = items[i], ix = ((it.x % WORLD) + WORLD) % WORLD, iy = groundY(world, ix, H, horizon) + camY;
      if (world.h[ix | 0] <= world.sea + 0.5 && it.kind !== 'print') iy = horizon - (world.sea - RELIEF_BASE) + camY;
      blitAt(it.kind, ix, iy, it.sc || 2, it.flip);
    }

    /* ambient life, wind, critters, motes — SoT-level density */
    if (!T.reduced) {
      if (biome === 'garden' || biome === 'forest' || biome === 'ocean') {
        for (i = 0; i < 16; i++) {
          var bx = wrapX((T.hash(i, 30, seed) * WORLD + t * (14 + i * 6)) % WORLD, camX, W);
          var by = horizon * 0.22 + Math.sin(t * 1.6 + i) * 12 + T.hash(i, 31, seed) * 32 - camY * 0.3;
          var wing = ((t * 10 + i) | 0) % 2;
          ctx.fillStyle = i % 4 === 0 ? '#c04060' : (i % 4 === 1 ? '#e0c040' : '#1a1a18');
          ctx.fillRect(bx | 0, by | 0, 3, 1);
          ctx.fillRect((bx | 0) + (wing ? 3 : -2), (by | 0) - 1, 2, 1);
        }
        /* dragonflies */
        for (i = 0; i < 4; i++) {
          var dx2 = wrapX((T.hash(i, 55, seed) * WORLD + t * 22) % WORLD, camX, W);
          var dy2 = horizon * 0.48 + Math.sin(t * 2.2 + i) * 6 - camY * 0.25;
          ctx.fillStyle = '#4a6a80'; ctx.fillRect(dx2 | 0, dy2 | 0, 5, 1);
          ctx.fillStyle = '#c8e0f0';
          var fl = ((t * 14 + i) | 0) % 2;
          ctx.fillRect((dx2 | 0) + 1, (dy2 | 0) - 1 - fl, 2, 1);
          ctx.fillRect((dx2 | 0) + 1, (dy2 | 0) + 1 + fl, 2, 1);
        }
      }
      if (biome === 'garden' || biome === 'forest') {
        for (i = 0; i < 36; i++) {
          var fx = wrapX((T.hash(i, 40, seed) * WORLD + Math.sin(t * 0.8 + i) * 10 + t * 8) % WORLD, camX, W);
          var fy = horizon - 10 - T.hash(i, 41, seed) * 50 + Math.sin(t * 2 + i * 1.3) * 5 + camY;
          if ((Math.sin(t * 5 + i * 2) + 1) * 0.5 > 0.22) {
            ctx.fillStyle = i % 4 === 0 ? '#fff8c0' : (i % 4 === 1 ? '#d8f080' : (i % 4 === 2 ? '#f0d0e0' : '#e8f8d0'));
            ctx.fillRect(fx | 0, fy | 0, 1, 1);
          }
        }
      }
      /* fish in water */
      if (biome !== 'lava') {
        for (i = 0; i < 8; i++) {
          var fix = (T.hash(i, 73, seed) * WORLD + t * (8 + i)) % WORLD;
          if (world.h[fix | 0] > world.sea + 0.5) continue;
          var fsy = (horizon - (world.sea - RELIEF_BASE) + camY) + 2 + (i % 3) * 2 + Math.sin(t * 2 + i) * 1;
          var fsx = wrapX(fix, camX, W);
          ctx.fillStyle = i % 2 ? '#2a6080' : '#48a0b8';
          ctx.fillRect(fsx | 0, fsy | 0, 4, 2);
          ctx.fillRect((fsx + (((t * 6 + i) | 0) % 2 ? 4 : -1)) | 0, fsy | 0, 1, 1);
        }
      }
      /* ground critters */
      if (biome !== 'lava') {
        for (i = 0; i < 8; i++) {
          var cx2 = (T.hash(i, 88, seed) * WORLD + t * (8 + i * 3) * (i % 2 ? 1 : -1) + WORLD) % WORLD;
          if (world.h[cx2 | 0] <= world.sea + 0.5) continue;
          var cy2 = groundY(world, cx2, H, horizon) + camY - (i % 3 === 0 ? 3 : 2);
          var csx = wrapX(cx2, camX, W);
          ctx.fillStyle = i % 3 === 0 ? '#c8b090' : (biome === 'ice' ? '#d0d8e0' : '#2a1a10');
          if (i % 3 === 0) { /* bunny */
            ctx.fillRect(csx | 0, cy2 | 0, 4, 3);
            ctx.fillRect((csx + 1) | 0, (cy2 - 2) | 0, 1, 2);
            ctx.fillRect((csx + 3) | 0, (cy2 - 2) | 0, 1, 2);
          } else {
            ctx.fillRect(csx | 0, cy2 | 0, 3, 2);
            ctx.fillRect((csx + (((t * 8 + i) | 0) % 2)) | 0, (cy2 + 2) | 0, 1, 1);
          }
        }
      }
      /* wind streaks + falling leaves / motes */
      for (i = 0; i < 10; i++) {
        var wx2 = wrapX((T.hash(i, 66, seed) * WORLD + t * 40) % WORLD, camX, W);
        var wy2 = 8 + T.hash(i, 67, seed) * (horizon * 0.55) - camY * 0.2;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(wx2 | 0, wy2 | 0, 5 + (i % 3), 1);
      }
      if (biome === 'garden' || biome === 'forest') {
        for (i = 0; i < 14; i++) {
          var lx = wrapX((T.hash(i, 81, seed) * WORLD + t * (6 + i % 5) + Math.sin(t + i) * 8) % WORLD, camX, W);
          var ly = ((T.hash(i, 82, seed) * horizon + t * (10 + i)) % (horizon + 8)) + camY * 0.2;
          ctx.fillStyle = i % 2 ? '#3a8a34' : '#c05030';
          ctx.fillRect(lx | 0, ly | 0, 2, 1);
        }
      }
      if (biome === 'lava') {
        for (i = 0; i < 20; i++) {
          var ex = wrapX((T.hash(i, 50, seed) * WORLD) % WORLD, camX, W);
          var ey = (horizon * 0.35 + ((t * (16 + i) + T.hash(i, 51, seed) * 80) % (horizon * 0.55))) - camY * 0.2;
          ctx.fillStyle = i % 2 ? '#ff8018' : '#ffd040';
          ctx.fillRect(ex | 0, ey | 0, 1, 1);
        }
      }
      if (biome === 'ice' || biome === 'tundra') {
        for (i = 0; i < 24; i++) {
          var snx = wrapX((T.hash(i, 60, seed) * WORLD + t * (12 + i % 5)) % WORLD, camX, W);
          var sny = ((t * (18 + i % 7) + T.hash(i, 61, seed) * horizon) % horizon) + camY * 0.15;
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

    /* no canvas-bottom grass under the toolbar — tufts live on the walkable horizon only */

    for (i = 0; i < S.fx.length; i++) {
      var p = S.fx[i], pxp = wrapX(p.x, camX, W);
      if (pxp < -2 || pxp > W + 2) continue;
      ctx.fillStyle = 'rgb(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ')';
      ctx.fillRect(pxp | 0, (p.y + camY) | 0, 1, 1);
    }

    /* landing cinematic: atmosphere veil + rushing clouds */
    if (S.landT < 1) {
      var u = S.landT, veil = u < 0.45 ? (1 - u / 0.45) : 0;
      if (veil > 0) {
        var ac = T.hex((SKY[biome] || SKY.forest)[3] || '#2a6040');
        ctx.fillStyle = 'rgba(' + ac[0] + ',' + ac[1] + ',' + ac[2] + ',' + (veil * 0.75).toFixed(3) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      if (u < 0.7) {
        for (i = 0; i < 14; i++) {
          var csp = cloudSprite(i % 8);
          var clx = ((T.hash(i, 3, seed) * W + t * (40 + i * 8) * (1.4 - u)) % (W + 80)) - 40;
          var cly = ((t * (80 + i * 12) * (1.2 - u) + T.hash(i, 4, seed) * H) % (H + 40)) - 16;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(csp, clx | 0, cly | 0);
        }
      }
    }
  };

  S.nearGift = function (world) {
    var g = world.planet.gifts || [], i, best = null, d;
    for (i = 0; i < g.length; i++) {
      d = Math.min(Math.abs(g[i].x - player.x), WORLD - Math.abs(g[i].x - player.x));
      if (d < 12 && (!best || d < best.d)) best = { g: g[i], d: d };
    }
    return best && best.g;
  };
})();
