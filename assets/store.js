/* Terra — shared store adapter. Talks to textdb.dev (one JSON blob per URL), same approach as Sea of Thought.
   Preview / tests use a dedicated test bucket so nothing lands in the production solar system.
   Falls back to localStorage if the network is unreachable. Every record is re-validated on read and write. */
(function (root) {
  'use strict';
  var T = root.TERRA = root.TERRA || {};

  var TEST_URL = 'https://textdb.dev/api/data/terra-preview-test-c8e41f2a';
  var LIVE_URL = 'https://textdb.dev/api/data/terra-site-9d2b6e17c4a8';
  var DEFAULTS = { url: LIVE_URL, localKey: 'terra:planets:v1', max: 400, maxBuilds: 64, maxGifts: 48, maxGiftsPerVisitor: 3 };

  function str(v, n) {
    if (typeof v !== 'string') return '';
    return v.replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, n);
  }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  var BUILD_KINDS = { house: 1, cabin: 1, tower: 1, tree: 1, pine: 1, flag: 1, lamp: 1, well: 1, bench: 1, garden: 1, windmill: 1 };
  var GIFT_KINDS = { flag: 1, sign: 1, gift: 1, print: 1 };

  function cleanBuild(b) {
    if (!b || typeof b !== 'object') return null;
    var id = str(b.id, 40), kind = str(b.kind, 16), x = +b.x, ts = +b.ts;
    if (!id || !BUILD_KINDS[kind] || !isFinite(x)) return null;
    return { id: id, kind: kind, x: Math.round(x), ts: isFinite(ts) ? Math.round(ts) : 0 };
  }
  function cleanGift(g) {
    if (!g || typeof g !== 'object') return null;
    var id = str(g.id, 40), kind = str(g.kind, 16), x = +g.x, ts = +g.ts, vis = str(g.visitor, 40);
    if (!id || !GIFT_KINDS[kind] || !isFinite(x) || !vis) return null;
    return { id: id, kind: kind, x: Math.round(x), ts: isFinite(ts) ? Math.round(ts) : 0, visitor: vis, author: str(g.author, 24).replace(/\n/g, ' ').trim(), msg: str(g.msg, 120).trim() };
  }
  function uniq(list, key) {
    var seen = Object.create(null), out = [], i, k;
    for (i = 0; i < list.length; i++) { k = list[i][key]; if (!k || seen[k]) continue; seen[k] = 1; out.push(list[i]); }
    return out;
  }
  function cleanPlanet(p, maxBuilds, maxGifts) {
    if (!p || typeof p !== 'object') return null;
    var id = str(p.id, 40), ts = +p.ts, n = +p.n;
    if (!id || !isFinite(ts) || !isFinite(n)) return null;
    var spec = T.cleanSpec ? T.cleanSpec(p) : p;
    var builds = [], gifts = [], i, c;
    if (Array.isArray(p.builds)) for (i = 0; i < p.builds.length; i++) { c = cleanBuild(p.builds[i]); if (c) builds.push(c); }
    if (Array.isArray(p.gifts)) for (i = 0; i < p.gifts.length; i++) { c = cleanGift(p.gifts[i]); if (c) gifts.push(c); }
    builds = uniq(builds, 'id').slice(0, maxBuilds || 64);
    gifts = uniq(gifts, 'id').slice(0, maxGifts || 48);
    return {
      id: id, n: n | 0, ts: Math.round(ts),
      seed: spec.seed, size: spec.size, biome: spec.biome, land: spec.land,
      clouds: spec.clouds, cloudPat: spec.cloudPat, atmo: spec.atmo, atmoHue: spec.atmoHue,
      aurora: spec.aurora, city: spec.city, craters: spec.craters, volcanoes: spec.volcanoes,
      iceCaps: spec.iceCaps, glow: spec.glow, rings: spec.rings, moons: spec.moons, shape: spec.shape, paint: spec.paint || '',
      name: spec.name || ('Planet #' + (n | 0)), author: spec.author, msg: spec.msg,
      builds: builds, gifts: gifts
    };
  }
  function cleanList(a, maxBuilds, maxGifts) {
    var seen = Object.create(null), out = [], i, p;
    if (!Array.isArray(a)) return out;
    for (i = 0; i < a.length; i++) {
      p = cleanPlanet(a[i], maxBuilds, maxGifts);
      if (!p || seen[p.id]) continue;
      seen[p.id] = 1;
      out.push(p);
    }
    return out.sort(function (x, y) { return x.n - y.n || x.ts - y.ts; });
  }
  function mergePlanets(a, b, maxBuilds, maxGifts) {
    var map = Object.create(null), i, p, q, k;
    function eat(list) {
      for (i = 0; i < list.length; i++) {
        p = list[i]; q = map[p.id];
        if (!q) { map[p.id] = p; continue; }
        q.builds = uniq(q.builds.concat(p.builds), 'id').slice(0, maxBuilds);
        q.gifts = uniq(q.gifts.concat(p.gifts), 'id').slice(0, maxGifts);
        if (p.ts > q.ts) {
          for (k in p) if (k !== 'builds' && k !== 'gifts') q[k] = p[k];
          q.builds = uniq(p.builds.concat(q.builds), 'id').slice(0, maxBuilds);
          q.gifts = uniq(p.gifts.concat(q.gifts), 'id').slice(0, maxGifts);
        }
      }
    }
    eat(cleanList(a, maxBuilds, maxGifts));
    eat(cleanList(b, maxBuilds, maxGifts));
    var out = [];
    for (k in map) out.push(map[k]);
    return out.sort(function (x, y) { return x.n - y.n || x.ts - y.ts; });
  }
  function maxN(l) { return l.reduce(function (m, x) { return Math.max(m, x.n); }, 0); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function createApi(o) {
    o = Object.assign({}, DEFAULTS, o || {});
    var fetchFn = o.fetch || (root.fetch && root.fetch.bind(root));
    var store = o.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    var mode = o.forceLocal ? 'local' : 'remote';

    async function rRead() {
      var r = await fetchFn(o.url, { cache: 'no-store' });
      if (!r.ok) throw new Error('read ' + r.status);
      var t = (await r.text()).trim();
      if (!t) return [];
      var j; try { j = JSON.parse(t); } catch (e) { throw new Error('bad json'); }
      return cleanList(j && j.planets, o.maxBuilds, o.maxGifts);
    }
    async function rWrite(list) {
      var r = await fetchFn(o.url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ v: 1, planets: list.slice(-o.max) }) });
      if (!r.ok) throw new Error('write ' + r.status);
    }
    function lRead() {
      try { return cleanList(JSON.parse(store.getItem(o.localKey)), o.maxBuilds, o.maxGifts); } catch (e) { return []; }
    }
    function lWrite(l) { try { store.setItem(o.localKey, JSON.stringify(l.slice(-o.max))); } catch (e) {} }

    async function commit(mutator) {
      var fresh = [], all = [], result;
      for (var attempt = 0; attempt < 3; attempt++) {
        if (mode === 'remote') { try { fresh = await rRead(); } catch (e) { mode = 'local'; } }
        if (mode === 'local') fresh = lRead();
        result = mutator(fresh);
        if (result && result.reject) return result;
        all = result.list;
        if (mode === 'remote') {
          try {
            await rWrite(all);
            var check = await rRead();
            if (result.verify(check)) return { ok: true, all: check, item: result.item, mode: mode };
            continue;
          } catch (e) { mode = 'local'; }
        }
        if (mode === 'local') { lWrite(all); return { ok: true, all: all.slice(-o.max), item: result.item, mode: mode }; }
      }
      lWrite(mergePlanets(lRead(), all, o.maxBuilds, o.maxGifts));
      return { ok: true, all: all.slice(-o.max), item: result && result.item, mode: 'local' };
    }

    return {
      get mode() { return mode; },
      url: o.url,
      isTest: o.url === TEST_URL,
      async list() {
        var l = [];
        if (mode === 'remote') { try { l = await rRead(); } catch (e) { mode = 'local'; } }
        if (mode === 'local') l = lRead();
        return l;
      },
      async add(spec) {
        var s = T.cleanSpec(spec || {});
        if (!s.name) s.name = T.autoName(s.seed);
        var mine = Object.assign({ id: uid(), n: 0, ts: Date.now(), builds: [], gifts: [] }, s);
        var out = await commit(function (fresh) {
          mine.n = maxN(fresh.filter(function (x) { return x.id !== mine.id; })) + 1;
          var all = mergePlanets(fresh, [mine], o.maxBuilds, o.maxGifts);
          return { list: all, item: mine, verify: function (check) { return check.some(function (x) { return x.id === mine.id; }); } };
        });
        return { planet: out.item, all: out.all, mode: out.mode };
      },
      async addBuild(planetId, rec) {
        var b = cleanBuild(Object.assign({ id: uid(), ts: Date.now() }, rec));
        if (!b) return { ok: false, state: 'bad' };
        var out = await commit(function (fresh) {
          var p = fresh.filter(function (x) { return x.id === planetId; })[0];
          if (!p) return { reject: true, ok: false, state: 'missing' };
          if (p.builds.length >= o.maxBuilds) return { reject: true, ok: false, state: 'full' };
          p = Object.assign({}, p, { builds: uniq(p.builds.concat([b]), 'id').slice(0, o.maxBuilds) });
          return { list: mergePlanets(fresh, [p], o.maxBuilds, o.maxGifts), item: b, verify: function (check) {
            var q = check.filter(function (x) { return x.id === planetId; })[0];
            return q && q.builds.some(function (x) { return x.id === b.id; });
          } };
        });
        if (out.reject) return out;
        return { ok: true, build: out.item, all: out.all, mode: out.mode };
      },
      async addGift(planetId, rec, visitor) {
        visitor = str(visitor || T.visitorId(), 40);
        var g = cleanGift(Object.assign({ id: uid(), ts: Date.now(), visitor: visitor }, rec));
        if (!g) return { ok: false, state: 'bad' };
        var out = await commit(function (fresh) {
          var p = fresh.filter(function (x) { return x.id === planetId; })[0];
          if (!p) return { reject: true, ok: false, state: 'missing' };
          var mine = p.gifts.filter(function (x) { return x.visitor === visitor; }).length;
          if (mine >= o.maxGiftsPerVisitor) return { reject: true, ok: false, state: 'limit' };
          if (p.gifts.length >= o.maxGifts) return { reject: true, ok: false, state: 'full' };
          p = Object.assign({}, p, { gifts: uniq(p.gifts.concat([g]), 'id').slice(0, o.maxGifts) });
          return { list: mergePlanets(fresh, [p], o.maxBuilds, o.maxGifts), item: g, verify: function (check) {
            var q = check.filter(function (x) { return x.id === planetId; })[0];
            return q && q.gifts.some(function (x) { return x.id === g.id; });
          } };
        });
        if (out.reject) return out;
        return { ok: true, gift: out.item, all: out.all, mode: out.mode };
      },
      _clean: cleanList, _merge: mergePlanets
    };
  }

  function pickUrl() {
    var q = '';
    try { q = (root.location && location.search) || ''; } catch (e) {}
    if (/[?&]store=test\b/.test(q) || /[?&]preview=1\b/.test(q)) return TEST_URL;
    if (/[?&]store=live\b/.test(q) || /[?&]live=1\b/.test(q)) return LIVE_URL;
    return LIVE_URL;
  }

  T.STORE_TEST = TEST_URL;
  T.STORE_LIVE = LIVE_URL;
  T.createStore = createApi;
  T.openStore = function (opts) {
    opts = opts || {};
    if (!opts.url) opts.url = pickUrl();
    if (/[?&]local=1\b/.test((root.location && location.search) || '')) opts.forceLocal = true;
    return createApi(opts);
  };
  T.BUILD_KINDS = Object.keys(BUILD_KINDS);
  T.GIFT_KINDS = Object.keys(GIFT_KINDS);
})(typeof window !== 'undefined' ? window : globalThis);
