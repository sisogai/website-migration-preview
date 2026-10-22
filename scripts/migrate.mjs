import fs from 'node:fs';
import {load} from 'cheerio';
import TurndownService from 'turndown';
const crawl=JSON.parse(fs.readFileSync('.migration/crawl.json','utf8'));
const td=new TurndownService({headingStyle:'atx',bulletListMarker:'-',emDelimiter:'*'});
// Explicit anchors, definition lists and layout blocks stay as HTML inside Markdown.
td.addRule('keepAnchors',{filter:n=>n.hasAttribute('id'),replacement:(_c,n)=>'\n\n'+n.outerHTML+'\n\n'});
td.keep(['dl','table']);
td.addRule('exactEmphasis',{filter:['strong','em','b','i'],replacement:(_c,n)=>n.outerHTML});
td.addRule('exactLinks',{filter:'a',replacement:(_c,n)=>n.outerHTML});
const pages=[], seen=new Set();
const names={'/':'home','/research/':'research','/teaching/':'teaching','/講義資料-course-materials/':'course-materials','/advising-policy-指導を希望する方へ/':'advising','/日本語/':'japanese','/ゲーム理論（2025年度前期）/':'game-theory-2025','/日本語教材の使用について（gbc生向け）/':'japanese-materials-policy'};
for(const item of crawl.pages){
 const route=decodeURIComponent(new URL(item.url).pathname)||'/';
 if(seen.has(route))continue; seen.add(route);
 const $=load(fs.readFileSync('.migration/raw/'+item.file,'utf8'));
 const title=$('.entry-title').first().text().trim();
 const root=$('.entry-content').first(); if(!root.length)throw new Error('Missing body '+route);
 root.find('script,style,iframe,object,embed,form,input,button,.sharedaddy,.jp-relatedposts,.wpcnt,#wordads-inline-marker,[id^="atatags"]').remove();
 root.find('*').each((_,el)=>{for(const [k,v] of Object.entries(el.attribs||{})){
  if(k.startsWith('on')||k==='srcdoc'||(k==='style'&&/url\(|expression|@import/i.test(v)))$(el).removeAttr(k);
  if(['href','src'].includes(k)&&/^\s*(javascript|data|vbscript):/i.test(v))throw new Error('Unsafe URL');
 }});
 const html=root.html().trim();
 const links=root.find('a[href]').toArray().map(el=>({text:$(el).text().trim(),href:$(el).attr('href')}));
 const images=root.find('img').toArray().map(el=>({src:$(el).attr('src'),alt:$(el).attr('alt')||''}));
 const id=names[route]||route.replaceAll('/','');
 const lang=['home','research','teaching'].includes(id)?'en':(/[\u3000-\u9fff]/.test(root.text())?'ja':'en');
 const body=id==='home'?html.split('\n').map(line=>line.trim()).filter(Boolean).join('\n'):td.turndown(html);
 const front={title,route,source:item.url,lang};
 fs.writeFileSync('src/content/pages/'+id+'.md','---\n'+Object.entries(front).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')+'\n---\n\n'+body+'\n');
 pages.push({...front,id,text:root.text().replace(/\s+/gu,''),links,images,anchors:root.find('[id]').toArray().map(el=>$(el).attr('id')),sourceSha256:item.sha256});
}
fs.writeFileSync('provenance/pages.json',JSON.stringify(pages,null,2)+'\n');
fs.writeFileSync('src/lib/routes.json',JSON.stringify(pages.map(({title,route,id})=>({title,route,id})),null,2)+'\n');
fs.writeFileSync('docs/page-map.md','# ページ対応表\n\nGitHub Pagesでは新パスの前に `/website-migration-preview` が付きます。Cloudflareでは表のパスをそのまま使います。\n\n| ページ | 移行元 | 新パス | Markdown |\n|---|---|---|---|\n'+pages.map(p=>`| ${p.title} | [公開ページ](${p.source}) | \`${p.route}\` | \`${p.id}.md\` |`).join('\n')+'\n');
console.log(pages.map(p=>({id:p.id,links:p.links.length,images:p.images.length,anchors:p.anchors.length})));
