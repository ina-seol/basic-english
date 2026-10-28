/* 주소(#)에 따라 화면을 고릅니다.  '' 첫 화면 · #s… 학생 · #t… 선생님 */
var App = (function () {
  var view = $('#view');
  function landing() {
    var nW = LESSONS.reduce(function (a, L) { return a + L.words.length; }, 0), nS = LESSONS.reduce(function (a, L) { return a + L.sentences.length; }, 0);
    view.innerHTML =
      '<section class="hero">' + ART.pattern(1200, 520, 11, { step: 86, scale: 1.1 }) +
      '<div class="hero-txt"><p class="eyebrow">초등 기초 영어 · ' + LESSONS.length + '일 과정</p><h1>영어랑 친해지는<br><span class="hl">첫걸음</span></h1>' +
      '<p class="lead">오늘 조금씩 배우고, 어려웠던 것은 다시 연습하고, 내가 얼마나 늘었는지 봐요.</p>' +
      '<div class="row"><a class="btn primary big" href="#s">🎒 학생으로 시작</a><a class="btn ghost big" href="#t">🧑‍🏫 선생님 화면</a></div></div>' +
      '<div class="hero-art">' + LESSONS.slice(0, 4).map(function (L) { return '<a class="tile-day" href="#s/d/' + L.id + '" ' + lstyle(L) + '><span class="td-emo">' + L.icon + '</span><b>Day ' + L.id + '</b><small>' + L.ko + '</small></a>'; }).join('') +
      '<div class="hero-card"><span class="hc-emo" aria-hidden="true">📚</span><b>' + nW + '</b><span>낱말 · 문장 ' + nS + '개</span><a class="btn small secondary" href="#s">시작하기</a></div></div></section>' +
      '<section class="values"><h2>BASIC Loop</h2><p class="muted">배우고 → 해 보고 → 기록되고 → 어려운 것을 다시 → 선생님이 함께</p><div class="vpills">' +
      [['B', 'Baseline 처음 진단'], ['A', 'Adaptive 맞춤 복습'], ['S', 'Speak & Write 말하고 쓰기'], ['I', 'Immediate 바로 피드백'], ['C', 'Cumulative 쌓이는 기록']].map(function (v) { return '<span class="vpill"><i class="chk" aria-hidden="true">' + v[0] + '</i>' + v[1] + '</span>'; }).join('') + '</div></section>' +
      '<section class="programs"><h2 class="teal-t">' + LESSONS.length + '일 과정</h2><div class="prog-grid">' + LESSONS.map(function (L) {
        return '<a class="prog-card" href="#s/d/' + L.id + '" ' + lstyle(L) + '><span class="pc-art blob">' + ART.bits([['leaf', 14, 18, -30, 1, '#F2A33A'], ['acorn', 86, 80, 20, .9], ['sprig', 84, 20, 15, 1]]) + '<span class="pc-emo">' + L.icon + '</span></span>' +
          '<b>Day ' + L.id + ' · ' + L.ko + '</b><small>' + L.theme + ' · ' + GAMES[L.game].name + '</small></a>';
      }).join('') + '</div></section>';
  }
  function syncTop(mode) {
    var who = $('#who'), sid = Me.sid();
    who.innerHTML = mode === 's' && Me.valid(sid) ? '<span class="me">🎒 ' + esc(sid) + '</span>' : mode === 't' ? '<span class="me">🧑‍🏫 선생님</span>' : '';
    var b = $('#snd'); b.textContent = Sound.on ? '🔊 소리 켬' : '🔇 소리 끔'; b.setAttribute('aria-pressed', Sound.on);
    document.body.dataset.mode = mode || '';
    $$('.top-nav a').forEach(function (a) { var on = location.hash.indexOf(a.getAttribute('href')) === 0 && (a.getAttribute('href') !== '#t' || !/^#t\/(dash|stu|export|set)/.test(location.hash)); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  /* 인터넷이 끊겼거나 보내기가 계속 안 될 때만 보여요 */
  function syncBar(st) {
    var bar = $('#syncbar'); if (!bar) return;
    var show = st.url && st.pending > 0 && (!st.online || st.failing) && document.body.dataset.mode === 's';
    bar.hidden = !show;
    if (show) bar.innerHTML = '<span class="emo" aria-hidden="true">💾</span><span><b>Your work is saved on this device.</b> We’ll sync it when the connection returns. <span class="muted">(기록 ' + st.pending + '개 대기 중)</span></span>';
  }
  function render() {
    Cleanup.run();
    var h = location.hash.replace(/^#\/?/, ''), parts = h.split('/'), mode = parts.shift();
    view.classList.remove('view-in'); void view.offsetWidth;
    if (mode === 's') Student.route(view, parts);
    else if (mode === 't') Teacher.route(view, parts);
    else { mode = ''; landing(); }
    syncTop(mode); syncBar(Api.status());
    window.scrollTo(0, 0);
    var hd = view.querySelector('h1'); if (hd) { hd.setAttribute('tabindex', '-1'); if (document.activeElement === document.body || !document.activeElement) hd.focus({ preventScroll: true }); }
  }
  $('#snd').onclick = function () { Sound.toggle(); syncTop(document.body.dataset.mode); };
  Api.onStatus(syncBar);
  window.addEventListener('hashchange', render);
  render();
  return { render: render };
})();
