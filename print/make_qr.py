# A4 인쇄용 QR 안내문(qr-a4.html)을 만듭니다.  python make_qr.py
import re, segno, os
here = os.path.dirname(os.path.abspath(__file__))
BASE = 'https://ina-seol.github.io/basic-english/'

def qr(url):
    s = segno.make(url, error='q').svg_inline(scale=1, border=0, dark='#1F2A30', light=None)
    w = re.search(r'width="(\d+)"', s).group(1)
    return re.sub(r'<svg width="\d+" height="\d+" class="segno">',
                  '<svg viewBox="0 0 %s %s" shape-rendering="crispEdges" role="img" aria-label="%s">' % (w, w, url), s)

html = open(os.path.join(here, 'qr-a4.template.html'), encoding='utf-8').read()
html = html.replace('{{QR_STU}}', qr(BASE + '#s')).replace('{{QR_TEA}}', qr(BASE + '#t'))
open(os.path.join(here, 'qr-a4.html'), 'w', encoding='utf-8').write(html)
print('ok')
