import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {rewriteLink} from '../src/lib/paths.mjs';
const pages=JSON.parse(fs.readFileSync('provenance/pages.json'));
let checks=0;
for(const [dir,base] of [['dist-github','/website-migration-preview/'],['dist-cloudflare','/']]){
 for(const p of pages){
  const path=`${dir}${p.route}index.html`;
  const html=fs.readFileSync(path,'utf8');const $=load(html);
  assert.equal($('.entry-content').text().replace(/\s+/gu,''),p.text,`${dir}: text ${p.id}`);
  const links=$('.entry-content a[href]').toArray().map(el=>({text:$(el).text().trim(),href:$(el).attr('href')}));
  assert.deepEqual(links,p.links.map(l=>({...l,href:rewriteLink(l.href,base)})),`${dir}: links ${p.id}`);
  for(const anchor of p.anchors)assert.ok($('[id]').toArray().some(e=>$(e).attr('id')===anchor),`${p.id}: missing anchor ${anchor}`);
  assert.match($('meta[name="robots"]').attr('content'),/noindex/);
  assert.equal($('script,iframe,object,embed,form').length,0,'No active third-party content');
  assert.ok(!html.includes('\uFFFD'),'No replacement characters');
  assert.equal($('h1.entry-title').length,1);
  for(const el of $('a[href],link[href]').toArray()){
   const href=$(el).attr('href');
   if(/^(https?:|mailto:)/.test(href))continue;
   const u=new URL(href,'https://preview.test'+base.replace(/\/$/,'')+p.route);
   const local=decodeURIComponent(u.pathname);
   assert.ok(local.startsWith(base),`Base escaped: ${href}`);
   const target=local.slice(base.length);
   const file=`${dir}/${target}${target.endsWith('/')||!target?'index.html':''}`;
   assert.ok(fs.existsSync(file),`Missing file: ${file}`);
   if(u.hash){const t=load(fs.readFileSync(file,'utf8'));assert.ok(t('[id]').toArray().some(e=>t(e).attr('id')===decodeURIComponent(u.hash.slice(1))),`Missing fragment ${href}`);}
  }
  checks++;
 }
 const err=load(fs.readFileSync(`${dir}/404.html`,'utf8'));
 assert.match(err('meta[name=robots]').attr('content'),/noindex/);
 assert.ok(err('a').toArray().some(e=>err(e).attr('href')===base));
}
const summary={pages:pages.length,buildPageComparisons:checks,bodyLinks:pages.reduce((n,p)=>n+p.links.length,0),driveLinks:pages.reduce((n,p)=>n+p.links.filter(l=>l.href.includes('drive.google.com')).length,0),result:'PASS'};
fs.mkdirSync('.local',{recursive:true});fs.writeFileSync('.local/content-results.json',JSON.stringify(summary,null,2));
console.log(summary);
