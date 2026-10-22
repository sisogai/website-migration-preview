import {spawnSync} from 'node:child_process';
const target=process.argv[2];
if(!['github','cloudflare'].includes(target))throw new Error('Choose github or cloudflare');
const result=spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{stdio:'inherit',env:{...process.env,DEPLOY_TARGET:target,ASTRO_TELEMETRY_DISABLED:'1'}});
process.exit(result.status??1);
