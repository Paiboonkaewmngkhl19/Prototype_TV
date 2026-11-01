#!/usr/bin/env python3
"""Move inline <style>/<script> out of each root *.html into <page>/ files.

  <style>  -> all appended to <page>/<page>.css, one <link> where the first <style> was
  <script> -> <page>/<page>-N.js (byte-for-byte), replaced in place by <script src>
Pages whose inline CSS+JS is under 10 KB are skipped. Usage: python3 tools/split-pages.py [page.html ...]
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_INLINE = 10 * 1024
JS_TYPES = {'', 'text/javascript', 'application/javascript', 'module'}

TAG = re.compile(r'<!--|<(script|style)\b([^>]*)>', re.I)
ATTR_TYPE = re.compile(r'\btype\s*=\s*["\']?([^"\'\s>]+)', re.I)
ATTR_SRC = re.compile(r'\bsrc\s*=', re.I)
ATTR_MEDIA = re.compile(r'\bmedia\s*=\s*["\']([^"\']*)["\']', re.I)
CSS_URL = re.compile(r'url\(\s*(["\']?)([^"\')]+?)\1\s*\)', re.I)
# Custom properties that JS fills with a page-relative url(). Chrome resolves those against the
# stylesheet that uses var(), so rules consuming them stay inline to keep resolving from the page.
URL_VARS = ('--img',)
RULE = re.compile(r'[^{}]*\{[^{}]*\}')


def rewrite_urls(css):
    def fix(m):
        q, p = m.group(1), m.group(2).strip()
        if re.match(r'(https?:|data:|blob:|about:|#|/|\.\./)', p, re.I):
            return m.group(0)
        return 'url(%s../%s%s)' % (q, p, q)
    return CSS_URL.sub(fix, css)


def keep_inline(css):
    """Split out top-level rules that use var(<URL_VARS>); returns (css, inline_rules)."""
    keep, out, last = [], [], 0
    for m in RULE.finditer(css):
        if css.count('{', 0, m.start()) != css.count('}', 0, m.start()):
            continue
        if any('var(%s' % v in m.group(0) for v in URL_VARS):
            out.append(css[last:m.start()])
            keep.append(m.group(0).strip())
            last = m.end()
    out.append(css[last:])
    return ''.join(out), keep


def scan(html):
    """Yield (kind, start, end, attrs, body) for every inline style/JS script, skipping comments."""
    pos = 0
    while True:
        m = TAG.search(html, pos)
        if not m:
            return
        if m.group(0) == '<!--':
            end = html.find('-->', m.end())
            pos = len(html) if end < 0 else end + 3
            continue
        name, attrs = m.group(1).lower(), m.group(2)
        close = re.compile(r'</%s\s*>' % name, re.I).search(html, m.end())
        if not close:
            return
        pos = close.end()
        body = html[m.end():close.start()]
        if name == 'script':
            t = ATTR_TYPE.search(attrs)
            if ATTR_SRC.search(attrs) or (t and t.group(1).lower() not in JS_TYPES):
                continue
        yield name, m.start(), close.end(), attrs, body


def split(path):
    page = os.path.splitext(os.path.basename(path))[0]
    with open(path, encoding='utf-8', newline='') as f:
        html = f.read()
    blocks = list(scan(html))
    inline = sum(len(b[4].encode('utf-8')) for b in blocks)
    before = len(html.encode('utf-8'))
    if inline < MIN_INLINE:
        return page, before, before, 'skipped (%.1f KB inline)' % (inline / 1024)

    outdir = os.path.join(ROOT, page)
    os.makedirs(outdir, exist_ok=True)
    css_parts, created, out, last, n_js, linked = [], [], [], 0, 0, False
    for name, start, end, attrs, body in blocks:
        out.append(html[last:start])
        last = end
        if name == 'style':
            media = ATTR_MEDIA.search(attrs)
            css_parts.append('@media %s {%s}' % (media.group(1), body) if media else body)
            if not linked:
                out.append('<link rel="stylesheet" href="%s/%s.css">' % (page, page))
                linked = True
        else:
            n_js += 1
            fname = '%s-%d.js' % (page, n_js)
            with open(os.path.join(outdir, fname), 'w', encoding='utf-8', newline='') as f:
                f.write(body)
            created.append(fname)
            attrs = attrs.rstrip()
            out.append('<script%s src="%s/%s"></script>' % (attrs, page, fname))
    out.append(html[last:])

    new = ''.join(out)
    if css_parts:
        css, keep = keep_inline('\n'.join(css_parts))
        with open(os.path.join(outdir, page + '.css'), 'w', encoding='utf-8', newline='') as f:
            f.write(rewrite_urls(css))
        created.insert(0, page + '.css')
        if keep:
            link = '<link rel="stylesheet" href="%s/%s.css">' % (page, page)
            new = new.replace(link, link + '\n<style>\n  ' + '\n  '.join(keep) + '\n</style>', 1)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(new)
    return page, before, len(new.encode('utf-8')), ', '.join(created)


def main():
    pages = sys.argv[1:] or sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))
    rows = [split(os.path.join(ROOT, p)) for p in pages]
    print('| page | size before | size after | files created |')
    print('|---|---|---|---|')
    for page, b, a, files in rows:
        print('| %s | %.1f KB | %.1f KB | %s |' % (page, b / 1024, a / 1024, files))


if __name__ == '__main__':
    main()
