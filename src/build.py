"""把 src/ 底下的零件組成單一 HTML 檔。
用法：python3 build.py ch5
零件：common/style.css、common/core.js、<章>/shell.html、<章>/tabs/t*.html（含 <!--NAV: 標題--> 第一行）、<章>/js/*.js
"""
import re, sys, pathlib

root = pathlib.Path(__file__).parent
ch = sys.argv[1] if len(sys.argv) > 1 else 'ch5'
OUT = {'ch5': '第五章_地球的環境_互動課本.html',
       'ch6': '第六章_板塊運動與岩層的祕密_互動課本.html',
       'ch7': '第七章_浩瀚的宇宙_互動課本.html'}[ch]

def read(p): return (root / p).read_text(encoding='utf-8')

def clean(s):
    # 擋掉看不見的控制字元（之前咬過：0x0B、NUL）
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)

tabs = sorted((root / ch / 'tabs').glob('t*.html'), key=lambda p: int(re.findall(r'\d+', p.stem)[0]))
nav, panels = [], []
for i, p in enumerate(tabs):
    txt = p.read_text(encoding='utf-8')
    m = re.match(r'\s*<!--NAV:(.*?)-->', txt)
    title = m.group(1).strip() if m else p.stem
    tid = p.stem
    nav.append(f'    <button data-tab="{tid}"><span class="n">{i}</span>{title}</button>')
    panels.append(f'<section class="panel" id="p-{tid}">\n{txt}\n</section>')

js_files = [root / 'common' / 'core.js'] + sorted(p for p in (root / 'common').glob('*.js') if p.name != 'core.js') + sorted((root / ch / 'js').glob('*.js'))
js = '\n'.join(f'/* ==== {f.name} ==== */\n' + f.read_text(encoding='utf-8') for f in js_files)

html = read(f'{ch}/shell.html')
html = html.replace('{{CSS}}', read('common/style.css'))
html = html.replace('{{NAV}}', '\n'.join(nav))
html = html.replace('{{TABS}}', '\n'.join(panels))
html = html.replace('{{JS}}', js)
html = clean(html)
out = root.parent / OUT
out.write_text(html, encoding='utf-8')
(root.parent / f'{ch}.html').write_text(html, encoding='utf-8')   # 網頁版用英文檔名（網址比較短）
print(f'OK → {out}  ({len(html)//1024} KB, {len(tabs)} 分頁)')
