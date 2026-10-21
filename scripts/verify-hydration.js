async (page) => {
  const base='http://127.0.0.1:8795';
  await page.context().addCookies([{url:base,name:'tourCompleted',value:'true'}]);
  await page.addInitScript(()=>localStorage.setItem('qamous.analytics-consent.v1','denied'));
  const errors=[];
  let active='';
  const consoleListener=message=>{
    if(message.type()==='error'&&/hydration|React error/.test(message.text())) errors.push({path:active,text:message.text()});
  };
  page.on('console',consoleListener);
  await page.route('**/js/index.*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,300));await route.continue();});
  const paths=['/','/word/2','/word/2/ar','/advanced-search','/advanced-search/Egypt','/browse/en','/browse/ar','/about','/blog','/login','/signup','/chatbot','/forgot-password','/reset-password/test','/profile','/add-definition','/search/ma3lish','/feeling-lucky','/advertise','/opportunities','/sources','/contributors/fixture','/missing'];
  const results=[];
  try {
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      for(const path of paths) {
        active=path;
        const response=await page.goto(base+path,{waitUntil:'commit'});
        await page.locator('#root[data-ssr]').waitFor();
        await page.evaluate(()=>{window.ssrHeader=document.querySelector('.header');window.ssrPage=document.querySelector('.content').firstElementChild;});
        await page.locator('#root[data-hydrated=true]').waitFor();
        await page.waitForTimeout(100);
        const result=await page.evaluate(({path,width,status})=>({
          path,width,status,headerReused:window.ssrHeader===document.querySelector('.header'),
          pageReused:window.ssrPage===document.querySelector('.content').firstElementChild,
          preview:!!document.querySelector('.seo-initial'),titles:document.head.querySelectorAll('title').length,
          canonicals:document.head.querySelectorAll('link[rel=canonical]').length,
        }),{path,width,status:response.status()});
        if(!result.headerReused||result.preview||result.titles!==1||(!['/profile','/add-definition'].includes(path)&&!result.pageReused)) throw new Error(JSON.stringify(result));
        results.push(result);
      }
    }
    if(errors.length) throw new Error(JSON.stringify(errors.map(error=>({path:error.path,text:error.text.slice(0,150)}))));
    return {hydratedRoutes:paths.length,viewportChecks:results.length,domReused:true,hydrationErrors:errors.length};
  } finally {page.off('console',consoleListener);await page.unroute('**/js/index.*.js');}
}
