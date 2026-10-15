"""Bundle current homepage and destination builds into an offline review file."""
from pathlib import Path
import re,base64,json
root=Path('dist');pages={}
def bundle(p):
 return re.sub(r'from"(\./[^\"]+)"',lambda m:'from"data:text/javascript;base64,'+base64.b64encode(bundle(p.parent/m[1]).encode()).decode()+'"',p.read_text())
for lang in ['zh-hans','zh-hant','en']:
 for kind in ['home','destination','pricing']:
  f=('index.html' if lang=='zh-hans' else f'{lang}/index.html') if kind=='home' else (f'{lang}/articles/saipan-vs-us-mainland/index.html' if lang=='zh-hans' else f'{lang}/why-saipan/index.html')
  if kind=='pricing': f=f'{lang}/articles/price-ranges-and-addon-items/index.html' if lang=='zh-hans' else f'{lang}/pricing/index.html'
  s=(root/f).read_text()
  s=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',lambda m:'<style>'+(root/m[1].lstrip('/')).read_text()+'</style>',s)
  s=re.sub(r'src="(/images/[^"]+)"',lambda m:'src="data:image/jpeg;base64,'+base64.b64encode((root/m[1].lstrip('/')).read_bytes()).decode()+'"',s)
  s=re.sub(r'<script type="module" src="([^"]+)"></script>',lambda m:'<script type="module">'+bundle(root/m[1].lstrip('/'))+'</script>',s)
  pages[lang+':'+kind]=s
out='''<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Saipan Design Preview</title><style>body{margin:0}header{min-height:48px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;background:#f9f7f1;padding:6px;box-sizing:border-box;font:12px system-ui}select{padding:6px 12px;color:#193f3a;border:1px solid #9cac9d;background:white}iframe{border:0;width:100%;height:calc(100dvh - 60px)}</style><header><select id="lang" aria-label="语言"><option value="zh-hans">简体中文</option><option value="zh-hant">繁體中文</option><option value="en">English</option></select><select id="page" aria-label="页面"><option value="pricing">费用与服务</option><option value="destination">为什么选塞班</option><option value="home">首页</option></select></header><iframe title="Saipan design preview"></iframe><script>const pages=DATA;function show(){document.querySelector('iframe').srcdoc=pages[document.querySelector('#lang').value+':'+document.querySelector('#page').value]}document.querySelectorAll('select').forEach(s=>s.addEventListener('change',show));show()</script></html>'''
Path('../saipan-home-preview.html').write_text(out.replace('DATA',json.dumps(pages).replace('</script','<\\/script')))
