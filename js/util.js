/* 공용 도구: DOM, 글자, 날짜, 기기 저장(localStorage) */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lessonById(id) { return LESSONS.filter(function (l) { return l.id === +id; })[0]; }
function wordsOf(text) { return text.replace(/[^A-Za-z' ]/g, ' ').trim().split(/\s+/); }
function uid(prefix) { return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function nowIso() { return new Date().toISOString(); }
/* 학교 하루 단위 (기기 시간 기준 YYYY-MM-DD) */
function dayKey(t) { var d = t ? new Date(t) : new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function daysBetween(a, b) { return Math.round((new Date(dayKey(b)) - new Date(dayKey(a))) / 864e5); }
/* 정답 비교: 대소문자·앞뒤 공백·여러 칸 공백·문장부호 무시, 굽은 따옴표는 곧은 따옴표로 */
function normAnswer(s) { return String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' -]/g, ' ').replace(/\s+/g, ' ').trim(); }

var store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del: function (k) { try { localStorage.removeItem(k); } catch (e) { } },
  keys: function (prefix) { var out = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(prefix) === 0) out.push(k); } } catch (e) { } return out; }
};

/* 화면이 바뀔 때 정리할 것들 (타이머, 소리, 이벤트) */
var Cleanup = {
  list: [],
  add: function (f) { this.list.push(f); },
  run: function () { var l = this.list; this.list = []; l.forEach(function (f) { try { f(); } catch (e) { } }); if (window.Voice) Voice.stop(); if (window.Listen) Listen.stop(); }
};
