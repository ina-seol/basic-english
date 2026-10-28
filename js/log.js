/* 학습 기록 층 (V2)
   원자료는 '시도 이벤트' 하나뿐이에요. 진도·Error Bank·숙달도는 모두 이 기록에서 계산해요.

   이벤트 필드
     eid  이벤트 id (중복 방지)        sid  학생 번호 "4-3-07"        sess 접속 세션 id
     day  1~20 (진단·복습 묶음은 0)   step see|say|write|use|retrieve|reflect|review|baseline|assign
     act  choose|speak|type|trace|game|done|reflect|import|assigndone
     item 항목 id (d08.w.3 낱말, d08.s.1 문장, d08.dr.2 바꿔 말하기)
     area vocab|listen|speak|write|sentence ('' = 점수 없는 기록)
     att  같은 항목·활동의 몇 번째 시도   ok 1 맞음 / 0 다시 / '' 점수 없음
     resp 입력 요약 (40자)   dur 걸린 시간(ms)   ts 시각(ISO)
     mode touch|keyboard|mic|self|auto   rev ''|quick|teacher|tricky   x 덧붙임(JSON 글자)
*/
var EV_FIELDS = ['eid', 'sid', 'sess', 'day', 'step', 'act', 'item', 'area', 'att', 'ok', 'resp', 'dur', 'ts', 'mode', 'rev', 'x'];
function evPack(e) { return EV_FIELDS.map(function (k) { return e[k] == null ? '' : e[k]; }); }
function evUnpack(a) { var e = {}; EV_FIELDS.forEach(function (k, i) { e[k] = a[i]; }); e.day = +e.day || 0; e.att = +e.att || 0; e.dur = +e.dur || 0; e.ok = e.ok === '' || e.ok == null ? '' : +e.ok; return e; }

/* ---------- 나 (학생 번호) ---------- */
var Me = {
  sid: function () { return store.get('be-me', ''); },
  set: function (sid) {
    store.set('be-me', sid);
    var l = store.get('be-sids', []).filter(function (x) { return x !== sid; }); l.unshift(sid); store.set('be-sids', l.slice(0, 40));
    Log.newSession();
  },
  out: function () { store.del('be-me'); },
  valid: function (sid) { return /^\d-\d{1,2}-\d{2}$/.test(sid || ''); },
  make: function (g, c, n) { return g + '-' + c + '-' + ('0' + n).slice(-2); },
  label: function (sid) { var p = String(sid || '').split('-'); return p.length === 3 ? p[0] + '학년 ' + p[1] + '반 ' + (+p[2]) + '번' : sid; },
  cls: function (sid) { return String(sid || '').split('-').slice(0, 2).join('-'); }
};

/* ---------- 기록 ---------- */
var Log = (function () {
  var cache = {}, listeners = [];
  function key(sid) { return 'be-ev:' + sid; }
  function all(sid) { sid = sid || Me.sid(); if (!cache[sid]) cache[sid] = store.get(key(sid), []); return cache[sid]; }
  function save(sid) {
    var l = all(sid);
    if (l.length > 8000) { l = l.slice(-8000); cache[sid] = l; }
    if (!store.set(key(sid), l)) { cache[sid] = l = l.slice(-3000); store.set(key(sid), l); }
  }
  function session() {
    var s = store.get('be-sess', null);
    if (!s || s.sid !== Me.sid() || Date.now() - s.last > 30 * 60 * 1000) s = { id: uid('s'), sid: Me.sid(), start: Date.now(), last: Date.now() };
    s.last = Date.now(); store.set('be-sess', s); return s.id;
  }
  function add(e) {
    var sid = e.sid || Me.sid(); if (!sid) return null;
    var list = all(sid);
    e.eid = e.eid || uid('e'); e.sid = sid; e.sess = e.sess || session(); e.ts = e.ts || nowIso();
    e.day = e.day || 0; e.area = e.area || ''; e.rev = e.rev || ''; e.mode = e.mode || '';
    if (e.ok === true) e.ok = 1; if (e.ok === false) e.ok = 0; if (e.ok == null) e.ok = '';
    if (e.resp != null) e.resp = String(e.resp).slice(0, 40);
    if (!e.att) e.att = list.filter(function (x) { return x.item === e.item && x.act === e.act && x.step === e.step; }).length + 1;
    list.push(e); save(sid);
    Api.queue(e);
    listeners.forEach(function (f) { try { f(e); } catch (x) { } });
    return e;
  }
  /* 다른 기기에서 한 기록을 합치기 (eid 로 중복 제거) */
  function merge(sid, events) {
    var list = all(sid), have = {};
    list.forEach(function (e) { have[e.eid] = 1; });
    var added = 0;
    events.forEach(function (e) { if (!have[e.eid]) { list.push(e); have[e.eid] = 1; added++; } });
    if (added) { list.sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; }); save(sid); }
    return added;
  }
  /* 단계 끝: 'done' 기록 (같은 Day·단계는 처음 한 번만 세지만, 다시 해도 기록은 남겨요) */
  function done(day, step, extra) { return add({ day: day, step: step, act: 'done', item: 'd' + pad2(day) + '.' + step, x: extra ? JSON.stringify(extra) : '' }); }
  return {
    all: all, add: add, merge: merge, done: done,
    newSession: function () { store.del('be-sess'); },
    on: function (f) { listeners.push(f); },
    clearCache: function () { cache = {}; }
  };
})();
function pad2(n) { return ('0' + n).slice(-2); }

