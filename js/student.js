/* 학생 화면: 이름 → 회차 고르기 → ① 낱말 ② 문장 ③ 바꿔 말하기 ④ 정리 게임 */
var Student = (function () {
  function me() { return store.get('fe-name', ''); }

  function nameView(view) {
    var used = store.get('fe-names', []);
    view.innerHTML =
      '<section class="panel name-panel">' +
      '<div class="result-emo" aria-hidden="true">' + ART.burst('#FFF2CC') + '<span>👋</span></div>' +
      '<h1>이름을 써 주세요</h1><p class="muted">이름만 쓰면 돼요. 공부한 기록은 선생님께 저장돼요.</p>' +
      '<form id="nameForm" class="name-form"><label class="sr" for="nm">이름</label>' +
      '<input id="nm" maxlength="12" autocomplete="off" placeholder="예: 김하늘" value="' + esc(me()) + '">' +
      '<button class="btn primary big">시작하기</button></form>' +
      (used.length ? '<div class="used"><span class="muted">이 기기에서 쓴 이름</span>' + used.map(function (n) { return '<button class="chip" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' : '') +
      '</section>';
    function go(n) {
      n = n.replace(/\s+/g, ' ').trim().slice(0, 12);
      if (!n) { toast('이름을 써 주세요'); $('#nm').focus(); return; }
      store.set('fe-name', n);
      var u = store.get('fe-names', []).filter(function (x) { return x !== n; }); u.unshift(n); store.set('fe-names', u.slice(0, 40));
      if (Sync.url()) Sync.get({ action: 'mine', name: n }).then(function (d) { if (d && d.rows) { Progress.merge(n, d.rows); if (location.hash === '#s') App.render(); } }).catch(function () { });
      location.hash = '#s';
    }
    $('#nameForm').onsubmit = function (e) { e.preventDefault(); go($('#nm').value); };
    $$('.chip[data-n]', view).forEach(function (b) { b.onclick = function () { go(b.dataset.n); }; });
    setTimeout(function () { var i = $('#nm'); if (i) i.focus(); }, 50);
  }

  function counts(l, L) {
    return { ws: l.w.s.length, wt: l.w.t.length, ss: l.s.s.length, st: l.s.t.length, ds: l.d.s.length, dt: l.d.t.length, wn: L.words.length, sn: L.sentences.length, dn: drillItems(L).length };
  }

  function homeView(view) {
    var n = me();
    view.innerHTML =
      '<section class="hello"><div><p class="eyebrow">오늘도 영어 한 걸음</p><h1>안녕, ' + esc(n) + '!</h1></div>' +
      '<button class="btn small" id="chg">이름 바꾸기</button></section>' +
      '<div class="days">' + LESSONS.map(function (L) {
        var l = Progress.lesson(n, L.id), c = counts(l, L);
        var done = c.ws + c.wt + c.ss + c.st + c.ds + c.dt === 2 * (c.wn + c.sn + c.dn) && l.g.plays > 0;
        return '<a class="day' + (done ? ' done' : '') + '" href="#s/' + L.id + '" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
          '<span class="day-ill"><b>Day ' + L.id + '</b><span class="day-emo">' + L.icon + '</span></span>' +
          '<span class="day-body"><span class="day-t">' + L.theme + ' <small>' + L.ko + '</small></span>' +
          '<span class="day-steps">' +
          '<span class="pill' + (c.ws + c.wt === 2 * c.wn ? ' ok' : '') + '">낱말 ' + Math.min(c.ws, c.wt) + '/' + c.wn + '</span>' +
          '<span class="pill' + (c.ss + c.st === 2 * c.sn ? ' ok' : '') + '">문장 ' + Math.min(c.ss, c.st) + '/' + c.sn + '</span>' +
          '<span class="pill' + (c.ds + c.dt === 2 * c.dn ? ' ok' : '') + '">바꿔 ' + Math.min(c.ds, c.dt) + '/' + c.dn + '</span>' +
          '<span class="pill' + (l.g.plays ? ' ok' : '') + '">게임 ' + (l.g.plays ? stars(l.g.stars) : '–') + '</span></span></span>' +
          (done ? '<span class="badge-done" aria-label="완료">' + ART.burst(L.color) + '<span>✓</span></span>' : '') + '</a>';
      }).join('') + '</div>';
    $('#chg').onclick = function () { location.hash = '#s/name'; };
  }

  function lessonView(view, L) {
    var n = me(), l = Progress.lesson(n, L.id), c = counts(l, L), G = GAMES[L.game];
    view.innerHTML =
      '<nav class="crumbs"><a class="btn small" href="#s">← 회차 목록</a></nav>' +
      '<section class="lesson-head" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"><span class="lh-emo" aria-hidden="true">' + L.icon + '</span>' +
      ART.bits([['leaf', 20, 30, -20, 1.4, '#F2A33A'], ['shroom', 70, 70, 8, 1.3], ['berry', 88, 30, 18, 1.2], ['sprig', 45, 78, -10, 1.2]]) + '<div><p class="eyebrow">Day ' + L.id + '</p><h1>' + L.theme + ' <span class="ko">' + L.ko + '</span></h1><p>' + L.goal + '</p></div></section>' +
      '<div class="steps" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
      step(1, '낱말 익히기', '듣고 · 따라 말하고 · 따라 써요', '#s/' + L.id + '/w', [['말하기', c.ws, c.wn], ['쓰기', c.wt, c.wn]], L.words.slice(0, 4).map(function (w) { return w.pic.p ? '🙂' : w.pic; }).join('')) +
      step(2, '문장 익히기', '문장 4개를 듣고 말하고 써요', '#s/' + L.id + '/s', [['말하기', c.ss, c.sn], ['쓰기', c.st, c.sn]], '💬') +
      step(3, '바꿔 말하기', '“' + L.drill.en.replace('{w}', '___') + '” 빈칸에 낱말을 바꿔 넣어 말해요', '#s/' + L.id + '/d', [['고르기', c.dt, c.dn], ['말하기', c.ds, c.dn]], '🔁') +
      step(4, G.name, G.how, '#s/' + L.id + '/g', null, G.icon, l.g) +
      '</div>';
  }
  function step(no, t, sub, href, bars, ill, g) {
    return '<a class="step" href="' + href + '"><span class="step-no">' + no + '</span><span class="step-ill" aria-hidden="true">' + ill + '</span>' +
      '<span class="step-body"><b>' + t + '</b><small>' + sub + '</small>' +
      (bars ? '<span class="bars">' + bars.map(function (b) { return '<span class="bar"><i style="width:' + (b[1] / b[2] * 100) + '%"></i></span><em>' + b[0] + ' ' + b[1] + '/' + b[2] + '</em>'; }).join('') + '</span>'
        : '<span class="bars">' + (g.plays ? '최고 ' + g.best + '점 ' + stars(g.stars) : '<em>아직 안 했어요</em>') + '</span>') +
      '</span></a>';
  }

  /* ---- ①② 낱말·문장 연습 ---- */
  function practice(view, L, kind) {
    var n = me(), items = kind === 'w' ? L.words : L.sentences, prog = Progress.lesson(n, L.id), P = prog[kind];
    var idx = 0, pad = null, dirty = false, tries = 0;
    for (var i = 0; i < items.length; i++) if (P.s.indexOf(i) < 0 || P.t.indexOf(i) < 0) { idx = i; break; }

    function mark(k) { if (P[k].indexOf(idx) < 0) { P[k].push(idx); dirty = true; Progress.save(n, L.id, prog); } }
    function report() {
      if (!dirty) return; dirty = false;
      var tot = items.length, sc = Math.round((P.s.length + P.t.length) / (2 * tot) * 100);
      Sync.send({ name: n, lesson: L.id, theme: L.ko, part: kind === 'w' ? 'words' : 'sentences', said: P.s.length, wrote: P.t.length, total: tot, score: sc, stars: sc >= 100 ? 3 : sc >= 70 ? 2 : sc >= 40 ? 1 : 0, items: JSON.stringify({ s: P.s, t: P.t }) });
    }
    Cleanup.add(report);

    var touch = (navigator.maxTouchPoints || 0) > 0;
    function render() {
      var it = items[idx], words = kind === 's' ? wordsOf(it.en) : null, wmode = store.get('fe-wmode', touch ? 'hand' : 'key');
      var said = P.s.indexOf(idx) >= 0, wrote = P.t.indexOf(idx) >= 0;
      view.innerHTML =
        '<nav class="crumbs"><a class="btn small" href="#s/' + L.id + '">← Day ' + L.id + '</a><span class="crumb-t">' + (kind === 'w' ? '① 낱말 익히기' : '② 문장 익히기') + '</span>' +
        '<span class="dots">' + items.map(function (x, i) {
          var st = (P.s.indexOf(i) >= 0) + (P.t.indexOf(i) >= 0);
          return '<button class="dot s' + st + (i === idx ? ' cur' : '') + '" data-i="' + i + '" aria-label="' + (i + 1) + '번째' + (st === 2 ? ' 완료' : '') + '">' + (i + 1) + '</button>';
        }).join('') + '</span>' +
        '<span class="crumb-nav"><button class="btn small" id="prev"' + (idx === 0 ? ' disabled' : '') + ' aria-label="앞">←</button>' +
        '<button class="btn small primary" id="next">' + (idx === items.length - 1 ? '끝내기' : '다음 →') + '</button></span></nav>' +
        '<section class="card practice ' + kind + '" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
        '<div class="see">' + ART.pic(it.pic, 'big') +
        '<div class="say-it"><p class="en' + (kind === 's' ? ' sent' : '') + '">' + (words ? it.en.split(' ').map(function (w, i) { return '<span data-w="' + i + '">' + esc(w) + '</span>'; }).join(' ') : esc(it.en)) + '</p>' +
        '<p class="ko">' + esc(it.ko) + '</p>' +
        '<div class="row"><button class="btn primary" id="hear">🔊 듣기</button><button class="btn' + (store.get('fe-slow', false) ? ' on' : '') + '" id="slow" aria-pressed="' + store.get('fe-slow', false) + '">🐢 천천히</button></div></div></div>' +
        '<div class="tasks">' +
        '<div class="task' + (said ? ' done' : '') + '" id="tSay"><h2><span class="tn">🎤</span> 따라 말하기 ' + (said ? '<span class="ok-tag">✓ 했어요</span>' : '') + '</h2>' +
        '<div class="row">' + (Listen.supported() ? '<button class="btn mic" id="mic">🎤 말하기</button>' : '') + '<button class="btn" id="selfSay"' + (Listen.supported() ? ' hidden' : '') + '>✋ 따라 말했어요</button>' +
        '<p class="muted" id="sayMsg">' + (Listen.supported() ? '듣기를 누르고, 말하기를 눌러 크게 따라 말해요.' : '듣기를 누르고 크게 따라 말한 다음 단추를 눌러요.') + '</p></div></div>' +
        '<div class="task' + (wrote ? ' done' : '') + '" id="tWrite"><div class="task-h"><h2><span class="tn">✏️</span> 따라쓰기 ' + (wrote ? '<span class="ok-tag">✓ 했어요</span>' : '') + '</h2>' +
        '<span class="seg" role="group" aria-label="쓰는 방법"><button class="' + (wmode === 'hand' ? 'on' : '') + '" data-m="hand" aria-pressed="' + (wmode === 'hand') + '">✋ 손으로</button><button class="' + (wmode === 'key' ? 'on' : '') + '" data-m="key" aria-pressed="' + (wmode === 'key') + '">⌨️ 키보드로</button></span></div>' +
        (wmode === 'hand'
          ? '<div id="pad"></div><div class="row"><button class="btn" id="erase">지우기</button><button class="btn primary" id="check">다 썼어요</button><span id="wMsg" class="muted"></span></div>'
          : '<div class="typeit"><p class="ghost" id="ghost" aria-hidden="true">' + it.en.split('').map(function (c) { return '<span>' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('') + '</p>' +
            '<label class="sr" for="typ">' + esc(it.en) + ' 쳐 보기</label><input id="typ" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="여기에 똑같이 쳐요"></div>' +
            '<div class="row"><button class="btn primary" id="check">다 썼어요</button><span id="wMsg" class="muted">대문자, 소문자는 상관없어요.</span></div>') +
        '</div></div></section>';

      if (pad) { pad.destroy(); pad = null; }
      if (wmode === 'hand') pad = new TracePad($('#pad'), it.en, { max: Math.min(kind === 'w' ? 120 : 96, Math.round(innerHeight * (kind === 'w' ? .16 : .13))), min: kind === 's' ? Math.min(70, Math.round(innerHeight * .082)) : 0, color: '#2B4789' });
      var hear = function () {
        var spans = $$('.en span[data-w]', view);
        Voice.say(it.en, {
          onboundary: function (e) { if (e.name !== 'word' && e.name) return; var k = it.en.slice(0, e.charIndex).split(' ').length - 1; spans.forEach(function (s, i) { s.classList.toggle('lit', i === k); }); },
          onend: function () { spans.forEach(function (s) { s.classList.remove('lit'); }); }
        });
      };
      $('#hear').onclick = hear;
      $('#slow').onclick = function () { var v = !store.get('fe-slow', false); store.set('fe-slow', v); this.classList.toggle('on', v); this.setAttribute('aria-pressed', v); hear(); };
      var mic = $('#mic');
      if (mic) mic.onclick = function () {
        Voice.stop(); mic.disabled = true; mic.classList.add('listening'); mic.textContent = '듣고 있어요…'; $('#sayMsg').textContent = '지금 말해요!';
        Listen.listen(it.en).then(function (r) {
          mic.disabled = false; mic.classList.remove('listening'); mic.textContent = '🎤 다시 말하기';
          if (!r.supported) { $('#sayMsg').textContent = '마이크를 쓸 수 없어요. 크게 따라 말하고 단추를 눌러요.'; mic.hidden = true; $('#selfSay').hidden = false; return; }
          if (r.ok) { Sound.good(); tries = 0; $('#sayMsg').innerHTML = '👏 <b>잘했어요!</b> 들린 말: “' + esc(r.heard) + '”'; mark('s'); $('#tSay').classList.add('done'); refreshDots(); }
          else {
            Sound.bad(); tries++;
            $('#sayMsg').innerHTML = (r.heard ? '들린 말: “' + esc(r.heard) + '”. ' : '잘 안 들렸어요. ') + '한 번 더 크게 말해 볼까요?';
            if (tries >= 2) $('#selfSay').hidden = false;
          }
        });
      };
      $('#selfSay').onclick = function () { Sound.good(); mark('s'); $('#tSay').classList.add('done'); $('#sayMsg').textContent = '👏 잘했어요!'; refreshDots(); };
      function wroteOk(msg) { Sound.good(); $('#wMsg').innerHTML = msg; mark('t'); $('#tWrite').classList.add('done'); refreshDots(); }
      if (wmode === 'hand') {
        $('#erase').onclick = function () { pad.clear(); $('#wMsg').textContent = ''; };
        $('#check').onclick = function () {
          var r = pad.check();
          if (r.empty) { $('#wMsg').textContent = '점선 글자를 따라 써요.'; return; }
          if (r.ok) wroteOk(stars(r.score >= 85 ? 3 : r.score >= 68 ? 2 : 1) + ' 잘 썼어요!');
          else { Sound.bad(); $('#wMsg').textContent = r.near < .5 ? '선 밖으로 많이 나갔어요. 지우고 다시 써요.' : '점선을 조금 더 따라 써요.'; }
        };
      } else {
        var typ = $('#typ'), gs = $$('#ghost span', view), done1 = false;
        var simp = function (t) { return t.toLowerCase().replace(/’/g, "'").replace(/[^a-z' ]/g, '').replace(/\s+/g, ' ').trim(); };
        var good1 = function () { if (done1) return; done1 = true; wroteOk('👏 잘 썼어요!'); Voice.say(it.en); };
        typ.oninput = function () {
          var v = typ.value;
          gs.forEach(function (g, i) { g.className = i >= v.length ? '' : v[i].toLowerCase() === it.en[i].toLowerCase() ? 'ok' : 'no'; });
          if (simp(v) === simp(it.en)) good1();
        };
        typ.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#check').click(); } };
        $('#check').onclick = function () {
          if (simp(typ.value) === simp(it.en)) return good1();
          Sound.bad(); $('#wMsg').textContent = typ.value ? '빨간 글자를 고쳐 봐요.' : '위 글자를 보고 똑같이 쳐요.'; typ.focus();
        };
      }
      $$('.seg button', view).forEach(function (b) { b.onclick = function () { store.set('fe-wmode', b.dataset.m); Voice.stop(); render(); }; });
      $('#prev').onclick = function () { if (idx > 0) { idx--; tries = 0; render(); } };
      $('#next').onclick = function () { if (idx < items.length - 1) { idx++; tries = 0; render(); } else finish(); };
      $$('.dot', view).forEach(function (d) { d.onclick = function () { idx = +d.dataset.i; tries = 0; render(); }; });
      setTimeout(hear, 350);
    }
    function onKey(e) {
      if ((e.target.closest && e.target.closest('input,textarea')) || !$('#next')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); $('#next').click(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); $('#prev').click(); }
    }
    document.addEventListener('keydown', onKey);
    Cleanup.add(function () { document.removeEventListener('keydown', onKey); });
    function refreshDots() {
      $$('.dot', view).forEach(function (d) { var i = +d.dataset.i, st = (P.s.indexOf(i) >= 0) + (P.t.indexOf(i) >= 0); d.className = 'dot s' + st + (i === idx ? ' cur' : ''); });
    }
    function finish() {
      report();
      var tot = items.length, all = P.s.length === tot && P.t.length === tot;
      if (all) { Sound.win(); confetti(); }
      view.innerHTML = '<section class="panel result" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
        '<div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + (all ? '🏆' : '💪') + '</span></div><h1>' + (all ? '모두 해냈어요!' : '거의 다 왔어요!') + '</h1>' +
        '<p class="big-n">말하기 <b>' + P.s.length + '</b>/' + tot + ' · 쓰기 <b>' + P.t.length + '</b>/' + tot + '</p>' +
        (all ? '' : '<p class="muted">빈 칸이 있는 번호를 눌러 마저 해요.</p>') +
        '<div class="row center">' + (all ? '' : '<button class="btn" id="again">마저 하기</button>') +
        '<a class="btn primary" href="#s/' + L.id + '/' + (kind === 'w' ? 's' : 'd') + '">' + (kind === 'w' ? '② 문장 익히기 →' : '③ 바꿔 말하기 →') + '</a></div></section>';
      var a = $('#again'); if (a) a.onclick = function () { for (var i = 0; i < items.length; i++) if (P.s.indexOf(i) < 0 || P.t.indexOf(i) < 0) { idx = i; break; } render(); };
    }
    Cleanup.add(function () { if (pad) pad.destroy(); });
    render();
  }

  /* ---- ③ 바꿔 말하기: 문장 틀의 빈칸에 낱말을 바꿔 넣고 말해요 ---- */
  function drill(view, L) {
    var n = me(), items = drillItems(L), prog = Progress.lesson(n, L.id), P = prog.d, idx = 0, dirty = false, tries = 0;
    var parts = L.drill.en.split('{w}');
    for (var i = 0; i < items.length; i++) if (P.s.indexOf(i) < 0 || P.t.indexOf(i) < 0) { idx = i; break; }
    function mark(k) { if (P[k].indexOf(idx) < 0) { P[k].push(idx); dirty = true; Progress.save(n, L.id, prog); } }
    function report() {
      if (!dirty) return; dirty = false;
      var tot = items.length, sc = Math.round((P.s.length + P.t.length) / (2 * tot) * 100);
      Sync.send({ name: n, lesson: L.id, theme: L.ko, part: 'drill', said: P.s.length, wrote: P.t.length, total: tot, score: sc, stars: sc >= 100 ? 3 : sc >= 70 ? 2 : sc >= 40 ? 1 : 0, items: JSON.stringify({ s: P.s, t: P.t }) });
    }
    Cleanup.add(report);
    function render() {
      var it = items[idx], filled = P.t.indexOf(idx) >= 0, said = P.s.indexOf(idx) >= 0;
      var opts = shuffle([it].concat(shuffle(items.filter(function (x) { return x !== it; })).slice(0, 3)));
      view.innerHTML =
        '<nav class="crumbs"><a class="btn small" href="#s/' + L.id + '">← Day ' + L.id + '</a><span class="crumb-t">③ 바꿔 말하기</span>' +
        '<span class="dots">' + items.map(function (x, i) {
          var st = (P.s.indexOf(i) >= 0) + (P.t.indexOf(i) >= 0);
          return '<button class="dot s' + st + (i === idx ? ' cur' : '') + '" data-i="' + i + '" aria-label="' + (i + 1) + '번째' + (st === 2 ? ' 완료' : '') + '">' + (i + 1) + '</button>';
        }).join('') + '</span>' +
        '<span class="crumb-nav"><button class="btn small" id="prev"' + (idx === 0 ? ' disabled' : '') + ' aria-label="앞">←</button>' +
        '<button class="btn small primary" id="next">' + (idx === items.length - 1 ? '끝내기' : '다음 →') + '</button></span></nav>' +
        '<section class="card practice drill" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
        '<div class="see">' + ART.pic(it.pic, 'big') + '<p class="frame-tag">문장 틀</p><p class="frame-pat">' + esc(parts[0]) + '<span class="blank">　　</span>' + esc(parts[1] || '') + '</p></div>' +
        '<div class="tasks">' +
        '<div class="task' + (filled ? ' done' : '') + '" id="tFill"><h2><span class="tn">🧩</span> 빈칸에 알맞은 낱말 ' + (filled ? '<span class="ok-tag">✓ 했어요</span>' : '') + '</h2>' +
        '<p class="en sent drill-sent" id="dSent">' + esc(parts[0]) + '<span class="slot' + (filled ? ' on' : '') + '" id="slot">' + (filled ? esc(it.slot) : '?') + '</span>' + esc(parts[1] || '') + '</p>' +
        '<p class="ko" id="dKo"' + (filled ? '' : ' hidden') + '>' + esc(it.ko) + '</p>' +
        '<div class="row" id="opts">' + opts.map(function (o) { return '<button class="tile opt" data-ok="' + (o === it ? 1 : 0) + '">' + esc(o.slot) + '</button>'; }).join('') + '</div>' +
        '<div class="row"><button class="btn" id="hear">🔊 문장 듣기</button><span class="muted" id="fMsg">그림을 보고 빈칸에 들어갈 낱말을 골라요.</span></div></div>' +
        '<div class="task' + (said ? ' done' : '') + '" id="tSay"><h2><span class="tn">🎤</span> 바꿔서 말하기 ' + (said ? '<span class="ok-tag">✓ 했어요</span>' : '') + '</h2>' +
        '<div class="row">' + (Listen.supported() ? '<button class="btn mic" id="mic">🎤 말하기</button>' : '') + '<button class="btn" id="selfSay"' + (Listen.supported() ? ' hidden' : '') + '>✋ 말했어요</button>' +
        '<p class="muted" id="sayMsg">낱말을 고른 다음, 완성된 문장을 크게 말해요.</p></div></div>' +
        '</div></section>';
      var hear = function () { Voice.say(it.en); };
      $('#hear').onclick = hear;
      $$('.opt', view).forEach(function (b) {
        if (filled) b.disabled = b.dataset.ok !== '1';
        b.onclick = function () {
          if (b.dataset.ok === '1') {
            Sound.good(); mark('t'); refreshDots();
            var s = $('#slot'); s.textContent = it.slot; s.classList.add('on');
            $('#dKo').hidden = false; $('#tFill').classList.add('done'); $('#fMsg').textContent = '👏 맞았어요! 이제 문장을 말해요.';
            $$('.opt', view).forEach(function (x) { x.disabled = x !== b; }); b.classList.add('on');
            hear();
          } else { Sound.bad(); b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 400); b.disabled = true; }
        };
      });
      var mic = $('#mic');
      if (mic) mic.onclick = function () {
        Voice.stop(); mic.disabled = true; mic.classList.add('listening'); mic.textContent = '듣고 있어요…'; $('#sayMsg').textContent = '지금 말해요!';
        Listen.listen(it.en).then(function (r) {
          mic.disabled = false; mic.classList.remove('listening'); mic.textContent = '🎤 다시 말하기';
          if (!r.supported) { $('#sayMsg').textContent = '마이크를 쓸 수 없어요. 크게 말하고 단추를 눌러요.'; mic.hidden = true; $('#selfSay').hidden = false; return; }
          if (r.ok) { Sound.good(); tries = 0; $('#sayMsg').innerHTML = '👏 <b>잘했어요!</b> 들린 말: “' + esc(r.heard) + '”'; mark('s'); $('#tSay').classList.add('done'); refreshDots(); }
          else { Sound.bad(); tries++; $('#sayMsg').innerHTML = (r.heard ? '들린 말: “' + esc(r.heard) + '”. ' : '잘 안 들렸어요. ') + '한 번 더 크게 말해 볼까요?'; if (tries >= 2) $('#selfSay').hidden = false; }
        });
      };
      $('#selfSay').onclick = function () { Sound.good(); mark('s'); $('#tSay').classList.add('done'); $('#sayMsg').textContent = '👏 잘했어요!'; refreshDots(); };
      $('#prev').onclick = function () { if (idx > 0) { idx--; tries = 0; render(); } };
      $('#next').onclick = function () { if (idx < items.length - 1) { idx++; tries = 0; render(); } else finish(); };
      $$('.dot', view).forEach(function (d) { d.onclick = function () { idx = +d.dataset.i; tries = 0; render(); }; });
      if (filled) setTimeout(hear, 350);
    }
    function refreshDots() { $$('.dot', view).forEach(function (d) { var i = +d.dataset.i, st = (P.s.indexOf(i) >= 0) + (P.t.indexOf(i) >= 0); d.className = 'dot s' + st + (i === idx ? ' cur' : ''); }); }
    function finish() {
      report();
      var tot = items.length, all = P.s.length === tot && P.t.length === tot;
      if (all) { Sound.win(); confetti(); }
      view.innerHTML = '<section class="panel result" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
        '<div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + (all ? '🏆' : '💪') + '</span></div><h1>' + (all ? '바꿔 말하기 끝!' : '거의 다 왔어요!') + '</h1>' +
        '<p class="big-n">고르기 <b>' + P.t.length + '</b>/' + tot + ' · 말하기 <b>' + P.s.length + '</b>/' + tot + '</p>' +
        (all ? '' : '<p class="muted">빈 칸이 있는 번호를 눌러 마저 해요.</p>') +
        '<div class="row center">' + (all ? '' : '<button class="btn" id="again">마저 하기</button>') + '<a class="btn primary" href="#s/' + L.id + '/g">④ 정리 게임 →</a></div></section>';
      var a = $('#again'); if (a) a.onclick = function () { for (var i = 0; i < items.length; i++) if (P.s.indexOf(i) < 0 || P.t.indexOf(i) < 0) { idx = i; break; } render(); };
    }
    function onKey(e) {
      if ((e.target.closest && e.target.closest('input,textarea')) || !$('#next')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); $('#next').click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); $('#prev').click(); }
    }
    document.addEventListener('keydown', onKey);
    Cleanup.add(function () { document.removeEventListener('keydown', onKey); });
    render();
  }

  /* ---- ④ 정리 게임 ---- */
  function gameView(view, L) {
    var n = me(), G = GAMES[L.game];
    view.innerHTML = '<nav class="crumbs"><a class="btn small" href="#s/' + L.id + '">← Day ' + L.id + '</a><span class="crumb-t">④ ' + G.name + '</span></nav><div id="game"></div>';
    Games.start($('#game'), L, function (res) {
      var prog = Progress.lesson(n, L.id);
      prog.g.best = Math.max(prog.g.best, res.score); prog.g.stars = Math.max(prog.g.stars, res.stars); prog.g.plays++;
      Progress.save(n, L.id, prog);
      Sync.send({ name: n, lesson: L.id, theme: L.ko, part: 'game', said: '', wrote: '', total: res.total || '', score: res.score, stars: res.stars, items: G.name });
    });
  }

  function route(view, parts) {
    if (parts[0] === 'name' || !me()) return nameView(view);
    var L = parts[0] && lessonById(parts[0]);
    if (!L) return homeView(view);
    if (parts[1] === 'w' || parts[1] === 's') return practice(view, L, parts[1]);
    if (parts[1] === 'd') return drill(view, L);
    if (parts[1] === 'g') return gameView(view, L);
    lessonView(view, L);
  }
  return { route: route, me: me };
})();
