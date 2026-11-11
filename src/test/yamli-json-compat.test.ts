import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,expect,it} from 'vitest';

function loadAdapter() {
  const context={window:{eval:undefined as unknown as (source:unknown)=>unknown},executed:false};
  runInNewContext(readFileSync('public/yamli-json-compat.js','utf8'),context,{
    contextCodeGeneration:{strings:false,wasm:false},
  });
  return context;
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
