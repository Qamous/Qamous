import {build} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
import postcss from 'postcss';
import {verifyPublicSnapshot} from './public-snapshot.mjs';
const codeOnly=process.argv.includes('--code-only');
// CI exercises compilation and fixture SSR without publishing public records.
// Its output is explicitly marked as undeployable; release builds audit assets.
const snapshot=codeOnly?JSON.parse(await readFile(new URL('../wrangler.jsonc',import.meta.url),'utf8')).vars?.PUBLIC_SNAPSHOT_ID:await verifyPublicSnapshot();
const define={'import.meta.env.VITE_PUBLIC_READ_ONLY':JSON.stringify(snapshot?'true':'false')};
if(!process.argv.includes('--server-only')) await build({define,build:{manifest:true}});
if(codeOnly)await writeFile(new URL('../build/.qamous-code-only',import.meta.url),'This build omits the production public snapshot audit.\n');
else await verifyPublicSnapshot({built:true});
const manifest=JSON.parse(await readFile(new URL('../build/.vite/manifest.json',import.meta.url),'utf8'));
const styles={};
const stylesheets=new Set(Object.values(manifest).flatMap(item=>item.css||[]));
for(const file of stylesheets) {
  const css=postcss.parse(await readFile(new URL('../build/'+file,import.meta.url),'utf8'));
  // Font imports remain in the linked stylesheet. The initial layout must be
  // usable without waiting for any other stylesheet, including Google Fonts.
  css.walkAtRules(/^(?:import|charset)$/i,rule=>rule.remove());
  styles['/'+file]=css.toString().replace(/<\/style/gi,'<\\/style');
}
await build({
  define:{...define,__CLIENT_MANIFEST__:JSON.stringify(manifest),__CLIENT_STYLES__:JSON.stringify(styles)},
  ssr:{target:'webworker',noExternal:true,resolve:{conditions:['worker','module','production']}},
  build:{ssr:'server/entry.tsx',outDir:'server-build',emptyOutDir:true,rollupOptions:{output:{manualChunks:undefined,entryFileNames:'entry.js',chunkFileNames:'[name]-[hash].js'}}},
});

await writeFile('server-build/package.json', JSON.stringify({type:'module'}));
