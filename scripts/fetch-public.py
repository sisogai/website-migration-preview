"""Read only public HTML/XML from the exact source host; never fetch documents."""
import urllib.request,urllib.parse,urllib.robotparser,json,time,hashlib
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT='https://shigekiisogai.wordpress.com/'
OUT=Path('.migration/raw');OUT.mkdir(parents=True,exist_ok=True)
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if t=='a' and d.get('href'):self.links.append(d['href'])

def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'WebsiteMigrationPreview/1.0 (public-page archival)'})
 r=urllib.request.urlopen(req,timeout=30)
 if urllib.parse.urlparse(r.url).hostname != 'shigekiisogai.wordpress.com':raise ValueError('unexpected redirect')
 if not any(x in r.headers.get('Content-Type','') for x in ['text/html','xml','text/plain']):raise ValueError('non-page content refused')
 return r.read().decode('utf-8')
robots=fetch(ROOT+'robots.txt');(OUT/'robots.txt').write_text(robots)
rp=urllib.robotparser.RobotFileParser();rp.parse(robots.splitlines())
queue=[ROOT];discovery=[]
for path in ['sitemap.xml']:
 try:
  data=fetch(ROOT+path);(OUT/path).write_text(data)
  tree=ET.fromstring(data)
  for el in tree.iter():
   if el.tag.endswith('loc') and el.text:
    u=el.text
    if u.startswith(ROOT) and ('sitemap' not in u):queue.append(u)
    elif u.startswith(ROOT) and 'sitemap' in u:
     data2=fetch(u);(OUT/('map-'+str(len(discovery))+'.xml')).write_text(data2);discovery.append(u)
     for e in ET.fromstring(data2).iter():
      if e.tag.endswith('loc') and e.text and e.text.startswith(ROOT):queue.append(e.text)
 except Exception as e:discovery.append({'url':ROOT+path,'error':str(e)})
seen=set();pages=[];fail=[]
while queue and len(seen)<60:
 url=queue.pop(0);p=urllib.parse.urlparse(url)
 url=urllib.parse.urlunparse(('https',p.netloc,urllib.parse.quote(urllib.parse.unquote(p.path),safe='/'),'', '', ''))
 if url in seen:continue
 seen.add(url)
 if p.hostname!='shigekiisogai.wordpress.com' or any(x in p.path for x in ['/feed','/wp-','/attachment','/author/','/category/','/tag/']) or p.path.lower().endswith(('.pdf','.png','.jpg','.jpeg','.xml')):continue
 if not rp.can_fetch('*',url):fail.append({'url':url,'reason':'robots.txt disallowed'});continue
 try:
  time.sleep(.5)
  html=fetch(url)
  name='home' if p.path=='/' else hashlib.sha256(url.encode()).hexdigest()[:12]
  (OUT/(name+'.html')).write_text(html)
  pages.append({'url':url,'file':name+'.html','sha256':hashlib.sha256(html.encode()).hexdigest()})
  parser=Links();parser.feed(html)
  queue.extend(urllib.parse.urljoin(url,u) for u in parser.links if urllib.parse.urlparse(urllib.parse.urljoin(url,u)).hostname==p.hostname and not urllib.parse.urlparse(u).query)
  print(url,flush=True)
 except Exception as e:fail.append({'url':url,'reason':str(e)})
Path('.migration/crawl.json').write_text(json.dumps({'pages':pages,'failures':fail,'sitemapDiscovery':discovery},ensure_ascii=False,indent=2))
print('pages',len(pages),'failures',fail)
