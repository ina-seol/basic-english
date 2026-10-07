/* 그림: 이모지 그림과, 생김새 단원용 사람 그림(SVG)을 만듭니다. */
var ART = (function () {
  var SKIN = '#F6D2B4', SKIN_DK = '#E3B08C', HAIR = '#3B2A20', PANTS = '#3D4A6B', INK = '#1A1C21';

  function face(cx, cy, r, o) {
    var s = '', hair = o.hairColor || HAIR, h = o.hair || 'short';
    // 뒷머리
    if (h === 'long') s += '<path d="M' + (cx - r * 1.08) + ',' + (cy - 0.2 * r) + ' Q' + (cx - r * 1.15) + ',' + (cy - 1.25 * r) + ' ' + cx + ',' + (cy - 1.2 * r) +
      ' Q' + (cx + r * 1.15) + ',' + (cy - 1.25 * r) + ' ' + (cx + r * 1.08) + ',' + (cy - 0.2 * r) + ' L' + (cx + r * 1.12) + ',' + (cy + 1.9 * r) +
      ' Q' + cx + ',' + (cy + 2.05 * r) + ' ' + (cx - r * 1.12) + ',' + (cy + 1.9 * r) + ' Z" fill="' + hair + '"/>';
    if (h === 'curly') for (var a = -205; a <= 25; a += 23) {
      var rad = a * Math.PI / 180;
      s += '<circle cx="' + (cx + Math.cos(rad) * r * 1.0) + '" cy="' + (cy + Math.sin(rad) * r * 1.0) + '" r="' + (r * 0.36) + '" fill="' + hair + '"/>';
    }
    // 귀와 얼굴
    if (h !== 'long') s += '<circle cx="' + (cx - r * 0.98) + '" cy="' + (cy + r * 0.08) + '" r="' + (r * 0.2) + '" fill="' + SKIN_DK + '"/><circle cx="' + (cx + r * 0.98) + '" cy="' + (cy + r * 0.08) + '" r="' + (r * 0.2) + '" fill="' + SKIN_DK + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + SKIN + '"/>';
    // 앞머리
    if (h === 'short' || h === 'long') s += '<path d="M' + (cx - r * 1.02) + ',' + (cy - 0.05 * r) + ' Q' + (cx - r * 1.05) + ',' + (cy - 1.2 * r) + ' ' + cx + ',' + (cy - 1.12 * r) +
      ' Q' + (cx + r * 1.05) + ',' + (cy - 1.2 * r) + ' ' + (cx + r * 1.02) + ',' + (cy - 0.05 * r) + ' Q' + (cx + r * 0.55) + ',' + (cy - 0.62 * r) + ' ' + (cx - r * 0.1) + ',' + (cy - 0.6 * r) +
      ' Q' + (cx - r * 0.7) + ',' + (cy - 0.55 * r) + ' ' + (cx - r * 1.02) + ',' + (cy - 0.05 * r) + ' Z" fill="' + hair + '"/>';
    if (h === 'curly') for (var b = -0.75; b <= 0.76; b += 0.25) s += '<circle cx="' + (cx + b * r) + '" cy="' + (cy - r * (0.82 + 0.12 * (1 - Math.abs(b)))) + '" r="' + (r * 0.3) + '" fill="' + hair + '"/>';
    if (o.she) s += '<circle cx="' + (cx + r * 0.62) + '" cy="' + (cy - r * 0.78) + '" r="' + (r * 0.2) + '" fill="#E74C3C"/><circle cx="' + (cx + r * 0.62) + '" cy="' + (cy - r * 0.78) + '" r="' + (r * 0.08) + '" fill="#fff"/>';
    // 눈
    var ey = cy + r * 0.05, ex = r * 0.38;
    [-1, 1].forEach(function (d) {
      var x = cx + d * ex;
      if (o.bigeyes) s += '<circle cx="' + x + '" cy="' + ey + '" r="' + (r * 0.24) + '" fill="#fff" stroke="' + INK + '" stroke-width="' + (r * 0.04) + '"/><circle cx="' + x + '" cy="' + (ey + r * 0.03) + '" r="' + (r * 0.16) + '" fill="' + INK + '"/><circle cx="' + (x + r * 0.06) + '" cy="' + (ey - r * 0.04) + '" r="' + (r * 0.055) + '" fill="#fff"/>';
      else s += '<circle cx="' + x + '" cy="' + ey + '" r="' + (r * 0.1) + '" fill="' + INK + '"/>';
    });
    if (o.glasses) s += '<g fill="rgba(255,255,255,.25)" stroke="' + INK + '" stroke-width="' + (r * 0.075) + '"><circle cx="' + (cx - ex) + '" cy="' + ey + '" r="' + (r * 0.3) + '"/><circle cx="' + (cx + ex) + '" cy="' + ey + '" r="' + (r * 0.3) + '"/>' +
      '<path fill="none" d="M' + (cx - ex + r * 0.3) + ',' + ey + ' Q' + cx + ',' + (ey - r * 0.12) + ' ' + (cx + ex - r * 0.3) + ',' + ey + ' M' + (cx - ex - r * 0.3) + ',' + ey + ' L' + (cx - r * 0.98) + ',' + (ey - r * 0.1) + ' M' + (cx + ex + r * 0.3) + ',' + ey + ' L' + (cx + r * 0.98) + ',' + (ey - r * 0.1) + '"/></g>';
    // 볼과 입
    // 그림책 동물처럼 볼은 늘 발그레하게 (귀여운 얼굴은 더 진하게)
    var bk = o.cute ? 1 : .8, bo = o.cute ? 1 : .75;
    [-1, 1].forEach(function (d) { s += '<ellipse cx="' + (cx + d * r * 0.6) + '" cy="' + (cy + r * 0.36) + '" rx="' + (r * 0.18 * bk) + '" ry="' + (r * 0.12 * bk) + '" fill="#F59BB5" opacity="' + bo + '"/>'; });
    var mw = o.cute ? 0.3 : 0.22;
    s += '<path d="M' + (cx - r * mw) + ',' + (cy + r * 0.45) + ' Q' + cx + ',' + (cy + r * (o.cute ? 0.85 : 0.68)) + ' ' + (cx + r * mw) + ',' + (cy + r * 0.45) + '" fill="' + (o.cute ? '#C2415E' : 'none') + '" stroke="' + INK + '" stroke-width="' + (r * 0.07) + '" stroke-linecap="round"/>';
    return s;
  }

  function sparkle(x, y, k) {
    return '<path d="M' + x + ',' + (y - k) + ' Q' + x + ',' + y + ' ' + (x + k) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + k) + ' Q' + x + ',' + y + ' ' + (x - k) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - k) + 'Z" fill="#E7C33A"/>';
  }

  // 서 있는 사람. ground: 발 위치
  function figure(cx, ground, o) {
    var H = o.tall ? 196 : o.short ? 104 : 146, bw = o.big ? 74 : o.small ? 30 : 46, r = o.big ? 25 : o.small ? 17 : 22;
    if (o.small) H = 112;
    if (o.chibi) { r = Math.round(r * 1.55); H += 14; }
    var hy = ground - H + r, neck = hy + r, legTop = ground - H * 0.36, shirt = o.shirt || '#E74C3C';
    var lw = Math.max(9, bw * 0.3), s = '<g' + (o.fade ? ' opacity=".28"' : '') + '>';
    s += '<line x1="' + (cx - bw / 2 + 5) + '" y1="' + (neck + 10) + '" x2="' + (cx - bw / 2 - 9) + '" y2="' + (legTop - 2) + '" stroke="' + SKIN_DK + '" stroke-width="' + (o.big ? 13 : 9) + '" stroke-linecap="round"/>';
    s += '<line x1="' + (cx + bw / 2 - 5) + '" y1="' + (neck + 10) + '" x2="' + (cx + bw / 2 + 9) + '" y2="' + (legTop - 2) + '" stroke="' + SKIN_DK + '" stroke-width="' + (o.big ? 13 : 9) + '" stroke-linecap="round"/>';
    s += '<rect x="' + (cx - bw / 2 + 2) + '" y="' + (legTop - 4) + '" width="' + lw + '" height="' + (ground - legTop) + '" rx="4" fill="' + PANTS + '"/>';
    s += '<rect x="' + (cx + bw / 2 - 2 - lw) + '" y="' + (legTop - 4) + '" width="' + lw + '" height="' + (ground - legTop) + '" rx="4" fill="' + PANTS + '"/>';
    s += '<rect x="' + (cx - bw / 2) + '" y="' + (neck - 3) + '" width="' + bw + '" height="' + (legTop - neck + 10) + '" rx="' + Math.min(bw / 2.4, 16) + '" fill="' + shirt + '"/>';
    s += face(cx, hy, r, o) + '</g>';
    return s;
  }

  function svg(inner, vb) { return '<svg class="art" viewBox="' + (vb || '0 0 240 240') + '" role="img" aria-hidden="true">' + inner + '</svg>'; }
  function floor() { return '<ellipse cx="120" cy="230" rx="104" ry="7" fill="#EFE2CF"/>'; }
  function portrait(o) {
    var shirt = o.shirt || '#0295A9';
    return svg('<circle cx="120" cy="120" r="112" fill="#FFF1DE"/><path d="M42,240 Q46,176 120,172 Q194,176 198,240Z" fill="' + shirt + '"/>' + face(120, 110, 58, o) +
      (o.cute ? sparkle(48, 60, 14) + sparkle(196, 78, 10) + sparkle(186, 34, 7) : '') +
      (o.ask ? '<g><circle cx="196" cy="46" r="30" fill="#fff" stroke="#0295A9" stroke-width="5"/><text x="196" y="60" text-anchor="middle" font-size="40" font-weight="700" fill="#0295A9" font-family="Andika,sans-serif">?</text></g>' : ''));
  }

  var SCENES = {
    tall: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#C9BBAA' }) + figure(84, 228, { tall: 1, she: 1, hair: 'long', shirt: '#0295A9' }) + arrow(36, 32, 226)); },
    short: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#C9BBAA' }) + figure(84, 228, { short: 1, shirt: '#036370' }) + arrow(36, 124, 226)); },
    big: function () { return svg(floor() + figure(172, 228, { fade: 1, shirt: '#C9BBAA' }) + figure(90, 228, { big: 1, shirt: '#F28C28' })); },
    small: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#C9BBAA' }) + figure(84, 228, { small: 1, shirt: '#3FA34D', hair: 'curly' })); },
    longhair: function () { return portrait({ hair: 'long', she: 1, shirt: '#E74C3C' }); },
    shorthair: function () { return portrait({ hair: 'short', shirt: '#036370' }); },
    curly: function () { return portrait({ hair: 'curly', shirt: '#F28C28' }); },
    bigeyes: function () { return portrait({ hair: 'short', bigeyes: 1, she: 1, shirt: '#3FA34D' }); },
    glasses: function () { return portrait({ hair: 'short', glasses: 1, shirt: '#036370' }); },
    cute: function () { return portrait({ hair: 'curly', cute: 1, bigeyes: 1, she: 1, shirt: '#FFBB12' }); },
    ask: function () { return portrait({ hair: 'long', she: 1, ask: 1, shirt: '#0295A9' }); }
  };
  function arrow(x, y1, y2) {
    return '<g stroke="#1A1C21" stroke-width="3" stroke-linecap="round" fill="none"><line x1="' + x + '" y1="' + (y1 + 4) + '" x2="' + x + '" y2="' + (y2 - 4) + '"/><path d="M' + (x - 7) + ',' + (y1 + 11) + ' L' + x + ',' + (y1 + 3) + ' L' + (x + 7) + ',' + (y1 + 11) + ' M' + (x - 7) + ',' + (y2 - 11) + ' L' + x + ',' + (y2 - 3) + ' L' + (x + 7) + ',' + (y2 - 11) + '"/></g>';
  }

  // 누구일까요 게임에 나오는 친구 한 명 (서 있는 모습)
  function person(o) { o.chibi = 1; return svg(floor() + figure(120, 228, o)); }

  function pic(p, cls) {
    if (p && p.p) return '<span class="pic pic-svg ' + (cls || '') + '">' + SCENES[p.p]() + '</span>';
    var n = window.Intl && Intl.Segmenter ? Array.from(new Intl.Segmenter().segment(p)).length : Array.from(p).length;
    return '<span class="pic pic-emo ' + (cls || '') + '" data-n="' + Math.min(n, 4) + '">' + p + '</span>';
  }

  /* 그림책 꾸밈: 나뭇잎, 도토리, 버섯, 열매, 동그란 나무, 풀잎 (little book 참고) */
  var DECO = {
    leaf: function (c) { return '<path d="M0,-14 C9,-8 9,8 0,14 C-9,8 -9,-8 0,-14Z" fill="' + c + '"/><path d="M0,-11 L0,14" stroke="#fff" stroke-width="1.2" opacity=".7"/>'; },
    acorn: function () { return '<ellipse cx="0" cy="4" rx="7" ry="9" fill="#E3A35B"/><path d="M-9,-1 Q0,-11 9,-1 Q0,2 -9,-1Z" fill="#8A5A3B"/><path d="M0,-6 L1,-11" stroke="#8A5A3B" stroke-width="2" stroke-linecap="round"/>'; },
    shroom: function () { return '<rect x="-3.5" y="-2" width="7" height="12" rx="3" fill="#F6E3C8"/><path d="M-12,0 Q-11,-13 0,-13 Q11,-13 12,0Z" fill="#E74C3C"/><circle cx="-5" cy="-6" r="1.8" fill="#fff"/><circle cx="4" cy="-8" r="1.5" fill="#fff"/><circle cx="6" cy="-3" r="1.2" fill="#fff"/>'; },
    berry: function () { return '<path d="M0,12 Q-2,0 -6,-8 M0,12 Q2,0 7,-6 M0,12 L0,-10" stroke="#8A5A3B" stroke-width="1.4" fill="none"/><circle cx="-6" cy="-9" r="3" fill="#C9473B"/><circle cx="7" cy="-7" r="3" fill="#C9473B"/><circle cx="0" cy="-11" r="3" fill="#C9473B"/>'; },
    tree: function () { return '<rect x="-2" y="4" width="4" height="14" rx="2" fill="#8A5A3B"/><circle cx="0" cy="-4" r="13" fill="#F2A33A"/><path d="M0,10 L0,-12 M0,-2 L-6,-8 M0,2 L6,-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".85"/>'; },
    sprig: function () { return '<path d="M0,14 Q2,0 0,-14" stroke="#6E9A86" stroke-width="1.5" fill="none"/>' + [-9, -3, 3, 9].map(function (y, i) { var d = i % 2 ? 1 : -1; return '<ellipse cx="' + (d * 5) + '" cy="' + y + '" rx="5" ry="2.6" fill="#8DB5A0" transform="rotate(' + (d * -30) + ' ' + (d * 5) + ' ' + y + ')"/>'; }).join(''); }
  };
  // 흩어 놓은 꾸밈 무늬 (seed 가 같으면 늘 같은 배치)
  function pattern(w, h, seed, opt) {
    opt = opt || {};
    var r = seed || 7, rnd = function () { r = (r * 9301 + 49297) % 233280; return r / 233280; };
    var kinds = opt.kinds || ['leaf', 'acorn', 'shroom', 'berry', 'tree', 'sprig', 'leaf'], leafC = ['#F2A33A', '#E3743C', '#C9473B', '#8DB5A0', '#E7B94A'];
    var step = opt.step || 70, s = '';
    for (var y = step / 2; y < h; y += step) for (var x = step / 2; x < w; x += step) {
      var k = kinds[Math.floor(rnd() * kinds.length)], px = x + (rnd() - .5) * step * .6, py = y + (rnd() - .5) * step * .6, rot = Math.round((rnd() - .5) * 70), sc = (.8 + rnd() * .5) * (opt.scale || 1);
      if (opt.skip && opt.skip(px, py)) continue;
      s += '<g transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + rot + ') scale(' + sc.toFixed(2) + ')">' + DECO[k](leafC[Math.floor(rnd() * leafC.length)]) + '</g>';
    }
    return '<svg class="deco" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + '</svg>';
  }
  // 몇 개만 놓는 꾸밈. list: [[종류, x, y, 회전, 크기, 색], ...] (100×100 기준)
  function bits(list) {
    return '<svg class="bits" viewBox="0 0 100 100" aria-hidden="true">' + list.map(function (b) {
      return '<g transform="translate(' + b[1] + ' ' + b[2] + ') rotate(' + (b[3] || 0) + ') scale(' + (b[4] || 1) + ')">' + DECO[b[0]](b[5] || '#F2A33A') + '</g>';
    }).join('') + '</svg>';
  }
  // 별 모양 배지 (Kids Park 의 starburst)
  function burst(color) {
    var p = '', n = 9;
    for (var i = 0; i < n * 2; i++) { var a = Math.PI * i / n - Math.PI / 2, rr = i % 2 ? 37 : 47; p += (i ? 'L' : 'M') + (50 + Math.cos(a) * rr).toFixed(1) + ',' + (50 + Math.sin(a) * rr).toFixed(1); }
    return '<svg class="burst" viewBox="0 0 100 100" aria-hidden="true"><path d="' + p + 'Z" fill="' + color + '" stroke="' + color + '" stroke-width="9" stroke-linejoin="round"/></svg>';
  }

  return { pic: pic, person: person, pattern: pattern, bits: bits, burst: burst };
})();
