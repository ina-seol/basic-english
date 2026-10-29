/* ---------- 따라쓰기 판: 영어 공책 4줄 위 점선 글자를 손가락으로 따라 써요 ----------
   opt.guide === false 면 점선 글자 없이 4줄만 (그냥 쓰기). reveal() 로 나중에 정답 점선을 보여 줘요.
   쓴 획은 strokes() 로 꺼내 손글씨 인식에 넘겨요. */
function TracePad(host, text, opt) {
  opt = opt || {};
  var self = this, wrap = document.createElement('div'); wrap.className = 'trace';
  var bg = document.createElement('canvas'), ink = document.createElement('canvas');
  bg.className = 'trace-bg'; ink.className = 'trace-ink';
  ink.setAttribute('aria-label', text + ' 따라쓰기 칸');
  wrap.appendChild(bg); wrap.appendChild(ink); host.innerHTML = ''; host.appendChild(wrap);
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, fs, lines, layout = [], drawing = false, last = null, strokes = 0, paths = [], cur = null, ptype = 'touch', guide = opt.guide !== false;
  var FONT = function (s) { return '400 ' + s + 'px Andika, "Comic Sans MS", sans-serif'; };

  function fit() {
    W = Math.max(260, wrap.clientWidth);
    var c = bg.getContext('2d'), maxFs = opt.max || 120, minOne = opt.min || (W < 520 ? 44 : 52);
    c.font = FONT(100);
    var w1 = c.measureText(text).width / 100;
    fs = Math.min(maxFs, (W - 36) / w1); lines = [text];
    if (fs < minOne && text.indexOf(' ') > 0) { // 두 줄로 나누기
      var ws = text.split(' '), bestI = 1, bestD = 1e9;
      for (var i = 1; i < ws.length; i++) { var d = Math.abs(c.measureText(ws.slice(0, i).join(' ')).width - c.measureText(ws.slice(i).join(' ')).width); if (d < bestD) { bestD = d; bestI = i; } }
      lines = [ws.slice(0, bestI).join(' '), ws.slice(bestI).join(' ')];
      var wm = Math.max(c.measureText(lines[0]).width, c.measureText(lines[1]).width) / 100;
      fs = Math.min(maxFs, (W - 36) / wm);
    }
    var row = fs * 1.42; H = Math.round(row * (lines.length - 1) + fs * 1.42);
    [bg, ink].forEach(function (cv) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; });
    wrap.style.height = H + 'px';
    layout = lines.map(function (t, i) { return { t: t, x: 18, base: Math.round(fs * 1.02 + i * row) }; });
    drawBg();
  }
  function drawBg() {
    var c = bg.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    c.font = FONT(fs);
    var asc = c.measureText('h').actualBoundingBoxAscent || fs * .72, xh = c.measureText('x').actualBoundingBoxAscent || fs * .5, desc = c.measureText('g').actualBoundingBoxDescent || fs * .24;
    layout.forEach(function (L) {
      var ys = [L.base - asc, L.base - xh, L.base, L.base + desc];
      ys.forEach(function (y, i) {
        c.beginPath(); c.lineWidth = i === 2 ? 2 : 1.2; c.strokeStyle = i === 2 ? '#E9A0B4' : '#C9CDD6';
        c.setLineDash(i === 1 ? [6, 6] : []); c.moveTo(6, y + .5); c.lineTo(W - 6, y + .5); c.stroke();
      });
      c.setLineDash([]);
      if (!guide) return;
      c.fillStyle = '#EEF0F4'; c.fillText(L.t, L.x, L.base);
      c.setLineDash([Math.max(3, fs * .045), Math.max(3, fs * .05)]); c.lineWidth = Math.max(1.5, fs * .018); c.strokeStyle = '#9EA4AF';
      c.strokeText(L.t, L.x, L.base); c.setLineDash([]);
    });
  }
  function pos(e) { var r = ink.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function ctx() { var c = ink.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = opt.color || '#2B4789'; c.lineWidth = Math.max(7, fs * .1); return c; }
  ink.addEventListener('pointerdown', function (e) {
    e.preventDefault(); drawing = true; last = pos(e); strokes++;
    ptype = e.pointerType || 'touch'; cur = [{ x: last.x, y: last.y, t: Date.now() }]; paths.push(cur);
    try { ink.setPointerCapture(e.pointerId); } catch (x) { }
    var c = ctx(); c.beginPath(); c.arc(last.x, last.y, c.lineWidth / 2, 0, Math.PI * 2); c.fillStyle = c.strokeStyle; c.fill();
    if (opt.onstart) opt.onstart();
  });
  ink.addEventListener('pointermove', function (e) {
    if (!drawing) return; var p = pos(e), c = ctx();
    c.beginPath(); c.moveTo(last.x, last.y); c.lineTo(p.x, p.y); c.stroke(); last = p;
    if (cur) cur.push({ x: p.x, y: p.y, t: Date.now() });
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { ink.addEventListener(ev, function () { drawing = false; cur = null; }); });

  // 점선 글자를 얼마나 덮었는지(coverage)와, 선 밖으로 나간 정도(near)
  this.check = function () {
    var w = W * dpr, h = H * dpr, m = document.createElement('canvas'); m.width = w; m.height = h;
    var c = m.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.font = FONT(fs);
    layout.forEach(function (L) { c.fillText(L.t, L.x, L.base); });
    var guide = c.getImageData(0, 0, w, h).data;
    c.clearRect(0, 0, W, H); c.lineWidth = fs * .3; c.lineJoin = 'round';
    layout.forEach(function (L) { c.fillText(L.t, L.x, L.base); c.strokeText(L.t, L.x, L.base); });
    var zone = c.getImageData(0, 0, w, h).data, inkd = ink.getContext('2d').getImageData(0, 0, w, h).data;
    var step = Math.max(2, Math.round(2 * dpr)), rad = Math.round(fs * .045 * dpr), gN = 0, gHit = 0, iN = 0, iNear = 0;
    function inkAt(x, y) { return x >= 0 && y >= 0 && x < w && y < h && inkd[(y * w + x) * 4 + 3] > 40; }
    for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) {
      var k = (y * w + x) * 4 + 3;
      if (guide[k] > 128) { gN++; if (inkAt(x, y) || inkAt(x - rad, y) || inkAt(x + rad, y) || inkAt(x, y - rad) || inkAt(x, y + rad)) gHit++; }
      if (inkd[k] > 40) { iN++; if (zone[k] > 20) iNear++; }
    }
    var cover = gN ? gHit / gN : 0, near = iN ? iNear / iN : 0;
    var sc = Math.round(Math.max(0, cover * 100 - Math.max(0, 0.7 - near) * 120));
    return { cover: cover, near: near, score: sc, ok: sc >= 45 && near >= .5, empty: iN < 20 };
  };
  this.clear = function () { var c = ink.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, ink.width, ink.height); strokes = 0; paths = []; };
  this.strokes = function () { return paths.filter(function (p) { return p.length; }); };
  this.pointerType = function () { return ptype; };
  this.isEmpty = function () { return !paths.some(function (p) { return p.length > 1; }) && paths.length < 2; };
  this.reveal = function () { guide = true; drawBg(); };
  this.destroy = function () { window.removeEventListener('resize', onResize); };
  var rt = null; function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(wrap.clientWidth - W) > 8) { fit(); self.clear(); } }, 200); }
  window.addEventListener('resize', onResize);
  (document.fonts && document.fonts.load ? document.fonts.load(FONT(60), text) : Promise.resolve()).then(fit, fit);
}


