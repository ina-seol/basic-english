/* 한 Day 의 6단계: 1 SEE & HEAR · 2 SAY · 3 WRITE · 4 USE · 5 RETRIEVE · 6 REFLECT
   모든 Day 가 같은 순서예요. 단계는 언제든 다시 할 수 있고, 처음 끝낼 때 'done' 기록이 남아요. */
var StudentDay = (function () {
  var DESC = {
    see: '그림을 보고 소리를 들어요 → 듣고 그림 고르기', say: '낱말과 문장을 따라 말해요', write: '낱말마다 따라 쓰기 1번, 그냥 쓰기 1번',
    use: '문장 틀의 빈칸에 낱말을 바꿔 넣어 말해요', retrieve: '게임으로 기억을 꺼내요', reflect: '오늘 공부를 10초 동안 돌아봐요'
  };
  function stepOf(k) { return STEPS.filter(function (s) { return s.k === k; })[0]; }
  function nextStep(k) { var l = stepsRequired(), i = l.map(function (s) { return s.k; }).indexOf(k); return l[i + 1] || null; }
  function crumbs(L, k, extra) {
    var s = stepOf(k);
    return '<nav class="crumbs"><a class="btn small" href="#s/d/' + L.id + '">← Day ' + L.id + '</a><span class="crumb-t">' + s.no + ' ' + s.en + ' <small>' + s.ko + '</small></span>' + (extra || '') + '</nav>';
  }
  function head(L) {
    return '<section class="lesson-head" ' + lstyle(L) + '><span class="lh-emo blob" aria-hidden="true">' + L.icon + '</span>' +
      ART.bits([['leaf', 20, 30, -20, 1.4, '#F2A33A'], ['shroom', 70, 70, 8, 1.3], ['berry', 88, 30, 18, 1.2], ['sprig', 45, 78, -10, 1.2]]) +
      '<div><p class="eyebrow">Day ' + L.id + '</p><h1>' + esc(L.theme) + ' <span class="ko">' + esc(L.ko) + '</span></h1><p>' + esc(L.goal) + '</p></div></section>';
  }

  /* ---------- Day 첫 화면: 6단계 ---------- */
  function overview(host, L) {
    var m = Progress.map(Me.sid()), d = m[L.id] || {}, steps = stepsRequired(), nxt = steps.filter(function (s) { return !d[s.k]; })[0];
    host.innerHTML = '<nav class="crumbs"><a class="btn small" href="#s">← Home</a><a class="btn small ghost" href="#s/journey">🗺️ Journey</a></nav>' + head(L) +
      '<ol class="day-steps" ' + lstyle(L) + '>' + steps.map(function (s) {
        var done = d[s.k], isNext = nxt && nxt.k === s.k;
        return '<li><a class="dstep' + (done ? ' done' : '') + (isNext ? ' next' : '') + '" href="#s/d/' + L.id + '/' + s.k + '"><span class="dstep-no" aria-hidden="true">' + (done ? '✓' : s.no) + '</span>' +
          '<span class="dstep-emo" aria-hidden="true">' + s.icon + '</span><span class="dstep-t"><b>' + s.en + '</b><small>' + s.ko + ' · ' + DESC[s.k] + '</small></span>' +
          (done ? '<span class="pill ok">✓ 했어요</span>' : isNext ? '<span class="pill now">다음</span>' : '') + '</a></li>';
      }).join('') + '</ol>' +
      (nxt ? '<div class="row center"><a class="btn primary big" href="#s/d/' + L.id + '/' + nxt.k + '">' + nxt.no + ' ' + nxt.en + ' 시작 →</a></div>' : '<div class="row center"><span class="pill ok">✓ Day ' + L.id + ' 완료</span><a class="btn secondary" href="#s/review">🔁 Quick Review</a></div>');
  }

  /* 단계를 끝냈을 때 */
  function stepDone(host, L, k, note) {
    var first = !(Progress.map(Me.sid())[L.id] || {})[k];
    Log.done(L.id, k, note || null); Api.flush();
    var nx = nextStep(k);
    if (!nx) return dayDone(host, L, first);
    Sound.good();
    host.innerHTML = '<section class="panel result view-in" ' + lstyle(L) + '><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + stepOf(k).icon + '</span></div>' +
      '<h1>Nice! ' + stepOf(k).en + ' 끝</h1>' + (note && note.msg ? '<p class="big-n">' + note.msg + '</p>' : '') +
      '<div class="row center"><a class="btn" href="#s/d/' + L.id + '">Day 화면</a><a class="btn primary big" href="#s/d/' + L.id + '/' + nx.k + '">' + nx.no + ' ' + nx.en + ' →</a></div></section>';
    $('.btn.primary', host).focus();
  }
  function dayDone(host, L, first) {
    if (first) { Sound.win(); confetti(); } else Sound.good();
    var due = Review.quick(Log.all(Me.sid())).length, cur = Progress.currentDay(Me.sid());
    host.innerHTML = '<section class="panel result view-in" ' + lstyle(L) + '><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>🏆</span></div>' +
      '<h1>Day ' + L.id + ' complete!</h1><p class="lead">' + esc(L.theme) + ' · ' + esc(L.ko) + ' 를 모두 해냈어요.</p>' +
      '<div class="row center">' + (due ? '<a class="btn secondary" href="#s/review">🔁 Quick Review ' + due + '개</a>' : '') + '<a class="btn" href="#s">Home</a>' +
      (cur ? '<a class="btn primary" href="#s/d/' + cur + '">Day ' + cur + ' →</a>' : '') + '</div></section>';
  }

  /* ---------- 1 SEE & HEAR ---------- */
  function see(host, L) {
    var i = 0, seen = {};
    function card() {
      var w = L.words[i]; seen[i] = 1;
      host.innerHTML = crumbs(L, 'see', '<span class="dots">' + L.words.map(function (x, j) { return '<button class="dot' + (seen[j] ? ' s2' : '') + (j === i ? ' cur' : '') + '" data-j="' + j + '" aria-label="' + (j + 1) + '번째 낱말">' + (j + 1) + '</button>'; }).join('') + '</span>') +
        '<section class="card see-card view-in" ' + lstyle(L) + '>' + ART.pic(w.pic, 'big blob') + '<div class="see-t"><p class="see-en en">' + esc(w.en) + '</p><p class="see-ko">' + esc(w.ko) + '</p>' +
        '<div class="row"><button class="btn secondary" id="hear">🔊 듣기</button><button class="btn" id="slow" aria-pressed="' + store.get('fe-slow', false) + '">🐢 천천히</button></div></div></section>' +
        '<div class="nav-row"><button class="btn" id="prev"' + (i === 0 ? ' disabled' : '') + '>← 앞</button>' +
        (i < L.words.length - 1 ? '<button class="btn primary" id="next">다음 →</button>' : '<button class="btn primary" id="quiz">🎧 Listen & Pick →</button>') + '</div>';
      var hear = function () { Voice.say(w.en); };
      $('#hear').onclick = hear; setTimeout(hear, 300);
      $('#slow').onclick = function () { store.set('fe-slow', !store.get('fe-slow', false)); this.setAttribute('aria-pressed', store.get('fe-slow', false)); hear(); };
      $('#prev').onclick = function () { i--; card(); };
      var n = $('#next'); if (n) n.onclick = function () { i++; card(); };
      var q = $('#quiz'); if (q) q.onclick = quiz;
      $$('.dot', host).forEach(function (d) { d.onclick = function () { i = +d.dataset.j; card(); }; });
    }
    function quiz() {
      var qs = shuffle(L.words.map(function (w, j) { return itemInfo(itemId(L.id, 'w', j)); })).slice(0, 6).map(function (it) { return { kind: 'hear2pic', item: it, area: 'listen' }; });
      host.innerHTML = crumbs(L, 'see') + '<div id="qz"></div>';
      Quiz.run($('#qz'), qs, { step: 'see', day: L.id, title: 'Listen & Pick', onDone: function (r) {
        var ok = r.filter(function (x) { return x.ok; }).length;
        stepDone(host, L, 'see', { score: ok, total: r.length, msg: '듣고 고르기 <b>' + ok + '</b> / ' + r.length });
      } });
    }
    card();
    keys(host);
  }

  /* ---------- 2 SAY ---------- */
  function say(host, L) {
    var items = L.words.map(function (w, j) { return itemInfo(itemId(L.id, 'w', j)); }).concat(L.sentences.map(function (s, j) { return itemInfo(itemId(L.id, 's', j)); }));
    var tried = {}, i = 0, fails = 0;
    Log.all(Me.sid()).forEach(function (e) { if (e.step === 'say' && e.day === L.id && e.act === 'speak') tried[e.item] = tried[e.item] || (e.ok === 1 ? 2 : 1); });
    function draw() {
      var it = items[i], sent = it.type === 'sentence';
      host.innerHTML = crumbs(L, 'say', '<span class="dots">' + items.map(function (x, j) { return '<button class="dot' + (tried[x.id] ? ' s2' : '') + (j === i ? ' cur' : '') + '" data-j="' + j + '" aria-label="' + (j + 1) + '번째' + (tried[x.id] ? ' 했어요' : '') + '">' + (j + 1) + '</button>'; }).join('') + '</span>') +
        '<section class="card say-card view-in" ' + lstyle(L) + '>' + ART.pic(it.pic, 'big blob') + '<div class="see-t">' +
        '<p class="see-en en' + (sent ? ' sent' : '') + '" id="sayTxt">' + (sent ? it.en.split(' ').map(function (w, j) { return '<span data-w="' + j + '">' + esc(w) + '</span>'; }).join(' ') : esc(it.en)) + '</p><p class="see-ko">' + esc(it.ko) + '</p>' +
        '<div class="row"><button class="btn secondary" id="hear">🔊 듣기</button>' + (Listen.supported() ? '<button class="btn mic" id="mic">🎤 말하기</button>' : '') +
        '<button class="btn" id="self"' + (Listen.supported() && !fails ? ' hidden' : '') + '>✋ 말했어요</button></div>' +
        '<div class="fb info" id="sayFb" aria-live="polite">' + (Listen.supported() ? '듣기를 누르고, 말하기를 눌러 크게 따라 말해요.' : '듣기를 누르고 크게 따라 말한 다음 "말했어요"를 눌러요.') + '</div></div></section>' +
        '<div class="nav-row"><button class="btn" id="prev"' + (i === 0 ? ' disabled' : '') + '>← 앞</button>' +
        (i < items.length - 1 ? '<button class="btn primary" id="next">다음 →</button>' : '<button class="btn primary" id="fin">끝내기 ✓</button>') + '</div>';
      var hear = function () {
        var spans = $$('#sayTxt span', host);
        Voice.say(it.en, { onboundary: function (e) { if (!spans.length || (e.name && e.name !== 'word')) return; var k = it.en.slice(0, e.charIndex).split(' ').length - 1; spans.forEach(function (s, j) { s.classList.toggle('lit', j === k); }); }, onend: function () { spans.forEach(function (s) { s.classList.remove('lit'); }); } });
      };
      $('#hear').onclick = hear; setTimeout(hear, 300);
      var fb = $('#sayFb'), mic = $('#mic');
      if (mic) mic.onclick = function () {
        Voice.stop(); mic.disabled = true; mic.classList.add('listening'); mic.textContent = '듣고 있어요…'; fb.className = 'fb info'; fb.textContent = '지금 말해요!';
        var t0 = Date.now();
        Listen.listen(it.en).then(function (r) {
          mic.disabled = false; mic.classList.remove('listening'); mic.textContent = '🎤 다시 말하기';
          var scored = r.reason === 'ok' || r.reason === 'mismatch' || r.reason === 'too-short' || r.reason === 'no-speech';
          Log.add({ day: L.id, step: 'say', act: 'speak', item: it.id, area: 'speak', ok: scored ? (r.ok ? 1 : 0) : '', resp: r.heard || '', dur: Date.now() - t0, mode: 'mic', x: JSON.stringify({ reason: r.reason, score: r.score || 0 }) });
          tried[it.id] = Math.max(tried[it.id] || 0, r.ok ? 2 : 1);
          if (r.ok) { Sound.good(); fails = 0; fb.className = 'fb ok pop-in'; fb.innerHTML = Feedback.mark(true) + Feedback.spoke() + ' <span class="fb-ko">들린 말: “' + esc(r.heard) + '”</span>'; refresh(); }
          else {
            fails++; fb.className = 'fb again pop-in';
            fb.innerHTML = Feedback.mark(false) + (r.reason === 'mismatch' ? Feedback.again() + ' <span class="fb-ko">들린 말: “' + esc(r.heard) + '”</span>' : esc(r.msg || '한 번 더 해 볼까요?'));
            $('#self').hidden = false; if (!r.supported) mic.hidden = true; refresh();
          }
        });
      };
      $('#self').onclick = function () {
        Log.add({ day: L.id, step: 'say', act: 'speak', item: it.id, area: 'speak', ok: 1, mode: 'self', x: JSON.stringify({ reason: 'self' }) });
        tried[it.id] = 2; Sound.good(); fb.className = 'fb ok pop-in'; fb.innerHTML = Feedback.mark(true) + Feedback.spoke(); refresh();
      };
      $('#prev').onclick = function () { i--; fails = 0; draw(); };
      var n = $('#next'); if (n) n.onclick = function () { i++; fails = 0; draw(); };
      var f = $('#fin'); if (f) f.onclick = finish;
      $$('.dot', host).forEach(function (d) { d.onclick = function () { i = +d.dataset.j; fails = 0; draw(); }; });
    }
    function refresh() { $$('.dot', host).forEach(function (d, j) { d.classList.toggle('s2', !!tried[items[j].id]); }); }
    function finish() {
      var left = items.filter(function (x) { return !tried[x.id]; });
      if (left.length) { toast('아직 ' + left.length + '개 남았어요. 번호가 빈 칸을 눌러 말해요.'); i = items.indexOf(left[0]); return draw(); }
      var ok = items.filter(function (x) { return tried[x.id] === 2; }).length;
      stepDone(host, L, 'say', { score: ok, total: items.length, msg: '말하기 <b>' + ok + '</b> / ' + items.length });
    }
    draw(); keys(host);
  }

  /* ---------- 3 WRITE: 낱말마다 따라 쓰기 1번 → 그냥 쓰기 1번 ----------
     둘 다 같은 쓰기 방법(손으로/키보드로)을 따라요. 따라 쓰기는 연습 기록, 그냥 쓰기(그림·뜻만 보고)는 한 번만 시도해서 점수로 남겨요. */
  function write(host, L) {
    var touch = (navigator.maxTouchPoints || 0) > 0;
    var pool = L.words.map(function (w, j) { return itemInfo(itemId(L.id, 'w', j)); });
    var picks = shuffle(pool.filter(function (x) { return /^[a-z' -]{2,14}$/i.test(x.en); })).slice(0, 6);
    if (picks.length < 6) picks = picks.concat(shuffle(pool.filter(function (x) { return picks.indexOf(x) < 0; })).slice(0, 6 - picks.length));
    var i = 0, pad = null, okCount = 0;
    function progress(phase) { return '<span class="muted">' + (i + 1) + ' / ' + picks.length + ' · ' + phase + '</span>'; }
    function copy() {
      var it = picks[i], mode = store.get('fe-wmode', touch ? 'hand' : 'key'), done = false;
      host.innerHTML = crumbs(L, 'write', progress('① 따라 쓰기')) +
        '<section class="card practice view-in" ' + lstyle(L) + '><div class="see">' + ART.pic(it.pic, 'big blob') + '<div class="say-it"><p class="en">' + esc(it.en) + '</p><p class="ko">' + esc(it.ko) + '</p><div class="row"><button class="btn secondary" id="hear">🔊 듣기</button></div></div></div>' +
        '<div class="tasks"><div class="task" id="tWrite"><div class="task-h"><h2><span class="emo">✏️</span> 따라 쓰기</h2>' +
        '<span class="seg" role="group" aria-label="쓰는 방법"><button class="' + (mode === 'hand' ? 'on' : '') + '" data-m="hand" aria-pressed="' + (mode === 'hand') + '">✋ 손으로</button><button class="' + (mode === 'key' ? 'on' : '') + '" data-m="key" aria-pressed="' + (mode === 'key') + '">⌨️ 키보드로</button></span></div>' +
        (mode === 'hand' ? '<div id="pad"></div><div class="row"><button class="btn" id="erase">지우기</button><button class="btn primary" id="check">다 썼어요</button><span id="wMsg" class="muted"></span></div>'
          : '<div class="typeit"><p class="ghost en" id="ghost" aria-hidden="true">' + it.en.split('').map(function (c) { return '<span>' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('') + '</p><label class="sr" for="typ">' + esc(it.en) + ' 따라 치기</label><input id="typ" class="en" autocapitalize="off" spellcheck="false" placeholder="똑같이 쳐요"></div><div class="row"><span id="wMsg" class="muted">대문자, 소문자는 상관없어요.</span></div>') +
        '</div></div></section>';
      $('#hear').onclick = function () { Voice.say(it.en); }; setTimeout(function () { Voice.say(it.en); }, 300);
      $$('.seg button', host).forEach(function (b) { b.onclick = function () { store.set('fe-wmode', b.dataset.m); copy(); }; });
      var t0 = Date.now();
      function ok(resp, how) {
        if (done) return; done = true;
        Log.add({ day: L.id, step: 'write', act: how, item: it.id, area: 'write', ok: '', resp: resp, dur: Date.now() - t0, mode: how === 'trace' ? 'touch' : 'keyboard' });
        Sound.good(); $('#wMsg').innerHTML = '👏 잘 썼어요! 이제 보지 않고 써 봐요.';
        setTimeout(free, 900);
      }
      if (mode === 'hand') {
        if (pad) pad.destroy();
        pad = new TracePad($('#pad'), it.en, { max: Math.min(110, Math.round(innerHeight * .15)), color: '#036370' });
        $('#erase').onclick = function () { pad.clear(); $('#wMsg').textContent = ''; };
        $('#check').onclick = function () {
          var r = pad.check();
          if (r.empty) { $('#wMsg').textContent = '점선 글자를 따라 써요.'; return; }
          if (r.ok) ok(r.score + '%', 'trace');
          else { Sound.bad(); $('#wMsg').textContent = r.near < .5 ? '선 밖으로 많이 나갔어요. 지우고 다시 써요.' : '점선을 조금 더 따라 써요.'; }
        };
      } else {
        var typ = $('#typ'), gs = $$('#ghost span', host);
        typ.oninput = function () {
          var v = typ.value;
          gs.forEach(function (g, j) { g.className = j >= v.length ? '' : v[j].toLowerCase() === it.en[j].toLowerCase() ? 'ok' : 'no'; });
          if (normAnswer(v) === normAnswer(it.en)) ok(v, 'copy');
        };
        if (!touch) setTimeout(function () { typ.focus(); }, 50);
      }
    }
    /* 그냥 쓰기: 같은 낱말을 그림과 뜻만 보고 한 번 (틀리면 정답을 같이 보고 다음 낱말로) */
    function next(ok) {
      if (ok) okCount++;
      i++;
      if (i < picks.length) copy();
      else stepDone(host, L, 'write', { score: okCount, total: picks.length, msg: '그냥 쓰기 <b>' + okCount + '</b> / ' + picks.length });
    }
    function free() {
      if (pad) { pad.destroy(); pad = null; }
      var mode = store.get('fe-wmode', touch ? 'hand' : 'key');
      if (mode !== 'hand') {
        host.innerHTML = crumbs(L, 'write', progress('② 그냥 쓰기')) + '<div id="qz"></div>';
        Quiz.run($('#qz'), [{ kind: 'type', item: picks[i], area: 'write' }], { step: 'write', day: L.id, title: 'Write without help', tries: 1, base: i, of: picks.length, onDone: function (r) { next(r[0] && r[0].ok); } });
        return;
      }
      handFree();
    }
    /* 손으로 그냥 쓰기: 점선 없는 4줄 공책. 크롬북 손글씨 인식으로 읽고, 인식기가 없거나 다르게 읽으면
       정답 점선을 겹쳐 보여 주고 학생이 스스로 확인해요 (한 번만 시도). */
    function handFree() {
      var it = picks[i], t0 = Date.now(), finished = false;
      host.innerHTML = crumbs(L, 'write', progress('② 그냥 쓰기')) +
        '<section class="card qz view-in" data-item="' + it.id + '" data-kind="hand" ' + lstyle(L) + '><div class="qz-top"><span class="qz-count">' + (i + 1) + ' / ' + picks.length + '</span><span class="bar" aria-hidden="true"><i style="width:' + (i / picks.length * 100) + '%"></i></span><span class="qz-title">Write without help</span></div>' +
        '<p class="qz-prompt">그림을 보고 영어로 써요 · 보지 않고 손으로</p>' +
        '<div class="qz-ask"><span class="qz-pic blob small">' + ART.pic(it.pic) + '</span><p class="qz-ko">' + esc(it.ko) + '</p><p class="qz-slots en" aria-label="' + it.en.replace(/ /g, '').length + '글자">' + it.en.split('').map(function (c) { return c === ' ' ? '<i class="sp"></i>' : '<i></i>'; }).join('') + '</p></div>' +
        '<div id="pad"></div><div class="row center" id="hBtns"><button class="btn" id="erase">지우기</button><button class="btn primary" id="hDone">다 썼어요</button></div>' +
        '<div class="fb info" id="qFb" aria-live="polite">천천히 또박또박 써요.</div><div class="row center" id="hCheck" hidden></div>' +
        '<div class="row center"><button class="btn primary" id="qNext" hidden>다음 →</button></div></section>';
      pad = new TracePad($('#pad'), it.en, { guide: false, max: Math.min(110, Math.round(innerHeight * .14)), color: '#036370' });
      var fb = $('#qFb');
      $('#erase').onclick = function () { pad.clear(); fb.className = 'fb info'; fb.textContent = '천천히 또박또박 써요.'; };
      function log(ok, mode, resp, extra) {
        if (finished) return; finished = true;
        Log.add({ day: L.id, step: 'write', act: 'hand', item: it.id, area: 'write', ok: ok ? 1 : 0, resp: resp || '', dur: Date.now() - t0, mode: mode, x: JSON.stringify(extra || {}) });
        $('#hBtns').hidden = true; $('#hCheck').hidden = true;
        var nb = $('#qNext'); nb.hidden = false; nb.focus(); nb.onclick = function () { next(ok); };
      }
      function good(mode, resp, extra) { Sound.good(); fb.className = 'fb ok pop-in'; fb.innerHTML = Feedback.mark(true) + Feedback.good(); Voice.say(it.en); log(true, mode, resp, extra); }
      /* 정답 점선을 겹쳐 보여 주고 스스로 확인 */
      function selfCheck(heard) {
        pad.reveal(); Voice.say(it.en);
        fb.className = 'fb info pop-in';
        fb.innerHTML = (heard != null ? '<span class="fb-ko">내 글씨를 “' + esc(heard || '?') + '” 로 읽었어요.</span> ' : '') + '<b>정답 <span class="en">' + esc(it.en) + '</span></b> — 내가 쓴 것과 같나요?';
        var box = $('#hCheck'); box.hidden = false; $('#hBtns').hidden = true;
        box.innerHTML = '<button class="btn secondary" id="same">✓ 같아요</button><button class="btn" id="diff">↻ 달라요</button>';
        var ex = { check: 'self', hwr: heard == null ? 'none' : heard };
        $('#same').onclick = function () { good('self', heard || '', ex); };
        $('#diff').onclick = function () { fb.className = 'fb info pop-in'; fb.innerHTML = Feedback.together() + ' <span class="en"><b>' + esc(it.en) + '</b></span>'; log(false, 'self', heard || '', ex); };
      }
      $('#hDone').onclick = function () {
        if (pad.isEmpty()) { fb.className = 'fb info'; fb.textContent = '먼저 써 봐요.'; return; }
        var btn = this; btn.disabled = true; fb.className = 'fb info'; fb.textContent = '읽고 있어요…';
        HWR.read(pad.strokes(), pad.pointerType()).then(function (alts) {
          btn.disabled = false;
          if (!alts) return selfCheck(null);                       // 인식기 없음 → 스스로 확인
          var target = normAnswer(it.en).replace(/ /g, ''), hit = alts.some(function (a) { return normAnswer(a).replace(/ /g, '') === target; });
          if (hit) good('hwr', alts[0], { check: 'hwr', alts: alts.slice(0, 3) });
          else selfCheck(alts[0] || '');                           // 다르게 읽음 → 아이 글씨를 잘못 읽었을 수도 있어서 스스로 확인
        });
      };
    }
    Cleanup.add(function () { if (pad) pad.destroy(); });
    copy();
  }

  /* ---------- 4 USE: 바꿔 말하기 ---------- */
  function use(host, L) {
    var items = drillItems(L).map(function (d, j) { return itemInfo(itemId(L.id, 'dr', j)); }), parts = L.drill.en.split('{w}');
    var st = {}, i = 0, fails = 0;
    items.forEach(function (it) { st[it.id] = { fill: false, said: false }; });
    function draw() {
      var it = items[i], s = st[it.id], others = shuffle(items.filter(function (x) { return x !== it; })).slice(0, 3), opts = shuffle([it].concat(others));
      host.innerHTML = crumbs(L, 'use', '<span class="dots">' + items.map(function (x, j) { var q = st[x.id]; return '<button class="dot' + (q.fill && q.said ? ' s2' : q.fill || q.said ? ' s1' : '') + (j === i ? ' cur' : '') + '" data-j="' + j + '" aria-label="' + (j + 1) + '번째">' + (j + 1) + '</button>'; }).join('') + '</span>') +
        '<section class="card practice drill view-in" ' + lstyle(L) + '><div class="see">' + ART.pic(it.pic, 'big blob') + '<p class="frame-tag">문장 틀</p><p class="frame-pat en">' + esc(parts[0]) + '<span class="blank">　　</span>' + esc(parts[1] || '') + '</p></div>' +
        '<div class="tasks"><div class="task' + (s.fill ? ' done' : '') + '" id="tFill"><h2><span class="emo">🧩</span> 빈칸에 알맞은 낱말</h2>' +
        '<p class="en drill-sent">' + esc(parts[0]) + '<span class="slot' + (s.fill ? ' on' : '') + '" id="slot">' + (s.fill ? esc(it.slot) : '?') + '</span>' + esc(parts[1] || '') + '</p><p class="ko"' + (s.fill ? '' : ' hidden') + ' id="dKo">' + esc(it.ko) + '</p>' +
        '<div class="row" id="opts">' + opts.map(function (o) { return '<button class="tile opt" data-id="' + o.id + '"' + (s.fill ? ' disabled' : '') + '>' + esc(o.slot) + '</button>'; }).join('') + '</div>' +
        '<div class="fb info" id="fFb" aria-live="polite">그림을 보고 빈칸에 들어갈 낱말을 골라요.</div></div>' +
        '<div class="task' + (s.said ? ' done' : '') + '" id="tSay"><h2><span class="emo">🎤</span> 바꿔서 말하기</h2><div class="row"><button class="btn secondary" id="hear">🔊 문장 듣기</button>' +
        (Listen.supported() ? '<button class="btn mic" id="mic">🎤 말하기</button>' : '') + '<button class="btn" id="self"' + (Listen.supported() && !fails ? ' hidden' : '') + '>✋ 말했어요</button></div><div class="fb info" id="sFb" aria-live="polite">낱말을 고른 다음, 완성된 문장을 크게 말해요.</div></div></div></section>' +
        '<div class="nav-row"><button class="btn" id="prev"' + (i === 0 ? ' disabled' : '') + '>← 앞</button>' + (i < items.length - 1 ? '<button class="btn primary" id="next">다음 →</button>' : '<button class="btn primary" id="fin">끝내기 ✓</button>') + '</div>';
      var tries = 0, t0 = Date.now();
      $('#hear').onclick = function () { Voice.say(it.en); };
      $$('.opt', host).forEach(function (b) {
        b.onclick = function () {
          var good = b.dataset.id === it.id; tries++;
          Log.add({ day: L.id, step: 'use', act: tries === 1 ? 'choose' : 'retry', item: it.id, area: 'sentence', ok: tries === 1 ? (good ? 1 : 0) : '', resp: b.textContent, dur: Date.now() - t0, mode: 'touch' });
          if (good) {
            s.fill = true; Sound.good(); var sl = $('#slot'); sl.textContent = it.slot; sl.classList.add('on'); $('#dKo').hidden = false;
            $('#tFill').classList.add('done'); $('#fFb').className = 'fb ok pop-in'; $('#fFb').innerHTML = Feedback.mark(true) + Feedback.good();
            $$('.opt', host).forEach(function (x) { x.disabled = x !== b; }); b.classList.add('on'); Voice.say(it.en); dots();
          } else {
            Sound.bad(); b.classList.add('shake'); b.disabled = true; $('#fFb').className = 'fb again pop-in';
            $('#fFb').innerHTML = Feedback.mark(false) + (tries >= 2 ? Feedback.together() : Feedback.again());
            if (tries >= 2) Voice.say(it.en);
          }
        };
      });
      var mic = $('#mic'), sFb = $('#sFb');
      if (mic) mic.onclick = function () {
        Voice.stop(); mic.disabled = true; mic.classList.add('listening'); mic.textContent = '듣고 있어요…';
        var t1 = Date.now();
        Listen.listen(it.en).then(function (r) {
          mic.disabled = false; mic.classList.remove('listening'); mic.textContent = '🎤 다시 말하기';
          var scored = ['ok', 'mismatch', 'too-short', 'no-speech'].indexOf(r.reason) >= 0;
          Log.add({ day: L.id, step: 'use', act: 'speak', item: it.id, area: 'speak', ok: scored ? (r.ok ? 1 : 0) : '', resp: r.heard || '', dur: Date.now() - t1, mode: 'mic', x: JSON.stringify({ reason: r.reason }) });
          if (r.ok) { s.said = true; Sound.good(); fails = 0; sFb.className = 'fb ok pop-in'; sFb.innerHTML = Feedback.mark(true) + Feedback.spoke(); $('#tSay').classList.add('done'); dots(); }
          else { fails++; sFb.className = 'fb again pop-in'; sFb.innerHTML = Feedback.mark(false) + (r.reason === 'mismatch' ? Feedback.again() + ' <span class="fb-ko">들린 말: “' + esc(r.heard) + '”</span>' : esc(r.msg)); $('#self').hidden = false; if (!r.supported) mic.hidden = true; }
        });
      };
      $('#self').onclick = function () { Log.add({ day: L.id, step: 'use', act: 'speak', item: it.id, area: 'speak', ok: 1, mode: 'self' }); s.said = true; Sound.good(); sFb.className = 'fb ok pop-in'; sFb.innerHTML = Feedback.mark(true) + Feedback.spoke(); $('#tSay').classList.add('done'); dots(); };
      $('#prev').onclick = function () { i--; fails = 0; draw(); };
      var n = $('#next'); if (n) n.onclick = function () { i++; fails = 0; draw(); };
      var f = $('#fin'); if (f) f.onclick = function () {
        var left = items.filter(function (x) { return !st[x.id].fill || !st[x.id].said; });
        if (left.length) { toast('아직 ' + left.length + '개 남았어요.'); i = items.indexOf(left[0]); return draw(); }
        stepDone(host, L, 'use', { msg: '바꿔 말하기 <b>' + items.length + '</b>개 완성' });
      };
      $$('.dot', host).forEach(function (d) { d.onclick = function () { i = +d.dataset.j; fails = 0; draw(); }; });
    }
    function dots() { $$('.dot', host).forEach(function (d, j) { var q = st[items[j].id]; d.classList.toggle('s2', q.fill && q.said); d.classList.toggle('s1', (q.fill || q.said) && !(q.fill && q.said)); }); }
    draw(); keys(host);
  }

  /* ---------- 5 RETRIEVE: 게임 ---------- */
  function retrieve(host, L) {
    var G = GAMES[L.game], nx = nextStep('retrieve');
    host.innerHTML = crumbs(L, 'retrieve', '<span class="muted">' + esc(G.name) + '</span>') + '<div id="game"></div>';
    Games.start($('#game'), L, function (res) {
      Log.add({ day: L.id, step: 'retrieve', act: 'game', item: 'd' + pad2(L.id) + '.game', area: '', ok: '', resp: res.score, mode: 'touch', x: JSON.stringify({ game: L.game, score: res.score, stars: res.stars, total: res.total }) });
      Log.done(L.id, 'retrieve', { game: L.game, score: res.score, stars: res.stars }); Api.flush();
      if (!nx) setTimeout(function () { dayDone($('#game'), L, true); }, 1500);
    }, {
      item: function (r) { Log.add({ day: L.id, step: 'retrieve', act: 'game', item: r.item, area: r.area, ok: r.ok, resp: r.resp, mode: 'touch', x: JSON.stringify({ game: L.game }) }); },
      next: nx ? { href: '#s/d/' + L.id + '/' + nx.k, label: nx.no + ' ' + nx.en + ' →' } : null
    });
  }

  /* ---------- 6 REFLECT ---------- */
  function reflect(host, L) {
    var rating = null, diff = {};
    var R = [['3', '😊', 'I know it well.', '잘 알아요'], ['2', '🙂', 'I need a little more practice.', '조금 더 연습할래요'], ['1', '🤔', 'It was difficult.', '어려웠어요']];
    var D = [['words', 'Words', '낱말'], ['listening', 'Listening', '듣기'], ['speaking', 'Speaking', '말하기'], ['writing', 'Writing', '쓰기'], ['sentences', 'Sentences', '문장'], ['nothing', 'Nothing', '없어요']];
    host.innerHTML = crumbs(L, 'reflect') + '<section class="card reflect view-in" ' + lstyle(L) + '><h2>How was today’s lesson? <small>오늘 공부 어땠어요?</small></h2>' +
      '<div class="rf-row" role="radiogroup" aria-label="오늘 공부">' + R.map(function (r) { return '<button class="rf" role="radio" aria-checked="false" data-r="' + r[0] + '"><span class="emo">' + r[1] + '</span><b class="en">' + r[2] + '</b><small>' + r[3] + '</small></button>'; }).join('') + '</div>' +
      '<h2>What was difficult today? <small>어려웠던 것 (여러 개 골라도 돼요)</small></h2><div class="rf-chips">' + D.map(function (d) { return '<button class="chip" aria-pressed="false" data-d="' + d[0] + '"><span class="en">' + d[1] + '</span> · ' + d[2] + '</button>'; }).join('') + '</div>' +
      '<div class="row center"><button class="btn primary big" id="rfGo" disabled>다 했어요 ✓</button></div></section>';
    $$('.rf', host).forEach(function (b) { b.onclick = function () { rating = b.dataset.r; $$('.rf', host).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); $('#rfGo').disabled = false; }; });
    $$('[data-d]', host).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.d; diff[k] = !diff[k];
        if (k === 'nothing' && diff[k]) { diff = { nothing: true }; } else if (k !== 'nothing') delete diff.nothing;
        $$('[data-d]', host).forEach(function (x) { x.setAttribute('aria-pressed', !!diff[x.dataset.d]); x.classList.toggle('on', !!diff[x.dataset.d]); });
      };
    });
    $('#rfGo').onclick = function () {
      var list = Object.keys(diff).filter(function (k) { return diff[k]; });
      Log.add({ day: L.id, step: 'reflect', act: 'reflect', item: 'd' + pad2(L.id) + '.reflect', resp: rating + '|' + list.join(','), x: JSON.stringify({ rating: +rating, difficult: list }) });
      stepDone(host, L, 'reflect');
    };
  }

  /* ← → 키로 앞뒤 */
  function keys(host) {
    function onKey(e) {
      if ((e.target.closest && e.target.closest('input,textarea')) || !$('.nav-row', host)) return;
      if (e.key === 'ArrowRight') { var n = $('#next', host) || $('#quiz', host) || $('#fin', host); if (n) { e.preventDefault(); n.click(); } }
      else if (e.key === 'ArrowLeft') { var p = $('#prev', host); if (p && !p.disabled) { e.preventDefault(); p.click(); } }
    }
    document.addEventListener('keydown', onKey);
    Cleanup.add(function () { document.removeEventListener('keydown', onKey); });
  }

  var RUN = { see: see, say: say, write: write, use: use, retrieve: retrieve, reflect: reflect };
  function route(host, L, k) { if (k && RUN[k] && (k !== 'reflect' || CONFIG.ENABLE_REFLECTION !== false)) RUN[k](host, L); else overview(host, L); }
  return { route: route, head: head };
})();
