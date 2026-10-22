import {defineConfig} from 'astro/config';
const github=process.env.DEPLOY_TARGET==='github';
const repo=process.env.PAGES_REPOSITORY||'website-migration-preview';
if(!/^[a-zA-Z0-9_.-]+$/.test(repo))throw new Error('Invalid repository name');
export default defineConfig({
 output:'static',
 site:github?'https://sisogai.github.io':undefined,
 base:github?`/${repo}/`:'/',
 outDir:github?'./dist-github':'./dist-cloudflare',
 trailingSlash:'always',
 devToolbar:{enabled:false},
});
