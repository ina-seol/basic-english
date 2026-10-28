/* 문제 풀이 공용 틀: 듣고 고르기, 그림 보고 낱말, 뜻 고르기, 써 보기, 빈칸, 순서
   Quiz.run(host, questions, { step, day, rev, title, onDone(results), tries(기본 2, 1이면 한 번만), base·of(번호 표시) })
   question: { kind, item(itemInfo), area }
     kind: hear2pic | pic2word | word2ko | type | fill | order

   기록 규칙 (Error Bank 를 정직하게 만들려고)
     · 첫 시도만 점수(ok 1/0)로 남겨요.
     · 다시 하기·도움 받은 뒤의 시도는 점수 없는 기록(act 'retry', ok '')으로만 남겨요.
       그래서 같은 자리에서 정답을 본 뒤 맞힌 것은 '복습 성공'으로 치지 않아요. */
var Quiz = (function () {
  function wordPool(it) {
    var L = it.lesson, own = L.words.map(function (w, i) { return itemInfo(itemId(L.id, 'w', i)); });
    return own.filter(function (x) { return x.id !== it.id; });
  }
  function distract(it, n, key) {
    var seen = {}; seen[key(it)] = 1;
    var pool = it.type === 'drill' ? drillItems(it.lesson).map(function (d, i) { return itemInfo(itemId(it.lesson.id, 'dr', i)); }).filter(function (x) { return x.id !== it.id; }) : wordPool(it);
    var out = [];
    shuffle(pool).forEach(function (x) { if (out.length < n && !seen[key(x)]) { seen[key(x)] = 1; out.push(x); } });
    while (out.length < n) { var L = LESSONS[Math.floor(Math.random() * LESSONS.length)], x = itemInfo(itemId(L.id, 'w', Math.floor(Math.random() * 10))); if (!seen[key(x)]) { seen[key(x)] = 1; out.push(x); } }
    return out;
  }
  var ACT = { hear2pic: 'choose', pic2word: 'choose', word2ko: 'choose', type: 'type', fill: 'choose', order: 'order' };
  var PROMPT = { hear2pic: '듣고 알맞은 그림을 골라요', pic2word: '그림에 맞는 낱말을 골라요', word2ko: '알맞은 뜻을 골라요', type: '그림을 보고 영어로 써요', fill: '빈칸에 알맞은 낱말을 골라요', order: '낱말을 차례대로 눌러 문장을 만들어요' };

  function run(host, qs, opt) {
    var k = 0, results = [], t0 = 0;
    function log(q, ok, resp, retry, extra) {
      var e = { day: q.item.day || opt.day || 0, step: opt.step, act: retry ? 'retry' : ACT[q.kind], item: q.item.id, area: q.area, ok: retry ? '' : (ok ? 1 : 0),
        resp: resp, dur: Date.now() - t0, mode: q.kind === 'type' ? 'keyboard' : 'touch', rev: opt.rev || '' };
      var x = {}; if (retry) x.ok = ok ? 1 : 0; if (q.kind) x.k = q.kind; for (var key in extra || {}) x[key] = extra[key];
      e.x = JSON.stringify(x);
      Log.add(e);
    }
    function next() {
      if (k >= qs.length) { Api.flush(); return opt.onDone(results); }
      var q = qs[k], it = q.item, tries = 0, done = false, hinted = false;
      t0 = Date.now();
      var L = it.lesson, st = 'style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"';
      var head = '<div class="qz-top"><span class="qz-count">' + ((opt.base || 0) + k + 1) + ' / ' + (opt.of || qs.length) + '</span><span class="bar" aria-hidden="true"><i style="width:' + (((opt.base || 0) + k) / (opt.of || qs.length) * 100) + '%"></i></span>' +
        (opt.title ? '<span class="qz-title">' + esc(opt.title) + '</span>' : '') + '</div>';
      var body = '', opts = [];
      if (q.kind === 'hear2pic') {
        opts = shuffle([it].concat(distract(it, 3, function (x) { return x.en; })));
        body = '<div class="qz-ask"><button class="btn secondary big" id="qHear">🔊 다시 듣기</button></div><div class="choices" style="--cols:4">' +
          opts.map(function (o, i) { return '<button class="choice" data-i="' + i + '" aria-label="' + (i + 1) + '번 그림">' + ART.pic(o.pic) + '</button>'; }).join('') + '</div>';
      } else if (q.kind === 'pic2word' || q.kind === 'word2ko') {
        var ko = q.kind === 'word2ko';
        opts = shuffle([it].concat(distract(it, 3, function (x) { return ko ? x.ko : x.en; })));
        body = '<div class="qz-ask">' + (ko ? '<p class="qz-word en">' + esc(it.en) + '</p>' : '<span class="qz-pic blob">' + ART.pic(it.pic) + '</span>') + '</div><div class="choices" style="--cols:' + (ko ? 2 : 4) + '">' +
          opts.map(function (o, i) { return '<button class="choice' + (ko ? ' ko' : '') + '" data-i="' + i + '">' + esc(ko ? o.ko : o.en) + '</button>'; }).join('') + '</div>';
      } else if (q.kind === 'fill') {
        opts = shuffle([it].concat(distract(it, 3, function (x) { return x.slot || x.en; })));
        var parts = it.frame.split('{w}');
        body = '<div class="qz-ask"><span class="qz-pic blob small">' + ART.pic(it.pic) + '</span><p class="qz-sent en">' + esc(parts[0]) + '<span class="slot" id="qSlot">?</span>' + esc(parts[1] || '') + '</p></div>' +
          '<div class="choices" style="--cols:4">' + opts.map(function (o, i) { return '<button class="choice" data-i="' + i + '">' + esc(o.slot || o.en) + '</button>'; }).join('') + '</div>';
      } else if (q.kind === 'type') {
        body = '<div class="qz-ask"><span class="qz-pic blob">' + ART.pic(it.pic) + '</span><p class="qz-ko">' + esc(it.ko) + '</p></div>' +
          '<form class="qz-type" id="qForm" autocomplete="off"><p class="qz-slots en" aria-hidden="true" id="qSlots">' + it.en.split('').map(function (c) { return c === ' ' ? '<i class="sp"></i>' : '<i></i>'; }).join('') + '</p>' +
          '<label class="sr" for="qIn">영어로 쓰기</label><input id="qIn" class="en" autocapitalize="off" spellcheck="false" placeholder="영어로 써요">' +
          '<div class="row center"><button type="button" class="btn small ghost" id="qHint">💡 첫 글자</button><button type="button" class="btn small" id="qSay">🔊 듣기</button><button class="btn primary">확인</button></div></form>';
      } else if (q.kind === 'order') {
        var words = it.en.replace(/[.?!]$/, '').split(' '), mark = (/[.?!]$/.exec(it.en) || [''])[0];
        opts = shuffle(words.map(function (w, i) { return { t: w, i: i }; }));
        body = '<div class="qz-ask"><span class="qz-pic blob small">' + ART.pic(it.pic) + '</span><p class="qz-ko">' + esc(it.ko) + '</p></div>' +
          '<div class="pz-ans" id="qAns"></div><div class="pz-tiles">' + opts.map(function (o, j) { return '<button class="tile" data-k="' + j + '">' + esc(o.t) + '</button>'; }).join('') + '</div><span hidden id="qMark">' + mark + '</span>';
      }
      host.innerHTML = '<section class="card qz view-in" data-item="' + it.id + '" data-kind="' + q.kind + '" ' + st + '>' + head + '<p class="qz-prompt">' + PROMPT[q.kind] + '</p>' + body + '<div class="fb info" id="qFb" aria-live="polite">' + (q.kind === 'hear2pic' ? '잘 듣고 골라요' : '천천히 해도 돼요') + '</div><div class="row center"><button class="btn primary" id="qNext" hidden>다음 →</button></div></section>';
      var fb = $('#qFb', host), nextBtn = $('#qNext', host);
      function finish(okFirst) {
        done = true; results.push({ item: it.id, ok: okFirst });
        nextBtn.hidden = false; nextBtn.focus();
        nextBtn.onclick = function () { k++; next(); };
      }
      function answer(ok, resp, showRight) {
        if (done) return;
        tries++;
        var first = tries === 1;
        log(q, first ? (ok && !hinted) : ok, resp, !first, hinted && first ? { hint: 1 } : null);
        if (ok) {
          Sound.good(); fb.className = 'fb ok pop-in'; fb.innerHTML = Feedback.mark(true) + Feedback.good();
          Voice.say(it.en); finish(first && !hinted);
          if (first && !hinted) setTimeout(function () { if (k < qs.length && qs[k] === q && done) nextBtn.click(); }, 1300);
        } else if (tries === 1 && (opt.tries || 2) > 1) {
          Sound.bad(); fb.className = 'fb again pop-in'; fb.innerHTML = Feedback.mark(false) + Feedback.again();
        } else {
          fb.className = 'fb info pop-in'; fb.innerHTML = Feedback.together() + ' <span class="en"><b>' + esc(it.slot || it.en) + '</b></span>';
          if (showRight) showRight(); Voice.say(it.en); finish(false);
        }
      }
      /* 고르기 문제 */
      $$('.choice', host).forEach(function (b) {
        b.onclick = function () {
          var o = opts[+b.dataset.i], ok = o.id === it.id;
          if (ok) { b.classList.add('right'); if (q.kind === 'fill') { var s = $('#qSlot', host); s.textContent = it.slot; s.classList.add('on'); } }
          else { b.classList.add('miss', 'shake'); b.disabled = true; }
          answer(ok, q.kind === 'word2ko' ? o.ko : (o.slot || o.en), function () {
            $$('.choice', host).forEach(function (x) { if (opts[+x.dataset.i].id === it.id) x.classList.add('right'); x.disabled = true; });
            if (q.kind === 'fill') { var s = $('#qSlot', host); s.textContent = it.slot; s.classList.add('on'); }
          });
          if (done) $$('.choice', host).forEach(function (x) { x.disabled = true; });
        };
      });
      if (q.kind === 'hear2pic') { var h = function () { Voice.say(it.en); }; $('#qHear', host).onclick = h; setTimeout(h, 350); }
      /* 써 보기 */
      if (q.kind === 'type') {
        var inp = $('#qIn', host), slots = $$('#qSlots i', host).filter(function (x) { return !x.classList.contains('sp'); });
        var letters = it.en.replace(/ /g, '');
        inp.oninput = function () { var v = inp.value.replace(/ /g, ''); slots.forEach(function (s, i) { s.textContent = v[i] || ''; s.className = v[i] ? (v[i].toLowerCase() === letters[i].toLowerCase() ? 'ok' : 'no') : ''; }); };
        $('#qHint', host).onclick = function () { hinted = true; inp.value = it.en[0]; inp.oninput(); inp.focus(); this.disabled = true; };
        $('#qSay', host).onclick = function () { hinted = true; Voice.say(it.en); };
        $('#qForm', host).onsubmit = function (e) {
          e.preventDefault(); if (done) return;
          if (!inp.value.trim()) { fb.className = 'fb info'; fb.textContent = '먼저 써 봐요.'; return; }
          answer(normAnswer(inp.value) === normAnswer(it.en), inp.value, function () { inp.value = it.en; inp.oninput(); inp.readOnly = true; });
        };
        setTimeout(function () { inp.focus(); }, 60);
      }
      /* 순서 */
      if (q.kind === 'order') {
        var placed = [], ans = $('#qAns', host), mk = $('#qMark', host).textContent;
        var draw = function () {
          ans.innerHTML = placed.map(function (j) { return '<button class="tile on" data-k="' + j + '">' + esc(opts[j].t) + '</button>'; }).join('') + (placed.length ? '' : '<span class="muted">낱말을 차례대로 눌러요</span>') + '<span class="pz-mark">' + mk + '</span>';
          $$('.pz-tiles .tile', host).forEach(function (b) { b.disabled = done || placed.indexOf(+b.dataset.k) >= 0; });
          $$('.tile.on', ans).forEach(function (b) { b.onclick = function () { if (done) return; placed.splice(placed.indexOf(+b.dataset.k), 1); draw(); }; });
          if (placed.length === opts.length && !done) {
            var text = placed.map(function (j) { return opts[j].t; }).join(' '), ok = text === it.en.replace(/[.?!]$/, '');
            answer(ok, text, function () { placed = opts.map(function (o, j) { return j; }).sort(function (a, b) { return opts[a].i - opts[b].i; }); draw(); ans.classList.add('right'); });
            if (ok) ans.classList.add('right'); else if (!done) { ans.classList.add('shake'); setTimeout(function () { ans.classList.remove('shake'); placed = []; draw(); }, 500); }
          }
        };
        $$('.pz-tiles .tile', host).forEach(function (b) { b.onclick = function () { placed.push(+b.dataset.k); Sound.tap(); draw(); }; });
        draw();
      }
    }
    next();
  }
  /* 항목에 맞는 문제 모양 고르기 (복습용): 틀렸던 영역을 따라가요 */
  function kindFor(info, areas) {
    areas = areas || {};
    if (info.type === 'drill') return 'fill';
    if (info.type === 'sentence') return 'order';
    if (areas.write && /^[a-z ]{2,14}$/i.test(info.en)) return 'type';
    if (areas.listen) return 'hear2pic';
    return Math.random() < .5 ? 'pic2word' : 'hear2pic';
  }
  function areaFor(kind, info) { return { hear2pic: 'listen', pic2word: 'vocab', word2ko: 'vocab', type: 'write', fill: 'sentence', order: 'sentence' }[kind] || 'vocab'; }
  return { run: run, kindFor: kindFor, areaFor: areaFor };
})();
