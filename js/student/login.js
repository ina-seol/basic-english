/* 학생 들어오기: 학년 → 반 → 번호 (타자 없이 단추만). 이름은 묻지 않아요. */
var StudentLogin = (function () {
  function lstyle(L) { return 'style="--c:' + L.color + ';--cl:' + L.light + ';--on:' + (L.on || '#fff') + '"'; }
  function view(host, done) {
    var g = null, c = null, used = store.get('be-sids', []);
    function draw() {
      var html = '<section class="panel login view-in"><div class="result-emo" aria-hidden="true">' + ART.burst('#FFF2CC') + '<span>👋</span></div>' +
        '<h1>Hello! 내 번호를 골라요</h1><p class="muted">이름은 쓰지 않아요. 학년, 반, 번호만 누르면 돼요.</p>';
      if (used.length && g == null) html += '<div class="used"><span class="muted">이 기기에서 쓴 번호</span>' + used.slice(0, 6).map(function (s) { return '<button class="chip" data-sid="' + esc(s) + '">' + esc(Me.label(s)) + '</button>'; }).join('') + '</div>';
      html += '<div class="pick"><p class="pick-h">학년</p><div class="pick-row">' + CONFIG.GRADES.map(function (x) { return '<button class="pick-b' + (g === x ? ' on' : '') + '" data-g="' + x + '" aria-pressed="' + (g === x) + '">' + x + '<small>학년</small></button>'; }).join('') + '</div></div>';
      if (g != null) html += '<div class="pick"><p class="pick-h">반</p><div class="pick-row">' + range(CONFIG.CLASSES_PER_GRADE).map(function (x) { return '<button class="pick-b' + (c === x ? ' on' : '') + '" data-c="' + x + '" aria-pressed="' + (c === x) + '">' + x + '<small>반</small></button>'; }).join('') + '</div></div>';
      if (c != null) html += '<div class="pick"><p class="pick-h">번호</p><div class="pick-grid">' + range(CONFIG.CLASS_SIZE).map(function (x) { return '<button class="pick-n" data-n="' + x + '">' + x + '</button>'; }).join('') + '</div></div>';
      host.innerHTML = html + '</section>';
      $$('[data-g]', host).forEach(function (b) { b.onclick = function () { g = +b.dataset.g; c = null; draw(); var r = $('[data-c]', host); if (r) r.focus(); }; });
      $$('[data-c]', host).forEach(function (b) { b.onclick = function () { c = +b.dataset.c; draw(); var r = $('[data-n]', host); if (r) r.focus(); }; });
      $$('[data-n]', host).forEach(function (b) { b.onclick = function () { confirm(Me.make(g, c, +b.dataset.n)); }; });
      $$('[data-sid]', host).forEach(function (b) { b.onclick = function () { confirm(b.dataset.sid); }; });
    }
    function confirm(sid) {
      host.innerHTML = '<section class="panel view-in"><div class="result-emo" aria-hidden="true">' + ART.burst('#FFF2CC') + '<span>🎒</span></div>' +
        '<h1>' + esc(Me.label(sid)) + ' 맞나요?</h1><div class="row center"><button class="btn" id="no">아니요, 다시 고를래요</button><button class="btn primary big" id="yes">네, 맞아요</button></div></section>';
      $('#no').onclick = function () { g = c = null; draw(); };
      $('#yes').onclick = function () { Me.set(sid); migrate(sid); };
      $('#yes').focus();
    }
    /* 이 기기에 v1(이름) 진도가 있으면 옮겨 오기 */
    function migrate(sid) {
      var names = Migrate.v1Names();
      if (!names.length) { Migrate.scrub(); return done(); }
      host.innerHTML = '<section class="panel view-in"><h1>예전에 한 공부를 가져올까요?</h1><p class="muted">이 기기에서 이름으로 공부한 기록이 있어요. 내 이름을 누르면 진도를 번호로 옮기고 이름은 지워요.</p>' +
        '<div class="used">' + names.map(function (n) { return '<button class="chip" data-name="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' +
        '<div class="row center"><button class="btn ghost" id="skip">내 이름이 없어요</button></div></section>';
      $$('[data-name]', host).forEach(function (b) { b.onclick = function () { var n = Migrate.importName(b.dataset.name, sid); Migrate.scrub(); toast('진도 ' + n + '칸을 옮겼어요'); done(); }; });
      $('#skip').onclick = function () { done(); };
    }
    draw();
  }
  function range(n) { var a = []; for (var i = 1; i <= n; i++) a.push(i); return a; }
  return { view: view, lstyle: lstyle };
})();
var lstyle = StudentLogin.lstyle;