/* ---------- Day 진행 상태 (기록에서 계산) ---------- */
var STEPS = [
  { k: 'see', no: 1, en: 'SEE & HEAR', ko: '보고 듣기', icon: '👀' },
  { k: 'say', no: 2, en: 'SAY', ko: '따라 말하기', icon: '🎤' },
  { k: 'write', no: 3, en: 'WRITE', ko: '써 보기', icon: '✏️' },
  { k: 'use', no: 4, en: 'USE', ko: '바꿔 말하기', icon: '🔁' },
  { k: 'retrieve', no: 5, en: 'RETRIEVE', ko: '정리 게임', icon: '🎮' },
  { k: 'reflect', no: 6, en: 'REFLECT', ko: '돌아보기', icon: '💭' }
];
function stepsRequired() { return STEPS.filter(function (s) { return s.k !== 'reflect' || CONFIG.ENABLE_REFLECTION !== false; }); }
var Progress = {
  /* {day: {see:true, say:true, …}} */
  map: function (sid) { return this.fromEvents(Log.all(sid)); },
  fromEvents: function (events) {
    var m = {};
    events.forEach(function (e) {
      if (e.act !== 'done' && e.act !== 'import') return;
      if (!e.day) return;
      (m[e.day] = m[e.day] || {})[e.step] = true;
    });
    return m;
  },
  dayDone: function (m, day) { var d = m[day] || {}; return stepsRequired().every(function (s) { return d[s.k]; }); },
  stepsDone: function (m, day) { var d = m[day] || {}; return stepsRequired().filter(function (s) { return d[s.k]; }).length; },
  completedCount: function (sid, m) { m = m || this.map(sid); var n = 0; LESSONS.forEach(function (L) { if (Progress.dayDone(m, L.id)) n++; }); return n; },
  /* 모두 열려 있고, 끝내지 않은 가장 앞 Day 가 '지금' */
  currentDay: function (sid) { var m = this.map(sid); for (var i = 0; i < LESSONS.length; i++) if (!this.dayDone(m, LESSONS[i].id)) return LESSONS[i].id; return null; },
  status: function (m, day, cur) { return this.dayDone(m, day) ? 'completed' : day === cur ? 'current' : 'available'; }
};

