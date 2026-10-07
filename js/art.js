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
    if (o.she) s += '<circle cx="' + (cx + r * 0.62) + '" cy="' + (cy - r * 0.78) + '" r="' + (r * 0.2) + '" fill="#E36D98"/><circle cx="' + (cx + r * 0.62) + '" cy="' + (cy - r * 0.78) + '" r="' + (r * 0.08) + '" fill="#fff"/>';
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
    if (o.cute) s += '<ellipse cx="' + (cx - r * 0.6) + '" cy="' + (cy + r * 0.38) + '" rx="' + (r * 0.17) + '" ry="' + (r * 0.1) + '" fill="#F59BB5"/><ellipse cx="' + (cx + r * 0.6) + '" cy="' + (cy + r * 0.38) + '" rx="' + (r * 0.17) + '" ry="' + (r * 0.1) + '" fill="#F59BB5"/>';
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
    var hy = ground - H + r, neck = hy + r, legTop = ground - H * 0.36, shirt = o.shirt || '#E36D98';
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
  function floor() { return '<ellipse cx="120" cy="230" rx="104" ry="7" fill="#E9EAEE"/>'; }
  function portrait(o) {
    var shirt = o.shirt || '#7A5CC9';
    return svg('<circle cx="120" cy="120" r="112" fill="#F4F1FB"/><path d="M42,240 Q46,176 120,172 Q194,176 198,240Z" fill="' + shirt + '"/>' + face(120, 110, 58, o) +
      (o.cute ? sparkle(48, 60, 14) + sparkle(196, 78, 10) + sparkle(186, 34, 7) : '') +
      (o.ask ? '<g><circle cx="196" cy="46" r="30" fill="#fff" stroke="#7A5CC9" stroke-width="5"/><text x="196" y="60" text-anchor="middle" font-size="40" font-weight="700" fill="#7A5CC9" font-family="Andika,sans-serif">?</text></g>' : ''));
  }

  var SCENES = {
    tall: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#9AA0AA' }) + figure(84, 228, { tall: 1, she: 1, hair: 'long', shirt: '#7A5CC9' }) + arrow(36, 32, 226)); },
    short: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#9AA0AA' }) + figure(84, 228, { short: 1, shirt: '#2B8AC9' }) + arrow(36, 124, 226)); },
    big: function () { return svg(floor() + figure(172, 228, { fade: 1, shirt: '#9AA0AA' }) + figure(90, 228, { big: 1, shirt: '#E89A3C' })); },
    small: function () { return svg(floor() + figure(160, 228, { fade: 1, shirt: '#9AA0AA' }) + figure(84, 228, { small: 1, shirt: '#10B183', hair: 'curly' })); },
    longhair: function () { return portrait({ hair: 'long', she: 1, shirt: '#E36D98' }); },
    shorthair: function () { return portrait({ hair: 'short', shirt: '#2B8AC9' }); },
    curly: function () { return portrait({ hair: 'curly', shirt: '#E89A3C' }); },
    bigeyes: function () { return portrait({ hair: 'short', bigeyes: 1, she: 1, shirt: '#10B183' }); },
    glasses: function () { return portrait({ hair: 'short', glasses: 1, shirt: '#2B4789' }); },
    cute: function () { return portrait({ hair: 'curly', cute: 1, bigeyes: 1, she: 1, shirt: '#F59BB5' }); },
    ask: function () { return portrait({ hair: 'long', she: 1, ask: 1, shirt: '#7A5CC9' }); }
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

  return { pic: pic, person: person };
})();
