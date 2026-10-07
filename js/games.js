/* 정리 게임 6종: 회차마다 하나씩. Games.start(host, lesson, onDone) */
var Games = (function () {
  function head(host, L, label) {
    host.innerHTML = '<div class="game g-' + L.game + '" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"><div class="hud">' + label + '</div><div class="stage"></div></div>';
    return { hud: $('.hud', host), stage: $('.stage', host), root: $('.game', host) };
  }
  function intro(host, L, go) {
    var G = GAMES[L.game];
    host.innerHTML = '<section class="panel result" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + G.icon + '</span></div><h1>' + G.name + '</h1><p class="lead">' + G.how + '</p>' +
      '<div class="row center"><button class="btn primary big" id="play">시작!</button></div></section>';
    $('#play').onclick = function () { Sound.tap(); go(); };
  }
  function result(host, L, res, onDone, again) {
    onDone(res);
    if (res.stars >= 2) { Sound.win(); confetti(); }
    host.innerHTML = '<section class="panel result" style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"><div class="result-emo">' + ART.burst('#FFF2CC') + '<span>' + (res.stars >= 3 ? '🏆' : res.stars === 2 ? '🎉' : '👍') + '</span></div>' +
      '<h1>' + (res.stars >= 3 ? '최고예요!' : res.stars === 2 ? '잘했어요!' : '좋아요, 한 번 더!') + '</h1>' + stars(res.stars) +
      '<p class="big-n"><b>' + res.score + '</b>점</p><p class="muted">' + esc(res.note || '') + '</p>' +
      '<div class="row center"><button class="btn" id="again">다시 하기</button>' + (location.hash.indexOf('#t') === 0 ? '' : '<a class="btn primary" href="#s">회차 목록</a>') + '</div></section>';
    $('#again').onclick = again;
  }
  function later(f, ms) { var t = setTimeout(f, ms); Cleanup.add(function () { clearTimeout(t); }); return t; }
  function every(f, ms) { var t = setInterval(f, ms); Cleanup.add(function () { clearInterval(t); }); return t; }

  /* 짝꿍 카드: 그림 ↔ 낱말 */
  function memory(host, L, onDone) {
    var pick = shuffle(L.words).slice(0, 8), cards = [], open = [], moves = 0, found = 0, lock = false;
    pick.forEach(function (w, i) { cards.push({ k: i, face: ART.pic(w.pic), w: w }); cards.push({ k: i, face: '<span class="mem-word">' + esc(w.en) + '</span>', w: w }); });
    cards = shuffle(cards);
    var g = head(host, L, '<span>짝 찾기 <b id="found">0</b>/8</span><span>뒤집은 횟수 <b id="moves">0</b></span>');
    g.stage.innerHTML = '<div class="mem-grid">' + cards.map(function (c, i) {
      return '<button class="mem" data-i="' + i + '" aria-label="카드 ' + (i + 1) + '"><span class="mem-in"><span class="mem-back">?</span><span class="mem-front">' + c.face + '</span></span></button>';
    }).join('') + '</div>';
    $$('.mem', g.stage).forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.i, c = cards[i];
        if (lock || b.classList.contains('flip')) return;
        b.classList.add('flip'); Sound.tap(); open.push(i);
        if (open.length < 2) return;
        moves++; $('#moves').textContent = moves;
        var a = cards[open[0]], bb = cards[open[1]], els = open.map(function (k) { return $('.mem[data-i="' + k + '"]', g.stage); });
        open = [];
        if (a.k === bb.k) {
          found++; $('#found').textContent = found; Sound.good(); Voice.say(a.w.en);
          els.forEach(function (e) { e.classList.add('got'); e.disabled = true; });
          if (found === 8) later(function () {
            var st = moves <= 13 ? 3 : moves <= 19 ? 2 : 1;
            result(host, L, { score: Math.max(20, 100 - Math.max(0, moves - 8) * 4), stars: st, total: 8, note: moves + '번 만에 8쌍을 모두 찾았어요.' }, onDone, function () { memory(host, L, onDone); });
          }, 900);
        } else { lock = true; later(function () { els.forEach(function (e) { e.classList.remove('flip'); }); lock = false; }, 900); }
      };
    });
  }

  /* 두더지 잡기: 들려준 낱말의 그림만 잡기 */
  function mole(host, L, onDone) {
    var T = 50, left = T, hits = 0, pts = 0, miss = 0, target = null, holes = [], over = false;
    var g = head(host, L, '<button class="btn small" id="again2">🔊 다시 듣기</button><span class="tgt" id="tgt"></span><span>⏱ <b id="time">' + T + '</b></span><span>잡은 수 <b id="hits">0</b></span>');
    g.stage.innerHTML = '<div class="mole-grid">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<div class="hole"><button class="mole" data-h="' + i + '" tabindex="-1"><span class="mole-body"></span><span class="mole-sign"></span></button></div>'; }).join('') + '</div>';
    holes = $$('.mole', g.stage);
    function newTarget() { var t; do { t = L.words[Math.floor(Math.random() * L.words.length)]; } while (target && t === target); target = t; $('#tgt').innerHTML = '🎯 <b>' + esc(t.en) + '</b>'; Voice.say(t.en); }
    $('#again2').onclick = function () { if (target) Voice.say(target.en); };
    function pop() {
      if (over) return;
      var free = holes.filter(function (h) { return !h.classList.contains('up'); });
      if (!free.length) return;
      var h = free[Math.floor(Math.random() * free.length)];
      var showT = !holes.some(function (x) { return x.classList.contains('up') && x._w === target; }) && Math.random() < .55;
      var w = showT ? target : shuffle(L.words.filter(function (x) { return x !== target; }))[0];
      h._w = w; $('.mole-sign', h).innerHTML = ART.pic(w.pic); h.setAttribute('aria-label', w.en);
      h.classList.remove('hit', 'no'); h.classList.add('up'); h.tabIndex = 0;
      clearTimeout(h._t); h._t = setTimeout(function () { h.classList.remove('up'); h.tabIndex = -1; }, 1700 - Math.min(600, hits * 30));
    }
    holes.forEach(function (h) {
      h.onclick = function () {
        if (!h.classList.contains('up') || over) return;
        clearTimeout(h._t);
        if (h._w === target) { hits++; pts += 10; Sound.pop(); h.classList.add('hit'); $('#hits').textContent = hits; later(function () { h.classList.remove('up'); }, 260); later(newTarget, 300); }
        else { miss++; pts = Math.max(0, pts - 3); Sound.bad(); h.classList.add('no'); later(function () { h.classList.remove('up'); }, 300); }
      };
    });
    Cleanup.add(function () { holes.forEach(function (h) { clearTimeout(h._t); }); });
    newTarget();
    every(function () { pop(); if (Math.random() < .5) pop(); }, 900);
    var tick = every(function () {
      left--; $('#time').textContent = left;
      if (left <= 0) {
        over = true; clearInterval(tick);
        result(host, L, { score: pts, stars: hits >= 12 ? 3 : hits >= 8 ? 2 : 1, total: hits, note: '두더지 ' + hits + '마리를 잡았어요. 틀린 두더지 ' + miss + '번.' }, onDone, function () { Cleanup.run(); mole(host, L, onDone); });
      }
    }, 1000);
  }

  /* 풍선 팡팡: 그림에 맞는 낱말 풍선 */
  function balloon(host, L, onDone) {
    var rounds = shuffle(L.words).slice(0, 10), r = 0, good = 0, first = true, busy = false;
    var g = head(host, L, '<span>문제 <b id="rn">1</b>/10</span><span>맞힌 수 <b id="ok">0</b></span>');
    var cols = ['#E36D98', '#E7C33A', '#10B183', '#2B8AC9'];
    function next() {
      if (r >= rounds.length) return result(host, L, { score: good * 10, stars: good >= 9 ? 3 : good >= 7 ? 2 : 1, total: 10, note: '10문제 중 ' + good + '문제를 한 번에 맞혔어요.' }, onDone, function () { Cleanup.run(); balloon(host, L, onDone); });
      var w = rounds[r], opts = shuffle([w].concat(shuffle(L.words.filter(function (x) { return x !== w; })).slice(0, 3)));
      first = true; busy = false; $('#rn').textContent = r + 1;
      g.stage.innerHTML = '<div class="sky"><div class="clue">' + ART.pic(w.pic) + '<span>' + esc(w.ko) + '</span></div>' + opts.map(function (o, i) {
        return '<button class="bal" style="--bc:' + cols[i] + ';left:' + (6 + i * 23.5) + '%;animation-duration:' + (7 + Math.random() * 2.5) + 's;animation-delay:' + (i * .25) + 's" data-ok="' + (o === w ? 1 : 0) + '">' + esc(o.en) + '<i></i></button>';
      }).join('') + '</div>';
      $$('.bal', g.stage).forEach(function (b) {
        b.onclick = function () {
          if (busy) return;
          if (b.dataset.ok === '1') { busy = true; if (first) good++; $('#ok').textContent = good; Sound.pop(); b.classList.add('popped'); Voice.say(w.en); r++; later(next, 1100); }
          else { first = false; Sound.bad(); b.classList.add('shake'); later(function () { b.classList.remove('shake'); }, 400); }
        };
        b.addEventListener('animationend', function (e) { if (e.animationName === 'rise' && b.dataset.ok === '1' && !busy) { first = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; } });
      });
    }
    next();
  }

  /* 문장 퍼즐: 그 회차의 문장과 바꿔 말하기 문장을 낱말 조각으로 */
  function puzzle(host, L, onDone) {
    // 회차 문장을 먼저 모두 넣고, 남은 자리는 바꿔 말하기 문장으로 (같은 문장은 한 번만)
    var seen = {}, pick = function (list) { return list.filter(function (q) { if (seen[q.en] || q.en.split(' ').length < 3) return false; seen[q.en] = 1; return true; }); };
    var main = pick(L.sentences.map(function (x) { return { en: x.en, ko: x.ko, pic: x.pic }; }));
    var qs = shuffle(main.concat(pick(shuffle(drillItems(L))).slice(0, 8 - main.length)));
    var r = 0, good = 0;
    var g = head(host, L, '<span>문제 <b id="rn">1</b>/' + qs.length + '</span><span>한 번에 맞힘 <b id="ok">0</b></span>');
    function next() {
      if (r >= qs.length) return result(host, L, { score: Math.round(good / qs.length * 100), stars: good >= qs.length - 1 ? 3 : good >= qs.length * .6 ? 2 : 1, total: qs.length, note: qs.length + '문장 중 ' + good + '문장을 한 번에 완성했어요.' }, onDone, function () { puzzle(host, L, onDone); });
      var q = qs[r], mark = q.en.slice(-1), parts = q.en.slice(0, -1).split(' '), placed = [], first = true;
      $('#rn').textContent = r + 1;
      var tiles = shuffle(parts.map(function (t, i) { return { t: t, i: i }; }));
      g.stage.innerHTML = '<div class="pz"><div class="pz-q">' + ART.pic(q.pic) + '<p>' + esc(q.ko) + '</p></div>' +
        '<div class="pz-ans" aria-live="polite"></div><div class="pz-tiles">' + tiles.map(function (t, k) { return '<button class="tile" data-k="' + k + '">' + esc(t.t) + '</button>'; }).join('') + '</div>' +
        '<div class="row center"><button class="btn small" id="hint">🔊 들어 보기</button></div></div>';
      var ans = $('.pz-ans', g.stage);
      function draw() {
        ans.innerHTML = placed.map(function (k) { return '<button class="tile on" data-k="' + k + '">' + esc(tiles[k].t) + '</button>'; }).join('') + (placed.length ? '' : '<span class="muted">낱말을 차례대로 눌러요</span>') + '<span class="pz-mark">' + mark + '</span>';
        $$('.pz-tiles .tile', g.stage).forEach(function (b) { b.disabled = placed.indexOf(+b.dataset.k) >= 0; });
        $$('.tile.on', ans).forEach(function (b) { b.onclick = function () { placed.splice(placed.indexOf(+b.dataset.k), 1); Sound.tap(); draw(); }; });
        if (placed.length === parts.length) {
          var text = placed.map(function (k) { return tiles[k].t; }).join(' ');
          if (text === parts.join(' ')) { if (first) good++; $('#ok').textContent = good; Sound.good(); ans.classList.add('right'); Voice.say(q.en); r++; later(next, 1500); }
          else { first = false; Sound.bad(); ans.classList.add('shake'); later(function () { ans.classList.remove('shake'); placed = placed.filter(function (k, pos) { return tiles[k].i === pos && placed.slice(0, pos).every(function (kk, pp) { return tiles[kk].i === pp; }); }); draw(); }, 600); }
        }
      }
      $$('.pz-tiles .tile', g.stage).forEach(function (b) { b.onclick = function () { placed.push(+b.dataset.k); Sound.tap(); draw(); }; });
      $('#hint').onclick = function () { first = false; Voice.say(q.en); };
      ans.classList.remove('right');
      draw();
    }
    next();
  }

  /* 철자 퍼즐: 그림을 보고 알파벳을 차례대로 */
  function spell(host, L, onDone) {
    var ws = shuffle(L.words.filter(function (w) { return /^[a-z-]+$/i.test(w.en); })).slice(0, 8), r = 0, good = 0;
    var g = head(host, L, '<span>문제 <b id="rn">1</b>/' + ws.length + '</span><span>한 번에 맞힘 <b id="ok">0</b></span>');
    function next() {
      if (r >= ws.length) return result(host, L, { score: Math.round(good / ws.length * 100), stars: good >= ws.length - 1 ? 3 : good >= ws.length * .6 ? 2 : 1, total: ws.length, note: ws.length + '낱말 중 ' + good + '낱말을 한 번에 맞혔어요.' }, onDone, function () { spell(host, L, onDone); });
      var w = ws[r], letters = w.en.toLowerCase().split(''), pos = 0, first = true;
      $('#rn').textContent = r + 1;
      var tiles = shuffle(letters.map(function (c, i) { return { c: c, i: i }; }));
      g.stage.innerHTML = '<div class="pz"><div class="pz-q">' + ART.pic(w.pic) + '<p>' + esc(w.ko) + '</p></div>' +
        '<div class="sp-ans" aria-live="polite">' + letters.map(function () { return '<span class="sp-slot"></span>'; }).join('') + '</div>' +
        '<div class="pz-tiles">' + tiles.map(function (t, k) { return '<button class="tile sp" data-k="' + k + '">' + esc(t.c) + '</button>'; }).join('') + '</div>' +
        '<div class="row center"><button class="btn small" id="hint">🔊 들어 보기</button></div></div>';
      var slots = $$('.sp-slot', g.stage);
      $$('.tile.sp', g.stage).forEach(function (b) {
        b.onclick = function () {
          var t = tiles[+b.dataset.k];
          if (t.c === letters[pos]) {
            Sound.tap(); slots[pos].textContent = t.c; slots[pos].classList.add('on'); b.disabled = true; pos++;
            if (pos === letters.length) { if (first) good++; $('#ok').textContent = good; Sound.good(); $('.sp-ans', g.stage).classList.add('right'); Voice.say(w.en); r++; later(next, 1400); }
          } else { first = false; Sound.bad(); b.classList.add('shake'); later(function () { b.classList.remove('shake'); }, 400); }
        };
      });
      $('#hint').onclick = function () { first = false; Voice.say(w.en); };
    }
    next();
  }

  /* 누구일까요 (생김새): 설명을 듣고 친구 찾기 */
  var NAMES = { she: ['Amy', 'Mina', 'Lily', 'Sora', 'Jenny', 'Emma'], he: ['Tom', 'Jun', 'Ben', 'Max', 'Sam', 'Leo'] };
  var SHIRTS = ['#E74C3C', '#0295A9', '#3FA34D', '#F28C28', '#036370', '#FFBB12'];
  function makePeople() {
    var used = {}, ppl = [], sheN = shuffle(NAMES.she), heN = shuffle(NAMES.he), tries = 0;
    while (ppl.length < 4 && tries++ < 200) {
      var p = { she: Math.random() < .5, tall: Math.random() < .5, hair: ['long', 'short', 'curly'][Math.floor(Math.random() * 3)], glasses: Math.random() < .45, bigeyes: Math.random() < .4 };
      var key = [p.tall, p.hair, p.glasses, p.bigeyes].join();
      if (used[key]) continue; used[key] = 1;
      p.short = !p.tall; p.name = p.she ? sheN.pop() : heN.pop(); p.shirt = SHIRTS[ppl.length]; ppl.push(p);
    }
    return ppl;
  }
  function cluesOf(p) {
    var P = p.she ? 'She' : 'He', c = [];
    c.push({ t: P + ' is ' + (p.tall ? 'tall' : 'short') + '.', f: function (x) { return x.tall === p.tall; } });
    c.push({ t: P + ' has ' + (p.hair === 'curly' ? 'curly' : p.hair) + ' hair.', f: function (x) { return x.hair === p.hair; } });
    if (p.glasses) c.push({ t: P + ' wears glasses.', f: function (x) { return x.glasses; } });
    if (p.bigeyes) c.push({ t: P + ' has big eyes.', f: function (x) { return x.bigeyes; } });
    return c;
  }
  function riddle() {
    for (var n = 0; n < 50; n++) {
      var ppl = makePeople(), t = ppl[Math.floor(Math.random() * ppl.length)], cs = shuffle(cluesOf(t));
      for (var a = 0; a < cs.length; a++) for (var b = a + 1; b < cs.length; b++) {
        var set = [cs[a], cs[b]];
        if (ppl.filter(function (x) { return set.every(function (c) { return c.f(x); }); }).length === 1) return { ppl: ppl, t: t, clues: set.map(function (c) { return c.t; }) };
      }
    }
    return null;
  }
  function guess(host, L, onDone) {
    var r = 0, good = 0;
    var g = head(host, L, '<span>문제 <b id="rn">1</b>/8</span><span>한 번에 맞힘 <b id="ok">0</b></span>');
    function next() {
      if (r >= 8) return result(host, L, { score: Math.round(good / 8 * 100), stars: good >= 7 ? 3 : good >= 5 ? 2 : 1, total: 8, note: '8명 중 ' + good + '명을 한 번에 찾았어요.' }, onDone, function () { guess(host, L, onDone); });
      var q = riddle(), first = true, busy = false; $('#rn').textContent = r + 1;
      var line = 'Who is it? ' + q.clues.join(' ');
      g.stage.innerHTML = '<div class="gw"><div class="gw-q"><button class="btn primary" id="hear">🔊 듣기</button><p><b>Who is it?</b> ' + q.clues.map(esc).join(' ') + '</p></div>' +
        '<div class="gw-ppl">' + q.ppl.map(function (p, i) { return '<button class="who" data-i="' + i + '">' + ART.person(p) + '<span>' + p.name + '</span></button>'; }).join('') + '</div></div>';
      $('#hear').onclick = function () { Voice.say(line); };
      later(function () { Voice.say(line); }, 300);
      $$('.who', g.stage).forEach(function (b) {
        b.onclick = function () {
          if (busy) return;
          var p = q.ppl[+b.dataset.i];
          if (p === q.t) { busy = true; if (first) good++; $('#ok').textContent = good; Sound.good(); b.classList.add('right'); Voice.say("It's " + p.name + '!'); r++; later(next, 1500); }
          else { first = false; Sound.bad(); b.classList.add('wrong'); b.disabled = true; }
        };
      });
    }
    next();
  }

  var IMPL = { memory: memory, mole: mole, balloon: balloon, puzzle: puzzle, spell: spell, guess: guess };
  return { start: function (host, L, onDone) { intro(host, L, function () { IMPL[L.game](host, L, onDone || function () { }); }); } };
})();
