import {build} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
if(!process.argv.includes('--server-only')) await build({build:{manifest:true}});
const manifest=JSON.parse(await readFile(new URL('../build/.vite/manifest.json',import.meta.url),'utf8'));
await build({
  define:{__CLIENT_MANIFEST__:JSON.stringify(manifest)},
  ssr:{target:'webworker',noExternal:true,resolve:{conditions:['worker','module','production']}},
  build:{ssr:'server/entry.tsx',outDir:'server-build',emptyOutDir:true,rollupOptions:{output:{manualChunks:undefined,entryFileNames:'entry.js',chunkFileNames:'[name]-[hash].js'}}},
});

await writeFile('server-build/package.json', JSON.stringify({type:'module'}));
