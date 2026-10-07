/* 주소(#)에 따라 화면을 고릅니다.  '' 첫 화면 · #s… 학생 · #t… 선생님 */
var App = (function () {
  var view = $('#view');
  function landing() {
    var nW = LESSONS.reduce(function (a, L) { return a + L.words.length; }, 0), nS = LESSONS.reduce(function (a, L) { return a + L.sentences.length; }, 0);
    var st = function (L) { return 'style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"'; };
    view.innerHTML =
      '<section class="hero">' + ART.pattern(1200, 520, 11, { step: 86, scale: 1.1 }) +
      '<div class="hero-txt"><p class="eyebrow">초등 기초 영어 · ' + LESSONS.length + '일 과정</p><h1>영어랑 친해지는<br><span class="hl">첫걸음</span></h1>' +
      '<p class="lead">하루에 한 테마씩, 듣고 따라 말하고 따라 쓰고, 정리 게임으로 마무리해요.</p>' +
      '<div class="row"><a class="btn primary big" href="#s">🎒 학생으로 시작</a><a class="btn dashed big" href="#t">🧑‍🏫 선생님 화면</a></div></div>' +
      '<div class="hero-art">' + LESSONS.slice(0, 4).map(function (L) { return '<a class="tile-day" href="#s/' + L.id + '" ' + st(L) + '><span class="td-emo">' + L.icon + '</span><b>Day ' + L.id + '</b><small>' + L.ko + '</small></a>'; }).join('') +
      '<div class="hero-card"><span class="hc-emo" aria-hidden="true">📚</span><b>' + nW + '</b><span>낱말 · 문장 ' + nS + '개</span><a class="btn small teal" href="#s">시작하기</a></div></div></section>' +
      '<section class="values"><h2>이렇게 배워요</h2><p class="muted">한 회차는 네 단계예요. 크롬북 한 화면에서 끝까지 할 수 있어요.</p><div class="vpills">' +
      [['🎧', '듣고 따라 말하기'], ['✏️', '4줄 공책에 따라쓰기'], ['🔁', '낱말 바꿔 말하기'], ['🎮', '정리 미니게임']].map(function (v) { return '<span class="vpill"><i class="chk" aria-hidden="true">✓</i>' + v[1] + '</span>'; }).join('') + '</div></section>' +
      '<section class="programs"><h2 class="teal-t">' + LESSONS.length + '일 과정</h2><div class="prog-grid">' + LESSONS.map(function (L) {
        return '<a class="prog-card" href="#s/' + L.id + '" ' + st(L) + '><span class="pc-art">' + ART.bits([['leaf', 14, 18, -30, 1, '#F2A33A'], ['acorn', 86, 80, 20, .9], ['sprig', 84, 20, 15, 1]]) + '<span class="pc-emo">' + L.icon + '</span></span>' +
          '<b>Day ' + L.id + ' · ' + L.ko + '</b><small>' + L.theme + ' · ' + GAMES[L.game].name + '</small></a>';
      }).join('') + '</div></section>';
  }
  function syncTop(mode) {
    var who = $('#who');
    who.innerHTML = mode === 's' && Student.me() ? '<span class="me">🎒 ' + esc(Student.me()) + '</span>' : mode === 't' ? '<span class="me">🧑‍🏫 선생님</span>' : '';
    var b = $('#snd'); b.textContent = Sound.on ? '🔊 소리 켬' : '🔇 소리 끔'; b.setAttribute('aria-pressed', Sound.on);
    document.body.dataset.mode = mode || '';
  }
  function render() {
    Cleanup.run();
    var h = location.hash.replace(/^#\/?/, ''), parts = h.split('/'), mode = parts.shift();
    if (mode === 's') Student.route(view, parts);
    else if (mode === 't') Teacher.route(view, parts);
    else { mode = ''; landing(); }
    syncTop(mode);
    window.scrollTo(0, 0);
    var hd = view.querySelector('h1'); if (hd && document.activeElement === document.body) hd.setAttribute('tabindex', '-1');
  }
  $('#snd').onclick = function () { Sound.toggle(); syncTop(document.body.dataset.mode); };
  window.addEventListener('hashchange', render);
  render();
  return { render: render };
})();
