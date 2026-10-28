/* 영역별 숙달도 (0~100) — 투명한 한 줄 공식

     숙달도 = 60% × 최근 정답률   (그 영역 최근 MASTERY_RECENT_N(10)번 시도)
            + 30% × 누적 정답률   (그 영역 전체 시도)
            + 10% × 복습 성공률   (복습(rev) 시도의 정답률, 복습이 없으면 누적 정답률로 대신)

   · 영역: vocab 낱말, listen 듣기, speak 말하기, write 쓰기, sentence 문장
   · 말하기는 발음 점수가 아니에요. '말하기 시도 중 알아들었거나 스스로 말했다고 한 비율' 이에요.
   · 진단(baseline) 시도도 포함돼요. 그래서 공부를 시작하기 전에는 진단 결과가 첫 숙달도가 돼요.
   · 시도가 하나도 없으면 null (화면에 '–'). */
var AREAS = [
  { k: 'vocab', en: 'Words', ko: '낱말' },
  { k: 'listen', en: 'Listening', ko: '듣기' },
  { k: 'speak', en: 'Speaking', ko: '말하기' },
  { k: 'write', en: 'Writing', ko: '쓰기' },
  { k: 'sentence', en: 'Sentences', ko: '문장' }
];
var Mastery = (function () {
  function acc(list) { if (!list.length) return null; var s = 0; list.forEach(function (e) { s += e.ok; }); return s / list.length; }
  function area(events, k, n) {
    n = n || (window.CONFIG ? CONFIG.MASTERY_RECENT_N : 10);
    var list = events.filter(function (e) { return e.area === k && (e.ok === 0 || e.ok === 1); }).sort(function (a, b) { return a.ts < b.ts ? -1 : 1; });
    if (!list.length) return { value: null, n: 0 };
    var recent = acc(list.slice(-n)), cum = acc(list), rev = acc(list.filter(function (e) { return e.rev; }));
    if (rev == null) rev = cum;
    return { value: Math.round(100 * (0.6 * recent + 0.3 * cum + 0.1 * rev)), n: list.length, recent: recent, cum: cum, rev: rev };
  }
  function all(events) { var o = {}; AREAS.forEach(function (a) { o[a.k] = area(events, a.k); }); return o; }
  /* 진단만 따로 (영역별 정답률 0~100) */
  function baseline(events) {
    var o = {}, b = events.filter(function (e) { return e.step === 'baseline' && (e.ok === 0 || e.ok === 1); });
    if (!b.length) return null;
    AREAS.forEach(function (a) { var l = b.filter(function (e) { return e.area === a.k; }); o[a.k] = l.length ? Math.round(acc(l) * 100) : null; });
    o.ts = b[b.length - 1].ts; return o;
  }
  /* 지난 기간과 비교 (My Growth: 다른 친구가 아니라 지난 나와 비교) */
  function before(events, ts) { return all(events.filter(function (e) { return e.ts < ts; })); }
  return { area: area, all: all, baseline: baseline, before: before };
})();
