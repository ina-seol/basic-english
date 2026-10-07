/* 공용 도구: 저장, 기록 보내기, 소리(읽어 주기·따라 말하기), 따라쓰기 판, 효과음 */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lessonById(id) { return LESSONS.filter(function (l) { return l.id === +id; })[0]; }
function wordsOf(text) { return text.replace(/[^A-Za-z' ]/g, ' ').trim().split(/\s+/); }

var store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------- 기록: 이 기기 + 구글 시트 ---------- */
var Sync = (function () {
  function url() {
    var q = new URLSearchParams(location.search).get('sheet');
    if (q && /^https:\/\/script\.google\.com\//.test(q)) store.set('fe-sheet', q);
    return store.get('fe-sheet', '') || (typeof SHEET_URL === 'string' ? SHEET_URL.trim() : '');
  }
  function flush() {
    var u = url(), box = store.get('fe-outbox', []);
    if (!u || !box.length || !navigator.onLine) return;
    box.forEach(function (rec) {
      fetch(u, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(rec) })
        .then(function () { store.set('fe-outbox', store.get('fe-outbox', []).filter(function (r) { return r.id !== rec.id; })); })
        .catch(function () { });
    });
  }
  function send(rec) {
    rec.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    rec.time = new Date().toISOString();
    var log = store.get('fe-log', []); log.push(rec); if (log.length > 3000) log = log.slice(-3000); store.set('fe-log', log);
    var box = store.get('fe-outbox', []); box.push(rec); store.set('fe-outbox', box);
    flush();
  }
  function get(params) {
    var u = url();
    if (!u) return Promise.reject(new Error('nourl'));
    return fetch(u + '?' + new URLSearchParams(params).toString()).then(function (r) { return r.json(); });
  }
  window.addEventListener('online', flush);
  setTimeout(flush, 1500);
  return { url: url, send: send, get: get, flush: flush, pending: function () { return store.get('fe-outbox', []).length; } };
})();

/* ---------- 학생 진도 ---------- */
var Progress = {
  key: function (name) { return 'fe-p:' + name; },
  all: function (name) { return store.get(this.key(name), {}); },
  lesson: function (name, id) {
    var a = this.all(name), l = a[id] || {};
    l.w = l.w || { s: [], t: [] }; l.s = l.s || { s: [], t: [] }; l.g = l.g || { best: 0, stars: 0, plays: 0 };
    return l;
  },
  save: function (name, id, l) { var a = this.all(name); a[id] = l; store.set(this.key(name), a); },
  // 시트에 남은 기록으로 다른 기기의 진도를 이어 받기
  merge: function (name, rows) {
    var a = this.all(name);
    rows.forEach(function (r) {
      var id = +r.lesson; if (!id) return;
      var l = a[id] || {}; l.w = l.w || { s: [], t: [] }; l.s = l.s || { s: [], t: [] }; l.g = l.g || { best: 0, stars: 0, plays: 0 };
      var d = {}; try { d = JSON.parse(r.items || '{}'); } catch (e) { }
      var part = r.part === 'words' ? l.w : r.part === 'sentences' ? l.s : null;
      if (part) ['s', 't'].forEach(function (k) { (d[k] || []).forEach(function (i) { if (part[k].indexOf(i) < 0) part[k].push(i); }); });
      if (r.part === 'game') { l.g.best = Math.max(l.g.best, +r.score || 0); l.g.stars = Math.max(l.g.stars, +r.stars || 0); l.g.plays = Math.max(l.g.plays, 1); }
      a[id] = l;
    });
    store.set(this.key(name), a);
  }
};

/* ---------- 읽어 주기 (TTS) ---------- */
var Voice = (function () {
  var voice = null;
  function pick() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
    var pref = [/Google US English/i, /Samantha/i, /Aria|Jenny|Zira/i, /en[-_]US/i];
    for (var i = 0; i < pref.length && !voice; i++) voice = vs.filter(function (v) { return pref[i].test(v.name) || pref[i].test(v.lang); })[0] || null;
    if (!voice) voice = vs[0] || null;
  }
  if (window.speechSynthesis) { pick(); speechSynthesis.onvoiceschanged = function () { voice = null; pick(); }; }
  function say(text, opt) {
    opt = opt || {};
    if (!window.speechSynthesis || !Sound.on) { if (opt.onend) setTimeout(opt.onend, 300); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; if (voice) u.voice = voice;
      u.rate = opt.rate || (store.get('fe-slow', false) ? 0.62 : 0.85);
      if (opt.onboundary) u.onboundary = opt.onboundary;
      if (opt.onend) { u.onend = opt.onend; u.onerror = opt.onend; }
      speechSynthesis.speak(u);
    } catch (e) { if (opt.onend) opt.onend(); }
  }
  return { say: say, stop: function () { if (window.speechSynthesis) speechSynthesis.cancel(); } };
})();

/* ---------- 따라 말하기 (음성 인식) ---------- */
var Listen = (function () {
  var R = window.SpeechRecognition || window.webkitSpeechRecognition, blocked = false, cur = null;
  function norm(s) {
    return s.toLowerCase().replace(/’/g, "'").replace(/\bit's\b/g, 'it is').replace(/\bwhat's\b/g, 'what is').replace(/\bhow's\b/g, 'how is')
      .replace(/\bi'm\b/g, 'i am').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) m[i] = [i];
    for (j = 0; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function near(w, h) { return w === h || (w.length > 3 && lev(w, h) <= Math.max(1, Math.floor(w.length / 4))); }
  // 들린 말과 목표 말이 얼마나 같은지 0~1
  function score(target, heard) {
    var t = norm(target).split(' '), h = norm(heard).split(' ');
    var hit = t.filter(function (w) { return h.some(function (x) { return near(w, x); }); }).length;
    var whole = 1 - lev(norm(target).replace(/ /g, ''), norm(heard).replace(/ /g, '')) / Math.max(4, norm(target).replace(/ /g, '').length);
    return Math.max(hit / t.length, whole);
  }
  function listen(target) {
    return new Promise(function (done) {
      if (!R || blocked) return done({ supported: false });
      try { if (cur) cur.abort(); } catch (e) { }
      var r = new R(), finished = false, best = { ok: false, heard: '', score: 0, supported: true };
      cur = r;
      r.lang = 'en-US'; r.maxAlternatives = 6; r.interimResults = false; r.continuous = false;
      function end(x) { if (finished) return; finished = true; clearTimeout(timer); try { r.stop(); } catch (e) { } done(x || best); }
      var timer = setTimeout(function () { end(); }, 8000);
      r.onresult = function (e) {
        var res = e.results[0];
        for (var i = 0; i < res.length; i++) {
          var sc = score(target, res[i].transcript);
          if (sc > best.score || !best.heard) best = { ok: sc >= (wordsOf(target).length > 1 ? 0.6 : 0.7), heard: res[i].transcript, score: sc, supported: true };
        }
        end();
      };
      r.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') { blocked = true; end({ supported: false, reason: e.error }); }
        else end();
      };
      r.onend = function () { end(); };
      try { r.start(); } catch (e) { end({ supported: false }); }
    });
  }
  return { listen: listen, supported: function () { return !!R && !blocked; }, stop: function () { try { if (cur) cur.abort(); } catch (e) { } } };
})();

/* ---------- 효과음 ---------- */
var Sound = (function () {
  var ctx = null, on = store.get('fe-sound', true);
  function tone(f, d, type, when, vol) {
    if (!on) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.05);
    } catch (e) { }
  }
  var api = {
    get on() { return on; },
    toggle: function () { on = !on; store.set('fe-sound', on); if (!on) Voice.stop(); return on; },
    good: function () { tone(660, .12, 'triangle'); tone(990, .2, 'triangle', .09); },
    bad: function () { tone(220, .22, 'square', 0, .07); },
    pop: function () { tone(880, .07, 'sine', 0, .2); tone(1320, .08, 'sine', .03, .1); },
    tap: function () { tone(520, .05, 'triangle', 0, .1); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, 'triangle', i * .11); }); }
  };
  return api;
})();

