# -*- coding: utf-8 -*-
# 压缩 /dxr 站点:HTML 内嵌 base64 图片 -> 限宽1600 + JPEG q82(白底铺平)
# 单独的 assets/*.png 顺带 optimize。输出前后体积对比。
import base64, io, os, re, sys
from PIL import Image

MAXW = 1600
QUALITY = 82
datauri_re = re.compile(rb'data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)')

def compress_bytes(raw):
    im = Image.open(io.BytesIO(raw))
    w, h = im.size
    if w * h > 12000 * 12000:  # 防超大图内存爆
        return None
    if im.mode in ('RGBA', 'P', 'LA'):
        bg = Image.new('RGB', im.size, (255, 255, 255))
        im2 = im.convert('RGBA')
        bg.paste(im2, mask=im2.split()[-1])
        im = bg
    elif im.mode != 'RGB':
        im = im.convert('RGB')
    if w > MAXW:
        im = im.resize((MAXW, round(h * MAXW / w)), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    return out.getvalue()

total_before = total_after = 0
img_count = 0
for root, dirs, files in os.walk(sys.argv[1]):
    for fn in files:
        p = os.path.join(root, fn)
        if fn.endswith('.html'):
            src = open(p, 'rb').read()
            orig = len(src)
            stats = [0]
            def repl(m):
                try:
                    raw = base64.b64decode(m.group(2))
                    comp = compress_bytes(raw)
                    if comp and len(comp) < len(raw) * 0.9:
                        stats[0] += 1
                        return b'data:image/jpeg;base64,' + base64.b64encode(comp)
                except Exception:
                    pass
                return m.group(0)
            out = datauri_re.sub(repl, src)
            if stats[0]:
                open(p, 'wb').write(out)
            total_before += orig; total_after += len(out)
            if stats[0] or orig > 500_000:
                print('%-50s imgs:%-4d %6dKB -> %6dKB' % (fn, stats[0], orig//1024, len(out)//1024))
            img_count += stats[0]
        elif fn.endswith('.png'):
            try:
                im = Image.open(p)
                if im.width > MAXW:
                    im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
                im.save(p, 'PNG', optimize=True)
            except Exception as e:
                print('PNG skip', fn, e)

print('=== TOTAL imgs:%d  %.1fMB -> %.1fMB' % (img_count, total_before/1048576.0, total_after/1048576.0))
