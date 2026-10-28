/**
 * 영어 첫걸음 (BASIC ENGLISH) 학습 기록 — Google Apps Script v2
 *
 * 처음 설치
 *  1) 구글 시트 → 확장 프로그램 → Apps Script 에 이 내용을 통째로 붙여 넣기
 *  2) 아래 TEACHER_KEY 를 선생님만 아는 암호로 바꾸기
 *  3) 배포 → 새 배포 → 유형: 웹 앱, 실행: 나, 액세스: 모든 사용자 → 배포
 *  4) 받은 주소(…/exec)를 config.js 의 SHEET_URL 에 넣기
 *
 * v1 에서 올릴 때
 *  · 코드만 바꾸고 배포 → 배포 관리 → (연필) → 버전: 새 버전 → 배포. 주소가 그대로라 config.js 는 안 고쳐도 돼요.
 *  · 시트에 들어 있는 학생 이름을 번호로 바꾸려면: 시트를 새로고침 → 메뉴 '영어 첫걸음' → '이름-번호 표 만들기'
 *    → 표에 번호를 적고 → '기록의 이름을 번호로 바꾸기'.
 *
 * 시트
 *  · events       V2 학습 기록 (시도 하나가 한 줄)
 *  · assignments  선생님이 보낸 복습
 *  · 기록          v1 단계 요약 (그대로 둠)
 */
var TEACHER_KEY = '여기에-암호를-쓰세요';
var VERSION = 2;

var EV_FIELDS = ['eid', 'sid', 'sess', 'day', 'step', 'act', 'item', 'area', 'att', 'ok', 'resp', 'dur', 'ts', 'mode', 'rev', 'x'];
var AS_FIELDS = ['aid', 'sid', 'created', 'items', 'note', 'status', 'by'];
var V1_SHEET = '기록';
var V1_HEAD = ['시각', '이름', '회차', '테마', '활동', '말하기', '쓰기', '전체', '점수', '별', '완료 항목', 'id'];
var V1_KEYS = ['time', 'name', 'lesson', 'theme', 'part', 'said', 'wrote', 'total', 'score', 'stars', 'items', 'id'];

function sheet_(name, head) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
/* 시트 수식으로 읽히지 않게 (=, +, -, @ 로 시작하는 글자 막기) */
function clean_(v, max) { v = String(v == null ? '' : v).slice(0, max || 200); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function validSid_(s) { return /^\d-\d{1,2}-\d{2}$/.test(String(s || '')); }
function rows_(sh) { var v = sh.getDataRange().getValues(); v.shift(); return v; }
function iso_(v) { return v instanceof Date ? v.toISOString() : v; }

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'json' }); }
  if (d.action === 'events') return saveEvents_(d.events || []);
  if (d.action === 'list') return d.key === TEACHER_KEY ? out_(list_(d)) : out_({ ok: false, error: 'key' });
  if (d.action === 'assign') return d.key === TEACHER_KEY ? out_(assign_(d)) : out_({ ok: false, error: 'key' });
  if (d.action === 'assignCancel') return d.key === TEACHER_KEY ? out_(assignCancel_(d)) : out_({ ok: false, error: 'key' });
  return saveV1_(d);
}

/* V2: 이벤트 여러 개를 한 번에. eid 가 이미 있으면 건너뛰어요 (재전송·beacon 중복 방지). */
function saveEvents_(list) {
  if (!list.length) return out_({ ok: true, saved: 0 });
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_('events', EV_FIELDS.concat(['received'])), cache = CacheService.getScriptCache();
    var last = sh.getLastRow(), seen = {};
    if (last > 1) {
      var from = Math.max(2, last - 4000);
      sh.getRange(from, 1, last - from + 1, 1).getValues().forEach(function (r) { seen[r[0]] = 1; });
    }
    var now = new Date(), add = [];
    list.forEach(function (a) {
      if (!a || a.length < 13) return;
      var eid = String(a[0]);
      if (!eid || seen[eid] || cache.get('e:' + eid) || !validSid_(a[1])) return;
      seen[eid] = 1;
      var row = EV_FIELDS.map(function (k, i) { var v = a[i]; return (k === 'day' || k === 'att' || k === 'dur') ? (Number(v) || 0) : (k === 'ok' ? (v === '' || v == null ? '' : Number(v)) : clean_(v, k === 'x' ? 300 : 80)); });
      row.push(now); add.push(row);
    });
    if (add.length) {
      sh.getRange(sh.getLastRow() + 1, 1, add.length, add[0].length).setValues(add);
      add.forEach(function (r) { cache.put('e:' + r[0], '1', 21600); });
    }
    return out_({ ok: true, v: VERSION, saved: add.length });
  } finally { lock.releaseLock(); }
}

/* 교사: 기록 내려받기. cls 를 주면 그 반만, from 을 주면 그 줄 다음부터만 (나눠 받기) */
function list_(d) {
  var sh = sheet_('events', EV_FIELDS.concat(['received'])), last = sh.getLastRow();
  var from = Math.max(2, Number(d.from) || 2), ev = [];
  if (last >= from) {
    var cls = d.cls ? String(d.cls) + '-' : '';
    sh.getRange(from, 1, last - from + 1, EV_FIELDS.length).getValues().forEach(function (r) {
      if (cls && String(r[1]).indexOf(cls) !== 0) return;
      ev.push(r.map(iso_));
    });
  }
  return { ok: true, v: VERSION, events: ev, next: last + 1, assignments: assignments_(), v1: v1Rows_() };
}
function assignments_() {
  var sh = sheet_('assignments', AS_FIELDS);
  return rows_(sh).map(function (r) { var o = {}; AS_FIELDS.forEach(function (k, i) { o[k] = iso_(r[i]); }); return o; });
}
function assign_(d) {
  var sh = sheet_('assignments', AS_FIELDS), now = new Date(), made = [];
  (d.sids || []).forEach(function (sid) {
    if (!validSid_(sid)) return;
    var aid = 'a' + now.getTime().toString(36) + Math.random().toString(36).slice(2, 6);
    sh.appendRow([aid, sid, now, clean_(JSON.stringify(d.items || []), 2000), clean_(d.note, 200), 'open', 'teacher']);
    made.push(aid);
  });
  return { ok: true, made: made };
}
function assignCancel_(d) {
  var sh = sheet_('assignments', AS_FIELDS), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === d.aid) { sh.getRange(i + 1, 6).setValue('cancelled'); return { ok: true }; }
  return { ok: false, error: 'notfound' };
}
function v1Rows_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(V1_SHEET);
  if (!sh) return [];
  return rows_(sh).map(function (r) { var o = {}; V1_KEYS.forEach(function (k, i) { o[k] = iso_(r[i]); }); return o; });
}

