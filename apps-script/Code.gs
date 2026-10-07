/**
 * 영어 첫걸음 학습 기록 저장 (구글 시트 Apps Script)
 * 1) 구글 시트 → 확장 프로그램 → Apps Script 에 이 내용을 통째로 붙여 넣기
 * 2) 아래 TEACHER_KEY 를 선생님만 아는 암호로 바꾸기
 * 3) 배포 → 새 배포 → 유형: 웹 앱, 실행: 나, 액세스: 모든 사용자 → 배포
 * 4) 받은 웹 앱 주소(…/exec)를 js/config.js 의 SHEET_URL 에 넣기
 */
var TEACHER_KEY = '여기에-암호를-쓰세요';
var SHEET_NAME = '기록';
var HEAD = ['시각', '이름', '회차', '테마', '활동', '말하기', '쓰기', '전체', '점수', '별', '완료 항목', 'id'];
var KEYS = ['time', 'name', 'lesson', 'theme', 'part', 'said', 'wrote', 'total', 'score', 'stars', 'items', 'id'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
// 시트 수식으로 읽히지 않게 (=, +, -, @ 로 시작하는 글자 막기)
function clean_(v, max) { v = String(v == null ? '' : v).slice(0, max || 200); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'json' }); }
  if (!d.name || !d.lesson) return out_({ ok: false, error: 'missing' });
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = sheet_();
    // 같은 기록이 두 번 오면 한 번만 저장
    var last = sh.getLastRow();
    if (last > 1 && d.id) {
      var from = Math.max(2, last - 300), ids = sh.getRange(from, 12, last - from + 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === d.id) return out_({ ok: true, dup: true });
    }
    sh.appendRow([new Date(), clean_(d.name, 20), Number(d.lesson) || '', clean_(d.theme, 20), clean_(d.part, 20), clean_(d.said, 5), clean_(d.wrote, 5),
      clean_(d.total, 5), Number(d.score) || 0, Number(d.stars) || 0, clean_(d.items, 300), clean_(d.id, 40)]);
  } finally { lock.releaseLock(); }
  return out_({ ok: true });
}

function rows_() {
  var sh = sheet_(), v = sh.getDataRange().getValues(); v.shift();
  return v.map(function (r) {
    var o = {}; KEYS.forEach(function (k, i) { o[k] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); return o;
  });
}

function doGet(e) {
  var p = e.parameter || {};
  if (p.action === 'ping') return out_({ ok: true });
  if (p.action === 'mine') { // 학생: 자기 이름 기록만 (다른 기기에서 진도 이어 하기)
    var n = String(p.name || '').trim();
    return out_({ ok: true, rows: n ? rows_().filter(function (r) { return String(r.name).trim() === n; }) : [] });
  }
  if (p.action === 'list') {
    if (p.key !== TEACHER_KEY) return out_({ ok: false, error: 'key' });
    return out_({ ok: true, rows: rows_() });
  }
  return out_({ ok: false, error: 'action' });
}
