/* Apps Script(Code.gs) 시험: 가짜 스프레드시트로 돌려 봐요.  node tests/appscript.test.js
   기록 저장·중복 제거·교사 암호·학생 조회·복습 보내기/취소·v1 호환·이름→번호 바꾸기 */
var fs = require('fs'), vm = require('vm'), path = require('path');
function Sheet(name) { this.name = name; this.rows = []; }
Sheet.prototype = {
  appendRow: function (r) { this.rows.push(r.slice()); },
  setFrozenRows: function () { }, clear: function () { this.rows = []; },
  getLastRow: function () { return this.rows.length; },
  getDataRange: function () { var s = this; return { getValues: function () { return s.rows.map(function (r) { return r.slice(); }); } }; },
  getRange: function (row, col, n, w) {
    var s = this; n = n || 1; w = w || 1;
    return {
      getValues: function () { var out = []; for (var i = 0; i < n; i++) { var r = s.rows[row - 1 + i] || []; out.push(r.slice(col - 1, col - 1 + w)); } return out; },
      setValues: function (v) { for (var i = 0; i < v.length; i++) { var r = s.rows[row - 1 + i] = s.rows[row - 1 + i] || []; for (var j = 0; j < v[i].length; j++) r[col - 1 + j] = v[i][j]; } },
      setValue: function (x) { (s.rows[row - 1] = s.rows[row - 1] || [])[col - 1] = x; }
    };
  }
};
var sheets = {}, alerts = [];
var ss = { getSheetByName: function (n) { return sheets[n] || null; }, insertSheet: function (n) { return sheets[n] = new Sheet(n); } };
var cacheStore = {};
var ctx = {
  SpreadsheetApp: { getActiveSpreadsheet: function () { return ss; }, getUi: function () { return { alert: function (m) { alerts.push(m); }, createMenu: function () { return { addItem: function () { return this; }, addToUi: function () { } }; } }; } },
  LockService: { getScriptLock: function () { return { waitLock: function () { }, releaseLock: function () { } }; } },
  CacheService: { getScriptCache: function () { return { get: function (k) { return cacheStore[k] || null; }, put: function (k, v) { cacheStore[k] = v; } }; } },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: function (t) { return { text: t, setMimeType: function () { return JSON.parse(t); } }; } },
  JSON: JSON, Date: Date, Math: Math, String: String, Number: Number, Object: Object
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8'), ctx);
var KEY = vm.runInContext('TEACHER_KEY', ctx);
function post(o) { return ctx.doPost({ postData: { contents: JSON.stringify(o) } }); }
function get(p) { return ctx.doGet({ parameter: p }); }
var pass = 0, fail = 0;
function ok(c, n) { if (c) pass++; else { fail++; console.log('  ✗ ' + n); } }
function ev(eid, sid, extra) { var e = [eid, sid, 's1', 2, 'see', 'choose', 'd02.w.1', 'listen', 1, 1, 'dog', 900, '2026-10-28T01:00:00Z', 'touch', '', '']; if (extra) for (var k in extra) e[k] = extra[k]; return e; }

console.log('기록 저장');
var r = post({ action: 'events', events: [ev('e1', '4-3-07'), ev('e2', '4-3-07'), ev('e3', '4-1-02')] });
ok(r.ok && r.saved === 3 && r.v === 2, '3개 저장 (got ' + JSON.stringify(r) + ')');
r = post({ action: 'events', events: [ev('e1', '4-3-07'), ev('e4', '4-3-07')] });
ok(r.saved === 1, '같은 eid 는 건너뜀');
r = post({ action: 'events', events: [ev('e5', '김하늘'), ev('e6', '4-3-07', { 10: '=HYPERLINK("x")' })] });
ok(r.saved === 1, '번호가 아닌 학생 id 는 받지 않음');
ok(String(sheets.events.rows[sheets.events.rows.length - 1][10]).indexOf("'=") === 0, '수식처럼 시작하는 글자는 막음');

console.log('조회');
ok(get({ action: 'ping' }).v === 2, 'ping 에 버전 2');
var m = get({ action: 'mine2', stu: '4-3-07' });
ok(m.ok && m.events.length === 4 && m.events.every(function (e) { return e[1] === '4-3-07'; }), '학생은 자기 번호 기록만');
ok(get({ action: 'mine2', stu: 'x' }).ok === false, '잘못된 번호는 거절');
ok(post({ action: 'list', key: 'wrong' }).error === 'key', '암호가 틀리면 거절');
var l = post({ action: 'list', key: KEY });
ok(l.ok && l.events.length === 5 && l.next === 7, '교사 전체 조회 (got ' + l.events.length + ', next ' + l.next + ')');
ok(post({ action: 'list', key: KEY, cls: '4-1' }).events.length === 1, '반으로 거르기');
ok(post({ action: 'list', key: KEY, from: 4 }).events.length === 3, '이어 받기 (from 4 = 4~6번째 줄)');

console.log('복습 보내기');
var a = post({ action: 'assign', key: KEY, sids: ['4-3-07', 'bad'], items: { ids: ['tricky'], area: 'auto', title: 't' }, note: 'hi' });
ok(a.ok && a.made.length === 1, '번호가 맞는 학생에게만');
ok(get({ action: 'mine2', stu: '4-3-07' }).assignments.length === 1, '학생이 받음');
ok(post({ action: 'assign', key: 'no', sids: ['4-3-07'] }).error === 'key', '암호 없이 못 보냄');
post({ action: 'assignCancel', key: KEY, aid: a.made[0] });
ok(get({ action: 'mine2', stu: '4-3-07' }).assignments.length === 0, '취소하면 학생에게 안 보임');

console.log('v1 호환과 이름 → 번호');
ok(post({ name: '김하늘', lesson: 1, part: 'words', said: 10, wrote: 10, id: 'v1a' }).ok, 'v1 요약 저장');
post({ name: '김하늘', lesson: 1, part: 'words', id: 'v1a' });
ok(sheets['기록'].rows.length === 2, 'v1 중복 제거');
ctx.makeNameTable();
ok(sheets['이름-번호'].rows.length === 2 && sheets['이름-번호'].rows[1][0] === '김하늘', '이름-번호 표 만들기');
sheets['이름-번호'].rows[1][1] = '4-3-07';
ctx.migrateNames();
ok(sheets['기록'].rows[1][1] === '4-3-07', '기록의 이름이 번호로 바뀜');
ok(post({ action: 'list', key: KEY }).v1[0].name === '4-3-07', '교사 조회에 v1 기록(번호)');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
