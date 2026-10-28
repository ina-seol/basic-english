/* 학생 홈 · My Journey · 설정/도움
   홈에서 바로 알 수 있어야 하는 세 가지: 어디까지 했는지 / 오늘 무엇을 할지 / 다시 연습할 것이 있는지 */
var StudentHome = (function () {
  var pulled = {};
  /* 다른 기기 기록과 선생님이 보낸 복습 받아 오기 (접속마다 한 번, 5분 간격) */
  function pull(sid, after) {
    if (!Api.url() || (pulled[sid] && Date.now() - pulled[sid] < 5 * 60 * 1000)) return;
    pulled[sid] = Date.now();
    Api.mine(sid).then(function (d) {
      if (!d || !d.ok) return;
      var added = Log.merge(sid, (d.events || []).map(evUnpack));
      store.set('be-asg:' + sid, d.assignments || []);
      if (after && (added || (d.assignments || []).length)) after();
    }).catch(function () { });
  }
  function openAssignments(sid) {
    var doneIds = {};
    Log.all(sid).forEach(function (e) { if (e.act === 'assigndone') doneIds[e.resp] = 1; });
    return store.get('be-asg:' + sid, []).filter(function (a) { return a.status === 'open' && !doneIds[a.aid]; });
  }
  function hello() { var h = new Date().getHours(); return h < 12 ? 'Good morning!' : h < 17 ? 'Good afternoon!' : 'Good evening!'; }

  function home(host) {
    var sid = Me.sid(), ev = Log.all(sid), m = Progress.map(sid), n = Progress.completedCount(sid), cur = Progress.currentDay(sid);
    var L = cur ? lessonById(cur) : null, due = CONFIG.ENABLE_REVIEW !== false ? Review.quick(ev) : [], asg = openAssignments(sid);
    var tricky = Review.tricky(ev).filter(function (b) { return b.state !== 'mastered'; }).length;
    var baselineDone = ev.some(function (e) { return e.step === 'baseline' && e.act === 'done'; });
    var html = '<section class="home-head view-in"><div><p class="eyebrow">' + esc(Me.label(sid)) + '</p><h1>' + hello() + '</h1></div>' +
      '<div class="home-prog"><b>' + n + '</b><span>/ ' + LESSONS.length + ' Days completed</span><span class="bar"><i style="width:' + (n / LESSONS.length * 100) + '%"></i></span>' +
      '<a class="btn small" href="#s/journey">🗺️ My Journey</a></div></section><div class="home-grid">';
    /* 오늘 할 것 */
    if (L) {
      var sd = Progress.stepsDone(m, L.id), total = stepsRequired().length;
      html += '<section class="card today card-in" ' + lstyle(L) + '><p class="eyebrow">Today’s Learning</p>' +
        '<div class="today-body"><span class="today-emo blob" aria-hidden="true">' + L.icon + '</span><div><h2>Day ' + L.id + ' — ' + esc(L.theme) + ' <small>' + esc(L.ko) + '</small></h2>' +
        '<p class="muted">' + esc(L.goal) + '</p><div class="step-dots" aria-label="' + total + '단계 중 ' + sd + '단계">' + stepsRequired().map(function (s) { return '<i class="' + ((m[L.id] || {})[s.k] ? 'on' : '') + '" title="' + s.en + '"></i>'; }).join('') + '<span>' + sd + ' / ' + total + '</span></div></div></div>' +
        '<a class="btn primary big" href="#s/d/' + L.id + '">' + (sd ? '이어서 하기 →' : '▶ Start Learning') + '</a></section>';
    } else {
      html += '<section class="card today card-in"><p class="eyebrow">Today’s Learning</p><h2>🏆 20 Days 모두 끝냈어요!</h2><p class="muted">My Journey 에서 좋아하는 Day 를 다시 해 보거나, 복습을 해요.</p><a class="btn secondary" href="#s/journey">My Journey</a></section>';
    }
    html += '<div class="home-side">';
    /* 선생님이 보낸 복습 */
    asg.slice(0, 2).forEach(function (a) {
      var t = asgTitle(a);
      html += '<section class="card side-card teacher card-in"><p class="eyebrow">📮 Teacher Review</p><h3>선생님이 짧은 연습을 보냈어요</h3><p class="muted">' + esc(t) + '</p><a class="btn secondary" href="#s/assign/' + encodeURIComponent(a.aid) + '">Start</a></section>';
    });
    /* Quick Review */
    if (CONFIG.ENABLE_REVIEW !== false) {
      html += '<section class="card side-card review card-in"><p class="eyebrow">🔁 Quick Review</p>' +
        (due.length ? '<h3>' + due.length + ' things to practice again</h3><p class="chips-line">' + due.slice(0, 4).map(function (b) { var it = itemInfo(b.item); return '<span class="pill">' + esc(it.type === 'drill' ? it.frame.replace('{w}', '___') : it.en) + '</span>'; }).join('') + '</p><a class="btn primary" href="#s/review">Start</a>'
          : '<h3>지금은 복습할 게 없어요 ✓</h3><p class="muted">틀렸던 것은 여기에 다시 나와요.</p>') + '</section>';
    }
    /* 처음 진단 */
    if (CONFIG.ENABLE_BASELINE !== false && !baselineDone && !store.get('be-bl-later:' + sid, false)) {
      html += '<section class="card side-card baseline card-in"><p class="eyebrow">🧭 Baseline</p><h3>처음 진단 (5분)</h3><p class="muted">지금 영어 실력을 알아봐요. 점수로 막지 않아요.</p><div class="row"><a class="btn secondary" href="#s/baseline">시작</a><button class="btn small ghost" id="blLater">나중에</button></div></section>';
    }
    html += '</div></div>' +
      '<nav class="home-links" aria-label="더 보기"><a class="link-card" href="#s/tricky"><span class="emo">🧩</span><b>My Tricky Words</b><small>' + (tricky ? tricky + '개 연습 중' : '아직 없어요') + '</small></a>' +
      '<a class="link-card" href="#s/growth"><span class="emo">🌱</span><b>My Growth</b><small>나의 성장</small></a>' +
      '<a class="link-card" href="#s/help"><span class="emo">⚙️</span><b>Settings / Help</b><small>소리 · 번호 바꾸기</small></a></nav>';
    host.innerHTML = html;
    var bl = $('#blLater'); if (bl) bl.onclick = function () { store.set('be-bl-later:' + sid, true); App.render(); };
    pull(sid, function () { if (/^#s\/?$/.test(location.hash)) App.render(); });
  }
  function asgTitle(a) { var it = {}; try { it = JSON.parse(a.items || '{}'); } catch (e) { } return (it.title || '복습') + (a.note ? ' · ' + a.note : ''); }

  function journey(host) {
    var sid = Me.sid(), m = Progress.map(sid), cur = Progress.currentDay(sid), n = Progress.completedCount(sid);
    var total = stepsRequired().length;
    host.innerHTML = '<nav class="crumbs"><a class="btn small" href="#s">← Home</a><span class="crumb-t">My Journey</span><span class="muted">' + n + ' / ' + LESSONS.length + ' completed</span></nav>' +
      '<ol class="journey view-in"><li class="j-start" aria-hidden="true">START</li>' + LESSONS.map(function (L) {
        var stt = Progress.status(m, L.id, cur), sd = Progress.stepsDone(m, L.id);
        var badge = stt === 'completed' ? '<span class="pill ok">✓ 완료</span>' : stt === 'current' ? '<span class="pill now">NOW</span>' : sd ? '<span class="pill">' + sd + '/' + total + '</span>' : '';
        return '<li class="j-node ' + stt + '" ' + lstyle(L) + '><a href="#s/d/' + L.id + '" aria-label="Day ' + L.id + ' ' + esc(L.theme) + ', ' + ({ completed: '완료', current: '지금 할 차례', available: '열려 있음' })[stt] + '">' +
          '<span class="j-num">' + pad2(L.id) + '</span><span class="j-emo" aria-hidden="true">' + L.icon + '</span><span class="j-t">' + esc(L.theme) + '<small>' + esc(L.ko) + '</small></span>' + badge + '</a></li>';
      }).join('') + '</ol>';
  }

  function help(host) {
    var st = Api.status();
    host.innerHTML = '<nav class="crumbs"><a class="btn small" href="#s">← Home</a><span class="crumb-t">Settings / Help</span></nav>' +
      '<section class="card view-in"><h2>소리</h2><div class="row" style="margin-top:10px"><button class="btn" id="hSound" aria-pressed="' + Sound.on + '">' + (Sound.on ? '🔊 소리 켬' : '🔇 소리 끔') + '</button>' +
      '<button class="btn" id="hSlow" aria-pressed="' + store.get('fe-slow', false) + '">🐢 천천히 읽기</button><button class="btn" id="hTest">🔈 소리 시험</button></div></section>' +
      '<section class="card"><h2>마이크 시험</h2><p class="muted">"hello" 라고 말해 봐요. 안 되면 말하기 활동에서 "말했어요" 단추로 넘어가면 돼요.</p><div class="row" style="margin-top:10px"><button class="btn secondary" id="hMic">🎤 시험해 보기</button><span id="hMicMsg" class="muted"></span></div></section>' +
      '<section class="card"><h2>저장</h2><p>' + (st.pending ? '아직 보내지 않은 기록 ' + st.pending + '개 · 이 기기에 안전하게 저장돼 있어요.' : '모든 기록을 보냈어요 ✓') + '</p><div class="row" style="margin-top:10px"><button class="btn small" id="hSync">지금 보내기</button></div></section>' +
      '<section class="card"><h2>번호</h2><p>' + esc(Me.label(Me.sid())) + '</p><div class="row" style="margin-top:10px"><button class="btn small danger" id="hOut">번호 바꾸기</button></div><p class="muted" style="margin-top:10px">' + esc(CONFIG.APP_NAME) + ' v' + CONFIG.VERSION + '</p></section>';
    $('#hSound').onclick = function () { Sound.toggle(); help(host); };
    $('#hSlow').onclick = function () { store.set('fe-slow', !store.get('fe-slow', false)); help(host); };
    $('#hTest').onclick = function () { Voice.say('Hello! Nice to meet you.'); };
    $('#hMic').onclick = function () {
      var m = $('#hMicMsg'); m.textContent = '듣고 있어요… "hello"';
      Listen.listen('hello').then(function (r) { m.textContent = r.ok ? '✓ 잘 들려요! (' + r.heard + ')' : (r.msg || ('들린 말: ' + (r.heard || '없음'))); });
    };
    $('#hSync').onclick = function () { Api.flush().then(function () { toast(Api.status().pending ? '인터넷이 연결되면 다시 보낼게요' : '보냈어요'); help(host); }); };
    $('#hOut').onclick = function () { Api.flush(); Me.out(); location.hash = '#s/login'; };
  }
  return { home: home, journey: journey, help: help, pull: pull, openAssignments: openAssignments, asgTitle: asgTitle };
})();
