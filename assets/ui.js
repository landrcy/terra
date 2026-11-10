/* Terra — earthy pixel buttons (stone/wood/moss/gold tiles, icons) and press-dust motes. */
(function () {
  'use strict';
  var T = window.TERRA, U = T.ui = {};
  var tiles = {}, icons = {}, dust = [], dustCv, dustCtx, last = 0;

  var ICONS = {
    planet: ['..gggg..', '.gwwggg.', 'gwbwggog', 'ggggggog', 'ogggggg.', '.ooggog.', '..oooo..', '........'],
    system: ['...yy...', '..ywyw..', '.yywyy.s', '..yyyy.s', '........', 's..s..s.', '.s....s.', '........'],
    back:   ['........', '..ww....', '.ww.....', 'wwwwwww.', '.ww.....', '..ww....', '........', '........'],
    leave:  ['www.....', 'w.w..ww.', 'www.w..w', '....wwww', '....w..w', '..y.w..w', '.yy.....', '........'],
    land:   ['...ww...', '..wyyw..', '.wwyyww.', 'wwwyywww', '...gg...', '..gggg..', '.gggggg.', '........'],
    launch: ['...w....', '..wyw...', '.wyyyww.', 'wyyyyyow', '.wyyyww.', '..wyw...', '...o....', '........'],
    pop:    ['..wwww..', '.w....w.', 'w..yy..w', 'w.yyyy.w', 'w..yy..w', '.w....w.', '..wwww..', '........'],
    ring:   ['........', '..wwww..', '.w....w.', 'w......w', 'w......w', '.w....w.', '..wwww..', '........'],
    moon:   ['..www...', '.wyyyw..', 'wyyyyyw.', 'wyyyyyw.', '.wyyyw..', '..www...', '........', '........'],
    rand:   ['..y..y..', '.y.ww.y.', '..w..w..', '.w....w.', '..w..w..', '.y.ww.y.', '..y..y..', '........'],
    body:   ['..gggg..', '.ggwwgg.', 'ggwbbwgg', 'gggggggg', '.oggggo.', '..oooo..', '........', '........'],
    terrain:['........', '..g..g..', '.ggg.gg.', 'gggggggg', '.ssssss.', '..ssss..', '........', '........'],
    sky:    ['y.......', '.y..ww..', '...w..w.', '..w....w', '........', '.gggggg.', 'gggggggg', '........'],
    note:   ['.wwwww..', '.w...w..', '.w.w.w..', '.w...w..', '.wwwww..', '...w....', '...w....', '........'],
    sphere: ['..wwww..', '.wwyyww.', 'wwyyyyww', 'wwyyyyww', '.wyyyow.', '..oooo..', '........', '........'],
    heart:  ['........', '.ww.ww..', 'wwwwwww.', 'wwwwwww.', '.wwwww..', '..www...', '...w....', '........'],
    pear:   ['...ww...', '..wwww..', '..wwww..', '.wwyyyy.', 'wwyyyyyw', '.wyyyyw.', '..oooo..', '........'],
    bean:   ['........', '..wwww..', '.wwyyyy.', 'wwyyyyyw', 'wwyyyyyw', '.woooww.', '..oo....', '........'],
    gem:    ['...w....', '..www...', '.wyyyyw.', 'wwyyyyww', '.woyyow.', '..oooo..', '........', '........'],
    square: ['..wwww..', '.wyyyww.', 'wwyyyyyw', 'wywyyyow', 'wywyyow.', 'wywoow..', '.ooo....', '........'],
    draw:   ['......y.', '.....yw.', '....yww.', '...yww..', '..yww...', '.www....', 'ww......', '........'],
    erase:  ['........', '.wwww...', '.w..ww..', '..w..ww.', '...w..w.', '....www.', '........', '........'],
    clear:  ['........', '.w....w.', '..w..w..', '...ww...', '..w..w..', '.w....w.', '........', '........'],
    left:   ['........', '...w....', '..ww....', '.wwwwww.', '..ww....', '...w....', '........', '........'],
    right:  ['........', '....w...', '....ww..', '.wwwwww.', '....ww..', '....w...', '........', '........'],
    jump:   ['...w....', '..www...', '.wwwww..', 'www.www.', '...w....', '...w....', '...w....', '........'],
    house:  ['...w....', '..www...', '.wwwww..', 'wwyyyyww', 'wy.yy.yw', 'wy.yy.yw', 'wwyyyyww', '........'],
    tree:   ['...g....', '..ggg...', '.ggggg..', 'ggggggg.', '..sss...', '..sss...', '........', '........'],
    pine:   ['...g....', '..ggg...', '.ggggg..', 'ggggggg.', '..sss...', '..sss...', '........', '........'],
    cabin:  ['........', '.wwwwww.', 'wwyyyyww', 'wy.yy.yw', 'wwyyyyww', 'wwyyyyww', '........', '........'],
    tower:  ['..yyy...', '..sss...', '..s.s...', '..sss...', '..s.s...', '..sss...', '.ssssss.', '........'],
    flag:   ['.wrrr...', '.wrrr...', '.wrr....', '.w......', '.w......', '.w......', '........', '........'],
    lamp:   ['..yyy...', '..ywy...', '...s....', '...s....', '...s....', '..sss...', '........', '........'],
    well:   ['.s...s..', 'sssssss.', '.sssss..', '.s.b.s..', '.sssss..', '........', '........', '........'],
    bench:  ['........', '........', 'yyyyyyy.', 's.s.s.s.', 's.....s.', '........', '........', '........'],
    garden: ['.r.y.b..', '.g.g.g..', '........', '........', '........', '........', '........', '........'],
    windmill:['w...w...', '.w.w....', '.wyw....', 'wwwww...', '.wsw....', '.wsw....', '........', '........'],
    sign:   ['.yyyyy..', '.y...y..', '.yyyyy..', '...s....', '...s....', '........', '........', '........'],
    gift:   ['.y.y....', 'yrrrry..', 'yrryry..', 'yrrrry..', '........', '........', '........', '........'],
    print:  ['........', '.s.s....', '..s.....', '.s.s....', '........', '........', '........', '........'],
    cactus: ['.g.g....', '.ggg....', '..g.....', '..g.....', '........', '........', '........', '........']
  };
  var IPAL = { w:'#f4ead4', y:'#f0c45c', g:'#5a9a48', o:'#5a3a18', b:'#2a6a88', s:'#6a5040', r:'#d04040' };

  function iconURL(name) {
    if (icons[name]) return icons[name];
    var rows = ICONS[name] || ICONS.planet, c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    var g = c.getContext('2d'), x, y, ch, col;
    if (T.setSmooth) T.setSmooth(g, false);
    for (y = 0; y < 8; y++) for (x = 0; x < 8; x++) {
      ch = rows[y] && rows[y].charAt(x);
      if (!ch || ch === '.') continue;
      col = IPAL[ch] || '#fff';
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    return (icons[name] = c.toDataURL());
  }

  function tileURL(kind) {
    if (tiles[kind]) return tiles[kind];
    var s = 16, c = document.createElement('canvas'); c.width = s; c.height = s;
    var g = c.getContext('2d'), x, y, n, pal;
    if (T.setSmooth) T.setSmooth(g, false);
    pal = kind === 'gold' ? ['#4a300c', '#6a4814', '#8a5c18', '#b07a24', '#6a4010']
      : kind === 'wood' ? ['#3a2410', '#4a2c14', '#5a3818', '#6a4420', '#4a2810']
      : kind === 'moss' ? ['#1a2c18', '#243820', '#2a4a28', '#1e3820', '#345838']
      : ['#2a1c14', '#3a281c', '#4a3424', '#5a4030', '#342418'];
    for (y = 0; y < s; y++) for (x = 0; x < s; x++) {
      if (kind === 'wood') n = ((y + (T.hash(x, y >> 1, 3) * 2)) / 2 + T.hash(x, y, 9) * 0.4) % 1;
      else n = T.hash(x, y, kind === 'gold' ? 11 : kind === 'moss' ? 7 : 5);
      g.fillStyle = pal[(n * pal.length) | 0];
      g.fillRect(x, y, 1, 1);
      if (T.hash(x + 3, y + 5, 13) > 0.93) {
        g.fillStyle = kind === 'gold' ? '#ffe08a' : kind === 'moss' ? '#7aba58' : '#8a7a60';
        g.fillRect(x, y, 1, 1);
      }
    }
    /* bevel hint baked into top row / left col so the tile itself feels carved */
    return (tiles[kind] = c.toDataURL());
  }

  function kindOf(el) {
    if (el.classList.contains('sun') || el.classList.contains('primary') || /^(btn-shape|btn-launch|c-land|pad-jump|make-btn|btn-pop)$/.test(el.id)) return 'gold';
    if (el.closest && (el.closest('#s-tools') || el.closest('.presets') || el.closest('.tabs') || el.classList.contains('chipbtn'))) return 'wood';
    if (el.classList.contains('on') || el.getAttribute('aria-selected') === 'true') return 'moss';
    return 'stone';
  }

  function skinOne(el) {
    if (!el || el.tagName !== 'BUTTON') return;
    if (el.classList.contains('swatch')) return;
    el.style.setProperty('--tile', 'none');
    var ico = el.getAttribute('data-ico');
    if (ico) {
      el.style.setProperty('--ico', 'url(' + iconURL(ico) + ')');
      var img = el.querySelector('img.ico-px');
      if (img) img.src = iconURL(ico);
    }
  }

  U.skinAll = function () {
    document.querySelectorAll('button').forEach(skinOne);
  };
  U.skin = skinOne;
  U.iconURL = iconURL;
  U.tileURL = tileURL;

  function ensureDust() {
    if (dustCv) return;
    dustCv = document.getElementById('ui-dust');
    if (!dustCv) return;
    dustCtx = dustCv.getContext('2d');
    if (T.setSmooth) T.setSmooth(dustCtx, false);
    function size() {
      var px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--px'), 10) || 3;
      dustCv.width = Math.ceil(innerWidth / px);
      dustCv.height = Math.ceil(innerHeight / px);
      dustCv.style.width = (dustCv.width * px) + 'px';
      dustCv.style.height = (dustCv.height * px) + 'px';
      if (T.setSmooth) T.setSmooth(dustCtx, false);
    }
    size();
    addEventListener('resize', size);
    U._sizeDust = size;
  }

  U.burst = function (clientX, clientY) {
    ensureDust();
    if (!dustCv) return;
    var px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--px'), 10) || 3;
    var x = clientX / px, y = clientY / px, i, cols = ['#e8d4a0', '#c4a060', '#8a6a38', '#f4ead4', '#5a3a18'];
    for (i = 0; i < 12; i++) {
      dust.push({
        x: x + (Math.random() * 6 - 3), y: y + 2,
        vx: (Math.random() - 0.5) * 18, vy: -6 - Math.random() * 14,
        t: 0, life: 0.28 + Math.random() * 0.25,
        c: cols[(Math.random() * cols.length) | 0]
      });
    }
  };

  function tickDust(now) {
    requestAnimationFrame(tickDust);
    if (!dustCtx || !dust.length) { last = now; return; }
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var i, p;
    dustCtx.clearRect(0, 0, dustCv.width, dustCv.height);
    for (i = dust.length - 1; i >= 0; i--) {
      p = dust[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt;
      if (p.t > p.life) { dust.splice(i, 1); continue; }
      dustCtx.fillStyle = p.c;
      dustCtx.fillRect(p.x | 0, p.y | 0, 1, 1);
    }
  }

  function onDown(e) {
    var el = e.target.closest && e.target.closest('button');
    if (!el || el.disabled) return;
    U.burst(e.clientX, e.clientY);
    /* re-skin after click so on-state tiles update */
    setTimeout(function () { U.skin(el); U.skinAll(); }, 0);
  }

  function boot() {
    ensureDust();
    U.skinAll();
    document.addEventListener('pointerdown', onDown);
    last = performance.now();
    requestAnimationFrame(tickDust);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
