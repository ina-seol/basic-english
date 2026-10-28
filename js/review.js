/* Error Bank 와 간격 복습 (규칙 기반, 설명 가능)

   어떤 기록이 들어가나: 점수가 있는(ok 0/1) 듣기·낱말·쓰기·문장 시도.
     · 말하기(speak)는 넣지 않아요. 음성 인식 실패는 학생 잘못이 아닐 때가 많아서요.
     · 진단(baseline)도 넣지 않아요. 아직 배우지 않은 내용이라서요.

   상태 (항목마다, 기록을 시간 순서로 다시 읽어서 계산)
     처음 틀림                 → needs     오늘 Quick Review 에 나와요
     복습에서 또 틀림          → needs     다음 날(다음 학습) 다시 나와요
     needs 에서 맞힘           → improving REVIEW_CHECK_AFTER_DAYS(2)일 뒤 한 번 더 확인
     improving, 그 날이 되어 맞힘 → mastered
     mastered 인데 틀림        → needs
   한 번도 틀리지 않은 항목은 Error Bank 에 들어가지 않아요. */
var Review = (function () {
  var BANK_AREAS = { listen: 1, vocab: 1, write: 1, sentence: 1 };
  function addDays(day, n) { var d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() + n); return dayKey(d); }

  /* events → { itemId: entry } */
  function bank(events, opt) {
    opt = opt || {};
    var gap = opt.gap != null ? opt.gap : (window.CONFIG ? CONFIG.REVIEW_CHECK_AFTER_DAYS : 2);
    var out = {};
    events.filter(function (e) { return (e.ok === 0 || e.ok === 1) && BANK_AREAS[e.area] && e.step !== 'baseline' && /^d\d+\.(w|s|dr)\./.test(e.item); })
      .sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; })
      .forEach(function (e) {
        var b = out[e.item], day = dayKey(e.ts);
        if (!b) {
          if (e.ok === 1) { out[e.item] = { item: e.item, tries: 1, wrong: 0, right: 1, firstOk: 1, state: 'known', areas: {} }; out[e.item].areas[e.area] = 1; return; }
          b = out[e.item] = { item: e.item, tries: 0, wrong: 0, right: 0, firstOk: 0, state: 'new', areas: {} };
        }
        b.tries++; b.areas[e.area] = 1; b.lastAttempt = e.ts;
        if (e.ok === 0) {
          b.wrong++; b.lastWrong = e.ts; b.everTricky = true;
          b.state = 'needs'; b.due = e.rev ? addDays(day, 1) : day; b.checkFrom = null;
        } else {
          b.right++; b.lastRight = e.ts;
          if (b.state === 'needs') { b.state = 'improving'; b.checkFrom = addDays(day, gap); b.due = b.checkFrom; }
          else if (b.state === 'improving' && day >= b.checkFrom) { b.state = 'mastered'; b.due = null; b.masteredAt = e.ts; }
        }
      });
    Object.keys(out).forEach(function (k) {
      var b = out[k];
      if (!b.everTricky) { delete out[k]; return; }
      /* 0~1, 교사 화면에서 쓰는 항목 숙달도: 맞힌 비율에 상태를 반영 */
      b.mastery = b.state === 'mastered' ? 1 : Math.round((b.right / Math.max(1, b.tries)) * (b.state === 'improving' ? 0.9 : 0.6) * 100) / 100;
    });
    return out;
  }
  function isDue(b, today) { return (b.state === 'needs' || b.state === 'improving') && b.due && b.due <= today; }
  /* Quick Review 목록: needs 먼저, 많이 틀린 것 먼저, 오래된 것 먼저 */
  function quick(events, opt) {
    opt = opt || {};
    var today = opt.today || dayKey(), max = opt.max != null ? opt.max : (window.CONFIG ? CONFIG.REVIEW_MAX_ITEMS : 8), weak = opt.weakAreas || {};
    var B = bank(events, opt);
    return Object.keys(B).map(function (k) { return B[k]; }).filter(function (b) { return isDue(b, today) && itemInfo(b.item); })
      .sort(function (a, b) {
        var pa = (a.state === 'needs' ? 100 : 0) + a.wrong * 5 + bonus(a), pb = (b.state === 'needs' ? 100 : 0) + b.wrong * 5 + bonus(b);
        return pb - pa || (a.lastAttempt < b.lastAttempt ? -1 : 1);
      }).slice(0, max);
    function bonus(b) { var s = 0; for (var a in b.areas) if (weak[a]) s += 10; return s; }
  }
  /* 어려웠던 낱말 (My Tricky Words) */
  function tricky(events) {
    var B = bank(events);
    return Object.keys(B).map(function (k) { return B[k]; }).filter(function (b) { return /\.w\./.test(b.item); })
      .sort(function (a, b) { var o = { needs: 0, improving: 1, mastered: 2 }; return o[a.state] - o[b.state] || b.wrong - a.wrong; });
  }
  /* 복습 효과: 처음 시도 정답률 vs 복습 시도 정답률, 어려웠다가 mastered 된 수 */
  function effect(events) {
    var first = {}, firstN = 0, firstOk = 0, revN = 0, revOk = 0;
    events.filter(function (e) { return (e.ok === 0 || e.ok === 1) && BANK_AREAS[e.area] && e.step !== 'baseline'; })
      .sort(function (a, b) { return a.ts < b.ts ? -1 : 1; })
      .forEach(function (e) {
        if (e.rev) { revN++; revOk += e.ok; }
        else if (!first[e.item]) { first[e.item] = 1; firstN++; firstOk += e.ok; }
      });
    var B = bank(events), all = Object.keys(B).length, mastered = Object.keys(B).filter(function (k) { return B[k].state === 'mastered'; }).length;
    return { firstAcc: firstN ? firstOk / firstN : null, reviewAcc: revN ? revOk / revN : null, firstN: firstN, reviewN: revN, trickyAll: all, trickyMastered: mastered };
  }
  return { bank: bank, quick: quick, tricky: tricky, effect: effect, isDue: isDue, addDays: addDays };
})();
