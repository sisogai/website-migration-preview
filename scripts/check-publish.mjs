import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const allowedRoot=new Set(['package.json','package-lock.json','astro.config.mjs','wrangler.jsonc','README.md','.gitignore','.nvmrc']);
const allowedDirs=['src/','public/','scripts/','tests/','docs/','provenance/','.github/workflows/'];
const allowedExt=new Set(['.mjs','.astro','.css','.md','.json','.jsonc','.txt','.py','.yml','.yaml']);
let files;
try{files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);}catch{throw new Error('Initialize dedicated Git repository before publication check');}
const errors=[];
for(const file of files){
 if(!allowedRoot.has(file)&&!allowedDirs.some(p=>file.startsWith(p)))errors.push(`${file}: not in publication allowlist`);
 if(!allowedRoot.has(file)&&!allowedExt.has(path.extname(file))&&!['public/.nojekyll','public/_headers'].includes(file))errors.push(`${file}: unsupported file type`);
 if(fs.lstatSync(file).isSymbolicLink()){errors.push(`${file}: symlink`);continue;}
 const s=fs.readFileSync(file,'utf8');
 const patterns=[/gh[pousr]_[A-Za-z0-9]{25,}/,/github_pat_[A-Za-z0-9_]{30,}/,/sk-[A-Za-z0-9_-]{24,}/,/AKIA[A-Z0-9]{16}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/Bearer\s+[A-Za-z0-9._-]{24,}/,/\/Users\/[A-Za-z0-9_-]+\//,/C:\\Users\\/];
 if(patterns.some(p=>p.test(s)))errors.push(`${file}: possible credential or local path`);
 if(/(?:^|\/)(?:\.env|\.dev\.vars|credentials|id_rsa|id_ed25519)(?:[./]|$)/i.test(file))errors.push(`${file}: sensitive filename`);
 if(Buffer.byteLength(s)>2_000_000)errors.push(`${file}: unexpectedly large file`);
}
for(const f of fs.readdirSync('src/content/pages')){const s=fs.readFileSync('src/content/pages/'+f,'utf8');if(/<\s*(?:script|iframe|form|object|embed)\b|\son\w+\s*=|(?:javascript|vbscript):/i.test(s))errors.push(`${f}: active content`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${files.length} publishable files; filename/content scan. Human review still required for new content.`);
