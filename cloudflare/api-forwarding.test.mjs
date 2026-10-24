// @vitest-environment node
import {it,expect,vi,afterAll} from 'vitest';
import worker from './worker.ts';
vi.mock('qamous:ssr',()=>({renderApplication:vi.fn()}));
vi.stubGlobal('window',{});afterAll(()=>vi.unstubAllGlobals());
function bindings(){const api=vi.fn();return {env:{API:{fetch:api},ASSETS:{fetch:vi.fn()}},api};}
  it('forwards normal-mode authenticated mutations with cookie, origin, body and response cookies intact',async()=>{
    const {env,api}=bindings();
    api.mockImplementationOnce(async()=>Response.json({changed:true},{status:201,headers:{'Cache-Control':'private, no-store','Set-Cookie':'qamous_session=renewed; Path=/; Secure; HttpOnly; SameSite=Lax'}}));
    const request=new Request('https://qamous.org/api/reactions/2/like',{method:'POST',headers:{Cookie:'qamous_session=private',Origin:'https://qamous.org',Referer:'https://qamous.org/word/2','Content-Type':'application/json'},body:JSON.stringify({action:'like'})});
    expect(request.method).toBe('POST');
    const response=await worker.fetch(request,env);
    expect(response.status).toBe(201);expect(await response.json()).toEqual({changed:true});
    expect(response.headers.get('Set-Cookie')).toContain('qamous_session=renewed');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    const forwarded=api.mock.calls[0][0];
    expect(new URL(forwarded.url).pathname).toBe('/reactions/2/like');expect(forwarded.method).toBe('POST');
    expect(forwarded.headers.get('Cookie')).toBe('qamous_session=private');expect(forwarded.headers.get('Origin')).toBe('https://qamous.org');
    expect(forwarded.headers.get('Referer')).toBe('https://qamous.org/word/2');expect(await forwarded.json()).toEqual({action:'like'});
  });
