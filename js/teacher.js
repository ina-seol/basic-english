/* 교사 화면: 수업 슬라이드(PPT처럼 띄워 놓고 지도) · 학습 결과(표와 그래프) · 설정 */
var Teacher = (function () {
  function tabs(cur) {
    return '<nav class="tabs" aria-label="교사 메뉴">' + [['#t', '수업하기'], ['#t/rec', '학습 결과'], ['#t/set', '설정']].map(function (t) {
      return '<a class="tab' + (t[0] === cur ? ' on' : '') + '" href="' + t[0] + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
    }).join('') + '</nav>';
  }

  function home(view) {
    view.innerHTML = tabs('#t') +
      '<section class="hello"><div><p class="eyebrow">선생님 화면</p><h1>오늘은 어떤 수업을 할까요?</h1><p class="muted">회차를 고르면 칠판 화면에 띄울 수 있는 슬라이드가 열려요. 방향키로 넘기고 <span class="kbd">F</span> 로 전체 화면.</p></div></section>' +
      '<div class="days">' + LESSONS.map(function (L) {
        return '<a class="day" href="#t/' + L.id + '" style="--c:' + L.color + ';--cl:' + L.light + '"><span class="day-ill"><b>Day ' + L.id + '</b><span class="day-emo">' + L.icon + '</span></span>' +
          '<span class="day-body"><span class="day-t">' + L.theme + ' <small>' + L.ko + '</small></span><span class="day-sub">' + L.words.slice(0, 5).map(function (w) { return esc(w.en); }).join(' · ') + ' …</span>' +
          '<span class="day-steps"><span class="pill">낱말 10</span><span class="pill">문장 4</span><span class="pill">' + GAMES[L.game].icon + ' ' + GAMES[L.game].name + '</span></span></span></a>';
      }).join('') + '</div>';
  }

  /* ---------- 수업 슬라이드 ---------- */
  function slidesOf(L) {
    var s = [{ k: 'cover' }, { k: 'sec', t: 'Words', ko: '낱말 익히기', emo: '🔤' }];
    L.words.forEach(function (w, i) { s.push({ k: 'word', i: i }); });
    s.push({ k: 'quiz' }, { k: 'sec', t: 'Sentences', ko: '문장 익히기', emo: '💬' });
    L.sentences.forEach(function (x, i) { s.push({ k: 'sent', i: i }); });
    s.push({ k: 'talk' }, { k: 'game' }, { k: 'wrap' });
    return s;
  }
  function deck(view, L) {
    var S = slidesOf(L), skey = 'fe-slide-' + L.id, idx = Math.min(store.get(skey, 0), S.length - 1), showKo = store.get('fe-ko', true), reps = {};
    view.innerHTML =
      '<div class="deck-wrap" id="deckWrap" style="--c:' + L.color + ';--cl:' + L.light + '">' +
      '<div class="deck-top"><a class="btn small" href="#t">← 회차 목록</a><b>Day ' + L.id + ' · ' + L.theme + ' ' + L.ko + '</b><span class="muted" id="count"></span></div>' +
      '<div class="deck" id="deck" tabindex="-1"><div class="slide" id="slide"></div><div class="game-over" id="gameOver" hidden></div></div>' +
      '<div class="deck-bar"><button class="btn" id="prev" aria-label="앞 슬라이드">◀</button><div class="prog"><i id="progBar"></i></div><button class="btn" id="next" aria-label="다음 슬라이드">▶</button>' +
      '<button class="btn small" id="ko" aria-pressed="' + showKo + '">한글 뜻 <span class="kbd">K</span></button><button class="btn small" id="slow2" aria-pressed="' + store.get('fe-slow', false) + '">🐢 천천히</button>' +
      '<button class="btn small" id="fs">전체 화면 <span class="kbd">F</span></button></div></div>';
    var slide = $('#slide');

    function speakEl(text, spans) {
      Voice.say(text, {
        onboundary: function (e) { if (!spans || (e.name && e.name !== 'word')) return; var k = text.slice(0, e.charIndex).split(' ').length - 1; spans.forEach(function (s, i) { s.classList.toggle('lit', i === k); }); },
        onend: function () { if (spans) spans.forEach(function (s) { s.classList.remove('lit'); }); }
      });
    }
    function ko(t) { return '<p class="s-ko' + (showKo ? '' : ' hide') + '">' + esc(t) + '</p>'; }
    function repDots(i) { var n = reps[i] || 0; return '<div class="reps" aria-label="따라 말한 횟수 ' + n + '">Listen &amp; Repeat ' + [0, 1, 2].map(function (k) { return '<i class="' + (k < n ? 'on' : '') + '"></i>'; }).join('') + '</div>'; }

    function draw() {
      var s = S[idx]; store.set(skey, idx);
      $('#count').textContent = (idx + 1) + ' / ' + S.length;
      $('#progBar').style.width = ((idx + 1) / S.length * 100) + '%';
      $('#prev').disabled = idx === 0; $('#next').disabled = idx === S.length - 1;
      slide.className = 'slide k-' + s.k;
      var h = '';
      if (s.k === 'cover') h = '<div class="s-cover"><span class="s-emo">' + L.icon + '</span><p class="s-eye">Day ' + L.id + '</p><h2>' + L.theme + '</h2><p class="s-sub">' + L.ko + ' · ' + esc(L.goal) + '</p>' +
        '<ol class="s-plan"><li><b>1</b> 낱말 10개</li><li><b>2</b> 문장 4개</li><li><b>3</b> ' + GAMES[L.game].name + '</li></ol></div>';
      if (s.k === 'sec') h = '<div class="s-sec"><span class="s-emo">' + s.emo + '</span><h2>' + s.t + '</h2><p class="s-sub">' + s.ko + '</p></div>';
      if (s.k === 'word') {
        var w = L.words[s.i];
        h = '<div class="s-word"><div class="s-pic">' + ART.pic(w.pic) + '</div><div class="s-txt"><p class="s-num">' + (s.i + 1) + ' / 10</p>' +
          '<p class="s-en" id="sEn">' + w.en.split('').map(function (c) { return '<span>' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('') + '</p>' + ko(w.ko) +
          '<div class="row"><button class="btn primary" id="say">🔊 듣기 <span class="kbd">S</span></button><button class="btn" id="spell">🔤 철자</button></div>' + repDots('w' + s.i) + '</div></div>';
      }
      if (s.k === 'quiz') h = '<div class="s-quiz"><h2>What’s this?</h2><p class="s-sub">그림을 누르면 낱말이 나와요</p><div class="q-grid">' + L.words.map(function (w, i) {
        return '<button class="q-card" data-i="' + i + '">' + ART.pic(w.pic) + '<span class="q-w">' + esc(w.en) + '</span></button>'; }).join('') + '</div></div>';
      if (s.k === 'sent') {
        var x = L.sentences[s.i];
        h = '<div class="s-word s-sent"><div class="s-pic">' + ART.pic(x.pic) + '</div><div class="s-txt"><p class="s-num">문장 ' + (s.i + 1) + ' / 4</p>' +
          '<p class="s-en sent" id="sEn">' + x.en.split(' ').map(function (t) { return '<span>' + esc(t) + '</span>'; }).join(' ') + '</p>' + ko(x.ko) +
          '<div class="row"><button class="btn primary" id="say">🔊 듣기 <span class="kbd">S</span></button></div>' + repDots('s' + s.i) + '</div></div>';
      }
      if (s.k === 'talk') h = '<div class="s-talk"><h2>Let’s talk!</h2><p class="s-sub">짝과 A, B 역할을 나눠 말해요 · 말풍선을 누르면 들려줘요</p><div class="talk">' + L.sentences.map(function (x, i) {
        return '<button class="bub ' + x.who + '" data-i="' + i + '"><span class="who-av">' + (x.who === 'A' ? '🧒' : '👧') + '<b>' + x.who + '</b></span><span class="bub-t">' + esc(x.en) + ko(x.ko) + '</span></button>'; }).join('') + '</div></div>';
      if (s.k === 'game') { var G = GAMES[L.game]; h = '<div class="s-cover"><span class="s-emo">' + G.icon + '</span><p class="s-eye">정리 게임</p><h2>' + G.name + '</h2><p class="s-sub">' + G.how + '</p>' +
        '<div class="row center"><button class="btn primary big" id="demo">칠판에서 함께 해 보기</button></div><p class="s-note">학생들은 각자 기기에서 <b>Day ' + L.id + ' → ③ ' + G.name + '</b> 을 해요.</p></div>'; }
      if (s.k === 'wrap') h = '<div class="s-wrap"><h2>Today I learned</h2><div class="chips">' + L.words.map(function (w) { return '<button class="chip big" data-say="' + esc(w.en) + '">' + esc(w.en) + '</button>'; }).join('') + '</div>' +
        '<ul class="wrap-s">' + L.sentences.map(function (x) { return '<li><button class="linkish" data-say="' + esc(x.en) + '">🔊 ' + esc(x.en) + '</button></li>'; }).join('') + '</ul><p class="s-big">Good job! 👏</p></div>';
      slide.innerHTML = h;
      bind(s);
    }
    function say() {
      var s = S[idx];
      if (s.k !== 'word' && s.k !== 'sent') return;
      var t = s.k === 'word' ? L.words[s.i].en : L.sentences[s.i].en, key = s.k[0] + s.i;
      speakEl(t, s.k === 'sent' ? $$('#sEn span', slide) : null);
      reps[key] = Math.min(3, (reps[key] || 0) + 1);
      var r = $('.reps', slide); if (r) r.outerHTML = repDots(key);
    }
    function bind(s) {
      var b = $('#say', slide); if (b) b.onclick = say;
      var sp = $('#spell', slide);
      if (sp) sp.onclick = function () {
        var w = L.words[s.i].en, spans = $$('#sEn span', slide), letters = [];
        w.split('').forEach(function (c, i) { if (c !== ' ') letters.push(i); });
        var k = 0;
        (function one() {
          spans.forEach(function (x) { x.classList.remove('lit'); });
          if (k >= letters.length || S[idx] !== s) { if (S[idx] === s) Voice.say(w); return; }
          spans[letters[k]].classList.add('lit');
          Voice.say(w[letters[k]], { rate: .8, onend: function () { k++; setTimeout(one, 120); } });
        })();
      };
      $$('.q-card', slide).forEach(function (c) { c.onclick = function () { c.classList.add('open'); Voice.say(L.words[+c.dataset.i].en); }; });
      $$('.bub', slide).forEach(function (c) { c.onclick = function () { Voice.say(L.sentences[+c.dataset.i].en); }; });
      $$('[data-say]', slide).forEach(function (c) { c.onclick = function () { Voice.say(c.dataset.say); }; });
      var d = $('#demo', slide);
      if (d) d.onclick = function () {
        var o = $('#gameOver'); o.hidden = false; o.innerHTML = '<button class="btn small close" id="closeG">닫기 ✕</button><div id="demoGame"></div>';
        Games.start($('#demoGame'), L, function () { });
        $('#closeG').onclick = function () { Cleanup.run(); bindKeys(); o.hidden = true; o.innerHTML = ''; };
      };
      if ((s.k === 'word' || s.k === 'sent') && store.get('fe-auto', true)) setTimeout(function () { if (S[idx] === s) say(); }, 450);
    }
    function go(d) { var n = Math.max(0, Math.min(S.length - 1, idx + d)); if (n !== idx) { idx = n; Voice.stop(); draw(); } }
    $('#prev').onclick = function () { go(-1); };
    $('#next').onclick = function () { go(1); };
    $('#ko').onclick = function () { showKo = !showKo; store.set('fe-ko', showKo); this.setAttribute('aria-pressed', showKo); $$('.s-ko', slide).forEach(function (e) { e.classList.toggle('hide', !showKo); }); };
    $('#slow2').onclick = function () { var v = !store.get('fe-slow', false); store.set('fe-slow', v); this.setAttribute('aria-pressed', v); };
    function fs() { var w = $('#deckWrap'); if (!document.fullscreenElement) { if (w.requestFullscreen) w.requestFullscreen().catch(function () { }); } else document.exitFullscreen(); }
    $('#fs').onclick = fs;
    function onKey(e) {
      if (!$('#gameOver') || !$('#gameOver').hidden || e.target.closest('input,textarea')) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(1); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(-1); }
      else if (k === 's' || k === 'S') say();
      else if (k === 'k' || k === 'K') $('#ko').click();
      else if (k === 'f' || k === 'F') fs();
      else if (k === 'Home') { idx = 0; draw(); } else if (k === 'End') { idx = S.length - 1; draw(); }
    }
    function bindKeys() { document.addEventListener('keydown', onKey); Cleanup.add(function () { document.removeEventListener('keydown', onKey); }); }
    bindKeys();
    draw();
  }

  /* ---------- 학습 결과: 표와 그래프 ---------- */
  var MAXW = 20, MAXS = 8; // 낱말 10개 × (말하기+쓰기), 문장 4개 × (말하기+쓰기)
  function aggregate(rows) {
    var by = {};
    rows.forEach(function (r) {
      var n = String(r.name || '').trim(), id = +r.lesson; if (!n || !id) return;
      var s = by[n] = by[n] || { name: n, d: {}, last: '' };
      var d = s.d[id] = s.d[id] || { ws: 0, wt: 0, ss: 0, st: 0, game: null, plays: 0, gstars: 0 };
      if (r.part === 'words') { d.ws = Math.max(d.ws, +r.said || 0); d.wt = Math.max(d.wt, +r.wrote || 0); }
      if (r.part === 'sentences') { d.ss = Math.max(d.ss, +r.said || 0); d.st = Math.max(d.st, +r.wrote || 0); }
      if (r.part === 'game') { d.game = Math.max(d.game || 0, +r.score || 0); d.plays++; d.gstars = Math.max(d.gstars, +r.stars || 0); }
      var t = String(r.time || ''); if (t > s.last) s.last = t;
    });
    Object.keys(by).forEach(function (n) { Object.keys(by[n].d).forEach(function (id) { var d = by[n].d[id]; d.pct = Math.round(((d.ws + d.wt + d.ss + d.st) / (MAXW + MAXS)) * 80 + (d.plays ? 20 : 0)); }); });
    return Object.keys(by).sort(function (a, b) { return a.localeCompare(b, 'ko'); }).map(function (n) { return by[n]; });
  }
  var RAMP = ['#EEF2FA', '#C9D5EE', '#93AADB', '#5878BE', '#2B4789'];
  function rampOf(p) { return p == null ? null : RAMP[p >= 90 ? 4 : p >= 70 ? 3 : p >= 45 ? 2 : p >= 20 ? 1 : 0]; }

  function barChart(title, sub, data, max, unit) {
    // data: [{label, value|null, note}]
    var W = 520, H = 230, L0 = 40, B = 190, top = 24, bw = 46, gap = (W - L0 - 12 - bw * data.length) / (data.length);
    var y = function (v) { return B - (v / max) * (B - top); };
    var grid = [0, .25, .5, .75, 1].map(function (f) { var v = Math.round(max * f), yy = y(v); return '<line x1="' + L0 + '" x2="' + (W - 8) + '" y1="' + yy + '" y2="' + yy + '" class="grid"/><text x="' + (L0 - 8) + '" y="' + (yy + 4) + '" class="ax" text-anchor="end">' + v + '</text>'; }).join('');
    var bars = data.map(function (d, i) {
      var x = L0 + gap / 2 + i * (bw + gap), has = d.value != null, v = has ? d.value : 0, yy = y(v), hgt = B - yy, r = Math.min(4, hgt);
      var path = hgt > 0 ? 'M' + x + ',' + B + ' V' + (yy + r) + ' Q' + x + ',' + yy + ' ' + (x + r) + ',' + yy + ' H' + (x + bw - r) + ' Q' + (x + bw) + ',' + yy + ' ' + (x + bw) + ',' + (yy + r) + ' V' + B + ' Z' : '';
      return '<g class="bar-g" tabindex="0" data-tip="' + esc(d.label + ' · ' + (has ? v + unit : '기록 없음') + (d.note ? ' · ' + d.note : '')) + '">' +
        '<rect x="' + (x - gap / 2 + 2) + '" y="' + top + '" width="' + (bw + gap - 4) + '" height="' + (B - top + 24) + '" fill="transparent"/>' +
        (path ? '<path d="' + path + '" class="bar-fill"/>' : '') +
        '<text x="' + (x + bw / 2) + '" y="' + (has ? yy - 7 : B - 7) + '" class="val" text-anchor="middle">' + (has ? v + unit : '–') + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (B + 18) + '" class="ax" text-anchor="middle">' + esc(d.label) + '</text></g>';
    }).join('');
    return '<figure class="chart"><figcaption><b>' + title + '</b><span class="muted">' + sub + '</span></figcaption>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(title) + '">' + grid + '<line x1="' + L0 + '" x2="' + (W - 8) + '" y1="' + B + '" y2="' + B + '" class="base"/>' + bars + '</svg></figure>';
  }

  function results(view) {
    var key = store.get('fe-key', ''), hasSheet = !!Sync.url();
    view.innerHTML = tabs('#t/rec') +
      '<section class="rec-head"><div><h1>학습 결과</h1><p class="muted" id="src"></p></div><div class="row">' +
      (hasSheet ? '<form id="keyForm" class="key-form"><label for="key" class="sr">교사 암호</label><input id="key" type="password" placeholder="교사 암호" value="' + esc(key) + '" autocomplete="off"><button class="btn primary small">불러오기</button></form>' : '') +
      '<button class="btn small" id="csv">CSV 내려받기</button></div></section><div id="recBody"><p class="muted">불러오는 중…</p></div>';
    var rows = [];
    function show(src) {
      $('#src').textContent = src;
      var studs = aggregate(rows), body = $('#recBody');
      if (!studs.length) { body.innerHTML = '<div class="empty"><span>📭</span><p>아직 기록이 없어요. 학생이 낱말·문장 단계를 마치거나 게임을 끝내면 기록이 쌓여요.</p></div>'; return; }
      var per = LESSONS.map(function (L) {
        var ds = studs.map(function (s) { return s.d[L.id]; }).filter(Boolean), gs = ds.filter(function (d) { return d.game != null; });
        return { L: L, n: ds.length, pct: ds.length ? Math.round(ds.reduce(function (a, d) { return a + d.pct; }, 0) / ds.length) : null, game: gs.length ? Math.round(gs.reduce(function (a, d) { return a + d.game; }, 0) / gs.length) : null, gn: gs.length };
      });
      var allD = []; studs.forEach(function (s) { Object.keys(s.d).forEach(function (k) { allD.push(s.d[k]); }); });
      var done = allD.filter(function (d) { return d.pct >= 100; }).length, plays = allD.reduce(function (a, d) { return a + d.plays; }, 0);
      var avg = Math.round(studs.reduce(function (a, s) { return a + LESSONS.reduce(function (b, L) { return b + (s.d[L.id] ? s.d[L.id].pct : 0); }, 0) / LESSONS.length; }, 0) / studs.length);
      body.innerHTML =
        '<div class="tiles"><div class="stat"><span>학생</span><b>' + studs.length + '<small>명</small></b></div>' +
        '<div class="stat"><span>전체 평균 진도율</span><b>' + avg + '<small>%</small></b></div>' +
        '<div class="stat"><span>마친 회차 (100%)</span><b>' + done + '<small>개</small></b></div>' +
        '<div class="stat"><span>게임 한 횟수</span><b>' + plays + '<small>번</small></b></div></div>' +
        '<div class="charts">' +
        barChart('회차별 평균 진도율', '기록이 있는 학생 기준 · 낱말·문장 80% + 게임 20%', per.map(function (p) { return { label: 'Day ' + p.L.id, value: p.pct, note: p.L.ko + ' · ' + p.n + '명' }; }), 100, '%') +
        barChart('회차별 게임 평균 점수', '가장 높은 점수의 평균 · 100점 만점', per.map(function (p) { return { label: 'Day ' + p.L.id, value: p.game, note: GAMES[p.L.game].name + ' · ' + p.gn + '명' }; }), 100, '점') +
        '</div>' +
        '<section class="card"><div class="sec-h"><h2>학생별 진도율</h2><div class="legend" aria-label="색 범례">' + ['0–19', '20–44', '45–69', '70–89', '90–100'].map(function (t, i) { return '<span><i style="background:' + RAMP[i] + '"></i>' + t + '%</span>'; }).join('') + '<span><i class="none"></i>기록 없음</span></div></div>' +
        '<div class="tbl-wrap"><table class="heat"><thead><tr><th scope="col">이름</th>' + LESSONS.map(function (L) { return '<th scope="col">Day ' + L.id + '<small>' + L.ko + '</small></th>'; }).join('') + '<th scope="col">평균<small>5회차 전체</small></th></tr></thead><tbody>' +
        studs.map(function (s) {
          var tot = LESSONS.reduce(function (a, L) { return a + (s.d[L.id] ? s.d[L.id].pct : 0); }, 0) / LESSONS.length;
          return '<tr><th scope="row">' + esc(s.name) + '</th>' + LESSONS.map(function (L) {
            var d = s.d[L.id]; if (!d) return '<td class="cell none" data-tip="' + esc(s.name + ' · Day ' + L.id + ' · 기록 없음') + '">–</td>';
            return '<td class="cell' + (d.pct >= 70 ? ' dk' : '') + '" style="background:' + rampOf(d.pct) + '" tabindex="0" data-tip="' + esc(s.name + ' · Day ' + L.id + ' · 낱말 말하기 ' + d.ws + '/10, 쓰기 ' + d.wt + '/10 · 문장 말하기 ' + d.ss + '/4, 쓰기 ' + d.st + '/4 · 게임 ' + (d.game == null ? '안 함' : d.game + '점')) + '">' + d.pct + '%</td>';
          }).join('') + '<td class="avg">' + Math.round(tot) + '%</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<section class="card"><div class="sec-h"><h2>자세한 기록</h2><label class="sel">회차 <select id="dayPick">' + LESSONS.map(function (L) { return '<option value="' + L.id + '">Day ' + L.id + ' ' + L.ko + '</option>'; }).join('') + '</select></label></div><div class="tbl-wrap" id="detail"></div></section>' +
        '<div class="tip" id="tip" role="tooltip" hidden></div>';
      function detail(id) {
        $('#detail').innerHTML = '<table class="tbl"><thead><tr><th scope="col">이름</th><th scope="col">낱말 말하기</th><th scope="col">낱말 쓰기</th><th scope="col">문장 말하기</th><th scope="col">문장 쓰기</th><th scope="col">게임 최고 점수</th><th scope="col">게임 횟수</th><th scope="col">진도율</th></tr></thead><tbody>' +
          studs.map(function (s) {
            var d = s.d[id];
            if (!d) return '<tr class="dim"><th scope="row">' + esc(s.name) + '</th><td colspan="7">기록 없음</td></tr>';
            function m(v, t) { return '<td><span class="mini"><i style="width:' + (v / t * 100) + '%"></i></span>' + v + '/' + t + '</td>'; }
            return '<tr><th scope="row">' + esc(s.name) + '</th>' + m(d.ws, 10) + m(d.wt, 10) + m(d.ss, 4) + m(d.st, 4) + '<td>' + (d.game == null ? '–' : d.game + '점 ' + stars(d.gstars)) + '</td><td>' + d.plays + '</td><td><b>' + d.pct + '%</b></td></tr>';
          }).join('') + '</tbody></table>';
      }
      var dp = $('#dayPick'); dp.value = store.get('fe-recday', 1); dp.onchange = function () { store.set('fe-recday', +dp.value); detail(+dp.value); }; detail(+dp.value);
      var tip = $('#tip');
      function showTip(el) { var t = el.getAttribute('data-tip'); if (!t) return; tip.textContent = t; tip.hidden = false; var r = el.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px'; tip.style.top = (r.top + scrollY - tip.offsetHeight - 8) + 'px'; }
      $$('[data-tip]', body).forEach(function (el) { el.addEventListener('mouseenter', function () { showTip(el); }); el.addEventListener('focus', function () { showTip(el); }); el.addEventListener('mouseleave', function () { tip.hidden = true; }); el.addEventListener('blur', function () { tip.hidden = true; }); });
    }
    function local() { rows = store.get('fe-log', []); show('이 기기에 저장된 기록만 보여요' + (hasSheet ? '. 암호를 넣고 불러오기를 누르면 구글 시트의 반 전체 기록이 나와요.' : '. 설정에서 구글 시트를 연결하면 반 전체 기록을 볼 수 있어요.')); }
    function load() {
      key = $('#key').value.trim(); store.set('fe-key', key);
      if (!key) return local();
      $('#src').textContent = '구글 시트에서 불러오는 중…';
      Sync.get({ action: 'list', key: key }).then(function (d) {
        if (!d || !d.ok) { toast(d && d.error === 'key' ? '교사 암호가 맞지 않아요' : '불러오지 못했어요'); return local(); }
        rows = d.rows; show('구글 시트 · 기록 ' + rows.length + '줄 · ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준');
      }).catch(function () { toast('구글 시트에 연결하지 못했어요'); local(); });
    }
    if (hasSheet) { $('#keyForm').onsubmit = function (e) { e.preventDefault(); load(); }; if (key) load(); else local(); } else local();
    $('#csv').onclick = function () {
      var head = ['시각', '이름', '회차', '테마', '활동', '말하기', '쓰기', '전체', '점수', '별'];
      var lines = [head.join(',')].concat(rows.map(function (r) { return [r.time, r.name, r.lesson, r.theme, { words: '낱말', sentences: '문장', game: '게임' }[r.part] || r.part, r.said, r.wrote, r.total, r.score, r.stars].map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }));
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' })); a.download = '영어첫걸음_기록.csv'; a.click();
    };
  }

  /* ---------- 설정 ---------- */
  function settings(view) {
    var u = Sync.url(), base = location.origin + location.pathname, link = base + '#s';
    view.innerHTML = tabs('#t/set') +
      '<section class="card set"><h2>학생에게 알려 줄 주소</h2><p class="muted">학생은 이 주소로 들어와 이름만 쓰면 돼요.</p><div class="link-row"><input id="lnk" readonly value="' + esc(link) + '"><button class="btn small" id="copy">복사</button></div><div id="qr" class="qr"></div></section>' +
      '<section class="card set"><h2>구글 시트 기록 연결 ' + (u ? '<span class="ok-tag">✓ 연결됨</span>' : '<span class="warn-tag">연결 안 됨</span>') + '</h2>' +
      (u ? '<p class="muted mono">' + esc(u) + '</p>' : '<p>지금은 기록이 각 기기에만 저장돼요. 반 전체 기록을 모으려면 아래 순서대로 한 번만 설정해요.</p>') +
      '<ol class="howto"><li>구글 드라이브에서 새 <b>구글 시트</b>를 만들어요.</li><li>메뉴 <b>확장 프로그램 → Apps Script</b> 를 열고, 저장소의 <code>apps-script/Code.gs</code> 내용을 모두 붙여 넣어요.</li>' +
      '<li>맨 위 <code>TEACHER_KEY</code> 의 암호를 선생님만 아는 말로 바꾸고 저장해요.</li><li><b>배포 → 새 배포 → 웹 앱</b>, 실행: <b>나</b>, 액세스: <b>모든 사용자</b> 로 배포하고 권한을 허용해요.</li>' +
      '<li>받은 웹 앱 주소를 <code>js/config.js</code> 의 <code>SHEET_URL</code> 에 넣어요. (이 기기에서만 먼저 써 보려면 아래 칸에 넣어도 돼요.)</li></ol>' +
      '<form class="link-row" id="urlForm"><label class="sr" for="url">웹 앱 주소</label><input id="url" placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(store.get('fe-sheet', '')) + '"><button class="btn small primary">이 기기에 저장</button><button type="button" class="btn small" id="test">연결 확인</button></form><p id="testMsg" class="muted"></p></section>' +
      '<section class="card set"><h2>수업 화면</h2><label class="check"><input type="checkbox" id="auto"' + (store.get('fe-auto', true) ? ' checked' : '') + '> 낱말·문장 슬라이드를 열면 바로 읽어 주기</label>' +
      '<p class="muted">보내지 못한 기록: ' + Sync.pending() + '개 (인터넷이 연결되면 자동으로 보내요)</p></section>';
    $('#copy').onclick = function () { $('#lnk').select(); (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { toast('주소를 복사했어요'); }, function () { document.execCommand('copy'); toast('주소를 복사했어요'); }); };
    if (window.QRCode) try { new QRCode($('#qr'), { text: link, width: 168, height: 168, colorDark: '#1A1C21', colorLight: '#ffffff' }); } catch (e) { }
    $('#urlForm').onsubmit = function (e) {
      e.preventDefault(); var v = $('#url').value.trim();
      if (v && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(v)) { toast('웹 앱 주소 모양이 아니에요 (…/exec 로 끝나요)'); return; }
      store.set('fe-sheet', v); toast(v ? '이 기기에 저장했어요' : '지웠어요'); settings(view);
    };
    $('#test').onclick = function () {
      $('#testMsg').textContent = '확인 중…';
      Sync.get({ action: 'ping' }).then(function (d) { $('#testMsg').textContent = d && d.ok ? '✓ 구글 시트와 연결됐어요' : '응답이 이상해요. 배포 설정을 확인해 주세요.'; }).catch(function () { $('#testMsg').textContent = '연결하지 못했어요. 주소와 "모든 사용자" 액세스를 확인해 주세요.'; });
    };
    $('#auto').onchange = function () { store.set('fe-auto', this.checked); };
  }

  function route(view, parts) {
    if (parts[0] === 'rec') return results(view);
    if (parts[0] === 'set') return settings(view);
    var L = parts[0] && lessonById(parts[0]);
    if (L) return deck(view, L);
    home(view);
  }
  return { route: route };
})();
