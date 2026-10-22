// Explicitly accept reviewed public content after both builds and visual review.
import fs from 'node:fs';
import {load} from 'cheerio';
if(process.argv[2]!=='--reviewed-public-content')throw new Error('Review the diff and public suitability before accepting changes.');
const pages=JSON.parse(fs.readFileSync('provenance/pages.json'));
for(const p of pages){
 const $=load(fs.readFileSync(`dist-cloudflare${p.route}index.html`,'utf8'));
 p.text=$('.entry-content').text().replace(/\s+/gu,'');
 p.links=$('.entry-content a[href]').toArray().map(e=>({text:$(e).text().trim(),href:$(e).attr('href')}));
 p.anchors=$('.entry-content [id]').toArray().map(e=>$(e).attr('id'));
 p.baselineNote='Updated from intentionally reviewed public content; sourceSha256 records original migration source.';
}
fs.writeFileSync('provenance/pages.json',JSON.stringify(pages,null,2)+'\n');
console.log('Comparison baseline updated. Review git diff, then rerun check:content and check:publish.');
