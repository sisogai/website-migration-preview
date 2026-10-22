import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
test('WXR excludes drafts, private/password-protected content and authors',()=>{
 const dir=mkdtempSync(join(tmpdir(),'wxr-check-'));
 const item=(status,password='')=>`<item><title>Example</title><link>https://shigekiisogai.wordpress.com/example/</link><wp:status>${status}</wp:status><wp:post_type>page</wp:post_type><wp:post_password>${password}</wp:post_password><content:encoded>&lt;p&gt;Public&lt;/p&gt;</content:encoded></item>`;
 writeFileSync(join(dir,'fixture.xml'),`<rss xmlns:wp="http://wordpress.org/export/1.2/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${item('publish')}${item('private')}${item('draft')}${item('publish','test-only')}</channel></rss>`);
 const r=spawnSync('python3',[resolve('scripts/import-wxr.py'),join(dir,'fixture.xml')],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 assert.equal(JSON.parse(readFileSync(join(dir,'.migration/wxr-review/candidates.json'))).length,1);
 writeFileSync(join(dir,'entity.xml'),'<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///not-read">]><rss/>');
 assert.notEqual(spawnSync('python3',[resolve('scripts/import-wxr.py'),join(dir,'entity.xml')],{cwd:dir}).status,0);
});
