"""Create a self-contained, routable preview of every generated HTML page."""
from pathlib import Path
import re,base64,json,gzip
root=Path('dist');pages={};routes={};cache={}
def bundle(p):
 key=str(p)
 if key not in cache:
  cache[key]=re.sub(r'from"(\./[^\"]+)"',lambda m:'from"data:text/javascript;base64,'+base64.b64encode(bundle(p.parent/m[1]).encode()).decode()+'"',p.read_text())
 return cache[key]
def resource(path):
 p=root/path.lstrip('/')
 if p.exists():return p
 raise ValueError(f'Missing resource: {path}')
for file in sorted(root.rglob('*.html')):
 relative=file.relative_to(root).as_posix()
 route='/' if relative=='index.html' else '/'+relative.removesuffix('/index.html')
 if route.endswith('.html') and route!='/404.html':route=route.removesuffix('.html')
 s=file.read_text()
 s=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',lambda m:'<style>'+resource(m[1]).read_text()+'</style>',s)
 s=re.sub(r'src="(/images/[^"]+)"',lambda m:'src="data:image/jpeg;base64,'+base64.b64encode(resource(m[1]).read_bytes()).decode()+'"',s)
 s=re.sub(r'<script type="module" src="([^"]+)"></script>',lambda m:'<script type="module">'+bundle(resource(m[1]))+'</script>',s)
 pages[route]=s
 title=re.search(r'<title>(.*?)</title>',s)
 routes[route]=title[1] if title else route
payload=base64.b64encode(gzip.compress(json.dumps(pages,ensure_ascii=False).encode(),compresslevel=9)).decode()
out='''<!doctype html><html lang="zh-Hans"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Saipan · Full Site Preview</title><style>body{margin:0;background:#f9f7f1;font:12px system-ui;color:#193f3a}header{min-height:52px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:8px;box-sizing:border-box;border-bottom:1px solid #d1dbcc}select,button{padding:7px 10px;color:#193f3a;border:1px solid #9cac9d;background:white;border-radius:3px;max-width:40vw}button{cursor:pointer}iframe{border:0;width:100%;height:calc(100dvh - 65px);display:block}#status{padding:30px;text-align:center}small{font-size:10px;color:#647266}@media(max-width:600px){header small{display:none}select{max-width:38vw}iframe{height:calc(100dvh - 65px)}}</style><header><button id="back" disabled>← 返回</button><select id="lang" aria-label="语言"><option value="zh-hans">简体中文</option><option value="zh-hant">繁體中文</option><option value="en">English</option></select><select id="page" aria-label="页面"></select><small>完整站点预览 · 表单与客服尚未接入</small></header><div id="status" role="status">正在加载完整预览…</div><iframe title="Saipan full site preview" hidden></iframe><script>
const packed='PAYLOAD', titles=ROUTES, frame=document.querySelector('iframe'), status=document.querySelector('#status'), selector=document.querySelector('#page'), lang=document.querySelector('#lang'), back=document.querySelector('#back');
let pages={},current='/',stack=[],pendingHash='';
const normalize=p=>p.replace(/\\/index\\.html$/,'').replace(/\\/$/,'')||'/';
const locale=p=>p.split('/')[1]&&['zh-hans','zh-hant','en'].includes(p.split('/')[1])?p.split('/')[1]:'zh-hans';
function menu(){const l=locale(current);lang.value=l;selector.replaceChildren();Object.keys(pages).filter(p=>p!='/404.html'&&locale(p)===l).forEach(p=>{const o=document.createElement('option');o.value=p;o.textContent=titles[p];selector.append(o)});selector.value=current}
function anchor(hash){if(!hash)return;const doc=frame.contentDocument;let id;try{id=decodeURIComponent(hash.slice(1))}catch{id=hash.slice(1)}const el=doc?.getElementById(id);if(el){for(let n=el;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;el.scrollIntoView({block:'start'});if(el.matches('input,button,a,select,textarea'))el.focus();else el.querySelector('input,button,a,select,textarea')?.focus({preventScroll:true})}}
function go(path,hash='',record=true){path=normalize(path);if(!pages[path]){status.hidden=false;status.textContent='此页面未包含在当前构建中：'+path;return}if(record&&current!==path)stack.push(current);current=path;pendingHash=hash;frame.srcdoc=pages[path];menu();back.disabled=!stack.length;status.hidden=true;frame.hidden=false}
frame.addEventListener('load',()=>{const doc=frame.contentDocument;if(!doc)return;anchor(pendingHash);pendingHash='';doc.addEventListener('click',event=>{const a=event.target&&typeof event.target.closest==='function'?event.target.closest('a[href]'):null;if(!a)return;const raw=a.getAttribute('href');if(!raw||raw.startsWith('mailto:')||raw.startsWith('tel:'))return;if(raw.startsWith('#')){event.preventDefault();anchor(raw);return}let u;try{u=new URL(raw,'https://preview.invalid'+current+'/')}catch{return}if(u.origin==='https://preview.invalid'||u.hostname==='saipanivf.org'||u.hostname==='www.saipanivf.org'){event.preventDefault();go(u.pathname,u.hash)}else{a.target='_blank';a.rel='noopener noreferrer'}})});
selector.addEventListener('change',()=>go(selector.value));back.addEventListener('click',()=>{const previous=stack.pop();if(previous)go(previous,'',false)});
lang.addEventListener('change',()=>{const target=lang.value;const route=current==='/'?'/'+target:current.replace(/^\\/(zh-hans|zh-hant|en)(?=\\/|$)/,'/'+target);go(pages[route]?route:pages['/'+target]?'/'+target:'/')});
(async()=>{try{const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));pages=JSON.parse(await new Response(stream).text());go('/', '',false)}catch(error){status.textContent='预览加载失败，请使用新版 Chrome 或 Edge 打开。'+error.message}})();
</script></html>'''
out=out.replace('PAYLOAD',payload).replace('ROUTES',json.dumps(routes,ensure_ascii=False).replace('</script','<\\/script'))
Path('../saipan-home-preview.html').write_text(out)
print(f'Bundled {len(pages)} pages, {len(out):,} preview bytes')
# Verify every internal route represented by links exists in the bundled map.
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.add(d['id'])
  if tag=='a' and d.get('href','').startswith('/'):self.links.append(d['href'])
parsed={}
for route,s in pages.items():
 p=Links();p.feed(s);parsed[route]=p
count=0
for route,p in parsed.items():
 for href in p.links:
  u=urlparse(href);target=u.path.rstrip('/') or '/'
  if target not in pages:raise ValueError(f'{route}: missing bundled route {target}')
  if u.fragment and unquote(u.fragment) not in parsed[target].ids:raise ValueError(f'{route}: missing anchor {href}')
  count+=1
print(f'Verified {count} internal page links inside the offline preview')