/* ---------- 알림, 축하 ---------- */
function toast(msg) {
  var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2200);
}
function confetti(n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var box = document.createElement('div'); box.className = 'confetti'; document.body.appendChild(box);
  var cols = ['#E36D98', '#E7DD6A', '#10B183', '#2B8AC9', '#E89A3C', '#7A5CC9'];
  for (var i = 0; i < (n || 60); i++) {
    var p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * .4 + 's'; p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    box.appendChild(p);
  }
  setTimeout(function () { box.remove(); }, 3400);
}
function stars(n, max) { var s = ''; for (var i = 0; i < (max || 3); i++) s += '<span class="star' + (i < n ? ' on' : '') + '">★</span>'; return '<span class="stars" aria-label="별 ' + n + '개">' + s + '</span>'; }

/* ---------- 따라쓰기 판: 영어 공책 4줄 위 점선 글자를 손가락으로 따라 써요 ---------- */
function TracePad(host, text, opt) {
  opt = opt || {};
  var self = this, wrap = document.createElement('div'); wrap.className = 'trace';
  var bg = document.createElement('canvas'), ink = document.createElement('canvas');
  bg.className = 'trace-bg'; ink.className = 'trace-ink';
  ink.setAttribute('aria-label', text + ' 따라쓰기 칸');
  wrap.appendChild(bg); wrap.appendChild(ink); host.innerHTML = ''; host.appendChild(wrap);
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, fs, lines, layout = [], drawing = false, last = null, strokes = 0;
  var FONT = function (s) { return '400 ' + s + 'px Andika, "Comic Sans MS", sans-serif'; };

  function fit() {
    W = Math.max(260, wrap.clientWidth);
    var c = bg.getContext('2d'), maxFs = opt.max || 120, minOne = opt.min || (W < 520 ? 44 : 52);
    c.font = FONT(100);
    var w1 = c.measureText(text).width / 100;
    fs = Math.min(maxFs, (W - 36) / w1); lines = [text];
    if (fs < minOne && text.indexOf(' ') > 0) { // 두 줄로 나누기
      var ws = text.split(' '), bestI = 1, bestD = 1e9;
      for (var i = 1; i < ws.length; i++) { var d = Math.abs(c.measureText(ws.slice(0, i).join(' ')).width - c.measureText(ws.slice(i).join(' ')).width); if (d < bestD) { bestD = d; bestI = i; } }
      lines = [ws.slice(0, bestI).join(' '), ws.slice(bestI).join(' ')];
      var wm = Math.max(c.measureText(lines[0]).width, c.measureText(lines[1]).width) / 100;
      fs = Math.min(maxFs, (W - 36) / wm);
    }
    var row = fs * 1.42; H = Math.round(row * (lines.length - 1) + fs * 1.42);
    [bg, ink].forEach(function (cv) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; });
    wrap.style.height = H + 'px';
    layout = lines.map(function (t, i) { return { t: t, x: 18, base: Math.round(fs * 1.02 + i * row) }; });
    drawBg();
  }
  function drawBg() {
    var c = bg.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    c.font = FONT(fs);
    var asc = c.measureText('h').actualBoundingBoxAscent || fs * .72, xh = c.measureText('x').actualBoundingBoxAscent || fs * .5, desc = c.measureText('g').actualBoundingBoxDescent || fs * .24;
    layout.forEach(function (L) {
      var ys = [L.base - asc, L.base - xh, L.base, L.base + desc];
      ys.forEach(function (y, i) {
        c.beginPath(); c.lineWidth = i === 2 ? 2 : 1.2; c.strokeStyle = i === 2 ? '#E9A0B4' : '#C9CDD6';
        c.setLineDash(i === 1 ? [6, 6] : []); c.moveTo(6, y + .5); c.lineTo(W - 6, y + .5); c.stroke();
      });
      c.setLineDash([]);
      c.fillStyle = '#EEF0F4'; c.fillText(L.t, L.x, L.base);
      c.setLineDash([Math.max(3, fs * .045), Math.max(3, fs * .05)]); c.lineWidth = Math.max(1.5, fs * .018); c.strokeStyle = '#9EA4AF';
      c.strokeText(L.t, L.x, L.base); c.setLineDash([]);
    });
  }
  function pos(e) { var r = ink.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function ctx() { var c = ink.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = opt.color || '#2B4789'; c.lineWidth = Math.max(7, fs * .1); return c; }
  ink.addEventListener('pointerdown', function (e) {
    e.preventDefault(); drawing = true; last = pos(e); strokes++;
    try { ink.setPointerCapture(e.pointerId); } catch (x) { }
    var c = ctx(); c.beginPath(); c.arc(last.x, last.y, c.lineWidth / 2, 0, Math.PI * 2); c.fillStyle = c.strokeStyle; c.fill();
    if (opt.onstart) opt.onstart();
  });
  ink.addEventListener('pointermove', function (e) {
    if (!drawing) return; var p = pos(e), c = ctx();
    c.beginPath(); c.moveTo(last.x, last.y); c.lineTo(p.x, p.y); c.stroke(); last = p;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { ink.addEventListener(ev, function () { drawing = false; }); });

  // 점선 글자를 얼마나 덮었는지(coverage)와, 선 밖으로 나간 정도(near)
  this.check = function () {
    var w = W * dpr, h = H * dpr, m = document.createElement('canvas'); m.width = w; m.height = h;
    var c = m.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.font = FONT(fs);
    layout.forEach(function (L) { c.fillText(L.t, L.x, L.base); });
    var guide = c.getImageData(0, 0, w, h).data;
    c.clearRect(0, 0, W, H); c.lineWidth = fs * .3; c.lineJoin = 'round';
    layout.forEach(function (L) { c.fillText(L.t, L.x, L.base); c.strokeText(L.t, L.x, L.base); });
    var zone = c.getImageData(0, 0, w, h).data, inkd = ink.getContext('2d').getImageData(0, 0, w, h).data;
    var step = Math.max(2, Math.round(2 * dpr)), rad = Math.round(fs * .045 * dpr), gN = 0, gHit = 0, iN = 0, iNear = 0;
    function inkAt(x, y) { return x >= 0 && y >= 0 && x < w && y < h && inkd[(y * w + x) * 4 + 3] > 40; }
    for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) {
      var k = (y * w + x) * 4 + 3;
      if (guide[k] > 128) { gN++; if (inkAt(x, y) || inkAt(x - rad, y) || inkAt(x + rad, y) || inkAt(x, y - rad) || inkAt(x, y + rad)) gHit++; }
      if (inkd[k] > 40) { iN++; if (zone[k] > 20) iNear++; }
    }
    var cover = gN ? gHit / gN : 0, near = iN ? iNear / iN : 0;
    var sc = Math.round(Math.max(0, cover * 100 - Math.max(0, 0.7 - near) * 120));
    return { cover: cover, near: near, score: sc, ok: sc >= 45 && near >= .5, empty: iN < 20 };
  };
  this.clear = function () { var c = ink.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, ink.width, ink.height); strokes = 0; };
  this.destroy = function () { window.removeEventListener('resize', onResize); };
  var rt = null; function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(wrap.clientWidth - W) > 8) { fit(); self.clear(); } }, 200); }
  window.addEventListener('resize', onResize);
  (document.fonts && document.fonts.load ? document.fonts.load(FONT(60), text) : Promise.resolve()).then(fit, fit);
}

/* 단계 화면이 바뀔 때 정리할 것들 (타이머, 소리, 창 크기 감시) */
var Cleanup = { list: [], add: function (f) { this.list.push(f); }, run: function () { this.list.forEach(function (f) { try { f(); } catch (e) { } }); this.list = []; Voice.stop(); Listen.stop(); } };
