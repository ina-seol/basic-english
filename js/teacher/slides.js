/* 교사: 수업 슬라이드 (PPT처럼 띄워 놓고 지도) — v1 그대로 */
var TeacherSlides = (function () {
  function tabs(cur) {
    return '<nav class="tabs" aria-label="교사 메뉴">' + [['#t', '수업하기'], ['#t/dash', '대시보드'], ['#t/export', '내보내기'], ['#t/set', '설정']].map(function (t) {
      return '<a class="tab' + (t[0] === cur ? ' on' : '') + '" href="' + t[0] + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + t[1] + '</a>';
    }).join('') + '</nav>';
  }

  function home(view) {
    view.innerHTML = tabs('#t') +
      '<section class="hello"><div><p class="eyebrow">선생님 화면</p><h1>오늘은 어떤 수업을 할까요?</h1><p class="muted">회차를 고르면 칠판 화면에 띄울 수 있는 슬라이드가 열려요. 방향키로 넘기고 <span class="kbd">F</span> 로 전체 화면.</p></div></section>' +
      '<div class="days">' + LESSONS.map(function (L) {
        return '<a class="day" href="#t/' + L.id + '" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"><span class="day-ill"><b>Day ' + L.id + '</b><span class="day-emo">' + L.icon + '</span></span>' +
          '<span class="day-body"><span class="day-t">' + L.theme + ' <small>' + L.ko + '</small></span><span class="day-sub">' + L.words.slice(0, 5).map(function (w) { return esc(w.en); }).join(' · ') + ' …</span>' +
          '<span class="day-steps"><span class="pill">낱말 10</span><span class="pill">문장 4</span><span class="pill">바꿔 말하기</span><span class="pill">' + GAMES[L.game].icon + ' ' + GAMES[L.game].name + '</span></span></span></a>';
      }).join('') + '</div>';
  }

  /* ---------- 수업 슬라이드 ---------- */
  function slidesOf(L) {
    var s = [{ k: 'cover' }, { k: 'sec', t: 'Words', ko: '낱말 익히기', emo: '🔤' }];
    L.words.forEach(function (w, i) { s.push({ k: 'word', i: i }); });
    s.push({ k: 'quiz' }, { k: 'sec', t: 'Sentences', ko: '문장 익히기', emo: '💬' });
    L.sentences.forEach(function (x, i) { s.push({ k: 'sent', i: i }); });
    s.push({ k: 'talk' }, { k: 'sec', t: 'Change & Say', ko: '바꿔 말하기', emo: '🔁' }, { k: 'drill' }, { k: 'game' }, { k: 'wrap' });
    return s;
  }
  function deck(view, L) {
    var S = slidesOf(L), skey = 'fe-slide-' + L.id, idx = Math.min(store.get(skey, 0), S.length - 1), showKo = store.get('fe-ko', true), reps = {};
    view.innerHTML =
      '<div class="deck-wrap" id="deckWrap" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '">' +
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
        '<ol class="s-plan"><li><b>1</b> 낱말 10개</li><li><b>2</b> 문장 4개</li><li><b>3</b> 바꿔 말하기</li><li><b>4</b> ' + GAMES[L.game].name + '</li></ol></div>';
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
      if (s.k === 'drill') {
        var dp = L.drill.en.split('{w}');
        h = '<div class="s-drill"><h2>Change &amp; Say</h2><p class="s-sub">그림을 누르면 빈칸에 낱말이 들어가고 문장을 읽어 줘요</p>' +
          '<p class="s-en sent dr-sent">' + esc(dp[0]) + '<span class="slot" id="dSlot">＿＿</span>' + esc(dp[1] || '') + '</p>' + ko(L.drill.ko.replace(/\{k(?::[^}]+)?\}/g, '＿＿')).replace('class="s-ko', 'id="dKo" class="s-ko') +
          '<div class="dr-grid">' + drillItems(L).map(function (it, i) { return '<button class="dr-card" data-i="' + i + '">' + ART.pic(it.pic) + '<span>' + esc(it.slot) + '</span></button>'; }).join('') + '</div></div>';
      }
      if (s.k === 'game') { var G = GAMES[L.game]; h = '<div class="s-cover"><span class="s-emo">' + G.icon + '</span><p class="s-eye">정리 게임</p><h2>' + G.name + '</h2><p class="s-sub">' + G.how + '</p>' +
        '<div class="row center"><button class="btn primary big" id="demo">칠판에서 함께 해 보기</button></div><p class="s-note">학생들은 각자 기기에서 <b>Day ' + L.id + ' → ④ ' + G.name + '</b> 을 해요.</p></div>'; }
      if (s.k === 'wrap') h = '<div class="s-wrap"><h2>Today I learned</h2><div class="chips">' + L.words.map(function (w) { return '<button class="chip big" data-say="' + esc(w.en) + '">' + esc(w.en) + '</button>'; }).join('') + '</div>' +
        '<ul class="wrap-s">' + L.sentences.map(function (x) { return '<li><button class="linkish" data-say="' + esc(x.en) + '">🔊 ' + esc(x.en) + '</button></li>'; }).join('') + '<li><button class="linkish" data-say="' + esc(drillItems(L)[0].en) + '">🔁 ' + esc(L.drill.en.replace('{w}', '___')) + '</button></li></ul><p class="s-big">Good job! 👏</p></div>';
      if (/cover|sec|game|wrap/.test(s.k)) h = ART.pattern(1600, 900, 3 + idx, { step: 120, scale: 1.6, skip: function (x, y) { return x > 260 && x < 1340 && y > 140 && y < 760; } }) + h;
      slide.innerHTML = h + '<span class="pg" aria-hidden="true">' + (idx + 1) + '</span>';
      bind(s);
    }
    var drillCur = null;
    function say() {
      var s = S[idx];
      if (s.k === 'drill' && drillCur) return Voice.say(drillCur.en);
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
      drillCur = null;
      $$('.dr-card', slide).forEach(function (c) {
        c.onclick = function () {
          var it = drillItems(L)[+c.dataset.i]; drillCur = it;
          $$('.dr-card', slide).forEach(function (x) { x.classList.toggle('on', x === c); });
          var sl = $('#dSlot', slide); sl.textContent = it.slot; sl.classList.add('on');
          $('#dKo', slide).textContent = it.ko; Voice.say(it.en);
        };
      });
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

  return { tabs: tabs, home: home, deck: deck };
})();
