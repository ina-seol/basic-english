/* 교사: 학급 데이터 불러오기와 계산
   시트(events) + v1 기록(번호로 바뀐 줄) + 이 기기의 기록을 합쳐 학생별 요약을 만들어요.
   계산 규칙은 학생 화면과 같은 함수(Progress·Review·Mastery)를 써서 값이 어긋나지 않아요. */
var TeacherData = (function () {
  var state = { events: [], assignments: [], v1: [], src: '', at: null, cls: '' };

  function localEvents() {
    var out = [];
    store.keys('be-ev:').forEach(function (k) { out = out.concat(store.get(k, [])); });
    return out;
  }
  function localAssignments() {
    var out = [];
    store.keys('be-asg:').forEach(function (k) { out = out.concat(store.get(k, [])); });
    return out.concat(store.get('be-tasg', []));
  }
  function dedupe(list) { var seen = {}; return list.filter(function (e) { if (seen[e.eid]) return false; seen[e.eid] = 1; return true; }); }

  /* 캐시: 받은 줄 번호(next)부터 이어 받아요 */
  function cacheKey(cls) { return 'be-tcache:' + (cls || 'all'); }
  function load(key, cls) {
    state.cls = cls || '';
    var loc = localEvents();
    if (!Api.url() || !key) {
      state.events = dedupe(loc); state.assignments = localAssignments(); state.v1 = []; state.src = 'local'; state.at = new Date();
      return Promise.resolve(state);
    }
    var c = store.get(cacheKey(cls), { next: 2, events: [] });
    return Api.teacher('list', key, { cls: cls || '', from: c.next }).then(function (d) {
      if (!d || !d.ok) throw new Error(d && d.error || 'fail');
      if (d.v !== 2) throw new Error('v1');
      var fresh = (d.events || []).map(evUnpack);
      c.events = c.events.concat(fresh.map(evPack)); c.next = d.next || c.next;
      if (!store.set(cacheKey(cls), c)) store.del(cacheKey(cls));
      state.events = dedupe(c.events.map(evUnpack).concat(loc));
      state.assignments = d.assignments || []; state.v1 = d.v1 || []; state.src = 'sheet'; state.at = new Date();
      return state;
    });
  }
  function resetCache() { store.keys('be-tcache:').forEach(store.del); }

  /* v1 기록 중 번호(4-3-07)로 바뀐 줄 → 회차 완료로 인정 */
  function v1Done(rows) {
    var by = {};
    rows.forEach(function (r) {
      var sid = String(r.name || '').trim(); if (!Me.valid(sid)) return;
      var L = lessonById(r.lesson); if (!L) return;
      var d = ((by[sid] = by[sid] || {})[L.id] = by[sid][L.id] || {});
      if (r.part === 'words') d.w = Math.max(d.w || 0, Math.min(+r.said || 0, +r.wrote || 0));
      if (r.part === 'sentences') d.s = Math.max(d.s || 0, Math.min(+r.said || 0, +r.wrote || 0));
      if (r.part === 'game') d.g = 1;
    });
    var out = {};
    Object.keys(by).forEach(function (sid) {
      out[sid] = {};
      Object.keys(by[sid]).forEach(function (id) { var d = by[sid][id], L = lessonById(id); if (d.w >= L.words.length && d.s >= L.sentences.length && d.g) out[sid][id] = true; });
    });
    return out;
  }

  /* 학생별 요약 */
  function students(cls) {
    var bySid = {};
    state.events.forEach(function (e) { if (!Me.valid(e.sid)) return; if (cls && Me.cls(e.sid) !== cls) return; (bySid[e.sid] = bySid[e.sid] || []).push(e); });
    var v1 = v1Done(state.v1);
    Object.keys(v1).forEach(function (sid) { if ((!cls || Me.cls(sid) === cls) && !bySid[sid]) bySid[sid] = []; });
    var today = dayKey();
    return Object.keys(bySid).sort(function (a, b) { return sortSid(a) - sortSid(b); }).map(function (sid) {
      var ev = bySid[sid].sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }), m = Progress.fromEvents(ev), done = {};
      LESSONS.forEach(function (L) { if (Progress.dayDone(m, L.id) || (v1[sid] || {})[L.id]) done[L.id] = 1; });
      var bank = Review.bank(ev), active = Object.keys(bank).filter(function (k) { return bank[k].state === 'needs' || bank[k].state === 'improving'; });
      var last = ev.length ? ev[ev.length - 1].ts : null;
      var since14 = new Date(Date.now() - 14 * 864e5).toISOString();
      return {
        sid: sid, ev: ev, map: m, done: done, daysDone: Object.keys(done).length, last: last, activeToday: last ? dayKey(last) === today : false,
        mastery: Mastery.all(ev), baseline: Mastery.baseline(ev), bank: bank, activeTricky: active.length,
        due: Review.quick(ev, { max: 99 }).length, effect: Review.effect(ev),
        speakFails: ev.filter(function (e) { return e.area === 'speak' && e.ok === 0 && e.ts >= since14; }).length,
        reviews: ev.filter(function (e) { return e.rev; }).length,
        reflections: ev.filter(function (e) { return e.act === 'reflect'; }).map(function (e) { var x = {}; try { x = JSON.parse(e.x || '{}'); } catch (er) { } return { day: e.day, rating: x.rating, difficult: x.difficult || [], ts: e.ts }; }),
        assignments: state.assignments.filter(function (a) { return a.sid === sid; }).map(function (a) {
          var dn = ev.filter(function (e) { return e.act === 'assigndone' && e.resp === a.aid; })[0];
          return Object.assign({}, a, { doneAt: dn ? dn.ts : null, result: dn ? JSON.parse(dn.x || '{}') : null });
        })
      };
    });
  }
  function sortSid(s) { var p = s.split('-'); return (+p[0]) * 1e4 + (+p[1]) * 100 + (+p[2]); }
  function classes() {
    var set = {};
    state.events.forEach(function (e) { if (Me.valid(e.sid)) set[Me.cls(e.sid)] = 1; });
    state.v1.forEach(function (r) { if (Me.valid(String(r.name))) set[Me.cls(String(r.name))] = 1; });
    return Object.keys(set).sort(function (a, b) { return sortSid(a + '-0') - sortSid(b + '-0'); });
  }

  /* ---------- 지원이 필요한 학생 (단순 규칙, 판정이 아니라 '확인해 볼 만한' 신호) ----------
     R1 Needs Review  : 어느 영역 숙달도 < 50 이고 그 영역 시도 ≥ 6
     R2 Check In      : 연습 중인 어려운 항목(needs·improving) ≥ 6
     R3 Speaking      : 최근 14일 말하기 미완료 시도 ≥ 3 이고 말하기 숙달도 < 50
     R4 Check In      : 7일 넘게 접속하지 않음 (반의 다른 학생은 그 사이 접속)
     R5 Check In      : 최근 자기점검 3번 중 2번 이상 '어려웠어요' */
  function support(list) {
    var out = [], classLast = list.reduce(function (a, s) { return s.last && s.last > a ? s.last : a; }, '');
    list.forEach(function (s) {
      AREAS.forEach(function (a) {
        var m = s.mastery[a.k];
        if (a.k !== 'speak' && m.value != null && m.value < 50 && m.n >= 6) out.push({ sid: s.sid, rule: 'R1', tag: 'Needs Review', area: a.k, text: a.en + ' · ' + a.ko, detail: '최근 숙달도 ' + m.value + '% (시도 ' + m.n + ')', rec: { area: a.k === 'vocab' ? 'vocab' : a.k, ids: dueIn(s, a.k), title: a.ko + ' 복습' } });
      });
      if (s.activeTricky >= 6) out.push({ sid: s.sid, rule: 'R2', tag: 'Check In', area: '', text: '어려운 항목 ' + s.activeTricky + '개', detail: '복습 예정 ' + s.due + '개', rec: { area: 'auto', ids: ['tricky'], title: '나의 어려운 항목' } });
      var sp = s.mastery.speak;
      if (s.speakFails >= 3 && sp.value != null && sp.value < 50) out.push({ sid: s.sid, rule: 'R3', tag: 'Needs Support', area: 'speak', text: 'Speaking · 말하기', detail: '최근 14일 미완료 시도 ' + s.speakFails + '번 (마이크 환경 확인)', rec: null });
      if (s.last && classLast && daysBetween(s.last, classLast) >= 7) out.push({ sid: s.sid, rule: 'R4', tag: 'Check In', area: '', text: '최근 접속 ' + daysBetween(s.last, new Date()) + '일 전', detail: '마지막 기록 ' + dayKey(s.last), rec: null });
      var rf = s.reflections.slice(-3);
      if (rf.length >= 2 && rf.filter(function (r) { return r.rating === 1; }).length >= 2) out.push({ sid: s.sid, rule: 'R5', tag: 'Check In', area: '', text: '최근 “어려웠어요” ' + rf.filter(function (r) { return r.rating === 1; }).length + '번', detail: '어려웠던 것: ' + uniq([].concat.apply([], rf.map(function (r) { return r.difficult; }))).join(', '), rec: { area: 'auto', ids: ['tricky'], title: '나의 어려운 항목' } });
    });
    var ign = store.get('be-tignore', {}), today = dayKey();
    return out.filter(function (x) { var t = ign[x.sid + '|' + x.rule + '|' + x.area]; return !t || daysBetween(t, today) >= 7; });
  }
  function dueIn(s, area) {
    var ids = Object.keys(s.bank).filter(function (k) { var b = s.bank[k]; return (b.state === 'needs' || b.state === 'improving') && b.areas[area]; });
    return ids.length ? ids.slice(0, 10) : ['tricky'];
  }
  function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }

  /* 반 전체에서 어려운 항목: 한 번이라도 어려웠던 학생 수 */
  function difficult(list) {
    var c = {};
    list.forEach(function (s) { Object.keys(s.bank).forEach(function (k) { var b = s.bank[k]; (c[k] = c[k] || { item: k, students: 0, now: 0, wrong: 0 }); c[k].students++; c[k].wrong += b.wrong; if (b.state !== 'mastered') c[k].now++; }); });
    var all = Object.keys(c).map(function (k) { return c[k]; }).filter(function (x) { return itemInfo(x.item); }).sort(function (a, b) { return b.students - a.students || b.wrong - a.wrong; });
    return { words: all.filter(function (x) { return /\.w\./.test(x.item); }), expr: all.filter(function (x) { return !/\.w\./.test(x.item); }) };
  }

  /* ---------- CSV (연구용) ---------- */
  function csv(rows) { return '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); }
  function download(name, text) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  var EXPORTS = {
    student_summary: function (list) {
      return [['student_id', 'class', 'days_completed', 'vocabulary_mastery', 'listening_mastery', 'speaking_mastery', 'writing_mastery', 'sentence_mastery', 'review_count', 'tricky_items_count', 'tricky_items_mastered', 'first_attempt_accuracy', 'review_accuracy', 'baseline_vocabulary', 'baseline_listening', 'baseline_writing', 'baseline_sentence', 'last_active']]
        .concat(list.map(function (s) {
          var m = s.mastery, b = s.baseline || {}, ef = s.effect;
          return [s.sid, Me.cls(s.sid), s.daysDone, m.vocab.value, m.listen.value, m.speak.value, m.write.value, m.sentence.value, s.reviews, ef.trickyAll, ef.trickyMastered,
            ef.firstAcc == null ? '' : Math.round(ef.firstAcc * 100), ef.reviewAcc == null ? '' : Math.round(ef.reviewAcc * 100), b.vocab, b.listen, b.write, b.sentence, s.last || ''];
        }));
    },
    activity_log: function (list) {
      return [['student_id', 'session_id', 'day', 'activity', 'action', 'item_id', 'area', 'correct', 'attempt', 'response', 'duration_ms', 'timestamp', 'input_mode', 'review_type', 'event_id']]
        .concat([].concat.apply([], list.map(function (s) { return s.ev.map(function (e) { return [e.sid, e.sess, e.day, e.step, e.act, e.item, e.area, e.ok, e.att, e.resp, e.dur, e.ts, e.mode, e.rev, e.eid]; }); })));
    },
    error_bank: function (list) {
      return [['student_id', 'item_id', 'content', 'type', 'error_count', 'correct_count', 'state', 'mastery', 'last_attempt', 'last_wrong', 'last_correct']]
        .concat([].concat.apply([], list.map(function (s) { return Object.keys(s.bank).map(function (k) { var b = s.bank[k], it = itemInfo(k) || {}; return [s.sid, k, it.type === 'drill' ? it.frame.replace('{w}', it.slot) : it.en, it.type, b.wrong, b.right, b.state, b.mastery, b.lastAttempt, b.lastWrong || '', b.lastRight || '']; }); })));
    },
    reflection: function (list) {
      return [['student_id', 'day', 'difficulty', 'self_rating', 'timestamp']]
        .concat([].concat.apply([], list.map(function (s) { return s.reflections.map(function (r) { return [s.sid, r.day, r.difficult.join(';'), r.rating, r.ts]; }); })));
    }
  };
  function exportCsv(kind, list) { download(kind + (state.cls ? '_' + state.cls : '') + '.csv', csv(EXPORTS[kind](list))); }
  return { state: state, load: load, resetCache: resetCache, students: students, classes: classes, support: support, difficult: difficult, exportCsv: exportCsv, csv: csv, download: download };
})();
