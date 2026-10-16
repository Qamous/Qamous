/// <reference path="./worker-configuration.d.ts" />
export default {
  async fetch(request:Request,env:Env):Promise<Response> {
    const url=new URL(request.url);
    if(url.hostname==='www.qamous.org') {url.hostname='qamous.org';return Response.redirect(url.toString(),308);}
    if(url.pathname==='/api'||url.pathname.startsWith('/api/')) {
      const target=new URL(request.url);
      // Service bindings select the API Worker; retain the public origin while
      // stripping the gateway prefix.
      target.pathname=url.pathname.slice(4)||'/';
      try {return await env.API.fetch(new Request(target,request));}
      catch {return Response.json({message:'Qamous is temporarily unavailable. Please try again later. / قاموس غير متاح مؤقتاً، يرجى المحاولة لاحقاً.'},{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
