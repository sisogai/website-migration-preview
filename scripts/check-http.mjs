import fs from 'node:fs';
import assert from 'node:assert/strict';
const [base,kind]=process.argv.slice(2);
if(!base?.endsWith('/')||!['github','cloudflare'].includes(kind))throw new Error('Usage: node scripts/check-http.mjs URL/ github|cloudflare');
const pages=JSON.parse(fs.readFileSync('provenance/pages.json'));
for(const p of pages){
 const r=await fetch(new URL(p.route.slice(1),base));assert.equal(r.status,200,p.route);
 const body=await r.text();assert.match(body,/noindex/);assert.ok(body.includes('entry-content'));
 if(kind==='cloudflare')assert.match(r.headers.get('x-robots-tag'),/noindex/);
 console.log('200',p.route);
}
const r=await fetch(new URL('nonexistent-verification-page/',base));assert.equal(r.status,404);assert.match(await r.text(),/Page not found/);console.log('404 custom page PASS');