/* ---------- 손글씨 인식 (크롬북 ChromeOS 크롬의 기기 안 인식기, 인터넷 필요 없음) ----------
   지원하지 않는 기기에서는 supported() 가 false → 정답을 보여 주고 학생이 스스로 확인해요. */
var HWR = (function () {
  var rec = null, checked = null;
  function supported() {
    if (checked !== null) return Promise.resolve(checked);
    if (!navigator.createHandwritingRecognizer) return Promise.resolve(checked = false);
    var q = navigator.queryHandwritingRecognizer ? navigator.queryHandwritingRecognizer({ languages: ['en'] }) : Promise.resolve({});
    return q.then(function (r) { return (checked = !!r); }, function () { return (checked = false); });
  }
  function get() {
    if (rec) return Promise.resolve(rec);
    return navigator.createHandwritingRecognizer({ languages: ['en'] }).then(function (r) { rec = r; return r; });
  }
  /* strokes: [[{x,y,t}]] → 읽은 글자 후보 [text…] (최대 5개) */
  function read(strokes, pointerType) {
    return supported().then(function (ok) {
      if (!ok || !strokes.length) return null;
      return Promise.race([
        get().then(function (r) {
          var d = r.startDrawing({ recognitionType: 'text', inputType: pointerType === 'pen' ? 'stylus' : pointerType === 'mouse' ? 'mouse' : 'touch', alternatives: 5 });
          var t0 = strokes[0][0].t;
          strokes.forEach(function (p) { var s = new HandwritingStroke(); p.forEach(function (q) { s.addPoint({ x: q.x, y: q.y, t: q.t - t0 }); }); d.addStroke(s); });
          return d.getPrediction().then(function (ps) { try { d.clear(); } catch (e) { } return (ps || []).map(function (x) { return x.text || ''; }); });
        }),
        new Promise(function (res) { setTimeout(function () { res(null); }, 5000); })
      ]);
    }).catch(function () { return null; });
  }
  return { supported: supported, read: read };
})();
