"""Extract published WordPress pages to an ignored review area; never auto-publish."""
import argparse,json,re,xml.etree.ElementTree as ET
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('file');args=parser.parse_args()
raw=Path(args.file).read_bytes()
if len(raw)>50_000_000:raise SystemExit('Export exceeds 50 MB review limit')
if re.search(br'<!\s*(DOCTYPE|ENTITY)',raw,re.I):raise SystemExit('DTD/entity declarations refused')
root=ET.fromstring(raw)
ns={'wp':'http://wordpress.org/export/1.2/','content':'http://purl.org/rss/1.0/modules/content/'}
items=[];skipped=0
for item in root.findall('./channel/item'):
 if item.findtext('wp:status','',ns)!='publish' or item.findtext('wp:post_type','',ns)!='page' or item.findtext('wp:post_password','',ns):skipped+=1;continue
 url=item.findtext('link','')
 if not url.startswith('https://shigekiisogai.wordpress.com/'):skipped+=1;continue
 items.append({'title':item.findtext('title',''),'source':url,'html':item.findtext('content:encoded','',ns)})
out=Path('.migration/wxr-review');out.mkdir(parents=True,exist_ok=True)
p=out/'candidates.json'
if p.exists():raise SystemExit('Review file already exists; archive it before another import')
p.write_text(json.dumps(items,ensure_ascii=False,indent=2))
print(f'{len(items)} published page candidates staged; {skipped} items excluded. Review path: {p}. HTML is untrusted; no live content changed.')
