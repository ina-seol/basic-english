/* 학생: Quick Review · 선생님 복습 · My Tricky Words · My Growth · 처음 진단 */
var StudentReview = (function () {
  function back(t) { return '<nav class="crumbs"><a class="btn small" href="#s">← Home</a><span class="crumb-t">' + t + '</span></nav>'; }
  function weakAreas(ev) { var b = Mastery.baseline(ev) || {}, w = {}; AREAS.forEach(function (a) { if (b[a.k] != null && b[a.k] < 50) w[a.k] = 1; }); return w; }
  function toQs(entries) {
    return entries.map(function (b) { var info = itemInfo(b.item), k = Quiz.kindFor(info, b.areas); return { kind: k, item: info, area: Quiz.areaFor(k, info) }; });
  }
  function summary(host, title, results, extra) {
    var ok = results.filter(function (r) { return r.ok; }).length;
    var B = Review.bank(Log.all(Me.sid()));
    var rows = results.map(function (r) { var it = itemInfo(r.item), b = B[r.item], st = b ? b.state : 'known'; return '<li><span class="en">' + esc(it.type === 'drill' ? it.frame.replace('{w}', it.slot) : it.en) + '</span>' + stateTag(st) + '</li>'; }).join('');
    Sound.good();
    host.innerHTML = '<section class="panel result view-in"><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + (ok === results.length ? '🌟' : '💪') + '</span></div><h1>' + title + '</h1>' +
      '<p class="big-n">한 번에 맞힘 <b>' + ok + '</b> / ' + results.length + '</p><ul class="rv-list">' + rows + '</ul>' + (extra || '') +
      '<p class="muted">맞힌 것은 며칠 뒤에 한 번 더 확인해요. 그때도 맞히면 Mastered!</p><div class="row center"><a class="btn" href="#s/tricky">🧩 My Tricky Words</a><a class="btn primary" href="#s">Home</a></div></section>';
  }
  function stateTag(st) {
    return { needs: '<span class="pill warn">↻ Needs Practice</span>', improving: '<span class="pill">↗ Improving</span>', mastered: '<span class="pill ok">✓ Mastered</span>', known: '<span class="pill ok">✓</span>' }[st] || '';
  }

  function quick(host) {
    var ev = Log.all(Me.sid()), due = Review.quick(ev, { weakAreas: weakAreas(ev) });
    if (!due.length) { host.innerHTML = back('Quick Review') + '<section class="panel view-in"><div class="result-emo">' + ART.burst('#E3F6E0') + '<span>✅</span></div><h1>All caught up!</h1><p class="muted">지금은 다시 연습할 것이 없어요. 공부하다 틀린 것은 여기에 다시 나와요.</p><a class="btn primary" href="#s">Home</a></section>'; return; }
    host.innerHTML = back('Quick Review') + '<section class="panel view-in"><h1>Quick Review</h1><p class="lead">Let’s practice ' + due.length + ' things again.</p><ul class="rv-list">' +
      due.map(function (b) { var it = itemInfo(b.item); return '<li><span class="en">' + esc(it.type === 'drill' ? it.frame.replace('{w}', '___') : it.en) + '</span>' + stateTag(b.state) + '</li>'; }).join('') +
      '</ul><button class="btn primary big" id="go">Start</button></section>';
    $('#go').onclick = function () {
      host.innerHTML = back('Quick Review') + '<div id="qz"></div>';
      Quiz.run($('#qz'), toQs(due), { step: 'review', rev: 'quick', title: 'Quick Review', onDone: function (r) { Log.done(0, 'review', { n: r.length }); summary(host, 'Review done!', r); } });
    };
    $('#go').focus();
  }

  /* 선생님이 보낸 복습. items: { ids:[…], area, title } — ids 에 'tricky', 'day:8:w', 'day:8:dr' 도 쓸 수 있어요 */
  function assign(host, aid) {
    var sid = Me.sid(), a = StudentHome.openAssignments(sid).filter(function (x) { return x.aid === aid; })[0];
    if (!a) { host.innerHTML = back('Teacher Review') + '<section class="panel"><h1>이미 끝냈거나 없는 복습이에요</h1><a class="btn primary" href="#s">Home</a></section>'; return; }
    var spec = {}; try { spec = JSON.parse(a.items || '{}'); } catch (e) { }
    var ids = [];
    (spec.ids || []).forEach(function (id) {
      var m = /^day:(\d+):(w|dr|s)$/.exec(id);
      if (id === 'tricky') Review.quick(Log.all(sid), { max: 8, today: '9999-12-31' }).forEach(function (b) { ids.push(b.item); });
      else if (m) { var L = lessonById(+m[1]); if (L) { var n = m[2] === 'w' ? L.words.length : m[2] === 's' ? L.sentences.length : drillItems(L).length; for (var i = 0; i < n; i++) ids.push(itemId(L.id, m[2], i)); } }
      else if (itemInfo(id)) ids.push(id);
    });
    ids = ids.filter(function (x, i) { return ids.indexOf(x) === i; }).slice(0, 10);
    var B = Review.bank(Log.all(sid));
    var qs = ids.map(function (id) {
      var info = itemInfo(id), area = spec.area || 'auto', k;
      if (area === 'write') k = info.type === 'word' && /^[a-z' -]{2,14}$/i.test(info.en) ? 'type' : Quiz.kindFor(info, {});
      else if (area === 'listen') k = info.type === 'word' ? 'hear2pic' : Quiz.kindFor(info, {});
      else if (area === 'vocab') k = info.type === 'word' ? 'pic2word' : Quiz.kindFor(info, {});
      else if (area === 'sentence') k = info.type === 'drill' ? 'fill' : info.type === 'sentence' ? 'order' : 'pic2word';
      else k = Quiz.kindFor(info, (B[id] || {}).areas);
      return { kind: k, item: info, area: Quiz.areaFor(k, info) };
    });
    host.innerHTML = back('Teacher Review') + '<section class="panel view-in"><div class="result-emo">' + ART.burst('#DDF4F8') + '<span>📮</span></div><h1>Teacher Review</h1><p class="lead">Your teacher sent you a short practice activity.</p>' +
      '<p><b>' + esc(spec.title || '복습') + '</b>' + (a.note ? ' · ' + esc(a.note) : '') + ' · ' + qs.length + '문제</p><button class="btn primary big" id="go"' + (qs.length ? '' : ' disabled') + '>Start</button></section>';
    $('#go').onclick = function () {
      host.innerHTML = back('Teacher Review') + '<div id="qz"></div>';
      Quiz.run($('#qz'), qs, { step: 'assign', rev: 'teacher', title: spec.title || 'Teacher Review', onDone: function (r) {
        Log.add({ day: 0, step: 'assign', act: 'assigndone', item: 'assign', resp: aid, x: JSON.stringify({ n: r.length, ok: r.filter(function (x) { return x.ok; }).length }) });
        Api.flush(); summary(host, 'Teacher Review done!', r);
      } });
    };
  }

  function tricky(host, itemArg) {
    var list = Review.tricky(Log.all(Me.sid()));
    if (itemArg) {
      var info = itemInfo(itemArg); if (!info) return tricky(host);
      var qs = [{ kind: 'hear2pic', item: info, area: 'listen' }];
      if (/^[a-z' -]{2,14}$/i.test(info.en)) qs.push({ kind: 'type', item: info, area: 'write' }); else qs.push({ kind: 'pic2word', item: info, area: 'vocab' });
      host.innerHTML = back('My Tricky Words') + '<div id="qz"></div>';
      Quiz.run($('#qz'), qs, { step: 'review', rev: 'tricky', title: info.en, onDone: function (r) { summary(host, 'Good practice!', r.filter(function (x, i) { return i === 0 || x.item !== r[0].item; })); } });
      return;
    }
    var groups = [['needs', 'Needs Practice', '↻'], ['improving', 'Improving', '↗'], ['mastered', 'Mastered', '✓']];
    host.innerHTML = back('My Tricky Words') + '<section class="card view-in"><h1>My Tricky Words</h1><p class="muted">어려웠던 낱말이에요. 누르면 다시 연습해요. 며칠 뒤에도 맞히면 Mastered 로 옮겨 가요.</p></section>' +
      (list.length ? groups.map(function (g) {
        var l = list.filter(function (b) { return b.state === g[0]; });
        if (!l.length) return '';
        return '<section class="card tricky-g ' + g[0] + '"><h2><span aria-hidden="true">' + g[2] + '</span> ' + g[1] + ' <small>' + l.length + '</small></h2><div class="tw-grid">' + l.map(function (b) {
          var it = itemInfo(b.item); return '<a class="tw" href="#s/tricky/' + b.item + '">' + ART.pic(it.pic) + '<b class="en">' + esc(it.en) + '</b><small>' + esc(it.ko) + '</small></a>';
        }).join('') + '</div></section>';
      }).join('') : '<section class="panel"><div class="result-emo">' + ART.burst('#E3F6E0') + '<span>✨</span></div><h2>아직 어려웠던 낱말이 없어요</h2></section>');
  }

  function growth(host) {
    var ev = Log.all(Me.sid()), n = Progress.completedCount(Me.sid()), now = Mastery.all(ev);
    var weekAgo = new Date(Date.now() - 7 * 864e5).toISOString(), before = Mastery.before(ev, weekAgo), bl = Mastery.baseline(ev), B = Review.bank(ev);
    var wordsKnown = {}; ev.forEach(function (e) { if (e.ok === 1 && /\.w\./.test(e.item)) wordsKnown[e.item] = 1; });
    Object.keys(B).forEach(function (k) { if (B[k].state === 'needs') delete wordsKnown[k]; });
    var speaks = ev.filter(function (e) { return e.act === 'speak'; }).length;
    var fixed = Object.keys(B).filter(function (k) { return B[k].state === 'mastered'; }).length;
    host.innerHTML = back('My Growth') + '<section class="card growth view-in"><h1>My Growth</h1><p class="muted">친구와 비교하지 않아요. <b>지난주의 나</b>와 비교해요.</p>' +
      '<div class="g-days"><b>' + n + '</b> Days completed<span class="bar"><i style="width:' + (n / LESSONS.length * 100) + '%"></i></span></div>' +
      '<ul class="g-areas">' + AREAS.map(function (a) {
        var v = now[a.k].value, p = before[a.k].value, d = v != null && p != null ? v - p : null;
        return '<li style="--c:var(--area-' + a.k + ')"><span class="g-name"><b>' + a.en + '</b><small>' + a.ko + '</small></span>' + masteryDots(v) +
          '<span class="bar" aria-hidden="true"><i style="width:' + (v || 0) + '%"></i></span>' +
          '<span class="g-delta">' + (d == null ? (v == null ? '아직 기록 없음' : '이번 주 시작!') : d > 0 ? '▲ 지난주보다 늘었어요' : d < 0 ? '↻ 조금 더 연습해요' : '= 그대로') + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="g-facts"><p><span class="emo">📚</span> You know <b>' + Object.keys(wordsKnown).length + '</b> words.</p><p><span class="emo">🎤</span> You practiced speaking <b>' + speaks + '</b> times.</p><p><span class="emo">🧩</span> You fixed <b>' + fixed + '</b> tricky items.</p></div>' +
      (bl ? '<p class="muted">처음 진단(' + dayKey(bl.ts) + ')보다 지금: ' + AREAS.filter(function (a) { return bl[a.k] != null && now[a.k].value != null; }).map(function (a) { return a.ko + ' ' + bl[a.k] + '→' + now[a.k].value; }).join(' · ') + '</p>' : '') + '</section>';
  }

  function baseline(host) {
    var qs = baselineItems().map(function (q) { return { kind: q.kind, item: q.item, area: q.area }; });
    host.innerHTML = back('처음 진단') + '<section class="panel view-in"><div class="result-emo">' + ART.burst('#DDF4F8') + '<span>🧭</span></div><h1>처음 진단</h1>' +
      '<p class="lead">' + qs.length + '문제, 5~10분. 배우지 않은 것이 나와도 괜찮아요.</p><p class="muted">결과는 공부를 막는 데 쓰지 않아요. 나에게 맞는 복습을 고르는 데 써요.</p><button class="btn primary big" id="go">시작</button></section>';
    $('#go').onclick = function () {
      host.innerHTML = back('처음 진단') + '<div id="qz"></div>';
      Quiz.run($('#qz'), qs, { step: 'baseline', day: 0, title: 'Baseline', onDone: function () {
        Log.add({ day: 0, step: 'baseline', act: 'done', item: 'baseline' }); Api.flush();
        var bl = Mastery.baseline(Log.all(Me.sid())) || {};
        host.innerHTML = '<section class="panel result view-in"><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>🧭</span></div><h1>진단 끝!</h1><ul class="g-areas">' +
          AREAS.filter(function (a) { return a.k !== 'speak'; }).map(function (a) { return '<li style="--c:var(--area-' + a.k + ')"><span class="g-name"><b>' + a.en + '</b><small>' + a.ko + '</small></span>' + masteryDots(bl[a.k]) + '</li>'; }).join('') +
          '</ul><p class="muted">이제 공부하면서 점점 채워 가요.</p><a class="btn primary" href="#s">Home</a></section>';
      } });
    };
  }
  return { quick: quick, assign: assign, tricky: tricky, growth: growth, baseline: baseline, stateTag: stateTag };
})();

/* 학생 화면 주소 */
var Student = {
  route: function (host, parts) {
    if (parts[0] === 'login' || !Me.valid(Me.sid())) return StudentLogin.view(host, function () { location.hash = '#s'; App.render(); });
    var p = parts[0];
    if (p === 'journey') return StudentHome.journey(host);
    if (p === 'help') return StudentHome.help(host);
    if (p === 'review') return StudentReview.quick(host);
    if (p === 'assign') return StudentReview.assign(host, decodeURIComponent(parts[1] || ''));
    if (p === 'tricky') return StudentReview.tricky(host, parts[1]);
    if (p === 'growth') return StudentReview.growth(host);
    if (p === 'baseline') return StudentReview.baseline(host);
    if (p === 'd') { var L = lessonById(parts[1]); if (L) return StudentDay.route(host, L, parts[2]); }
    StudentHome.home(host);
  },
  me: function () { return Me.sid(); }
};
