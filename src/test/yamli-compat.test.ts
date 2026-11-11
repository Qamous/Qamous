import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,expect,it,vi} from 'vitest';

function loadAdapter() {
  const script=new EventTarget();
  const context={window:Object.assign(new EventTarget(),{eval:undefined as unknown as (source:unknown)=>unknown,Yamli:undefined as unknown as {I:ReturnType<typeof vendorEvents>}}),document:{querySelector:()=>script},script,executed:false};
  runInNewContext(readFileSync('public/yamli-compat.js','utf8'),context,{
    contextCodeGeneration:{strings:false,wasm:false},
  });
  return context;
}

function vendorEvents() {
  return {
    addEvent:vi.fn((target:EventTarget,type:string,callback:EventListener,capture?:boolean)=>{target.addEventListener(type,callback,!!capture);return true;}),
    removeEvent:vi.fn((target:EventTarget,type:string,callback:EventListener,capture?:boolean)=>{target.removeEventListener(type,callback,!!capture);return true;}),
  };
}

function pageHide(target:EventTarget,persisted:boolean) {
  const event=new Event('pagehide');Object.defineProperty(event,'persisted',{value:persisted});target.dispatchEvent(event);
}

describe('Yamli JSON compatibility',()=>{
  it('parses API data with JavaScript code generation disabled',()=>{
    const {window}=loadAdapter();
    const response={r:'كتب',words:['كتب','كاتب'],authorized:true};
    expect(window.eval('('+JSON.stringify(response)+')')).toEqual(response);
    expect(window.eval(' \n('+JSON.stringify(response)+')\n ')).toEqual(response);
    expect(window.eval(JSON.stringify(response))).toEqual(response);
    expect(window.eval(42)).toBe(42);
  });

  it('rejects executable expressions and malformed data without running them',()=>{
    const context=loadAdapter();
    for(const source of [
      '(globalThis.executed = true)',
      '({"ok":true,"sideEffect":(globalThis.executed=true)})',
      '({"ok":true});globalThis.executed=true',
      '({"ok":undefined})',
    ])expect(()=>context.window.eval(source)).toThrow();
    expect(context.executed).toBe(false);
  });
});

describe('Yamli page lifecycle compatibility',()=>{
  it('cleans up on a final pagehide while preserving controls for a cached page',()=>{
    const context=loadAdapter(),events=vendorEvents(),cleanup=vi.fn();
    context.window.Yamli={I:events};context.script.dispatchEvent(new Event('load'));
    expect(events.addEvent(context.window,'unload',cleanup)).toBe(true);
    context.window.dispatchEvent(new Event('unload'));expect(cleanup).not.toHaveBeenCalled();
    pageHide(context.window,true);expect(cleanup).not.toHaveBeenCalled();
    pageHide(context.window,false);expect(cleanup).toHaveBeenCalledOnce();
    expect(cleanup.mock.instances[0]).toBe(context.window);
    expect(cleanup.mock.calls[0][0].type).toBe('pagehide');
  });

  it('removes migrated listeners, preserves capture identity and leaves other events alone',()=>{
    const context=loadAdapter(),events=vendorEvents(),cleanup=vi.fn(),resize=vi.fn();
    context.window.Yamli={I:events};context.script.dispatchEvent(new Event('load'));
    events.addEvent(context.window,'unload',cleanup);events.addEvent(context.window,'unload',cleanup,true);
    events.addEvent(context.window,'resize',resize);
    events.removeEvent(context.window,'unload',cleanup);
    pageHide(context.window,false);expect(cleanup).toHaveBeenCalledOnce();
    events.removeEvent(context.window,'unload',cleanup,true);
    pageHide(context.window,false);expect(cleanup).toHaveBeenCalledOnce();
    context.window.dispatchEvent(new Event('resize'));expect(resize).toHaveBeenCalledOnce();
    events.removeEvent(context.window,'resize',resize);
    context.window.dispatchEvent(new Event('resize'));expect(resize).toHaveBeenCalledOnce();
  });
});
