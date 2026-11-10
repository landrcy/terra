/* Terra — sound effects. Real Kenney CC0 files (assets/sfx/) played through Audio elements.
   A tiny Web Audio beep is used only as a last-resort fallback if a file cannot load. */
(function () {
  'use strict';
  var T = window.TERRA;
  var NAMES = ['click', 'select', 'tick', 'whoosh', 'zoom', 'takeoff', 'land', 'step1', 'step2', 'step3', 'jump', 'pickup', 'pickup2', 'deny', 'open', 'close', 'build', 'toggleOn', 'toggleOff', 'discover', 'arrive', 'blip1', 'part'];
  var VOL = { tick: 0.22, click: 0.32, select: 0.34, whoosh: 0.4, zoom: 0.38, takeoff: 0.45, land: 0.4, step1: 0.28, step2: 0.28, step3: 0.28, jump: 0.35, pickup: 0.38, pickup2: 0.38, deny: 0.4, open: 0.36, close: 0.36, build: 0.4, toggleOn: 0.32, toggleOff: 0.32, discover: 0.42, arrive: 0.42, blip1: 0.3, part: 0.48 };
  var pool = {}, ext = 'ogg', ready = false, muted = false, stepN = 0, actx;

  (function pick() {
    var a = document.createElement('audio');
    ext = (a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"')) ? 'ogg' : 'mp3';
  })();

  function load() {
    if (ready) return;
    ready = true;
    NAMES.forEach(function (n) {
      var a = new Audio('assets/sfx/' + n + '.' + ext);
      a.preload = 'auto';
      a.volume = VOL[n] || 0.35;
      pool[n] = a;
    });
  }

  function fallback(kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = 'square';
      o.frequency.value = kind === 'deny' ? 180 : kind === 'part' ? 320 : 420;
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + 0.09);
    } catch (e) {}
  }

  function play(name) {
    if (muted || T.reduced && (name === 'whoosh' || name === 'takeoff')) return;
    load();
    var a = pool[name];
    if (!a) { fallback(name); return; }
    try {
      var b = a.cloneNode ? a.cloneNode() : a;
      b.volume = a.volume;
      var p = b.play();
      if (p && p.catch) p.catch(function () { fallback(name); });
    } catch (e) { fallback(name); }
  }

  T.sfx = {
    play: play,
    load: load,
    click: function () { play('click'); },
    select: function () { play('select'); },
    tick: function () { play('tick'); },
    whoosh: function () { play('whoosh'); },
    zoom: function () { play('zoom'); },
    takeoff: function () { play('takeoff'); },
    land: function () { play('land'); },
    jump: function () { play('jump'); },
    pickup: function () { play('pickup'); },
    place: function () { play('build'); },
    deny: function () { play('deny'); },
    open: function () { play('open'); },
    close: function () { play('close'); },
    pop3d: function () { play('part'); },
    arrive: function () { play('arrive'); },
    step: function () { stepN = (stepN + 1) % 3; play(['step1', 'step2', 'step3'][stepN]); },
    setMuted: function (m) { muted = !!m; },
    get muted() { return muted; }
  };
  addEventListener('pointerdown', load, { once: true });
})();