/* v1 앱(예전 캐시가 남은 크롬북)에서 오는 단계 요약은 그대로 받아요 */
function saveV1_(d) {
  if (!d.name || !d.lesson) return out_({ ok: false, error: 'missing' });
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_(V1_SHEET, V1_HEAD), last = sh.getLastRow();
    if (last > 1 && d.id) {
      var from = Math.max(2, last - 300), ids = sh.getRange(from, 12, last - from + 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === d.id) return out_({ ok: true, dup: true });
    }
    sh.appendRow([new Date(), clean_(d.name, 20), Number(d.lesson) || '', clean_(d.theme, 20), clean_(d.part, 20), clean_(d.said, 5), clean_(d.wrote, 5),
      clean_(d.total, 5), Number(d.score) || 0, Number(d.stars) || 0, clean_(d.items, 300), clean_(d.id, 40)]);
  } finally { lock.releaseLock(); }
  return out_({ ok: true });
}

function doGet(e) {
  var p = e.parameter || {};
  if (p.action === 'ping') return out_({ ok: true, v: VERSION });
  /* 학생: 내 번호의 기록과 열린 복습 (다른 기기에서 이어 하기) */
  if (p.action === 'mine2') {
    /* 주의: Apps Script 는 'sid', 'c' 라는 주소 이름을 쓸 수 없어서(시스템 예약) 'stu' 로 받아요 */
    var sid = String(p.stu || '');
    if (!validSid_(sid)) return out_({ ok: false, error: 'sid' });
    var sh = sheet_('events', EV_FIELDS.concat(['received'])), last = sh.getLastRow(), ev = [];
    if (last > 1) sh.getRange(2, 1, last - 1, EV_FIELDS.length).getValues().forEach(function (r) { if (r[1] === sid) ev.push(r.map(iso_)); });
    var as = assignments_().filter(function (a) { return a.sid === sid && a.status === 'open'; });
    return out_({ ok: true, v: VERSION, events: ev, assignments: as });
  }
  /* v1 호환 */
  if (p.action === 'mine') { var n = String(p.name || '').trim(); return out_({ ok: true, rows: n ? v1Rows_().filter(function (r) { return String(r.name).trim() === n; }) : [] }); }
  if (p.action === 'list') return p.key === TEACHER_KEY ? out_({ ok: true, rows: v1Rows_() }) : out_({ ok: false, error: 'key' });
  return out_({ ok: false, error: 'action' });
}

/* ---------- 이름 → 번호 (한 번만) ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('영어 첫걸음')
    .addItem('이름-번호 표 만들기', 'makeNameTable')
    .addItem('기록의 이름을 번호로 바꾸기', 'migrateNames')
    .addToUi();
}
/* '기록' 시트에 나온 이름을 모아 '이름-번호' 표를 만들어요. B 칸에 4-3-07 처럼 번호를 적으세요. */
function makeNameTable() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), v1 = ss.getSheetByName(V1_SHEET);
  if (!v1) { SpreadsheetApp.getUi().alert('기록 시트가 없어요.'); return; }
  var names = {}; rows_(v1).forEach(function (r) { var n = String(r[1]).trim(); if (n && !validSid_(n)) names[n] = 1; });
  var sh = ss.getSheetByName('이름-번호') || ss.insertSheet('이름-번호');
  sh.clear(); sh.appendRow(['이름', '번호 (예: 4-3-07)']); sh.setFrozenRows(1);
  Object.keys(names).sort().forEach(function (n) { sh.appendRow([n, '']); });
  SpreadsheetApp.getUi().alert('이름 ' + Object.keys(names).length + '개를 적었어요. B 칸에 번호를 적고 "기록의 이름을 번호로 바꾸기"를 눌러 주세요.');
}
/* '이름-번호' 표대로 '기록' 시트의 이름 칸을 번호로 바꿔요. 번호를 안 적은 이름은 그대로 둬요. */
function migrateNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), map = {}, t = ss.getSheetByName('이름-번호'), v1 = ss.getSheetByName(V1_SHEET);
  if (!t || !v1) { SpreadsheetApp.getUi().alert('이름-번호 표나 기록 시트가 없어요.'); return; }
  rows_(t).forEach(function (r) { var n = String(r[0]).trim(), s = String(r[1]).trim(); if (n && validSid_(s)) map[n] = s; });
  var rng = v1.getRange(2, 2, Math.max(1, v1.getLastRow() - 1), 1), v = rng.getValues(), changed = 0;
  v.forEach(function (r) { var n = String(r[0]).trim(); if (map[n]) { r[0] = map[n]; changed++; } });
  rng.setValues(v);
  SpreadsheetApp.getUi().alert(changed + '줄의 이름을 번호로 바꿨어요. 다 끝나면 "이름-번호" 탭은 지워도 돼요.');
}
