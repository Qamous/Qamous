import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {verifyFreePlan,ACCOUNT_ID} from '../../qamous-backend/cloudflare/scripts/free-plan-guard.mjs';
import {verifyPublicSnapshot} from '../scripts/public-snapshot.mjs';
import {verifyFrozenWriters} from './snapshot-deploy-guard.mjs';
await verifyFreePlan();
if(process.argv.slice(2).some(arg=>arg!=='--dry-run')) throw new Error('Deployment refused: configuration/account overrides are not allowed');
const root=fileURLToPath(new URL('..',import.meta.url));
const config=JSON.parse(await readFile(join(root,'wrangler.jsonc'),'utf8'));
if(config.account_id!==ACCOUNT_ID||config.name!=='qamous-web'||config.services?.length!==1||config.services[0].service!=='qamous-api') throw new Error('Frontend deployment refused: unapproved account or service');
if(config.workers_dev!==false||config.preview_urls!==false) throw new Error('Frontend deployment refused: public preview mirrors would bypass zone security');
if(config.assets?.not_found_handling!=='none'||!config.compatibility_flags?.includes('assets_navigation_has_no_effect')) throw new Error('Frontend deployment refused: unknown routes must reach explicit 404 handling');
for(const key of ['r2_buckets','vectorize','containers','hyperdrive','queues','ai','d1_databases']) if(config[key]) throw new Error('Frontend deployment refused: unapproved binding');
const snapshot=await verifyPublicSnapshot({built:true});
if(snapshot) {
  if(!snapshot.frozen||!config.assets.run_worker_first?.includes('!/public-data/*'))throw Error('Snapshot deployment refused: frozen public data must use direct static assets');
  await verifyFrozenWriters(root,ACCOUNT_ID);
}
const child=spawn(process.execPath,[join(root,'node_modules/wrangler/bin/wrangler.js'),'deploy',...process.argv.slice(2)],{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,CLOUDFLARE_ACCOUNT_ID:ACCOUNT_ID}});
child.on('exit',code=>process.exit(code??1));
