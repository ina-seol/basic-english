/* 화면 공통: 효과음, 알림, 피드백 문구, 별, 숙달도 점 */
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
  return {
    get on() { return on; },
    toggle: function () { on = !on; store.set('fe-sound', on); if (!on) Voice.stop(); return on; },
    good: function () { tone(660, .12, 'triangle'); tone(990, .2, 'triangle', .09); },
    bad: function () { tone(300, .16, 'triangle', 0, .08); },
    pop: function () { tone(880, .07, 'sine', 0, .2); tone(1320, .08, 'sine', .03, .1); },
    tap: function () { tone(520, .05, 'triangle', 0, .1); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, 'triangle', i * .11); }); }
  };
})();

function toast(msg) {
  var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600);
}
/* 축하는 Day·게임을 끝낼 때만, 짧게 */
function confetti(n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box);
  var cols = ['#E74C3C', '#FFBB12', '#10C700', '#0295A9', '#F28C28'];
  for (var i = 0; i < (n || 36); i++) {
    var p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * .3 + 's'; p.style.animationDuration = 1.4 + Math.random() * .8 + 's';
    box.appendChild(p);
  }
  setTimeout(function () { box.remove(); }, 2600);
}
function stars(n, max) { var s = ''; for (var i = 0; i < (max || 3); i++) s += '<span class="star' + (i < n ? ' on' : '') + '" aria-hidden="true">★</span>'; return '<span class="stars" role="img" aria-label="별 ' + max + '개 중 ' + n + '개">' + s + '</span>'; }

/* 피드백 문구: 틀렸다는 말 대신 다시 해 보자는 말 */
var Feedback = {
  good: function () { return '<b>Nice!</b> You got it. <span class="fb-ko">잘했어요</span>'; },
  again: function () { return '<b>Almost!</b> Try again. <span class="fb-ko">한 번 더</span>'; },
  together: function () { return '<b>Let’s look at it together.</b> <span class="fb-ko">같이 볼까요?</span>'; },
  spoke: function () { return '<b>Great practice!</b> <span class="fb-ko">잘 말했어요</span>'; },
  /* 정답/오답을 색만으로 보이지 않게: 기호와 글자를 같이 */
  mark: function (ok) { return ok ? '<span class="fb-mark ok" aria-hidden="true">✓</span>' : '<span class="fb-mark again" aria-hidden="true">↻</span>'; }
};

/* 숙달도 0~100 → 학생용 점 4칸 (●●●○). 값이 없으면 '–' */
function masteryDots(v) {
  if (v == null) return '<span class="mdots none" aria-label="아직 기록 없음">–</span>';
  var n = v >= 75 ? 4 : v >= 50 ? 3 : v >= 25 ? 2 : 1, s = '';
  for (var i = 0; i < 4; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>';
  return '<span class="mdots" role="img" aria-label="4칸 중 ' + n + '칸">' + s + '</span>';
}
