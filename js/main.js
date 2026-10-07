/* 주소(#)에 따라 화면을 고릅니다.  '' 첫 화면 · #s… 학생 · #t… 선생님 */
var App = (function () {
  var view = $('#view');
  function landing() {
    view.innerHTML =
      '<section class="landing"><p class="eyebrow">초등 기초 영어 · 5일 과정</p><h1>영어 첫걸음</h1>' +
      '<p class="lead">하루에 한 테마씩, 낱말 10개 → 문장 4개 → 정리 게임으로 마무리해요.</p>' +
      '<div class="themes">' + LESSONS.map(function (L) { return '<span style="--c:' + L.color + ';--cl:' + L.light + '"><b>' + L.icon + '</b>Day ' + L.id + ' ' + L.ko + '</span>'; }).join('') + '</div>' +
      '<div class="who-pick"><a class="who-card stu" href="#s"><span class="wc-emo">🎒</span><b>학생</b><small>이름 쓰고 공부 시작</small></a>' +
      '<a class="who-card tea" href="#t"><span class="wc-emo">🧑‍🏫</span><b>선생님</b><small>수업 슬라이드 · 학습 결과</small></a></div></section>';
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
