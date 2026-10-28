/* 교사 대시보드: Class Overview · Students Needing Support · Learning Heatmap · Difficult Items · Review Assignment · Export
   Teacher-in-the-loop: 시스템은 추천만 하고, 보낼지·고칠지·무시할지는 선생님이 정해요. */
var TeacherDash = (function () {
  var sel = {};   // 고른 학생
  function key() { return store.get('fe-key', ''); }
  function cls() { return store.get('be-tcls', ''); }
  function pct(v) { return v == null ? '–' : Math.round(v) + '%'; }
  function sym(v) { return v == null ? '–' : v >= 75 ? '●' : v >= 50 ? '◕' : v >= 25 ? '◑' : '○'; }
  function level(v) { return v == null ? 'none' : v >= 75 ? 'l4' : v >= 50 ? 'l3' : v >= 25 ? 'l2' : 'l1'; }
  function avg(a) { a = a.filter(function (x) { return x != null; }); return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function label(it) { return it.type === 'drill' ? it.frame.replace('{w}', '___') + ' → ' + it.slot : it.en; }

  function head(view, active) {
    var classes = TeacherData.classes(), st = TeacherData.state;
    return TeacherSlides.tabs(active) +
      '<section class="dash-head"><div><h1>대시보드</h1><p class="muted" id="src">' + (st.src === 'sheet' ? '구글 시트 · ' + st.events.length + '개 기록 · ' + st.at.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준' : st.src === 'local' ? '이 기기의 기록만 보여요' + (Api.url() ? ' · 교사 암호를 넣으면 반 전체가 나와요' : ' · 설정에서 구글 시트를 연결해요') : '불러오는 중…') + '</p></div>' +
      '<form class="dash-ctl" id="ctl"><label>반 <select id="cls"><option value="">전체</option>' + classes.map(function (c) { return '<option' + (c === cls() ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' +
      (Api.url() ? '<label class="sr" for="key">교사 암호</label><input id="key" type="password" placeholder="교사 암호" value="' + esc(key()) + '" autocomplete="off">' : '') +
      '<button class="btn small secondary">불러오기</button></form></section>';
  }
  function bindHead(view, rerender) {
    $('#ctl', view).onsubmit = function (e) { e.preventDefault(); var k = $('#key', view); if (k) store.set('fe-key', k.value.trim()); store.set('be-tcls', $('#cls', view).value); reload(view, rerender); };
    $('#cls', view).onchange = function () { store.set('be-tcls', this.value); rerender(); };
  }
  function reload(view, rerender) {
    var s = $('#src', view); if (s) s.textContent = '불러오는 중…';
    return TeacherData.load(key(), '').then(rerender, function (err) {
      toast(err.message === 'key' ? '교사 암호가 맞지 않아요' : err.message === 'v1' ? 'Apps Script 를 v2 로 새로 배포해야 해요 (설정 참고)' : '시트에 연결하지 못했어요. 이 기기 기록만 보여요');
      TeacherData.load('', '').then(rerender);
    });
  }

  /* ---------- 대시보드 ---------- */
  function dash(view) {
    function render() {
      var list = TeacherData.students(cls()), sup = TeacherData.support(list), diff = TeacherData.difficult(list), today = dayKey();
      var html = head(view, '#t/dash');
      if (!list.length) { view.innerHTML = html + '<div class="empty"><span class="emo">📭</span><p>아직 기록이 없어요. 학생이 공부를 시작하면 여기에 나와요.</p></div>'; bindHead(view, render); return; }
      var mAvg = avg(list.map(function (s) { return avg(AREAS.map(function (a) { return s.mastery[a.k].value; })); }));
      var needIds = {}; sup.forEach(function (x) { needIds[x.sid] = 1; }); list.forEach(function (s) { if (s.due) needIds[s.sid] = 1; });
      html += '<section class="kpis">' +
        kpi('🧒', (cls() || '전체') + ' 학생', list.length, '명') +
        kpi('📅', 'Today active', list.filter(function (s) { return s.activeToday; }).length, '명') +
        kpi('🏁', 'Completion', Math.round(avg(list.map(function (s) { return s.daysDone / LESSONS.length * 100; })) || 0), '%') +
        kpi('📈', 'Average Mastery', mAvg == null ? '–' : Math.round(mAvg), mAvg == null ? '' : '%') +
        kpi('🔁', 'Review Needed', Object.keys(needIds).length, '명') + '</section>';
      /* 지원이 필요한 학생 */
      html += '<section class="card"><div class="sec-h"><h2>🤝 Students Needing Support <small class="muted">규칙으로 찾은 ‘확인해 볼 만한’ 신호예요</small></h2></div>' +
        (sup.length ? '<ul class="sup-list">' + sup.slice(0, 12).map(function (x, i) {
          return '<li><span class="sup-tag ' + x.rule + '">' + x.tag + '</span><a class="linkish" href="#t/stu/' + x.sid + '">' + esc(Me.label(x.sid)) + '</a><span><b>' + esc(x.text) + '</b> <small class="muted">' + esc(x.detail) + '</small></span>' +
            '<span class="row">' + (x.rec ? '<span class="muted">Recommended: ' + esc(x.rec.title) + '</span><button class="btn small secondary" data-sup="' + i + '" data-do="assign">Assign</button><button class="btn small" data-sup="' + i + '" data-do="edit">Edit</button>' : '') +
            '<button class="btn small ghost" data-sup="' + i + '" data-do="ignore">Ignore</button></span></li>';
        }).join('') + '</ul>' : '<p class="muted">지금은 눈에 띄는 신호가 없어요 ✓</p>') + '</section>';
      /* 히트맵 */
      html += '<section class="card"><div class="sec-h"><h2>🗺️ Learning Heatmap</h2><div class="row"><span class="legend">● 75+ ◕ 50–74 ◑ 25–49 ○ 0–24 – 기록 없음</span>' +
        '<button class="btn small secondary" id="asgSel" disabled>선택한 학생에게 복습 보내기</button></div></div><div class="tbl-wrap"><table class="heat2"><thead><tr><th><input type="checkbox" id="selAll" aria-label="모두 고르기"></th><th scope="col">학생</th><th scope="col">Days</th>' +
        AREAS.map(function (a) { return '<th scope="col">' + a.en + '<small>' + a.ko + '</small></th>'; }).join('') + '<th scope="col">Tricky</th><th scope="col">Review due</th><th scope="col">Last</th></tr></thead><tbody>' +
        list.map(function (s) {
          return '<tr><td><input type="checkbox" class="selOne" data-sid="' + s.sid + '"' + (sel[s.sid] ? ' checked' : '') + ' aria-label="' + Me.label(s.sid) + ' 고르기"></td><th scope="row"><a class="linkish" href="#t/stu/' + s.sid + '">' + s.sid + '</a></th><td>' + s.daysDone + '</td>' +
            AREAS.map(function (a) { var v = s.mastery[a.k].value; return '<td class="hm ' + level(v) + '" title="' + a.ko + ' ' + pct(v) + ' (시도 ' + s.mastery[a.k].n + ')"><span aria-hidden="true">' + sym(v) + '</span> ' + (v == null ? '' : v) + '</td>'; }).join('') +
            '<td>' + s.activeTricky + '</td><td>' + (s.due || '') + '</td><td class="muted">' + (s.last ? (dayKey(s.last) === today ? '오늘' : dayKey(s.last).slice(5)) : '–') + '</td></tr>';
        }).join('') + '</tbody></table></div></section>';
      /* 차트 */
      var areaAvg = AREAS.map(function (a) { return { label: a.en, sub: a.ko, value: avg(list.map(function (s) { return s.mastery[a.k].value; })), color: 'var(--area-' + a.k + ')' }; });
      var dayRate = LESSONS.map(function (L) { return { label: String(L.id), sub: L.ko, value: list.filter(function (s) { return s.done[L.id]; }).length / list.length * 100 }; });
      var ef = list.reduce(function (o, s) { var e = s.effect; o.fN += e.firstN; o.fO += (e.firstAcc || 0) * e.firstN; o.rN += e.reviewN; o.rO += (e.reviewAcc || 0) * e.reviewN; o.tA += e.trickyAll; o.tM += e.trickyMastered; return o; }, { fN: 0, fO: 0, rN: 0, rO: 0, tA: 0, tM: 0 });
      html += '<div class="dash-charts"><section class="card"><h2>영역별 평균 숙달도</h2>' + hbars(areaAvg, '%') + '</section>' +
        '<section class="card"><h2>복습 효과</h2><div class="effect"><div><span>First Attempt</span><b>' + (ef.fN ? Math.round(ef.fO / ef.fN * 100) + '%' : '–') + '</b><small>처음 시도 정답률 (' + ef.fN + ')</small></div><span class="arrow" aria-hidden="true">→</span>' +
        '<div><span>After Review</span><b>' + (ef.rN ? Math.round(ef.rO / ef.rN * 100) + '%' : '–') + '</b><small>복습 시도 정답률 (' + ef.rN + ')</small></div></div>' +
        '<p class="muted">어려웠던 항목 중 Mastered: <b>' + ef.tM + ' / ' + ef.tA + '</b></p></section></div>' +
        '<section class="card"><h2>Day별 완료율</h2>' + vbars(dayRate) + '</section>';
      /* 어려운 항목 */
      html += '<div class="dash-charts"><section class="card"><div class="sec-h"><h2>🧩 Most Difficult Words</h2></div>' + diffList(diff.words.slice(0, 10), list.length) + '</section>' +
        '<section class="card"><div class="sec-h"><h2>💬 Difficult Expressions</h2></div>' + diffList(diff.expr.slice(0, 10), list.length) + '</section></div>';
      view.innerHTML = html;
      bindHead(view, render);
      var btn = $('#asgSel'), upd = function () { var n = Object.keys(sel).filter(function (k) { return sel[k]; }).length; btn.disabled = !n; btn.textContent = n ? n + '명에게 복습 보내기' : '선택한 학생에게 복습 보내기'; };
      $$('.selOne', view).forEach(function (c) { c.onchange = function () { sel[c.dataset.sid] = c.checked; upd(); }; });
      $('#selAll').onchange = function () { var on = this.checked; $$('.selOne', view).forEach(function (c) { c.checked = on; sel[c.dataset.sid] = on; }); upd(); };
      upd();
      btn.onclick = function () { assignModal(Object.keys(sel).filter(function (k) { return sel[k]; }), null, render); };
      $$('[data-sup]', view).forEach(function (b) {
        b.onclick = function () {
          var x = sup[+b.dataset.sup];
          if (b.dataset.do === 'ignore') { var ign = store.get('be-tignore', {}); ign[x.sid + '|' + x.rule + '|' + x.area] = dayKey(); store.set('be-tignore', ign); toast('7일 동안 숨겨요'); render(); }
          else if (b.dataset.do === 'assign') send([x.sid], x.rec, '', render);
          else assignModal([x.sid], x.rec, render);
        };
      });
      $$('[data-pick]', view).forEach(function (b) { b.onclick = function () { assignModal(list.map(function (s) { return s.sid; }).filter(function (sid) { var s = list.filter(function (q) { return q.sid === sid; })[0]; return s.bank[b.dataset.pick] && s.bank[b.dataset.pick].state !== 'mastered'; }), { ids: [b.dataset.pick], area: 'auto', title: label(itemInfo(b.dataset.pick)) }, render); }; });
    }
    function kpi(ic, t, v, u) { return '<div class="kpi"><span class="emo" aria-hidden="true">' + ic + '</span><span class="kpi-t">' + esc(t) + '</span><b>' + v + '<small>' + u + '</small></b></div>'; }
    function diffList(l, n) {
      if (!l.length) return '<p class="muted">아직 없어요.</p>';
      var max = Math.max.apply(null, l.map(function (x) { return x.students; }));
      return '<ol class="diff">' + l.map(function (x) {
        var it = itemInfo(x.item);
        return '<li><span class="diff-t"><span class="en">' + esc(label(it)) + '</span><small>Day ' + it.day + ' · ' + esc(it.ko) + '</small></span><span class="bar" aria-hidden="true"><i style="width:' + (x.students / max * 100) + '%"></i></span>' +
          '<span class="diff-n"><b>' + x.students + '</b>명' + (x.now ? ' <small>(연습 중 ' + x.now + ')</small>' : '') + '</span>' + (x.now ? '<button class="btn small" data-pick="' + x.item + '">보내기</button>' : '') + '</li>';
      }).join('') + '</ol>';
    }
    view.innerHTML = head(view, '#t/dash') + '<p class="muted">불러오는 중…</p>';
    if (!TeacherData.state.src) reload(view, render); else render();
  }
  function hbars(data, unit) {
    return '<ul class="hbars">' + data.map(function (d) {
      return '<li><span class="hb-l"><b>' + esc(d.label) + '</b><small>' + esc(d.sub || '') + '</small></span><span class="bar" aria-hidden="true"><i style="width:' + (d.value || 0) + '%;background:' + (d.color || 'var(--color-primary)') + '"></i></span><span class="hb-v">' + (d.value == null ? '–' : Math.round(d.value) + unit) + '</span></li>';
    }).join('') + '</ul>';
  }
  function vbars(data) {
    return '<div class="vbars" role="img" aria-label="Day별 완료율">' + data.map(function (d) {
      return '<div class="vb" title="Day ' + d.label + ' ' + d.sub + ' · ' + Math.round(d.value) + '%"><span class="vb-v">' + Math.round(d.value) + '</span><span class="vb-col"><i style="height:' + d.value + '%"></i></span><span class="vb-l">' + d.label + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------- 학생 한 명 ---------- */
  function student(view, sid) {
    function render() {
      var s = TeacherData.students('').filter(function (x) { return x.sid === sid; })[0];
      if (!s) { view.innerHTML = TeacherSlides.tabs('#t/dash') + '<p class="muted">기록이 없어요. <a class="linkish" href="#t/dash">대시보드</a></p>'; return; }
      var B = s.bank, items = Object.keys(B).map(function (k) { return B[k]; }).sort(function (a, b) { var o = { needs: 0, improving: 1, mastered: 2 }; return o[a.state] - o[b.state] || b.wrong - a.wrong; });
      view.innerHTML = TeacherSlides.tabs('#t/dash') + '<nav class="crumbs"><a class="btn small" href="#t/dash">← 대시보드</a><span class="crumb-t">' + esc(Me.label(sid)) + ' <small class="muted">' + sid + '</small></span><button class="btn small secondary" id="asg">📮 복습 보내기</button></nav>' +
        '<section class="card"><h2>Days ' + s.daysDone + ' / ' + LESSONS.length + '</h2><div class="day-cells">' + LESSONS.map(function (L) { var n = Progress.stepsDone(s.map, L.id), all = stepsRequired().length; return '<span class="dc' + (s.done[L.id] ? ' done' : n ? ' part' : '') + '" title="Day ' + L.id + ' ' + L.ko + ' · ' + n + '/' + all + '">' + L.id + '<small>' + (s.done[L.id] ? '✓' : n ? n + '/' + all : '') + '</small></span>'; }).join('') + '</div>' +
        '<p class="muted">마지막 기록: ' + (s.last ? new Date(s.last).toLocaleString('ko-KR') : '–') + '</p></section>' +
        '<div class="dash-charts"><section class="card"><h2>영역별 숙달도</h2>' + hbars(AREAS.map(function (a) { var m = s.mastery[a.k]; return { label: a.en, sub: a.ko + ' · 시도 ' + m.n + (s.baseline && s.baseline[a.k] != null ? ' · 진단 ' + s.baseline[a.k] + '%' : ''), value: m.value, color: 'var(--area-' + a.k + ')' }; }), '%') +
        '<p class="muted">숙달도 = 60% 최근 10번 정답률 + 30% 누적 정답률 + 10% 복습 정답률</p></section>' +
        '<section class="card"><h2>복습 효과</h2><div class="effect"><div><span>First Attempt</span><b>' + (s.effect.firstAcc == null ? '–' : Math.round(s.effect.firstAcc * 100) + '%') + '</b></div><span class="arrow" aria-hidden="true">→</span><div><span>After Review</span><b>' + (s.effect.reviewAcc == null ? '–' : Math.round(s.effect.reviewAcc * 100) + '%') + '</b></div></div>' +
        '<p class="muted">Tricky items mastered <b>' + s.effect.trickyMastered + ' / ' + s.effect.trickyAll + '</b></p></section></div>' +
        '<section class="card"><h2>Error Bank <small class="muted">' + items.length + '개</small></h2>' + (items.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">항목</th><th scope="col">상태</th><th scope="col">틀림</th><th scope="col">맞음</th><th scope="col">다음 확인</th></tr></thead><tbody>' +
          items.map(function (b) { var it = itemInfo(b.item); return '<tr><th scope="row"><span class="en">' + esc(label(it)) + '</span> <small class="muted">Day ' + it.day + '</small></th><td>' + StudentReview.stateTag(b.state) + '</td><td>' + b.wrong + '</td><td>' + b.right + '</td><td>' + (b.due || '–') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">없어요.</p>') + '</section>' +
        '<div class="dash-charts"><section class="card"><h2>자기점검</h2>' + (s.reflections.length ? '<ul class="rf-log">' + s.reflections.slice(-8).reverse().map(function (r) { return '<li>Day ' + r.day + ' · ' + ['', '🤔 어려웠어요', '🙂 조금 더', '😊 잘 알아요'][r.rating || 0] + (r.difficult.length ? ' · <span class="muted">' + esc(r.difficult.join(', ')) + '</span>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="muted">아직 없어요.</p>') + '</section>' +
        '<section class="card"><h2>보낸 복습</h2>' + (s.assignments.length ? '<ul class="rf-log">' + s.assignments.map(function (a) { var t = StudentHome.asgTitle(a); return '<li>' + esc(t) + ' · ' + (a.status === 'cancelled' ? '<span class="pill">취소</span>' : a.doneAt ? '<span class="pill ok">✓ 완료 ' + (a.result ? a.result.ok + '/' + a.result.n : '') + '</span>' : '<span class="pill now">대기</span> <button class="btn small ghost" data-cancel="' + a.aid + '">취소</button>') + '</li>'; }).join('') + '</ul>' : '<p class="muted">아직 없어요.</p>') + '</section></div>';
      $('#asg').onclick = function () { assignModal([sid], { ids: ['tricky'], area: 'auto', title: '나의 어려운 항목' }, render); };
      $$('[data-cancel]', view).forEach(function (b) { b.onclick = function () { cancel(b.dataset.cancel, render); }; });
    }
    if (!TeacherData.state.src) TeacherData.load(key(), '').then(render, function () { TeacherData.load('', '').then(render); }); else render();
  }

  /* ---------- 복습 보내기 ---------- */
  function assignModal(sids, rec, after) {
    if (!sids.length) { toast('먼저 학생을 골라요'); return; }
    var back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mT"><h2 id="mT">📮 복습 보내기 · ' + sids.length + '명</h2><p class="muted">' + sids.map(esc).join(', ') + '</p>' +
      '<fieldset class="m-opts"><legend>무엇을 보낼까요?</legend>' +
      (rec ? '<label><input type="radio" name="what" value="rec" checked> 추천: <b>' + esc(rec.title) + '</b></label>' : '') +
      '<label><input type="radio" name="what" value="tricky"' + (rec ? '' : ' checked') + '> 학생마다 자기 어려운 항목 (최대 8개)</label>' +
      '<label><input type="radio" name="what" value="day"> Day <select id="mDay">' + LESSONS.map(function (L) { return '<option value="' + L.id + '">' + L.id + ' ' + L.ko + '</option>'; }).join('') + '</select> 의 ' +
      '<select id="mKind"><option value="w:write">낱말 — 쓰기</option><option value="w:listen">낱말 — 듣기</option><option value="w:vocab">낱말 — 뜻·그림</option><option value="dr:sentence">바꿔 말하기 문장</option><option value="s:sentence">문장 순서</option></select></label></fieldset>' +
      '<label class="m-note">한마디 (선택) <input id="mNote" maxlength="60" placeholder="예: 쓰기를 한 번 더 해 봐요"></label>' +
      '<div class="row" style="justify-content:flex-end"><button class="btn" id="mNo">취소</button><button class="btn primary" id="mGo">보내기</button></div></div>';
    document.body.appendChild(back);
    var close = function () { back.remove(); document.removeEventListener('keydown', esc1); };
    var esc1 = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc1);
    $('#mNo', back).onclick = close;
    back.onclick = function (e) { if (e.target === back) close(); };
    $('#mGo', back).onclick = function () {
      var what = $('input[name=what]:checked', back).value, spec;
      if (what === 'rec') spec = rec;
      else if (what === 'tricky') spec = { ids: ['tricky'], area: 'auto', title: '나의 어려운 항목' };
      else { var d = $('#mDay', back).value, k = $('#mKind', back).value.split(':'), L = lessonById(d); spec = { ids: ['day:' + d + ':' + k[0]], area: k[1], title: 'Day ' + d + ' ' + L.ko + ' · ' + $('#mKind', back).selectedOptions[0].textContent }; }
      close(); send(sids, spec, $('#mNote', back).value.trim(), after);
    };
    $('input', back).focus();
  }
  function send(sids, spec, note, after) {
    if (Api.url() && key()) {
      Api.teacher('assign', key(), { sids: sids, items: spec, note: note }).then(function (d) {
        if (!d || !d.ok) throw new Error(d && d.error);
        toast(sids.length + '명에게 보냈어요. 학생이 다음에 들어오면 홈에 나와요.');
        TeacherData.load(key(), '').then(after);
      }).catch(function (e) { toast(e && e.message === 'key' ? '교사 암호가 맞지 않아요' : '보내지 못했어요. 인터넷과 Apps Script 버전을 확인해 주세요'); });
    } else {
      /* 시트 없이: 이 기기에서만 (같은 크롬북을 쓰는 학생에게) */
      sids.forEach(function (sid) { var l = store.get('be-asg:' + sid, []); l.push({ aid: uid('a'), sid: sid, created: nowIso(), items: JSON.stringify(spec), note: note, status: 'open', by: 'teacher' }); store.set('be-asg:' + sid, l); });
      toast('이 기기에만 저장했어요 (시트 연결 전)'); TeacherData.load('', '').then(after);
    }
  }
  function cancel(aid, after) {
    if (Api.url() && key()) Api.teacher('assignCancel', key(), { aid: aid }).then(function () { toast('취소했어요'); TeacherData.load(key(), '').then(after); }, function () { toast('취소하지 못했어요'); });
    else { store.keys('be-asg:').forEach(function (k) { store.set(k, store.get(k, []).map(function (a) { if (a.aid === aid) a.status = 'cancelled'; return a; })); }); TeacherData.load('', '').then(after); }
  }

  /* ---------- 내보내기 ---------- */
  function exportView(view) {
    function render() {
      var list = TeacherData.students(cls());
      view.innerHTML = head(view, '#t/export') + '<section class="card"><h2>연구용 CSV</h2><p class="muted">학생 번호만 들어가요 (이름 없음). Excel·Python 에서 바로 열 수 있어요 (UTF-8).</p><div class="exp-grid">' +
        [['student_summary', '학생별 요약', 'days_completed, 영역별 mastery, review_count, tricky_items_count …'], ['activity_log', '활동 기록', '시도 하나가 한 줄 (correct, attempt, duration, timestamp …)'], ['error_bank', 'Error Bank', '항목별 error_count, correct_count, mastery, last_attempt'], ['reflection', '자기점검', 'day, difficulty, self_rating']].map(function (x) {
          return '<div class="exp"><b>' + x[0] + '.csv</b><span>' + x[1] + '</span><small class="muted">' + x[2] + '</small><button class="btn small secondary" data-x="' + x[0] + '">내려받기</button></div>';
        }).join('') + '</div><p class="muted">지금 범위: ' + (cls() || '전체 반') + ' · 학생 ' + list.length + '명</p></section>';
      bindHead(view, render);
      $$('[data-x]', view).forEach(function (b) { b.onclick = function () { TeacherData.exportCsv(b.dataset.x, TeacherData.students(cls())); }; });
    }
    view.innerHTML = head(view, '#t/export') + '<p class="muted">불러오는 중…</p>';
    if (!TeacherData.state.src) reload(view, render); else render();
  }

  /* ---------- 설정 ---------- */
  function settings(view) {
    var u = Api.url(), base = location.origin + location.pathname, link = base + '#s';
    view.innerHTML = TeacherSlides.tabs('#t/set') +
      '<section class="card"><h2>학생에게 알려 줄 주소</h2><p class="muted">학생은 이 주소로 들어와 학년·반·번호만 누르면 돼요.</p><div class="link-row"><input id="lnk" readonly value="' + esc(link) + '"><button class="btn small" id="copy">복사</button></div><div id="qr" class="qr"></div></section>' +
      '<section class="card"><h2>구글 시트 연결 ' + (u ? '<span class="ok-tag">주소 있음</span>' : '<span class="warn-tag">연결 안 됨</span>') + '</h2>' + (u ? '<p class="mono">' + esc(u) + '</p>' : '') +
      '<div class="row" style="margin-top:8px"><button class="btn small secondary" id="test">연결·버전 확인</button><span id="testMsg" class="muted"></span></div>' +
      '<ol class="howto"><li>시트의 <b>확장 프로그램 → Apps Script</b> 에 저장소의 <code>apps-script/Code.gs</code> 를 붙여 넣고 <code>TEACHER_KEY</code> 를 바꿔요.</li>' +
      '<li>처음이면 <b>배포 → 새 배포 → 웹 앱</b> (실행: 나, 액세스: 모든 사용자). 이미 쓰고 있으면 <b>배포 관리 → 연필 → 새 버전</b> (주소 그대로).</li>' +
      '<li>예전 기록의 이름을 번호로 바꾸려면 시트를 새로고침 → 메뉴 <b>영어 첫걸음 → 이름-번호 표 만들기</b> → 번호 적기 → <b>기록의 이름을 번호로 바꾸기</b>.</li></ol>' +
      '<form class="link-row" id="urlForm"><label class="sr" for="url">웹 앱 주소 (이 기기만)</label><input id="url" placeholder="https://script.google.com/macros/s/…/exec (이 기기에서만 바꿀 때)" value="' + esc(store.get('fe-sheet', '')) + '"><button class="btn small">이 기기에 저장</button></form></section>' +
      '<section class="card"><h2>수업 화면</h2><label class="check"><input type="checkbox" id="auto"' + (store.get('fe-auto', true) ? ' checked' : '') + '> 낱말·문장 슬라이드를 열면 바로 읽어 주기</label>' +
      '<div class="row" style="margin-top:10px"><button class="btn small ghost" id="cache">대시보드 캐시 지우기</button><span class="muted">' + esc(CONFIG.APP_NAME) + ' v' + CONFIG.VERSION + '</span></div></section>';
    $('#copy').onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { toast('주소를 복사했어요'); }, function () { $('#lnk').select(); document.execCommand('copy'); toast('주소를 복사했어요'); }); };
    if (window.QRCode) try { new QRCode($('#qr'), { text: link, width: 168, height: 168, colorDark: '#2E2420', colorLight: '#ffffff' }); } catch (e) { }
    $('#test').onclick = function () {
      var m = $('#testMsg'); m.textContent = '확인 중…';
      Api.ping().then(function (d) { m.textContent = d && d.ok ? (d.v >= 2 ? '✓ 연결됨 · Apps Script v' + d.v : '⚠ 연결은 됐지만 v1 이에요. 새 Code.gs 로 새 버전을 배포해 주세요.') : '응답이 이상해요.'; }).catch(function () { m.textContent = '연결하지 못했어요. 주소와 "모든 사용자" 액세스를 확인해 주세요.'; });
    };
    $('#urlForm').onsubmit = function (e) { e.preventDefault(); var v = $('#url').value.trim(); if (v && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(v)) { toast('웹 앱 주소 모양이 아니에요'); return; } store.set('fe-sheet', v); TeacherData.resetCache(); toast(v ? '이 기기에 저장했어요' : '지웠어요'); settings(view); };
    $('#auto').onchange = function () { store.set('fe-auto', this.checked); };
    $('#cache').onclick = function () { TeacherData.resetCache(); TeacherData.state.src = ''; toast('지웠어요. 다음에 처음부터 받아요'); };
  }
  return { dash: dash, student: student, exportView: exportView, settings: settings };
})();

/* 교사 화면 주소 */
var Teacher = {
  route: function (view, parts) {
    if (CONFIG.TEACHER_PIN && sessionStorage.getItem('be-pin') !== CONFIG.TEACHER_PIN) {
      view.innerHTML = '<section class="panel"><h1>선생님 화면</h1><form id="pinF" class="row center"><label class="sr" for="pin">숫자</label><input id="pin" type="password" inputmode="numeric" placeholder="숫자" style="min-height:48px;font-size:20px;text-align:center"><button class="btn primary">들어가기</button></form></section>';
      $('#pinF').onsubmit = function (e) { e.preventDefault(); if ($('#pin').value === CONFIG.TEACHER_PIN) { sessionStorage.setItem('be-pin', CONFIG.TEACHER_PIN); App.render(); } else toast('숫자가 달라요'); };
      $('#pin').focus(); return;
    }
    var p = parts[0];
    if (p === 'dash' || p === 'rec') return TeacherDash.dash(view);
    if (p === 'stu') return TeacherDash.student(view, parts[1]);
    if (p === 'export') return TeacherDash.exportView(view);
    if (p === 'set') return TeacherDash.settings(view);
    var L = p && lessonById(p);
    if (L) return TeacherSlides.deck(view, L);
    TeacherSlides.home(view);
  }
};