/* ---------- 시트로 보내기 ---------- */
var Api = (function () {
  var timer = null, sending = false, lastOk = 0, failCount = 0, statusListeners = [];
  function url() {
    var q = new URLSearchParams(location.search).get('sheet');
    if (q && /^https:\/\/script\.google\.com\//.test(q)) store.set('fe-sheet', q);
    /* ?sheet=off : 이 기기에서 시트로 보내지 않기 (시연·연습용). ?sheet=on 으로 되돌려요 */
    if (q === 'off') store.set('fe-sheet', 'off');
    if (q === 'on') store.del('fe-sheet');
    var s = store.get('fe-sheet', '');
    if (s === 'off') return '';
    return s || (CONFIG.SHEET_URL || '').trim();
  }
  function box() { return store.get('be-outbox', []); }
  function setBox(b) { store.set('be-outbox', b); notify(); }
  function queue(e) { var b = box(); b.push(evPack(e)); setBox(b); schedule(4000); }
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms); }
  function notify() { var st = status(); statusListeners.forEach(function (f) { try { f(st); } catch (e) { } }); }
  function status() { return { pending: box().length, online: navigator.onLine, url: !!url(), failing: failCount >= 2 }; }
  function post(body, readable) {
    var u = url(); if (!u) return Promise.reject(new Error('nourl'));
    var opt = { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), keepalive: body.events ? JSON.stringify(body).length < 60000 : false, redirect: 'follow' };
    return fetch(u, opt).then(function (r) { return r.json(); }).catch(function (err) {
      if (readable) throw err;
      /* 응답을 못 읽는 환경(CORS)이면 no-cors 로 한 번 더 보내고 보낸 것으로 칩니다. 서버가 eid 로 중복을 걸러요. */
      opt.mode = 'no-cors'; return fetch(u, opt).then(function () { return { ok: true, opaque: true }; });
    });
  }
  function flush() {
    var b = box();
    if (!url() || !b.length || sending) return Promise.resolve();
    if (!navigator.onLine) { failCount++; notify(); return Promise.resolve(); }
    sending = true;
    var chunk = b.slice(0, 150), ids = {};
    chunk.forEach(function (a) { ids[a[0]] = 1; });
    return post({ action: 'events', v: 2, events: chunk }).then(function (res) {
      sending = false;
      if (res && res.ok && !res.opaque) {
        failCount = 0; lastOk = Date.now();
        setBox(box().filter(function (a) { return !ids[a[0]]; }));
        if (box().length) schedule(800);
      } else if (res && res.opaque) {
        /* 응답을 못 읽었을 때: 지우지 않고 다시 보내요(서버가 중복을 걸러요). 3번 보낸 뒤에는 보낸 것으로 쳐요. */
        var opq = store.get('be-opq', {}), drop = {};
        Object.keys(ids).forEach(function (id) { opq[id] = (opq[id] || 0) + 1; if (opq[id] >= 3) { drop[id] = 1; delete opq[id]; } });
        store.set('be-opq', opq);
        setBox(box().filter(function (a) { return !drop[a[0]]; }));
        failCount++; notify(); schedule(Math.min(60000, 10000 * failCount));
      } else { failCount++; notify(); schedule(Math.min(60000, 5000 * failCount)); }
    }, function () { sending = false; failCount++; notify(); schedule(Math.min(60000, 5000 * failCount)); });
  }
  /* 창을 닫을 때: 남은 기록을 beacon 으로 (64KB 넘지 않게 나눠서). 서버가 eid 로 중복을 걸러요 */
  function beacon() {
    var u = url(), b = box(); if (!u || !b.length || !navigator.sendBeacon) return;
    for (var i = 0; i < b.length; i += 120) {
      try { navigator.sendBeacon(u, new Blob([JSON.stringify({ action: 'events', v: 2, events: b.slice(i, i + 120) })], { type: 'text/plain;charset=utf-8' })); } catch (e) { }
    }
  }
  window.addEventListener('online', function () { failCount = 0; notify(); flush(); });
  window.addEventListener('offline', notify);
  window.addEventListener('pagehide', beacon);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { flush(); beacon(); } });
  setTimeout(flush, 1500);

  function get(params) {
    var u = url(); if (!u) return Promise.reject(new Error('nourl'));
    return fetch(u + '?' + new URLSearchParams(params).toString()).then(function (r) { return r.json(); });
  }
  return {
    url: url, queue: queue, flush: flush, get: get, post: post, status: status,
    onStatus: function (f) { statusListeners.push(f); },
    /* 학생: 다른 기기에서 한 내 기록과 선생님이 보낸 복습 받기 */
    mine: function (sid) { return get({ action: 'mine2', sid: sid }); },
    /* 교사: 암호는 주소가 아니라 본문으로 */
    teacher: function (action, key, extra) { var b = { action: action, key: key }; for (var k in extra || {}) b[k] = extra[k]; return post(b, true); },
    ping: function () { return get({ action: 'ping' }); }
  };
})();

/* ---------- v1 → v2 기기 데이터 옮기기 ----------
   v1 은 이름(fe-p:<이름>)으로 진도를 저장했어요. 번호로 옮기고 이름이 든 키는 지워요.
   v1 진도에는 맞고 틀린 정보가 없어서 'import' 기록(완료 표시)만 만들고 숙달도 계산에는 쓰지 않아요. */
var Migrate = {
  v1Names: function () { return store.keys('fe-p:').map(function (k) { return k.slice(5); }).filter(function (n) { var p = store.get('fe-p:' + n, {}); return Object.keys(p).length; }); },
  importName: function (name, sid) {
    var p = store.get('fe-p:' + name, {}), n = 0;
    Object.keys(p).forEach(function (id) {
      var l = p[id], L = lessonById(id); if (!L) return;
      var full = function (part, total) { return part && part.s && part.t && part.s.length >= total && part.t.length >= total; };
      var steps = [];
      if (full(l.w, L.words.length)) steps.push('see', 'write');
      if (full(l.w, L.words.length) && full(l.s, L.sentences.length)) steps.push('say');
      if (l.d && full(l.d, drillItems(L).length)) steps.push('use');
      if (l.g && l.g.plays) steps.push('retrieve');
      if (steps.length >= 5) steps.push('reflect');
      steps.forEach(function (st) { Log.add({ sid: sid, day: L.id, step: st, act: 'import', item: 'd' + pad2(L.id) + '.' + st, x: JSON.stringify({ v1: 1 }) }); n++; });
    });
    store.del('fe-p:' + name);
    store.set('fe-names', store.get('fe-names', []).filter(function (x) { return x !== name; }));
    return n;
  },
  /* 이름이 남는 v1 키 정리 (fe-log 는 이름이 든 보낸 기록 사본) */
  scrub: function () { if (!this.v1Names().length) { store.del('fe-name'); store.del('fe-names'); store.del('fe-log'); store.del('fe-outbox'); } }
};
