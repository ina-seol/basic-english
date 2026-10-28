/* 규칙 단위 테스트: node tests/logic.test.js
   간격 복습 상태 변화, Quick Review 목록, 숙달도 공식, 복습 효과, 정답 비교를 확인해요. */
var fs = require('fs'), vm = require('vm'), path = require('path');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number, RegExp: RegExp, Intl: Intl };
ctx.window = ctx; ctx.localStorage = { _: {}, getItem: function (k) { return k in this._ ? this._[k] : null; }, setItem: function (k, v) { this._[k] = String(v); }, removeItem: function (k) { delete this._[k]; }, key: function (i) { return Object.keys(this._)[i]; }, get length() { return Object.keys(this._).length; } };
vm.createContext(ctx);
['config.js', 'js/util.js', 'data/lessons.js', 'js/review.js', 'js/mastery.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });

var pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.log('  ✗ ' + name); } }
function ev(item, ok_, ts, extra) { var e = { item: item, ok: ok_, ts: ts, area: 'vocab', step: 'see', act: 'choose', rev: '' }; for (var k in extra || {}) e[k] = extra[k]; return e; }
var R = ctx.Review, M = ctx.Mastery;

console.log('간격 복습');
var W = 'd08.w.3';
var evs = [ev(W, 0, '2026-10-01T01:00:00Z')];
var b = R.bank(evs, { gap: 2 })[W];
ok(b && b.state === 'needs' && b.due === '2026-10-01', '처음 틀리면 needs, 오늘 복습');
ok(R.quick(evs, { today: '2026-10-01', gap: 2 }).length === 1, '오늘 Quick Review 에 나옴');
evs.push(ev(W, 0, '2026-10-01T02:00:00Z', { rev: 'quick' }));
b = R.bank(evs, { gap: 2 })[W];
ok(b.state === 'needs' && b.due === '2026-10-02', '복습에서 또 틀리면 다음 날');
ok(R.quick(evs, { today: '2026-10-01', gap: 2 }).length === 0, '같은 날에는 다시 안 나옴');
evs.push(ev(W, 1, '2026-10-02T01:00:00Z', { rev: 'quick' }));
b = R.bank(evs, { gap: 2 })[W];
ok(b.state === 'improving' && b.due === '2026-10-04', '맞히면 improving, 2일 뒤 확인');
ok(R.quick(evs, { today: '2026-10-03', gap: 2 }).length === 0, '확인 날 전에는 안 나옴');
ok(R.quick(evs, { today: '2026-10-04', gap: 2 }).length === 1, '확인 날에 나옴');
evs.push(ev(W, 1, '2026-10-02T03:00:00Z'));
ok(R.bank(evs, { gap: 2 })[W].state === 'improving', '같은 날 또 맞혀도 아직 improving');
evs.push(ev(W, 1, '2026-10-04T01:00:00Z', { rev: 'quick' }));
ok(R.bank(evs, { gap: 2 })[W].state === 'mastered', '확인 날 맞히면 mastered');
evs.push(ev(W, 0, '2026-10-09T01:00:00Z'));
ok(R.bank(evs, { gap: 2 })[W].state === 'needs', 'mastered 인데 틀리면 다시 needs');

console.log('Error Bank 에 넣지 않는 것');
ok(Object.keys(R.bank([ev('d01.w.0', 1, '2026-10-01T00:00:00Z')])).length === 0, '한 번도 안 틀린 항목은 없음');
ok(Object.keys(R.bank([ev('d01.w.0', 0, '2026-10-01T00:00:00Z', { area: 'speak' })])).length === 0, '말하기 실패는 안 들어감');
ok(Object.keys(R.bank([ev('d01.w.0', 0, '2026-10-01T00:00:00Z', { step: 'baseline' })])).length === 0, '진단은 안 들어감');

console.log('Quick Review 순서');
var q = R.quick([ev('d02.w.1', 0, '2026-10-05T00:00:00Z'), ev('d02.w.2', 0, '2026-10-05T00:01:00Z'), ev('d02.w.2', 0, '2026-10-05T00:02:00Z'),
  ev('d02.w.5', 0, '2026-10-01T00:00:00Z'), ev('d02.w.5', 1, '2026-10-01T00:05:00Z')], { today: '2026-10-05', gap: 2 });
ok(q[0].item === 'd02.w.2', '많이 틀린 것 먼저');
ok(q[q.length - 1].item === 'd02.w.5', 'improving 은 needs 뒤');
ok(R.quick([ev('d02.w.1', 0, '2026-10-05T00:00:00Z')], { today: '2026-10-05', max: 0 }).length === 0, '최대 개수 지킴');

console.log('숙달도 공식');
var me = [];
for (var i = 0; i < 10; i++) me.push(ev('d01.w.' + (i % 10), i < 5 ? 0 : 1, '2026-10-01T00:' + ('0' + i).slice(-2) + ':00Z'));
var a = M.area(me, 'vocab', 10);
ok(a.value === 50, '최근 50%·누적 50%·복습 없음 → 50 (got ' + a.value + ')');
me.push(ev('d01.w.0', 1, '2026-10-02T00:00:00Z', { rev: 'quick' }));
a = M.area(me, 'vocab', 10);
/* 최근 10개: 4틀림 6맞음 = .6, 누적 6/11, 복습 1/1 */
ok(a.value === Math.round(100 * (0.6 * 0.6 + 0.3 * (6 / 11) + 0.1 * 1)), '공식대로 (got ' + a.value + ')');
ok(M.area([], 'write').value === null, '기록 없으면 null');
var bl = M.baseline([ev('d01.w.0', 1, '2026-10-01T00:00:00Z', { step: 'baseline', area: 'listen' }), ev('d01.w.1', 0, '2026-10-01T00:00:00Z', { step: 'baseline', area: 'listen' })]);
ok(bl.listen === 50 && bl.write === null, '진단 영역별 정답률');

console.log('복습 효과');
var ef = R.effect([ev('d03.w.0', 0, '2026-10-01T00:00:00Z'), ev('d03.w.1', 1, '2026-10-01T00:00:01Z'), ev('d03.w.0', 1, '2026-10-02T00:00:00Z', { rev: 'quick' })]);
ok(ef.firstAcc === 0.5 && ef.reviewAcc === 1, '처음 50% → 복습 100%');

console.log('정답 비교·항목 id');
ok(ctx.normAnswer('  Ride  a Bike. ') === 'ride a bike', '대소문자·공백·문장부호');
ok(ctx.normAnswer('It’s red') === "it's red", '굽은 따옴표');
ok(ctx.itemInfo('d08.w.3').en === 'strawberry', 'd08.w.3 = strawberry');
ok(ctx.itemInfo('d09.dr.0').type === 'drill' && /I want/.test(ctx.itemInfo('d09.dr.0').en), '바꿔 말하기 항목');
ok(ctx.itemInfo('zzz') === null, '없는 id');
var bq = ctx.baselineItems();
ok(bq.length === 17 && bq.every(function (q) { return q.item && q.item.id; }), '진단 17문항 (got ' + bq.length + ')');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
