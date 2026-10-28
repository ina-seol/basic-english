/* 소리: 읽어 주기(TTS)와 따라 말하기(음성 인식)
   음성 인식은 '발음 점수'가 아니에요. 크롬이 알아들은 말이 목표 문장과 비슷한지만 보고,
   실패해도 학생은 언제든 '말했어요' 로 넘어갈 수 있어요. */
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

/* 따라 말하기. 상태: idle → listening → idle
   결과 reason: ok | mismatch | no-speech | too-short | blocked | no-mic | network | unsupported | timeout | error */
var Listen = (function () {
  var R = window.SpeechRecognition || window.webkitSpeechRecognition, blocked = false, cur = null, state = 'idle';
  var MSG = {
    'no-speech': '소리가 안 들렸어요. 마이크 가까이에서 크게 말해요.',
    'too-short': '조금 더 길게 말해 볼까요?',
    'blocked': '마이크를 쓸 수 없어요. 크게 말하고 "말했어요"를 눌러요.',
    'no-mic': '마이크를 찾을 수 없어요. 크게 말하고 "말했어요"를 눌러요.',
    'network': '인터넷이 불안정해 알아듣지 못했어요. "말했어요"로 넘어가도 돼요.',
    'unsupported': '이 브라우저는 말하기 듣기를 못 해요. 크게 말하고 "말했어요"를 눌러요.',
    'timeout': '시간이 지났어요. 다시 눌러 말해요.',
    'error': '잠깐 문제가 있었어요. 다시 해 보거나 "말했어요"를 눌러요.'
  };
  function norm(s) {
    return s.toLowerCase().replace(/’/g, "'").replace(/\bit's\b/g, 'it is').replace(/\bwhat's\b/g, 'what is').replace(/\bhow's\b/g, 'how is')
      .replace(/\bi'm\b/g, 'i am').replace(/\blet's\b/g, 'let us').replace(/\bdon't\b/g, 'do not').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) m[i] = [i];
    for (j = 0; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function near(w, h) { return w === h || (w.length > 3 && lev(w, h) <= Math.max(1, Math.floor(w.length / 4))); }
  /* 들린 말과 목표 말이 얼마나 비슷한지 0~1 */
  function score(target, heard) {
    var t = norm(target).split(' '), h = norm(heard).split(' ');
    var hit = t.filter(function (w) { return h.some(function (x) { return near(w, x); }); }).length;
    var a = norm(target).replace(/ /g, ''), b = norm(heard).replace(/ /g, '');
    return Math.max(hit / t.length, 1 - lev(a, b) / Math.max(4, a.length));
  }
  function enabled() { return !!R && !blocked && CONFIG.ENABLE_SPEECH !== false; }
  /* 마이크 권한을 미리 확인 (지원하는 브라우저만). denied 면 처음부터 '말했어요' 로 */
  if (navigator.permissions && navigator.permissions.query) {
    try { navigator.permissions.query({ name: 'microphone' }).then(function (p) { if (p.state === 'denied') blocked = true; p.onchange = function () { blocked = p.state === 'denied'; }; }).catch(function () { }); } catch (e) { }
  }
  function listen(target) {
    return new Promise(function (done) {
      if (!enabled()) return done({ ok: false, reason: R ? 'blocked' : 'unsupported', supported: false });
      try { if (cur) cur.abort(); } catch (e) { }
      var r = new R(), finished = false, best = null;
      cur = r; state = 'listening';
      r.lang = 'en-US'; r.maxAlternatives = 6; r.interimResults = false; r.continuous = false;
      function end(x) {
        if (finished) return; finished = true; state = 'idle'; clearTimeout(timer);
        try { r.stop(); } catch (e) { }
        var res = x || best || { ok: false, reason: 'no-speech', heard: '', score: 0 };
        res.supported = res.reason !== 'blocked' && res.reason !== 'no-mic' && res.reason !== 'unsupported';
        res.msg = MSG[res.reason] || '';
        done(res);
      }
      var timer = setTimeout(function () { end({ ok: false, reason: 'timeout', heard: '', score: 0 }); }, 9000);
      r.onresult = function (e) {
        var res = e.results[0], need = wordsOf(target).length > 1 ? 0.6 : 0.7;
        for (var i = 0; i < res.length; i++) {
          var tr = res[i].transcript || '', sc = score(target, tr);
          if (!best || sc > best.score) best = { ok: sc >= need, heard: tr, score: Math.round(sc * 100) / 100, reason: sc >= need ? 'ok' : 'mismatch' };
        }
        if (best && best.heard.replace(/[^a-z]/gi, '').length < 2) best.reason = 'too-short', best.ok = false;
        end();
      };
      r.onerror = function (e) {
        var map = { 'not-allowed': 'blocked', 'service-not-allowed': 'blocked', 'audio-capture': 'no-mic', 'network': 'network', 'no-speech': 'no-speech', 'aborted': 'error' };
        var reason = map[e.error] || 'error';
        if (reason === 'blocked' || reason === 'no-mic') blocked = true;
        end({ ok: false, reason: reason, heard: '', score: 0 });
      };
      r.onend = function () { end(); };
      try { r.start(); } catch (e) { end({ ok: false, reason: 'error', heard: '', score: 0 }); }
    });
  }
  return { listen: listen, supported: enabled, state: function () { return state; }, score: score, stop: function () { try { if (cur) cur.abort(); } catch (e) { } state = 'idle'; } };
})();
