async (page) => {
  const base='http://127.0.0.1:8795';
  await page.context().addCookies([{url:base,name:'tourCompleted',value:'true'}]);
  await page.addInitScript(()=>localStorage.setItem('qamous.analytics-consent.v1','denied'));
  const errors=[];
  let active='',release=()=>{},pending=Promise.resolve();
  const consoleListener=message=>{
    if(message.type()==='error'&&/hydration|React error/.test(message.text())) errors.push({path:active,text:message.text()});
  };
  const hold=async route=>{const gate=pending;await gate;await route.continue();};
  page.on('console',consoleListener);
  await page.route('**/*.css',hold);
  await page.route('**/js/index.*.js',hold);
  const paths=['/','/word/2','/word/2/ar','/advanced-search','/advanced-search/Egypt','/browse/en','/browse/ar','/about','/blog','/login','/missing'];
  const results=[];
  try {
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      for(const path of paths) {
        active=path;
        pending=new Promise(resolve=>{release=resolve;});
        await page.goto(base+path,{waitUntil:'commit'});
        await page.locator('#root[data-ssr]').waitFor({state:'attached'});
        await page.waitForTimeout(350);
        const before=await page.evaluate(()=>{
          window.firstPaintHeader=document.querySelector('.header');
          window.firstPaintPage=document.querySelector('.content').firstElementChild;
          const header=getComputedStyle(window.firstPaintHeader);
          const svgSizes=[...document.querySelectorAll('.header svg')].map(node=>node.getBoundingClientRect()).map(rect=>Math.max(rect.width,rect.height));
          return {
            headerDisplay:header.display,headerPosition:header.position,
            logoHeight:document.querySelector('.header img').getBoundingClientRect().height,
            largestHeaderIcon:Math.max(...svgSizes),
            pendingStyles:[...document.querySelectorAll('link[rel=stylesheet]')].filter(link=>!link.sheet).length,
            inlineStyles:document.querySelectorAll('style[data-qamous-stylesheet]').length,
            hydrated:document.querySelector('#root').hasAttribute('data-hydrated'),
          };
        });
        if(before.headerDisplay!=='flex'||before.headerPosition!=='fixed'||before.logoHeight<=0||before.logoHeight>50||before.largestHeaderIcon>64||!before.pendingStyles||!before.inlineStyles||before.hydrated) throw new Error(JSON.stringify({path,width,before}));
        release();
        await page.locator('#root[data-hydrated=true]').waitFor();
        const after=await page.evaluate(()=>({
          headerReused:window.firstPaintHeader===document.querySelector('.header'),
          pageReused:window.firstPaintPage===document.querySelector('.content').firstElementChild,
        }));
        if(!after.headerReused||!after.pageReused) throw new Error(JSON.stringify({path,width,after}));
        results.push({path,width,...before,...after});
      }
    }
    if(errors.length) throw new Error(JSON.stringify(errors));
    return {styledBeforeDownloads:results.length,hydrationErrors:errors.length,domReused:true};
  } finally {
    release();page.off('console',consoleListener);
    await page.unrouteAll({behavior:'wait'});
  }
}
