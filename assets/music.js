/* Terra — real recorded music played through a normal <audio> element.
   Track: "Sunset Walk" by KiluaBoy (CC0), see assets/music/CREDITS.txt.
   No generated or synthesized music. Starts after the first gesture, low volume, mute remembered. */
(function () {
  'use strict';
  var T = window.TERRA, KEY = 'terra:music', VOL = 0.32, FADE = 2800;
  var au = document.getElementById('bgm');
  if (!au) {
    au = document.createElement('audio');
    au.id = 'bgm';
    au.setAttribute('loop', '');
    au.setAttribute('preload', 'auto');
    au.setAttribute('playsinline', '');
    document.body.appendChild(au);
  }
  au.loop = true;
  au.preload = 'auto';
  au.volume = 0;
  var canOgg = au.canPlayType && au.canPlayType('audio/ogg; codecs="vorbis"');
  au.src = canOgg ? 'assets/music/sunset-walk.ogg' : 'assets/music/sunset-walk.mp3';

  var muted = false;
  try { muted = localStorage.getItem(KEY) === 'off'; } catch (e) {}
  var started = false, fadeT = 0, fadeFrom = 0, raf = 0;
  var CREDIT = 'Music: Sunset Walk by KiluaBoy (CC0)';

  function fadeTo(v, ms, done) {
    cancelAnimationFrame(raf);
    fadeFrom = au.volume;
    fadeT = performance.now();
    (function step() {
      var k = Math.min(1, (performance.now() - fadeT) / ms);
      au.volume = Math.max(0, Math.min(1, fadeFrom + (v - fadeFrom) * k));
      if (k < 1) raf = requestAnimationFrame(step);
      else if (done) done();
    })();
  }
  function play() {
    if (muted || document.hidden) return;
    var p = au.play();
    started = true;
    if (p && p.catch) p.catch(function () { started = false; });
    fadeTo(VOL, FADE);
  }
  function pause() { fadeTo(0, 400, function () { au.pause(); }); }

  var evs = ['pointerdown', 'keydown', 'touchend', 'click'];
  function first(e) {
    if (e.target && e.target.closest && e.target.closest('#music-btn')) return;
    if (started) return;
    play();
    if (started) evs.forEach(function (n) { removeEventListener(n, first, true); });
  }
  evs.forEach(function (n) { addEventListener(n, first, true); });

  T.music = {
    audio: au,
    credit: CREDIT,
    get muted() { return muted; },
    setMuted: function (m) {
      muted = !!m;
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (e) {}
      if (muted) pause(); else { evs.forEach(function (n) { removeEventListener(n, first, true); }); play(); }
      if (T.ui && T.ui.syncMusic) T.ui.syncMusic();
    },
    toggle: function () { T.music.setMuted(!muted); }
  };
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (started) { cancelAnimationFrame(raf); au.pause(); } }
    else if (started && !muted) { var p = au.play(); if (p && p.catch) p.catch(function () {}); fadeTo(VOL, 1200); }
  });
})();
