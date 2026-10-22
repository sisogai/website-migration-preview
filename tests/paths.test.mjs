import test from 'node:test';
import assert from 'node:assert/strict';
import {rewriteLink} from '../src/lib/paths.mjs';
test('subdirectory: internal Japanese anchors and queries survive',()=>{
 assert.equal(rewriteLink('https://shigekiisogai.wordpress.com/%e8%ac%9b%e7%be%a9%e8%b3%87%e6%96%99-course-materials/?x=1#advanced-en','/preview/'),'/preview/講義資料-course-materials/?x=1#advanced-en');
});
test('external teaching and Drive URLs retain every character',()=>{
 for(const s of ['https://sisogai.github.io/teaching/index.html','https://drive.google.com/file/d/example/view?usp=sharing','#advanced-en'])assert.equal(rewriteLink(s,'/preview/'),s);
});
test('unknown source pages remain original links',()=>assert.equal(rewriteLink('https://shigekiisogai.wordpress.com/not-migrated/','/preview/'),'https://shigekiisogai.wordpress.com/not-migrated/'));
