import {describe,it,expect,vi} from 'vitest';
import {initialHome,popularHomePath,type HomeRead} from '../utils/home-page-data';

describe('home availability fallback',()=>{
  it('keeps the normal shuffled visit and makes no fallback request',async()=>{
    const read=vi.fn(async(path:string)=>path.startsWith('/definitions/feed')?{definitionIds:[8,2,4]}:{results:[{definitionId:8}]});
    expect(await initialHome(read as HomeRead,'franco')).toEqual({definitionIds:[8,2,4],results:[{definitionId:8}]});expect(read).toHaveBeenCalledTimes(2);
  });
  it.each(['franco','ar'])('uses real, same-language fallback rows to define the entire hydrated %s order',async script=>{
    const matching=script==='ar';
    const rows=[{definitionId:2,isArabic:matching,isLiked:true},{definitionId:3,isArabic:!matching}];
    const read=vi.fn(async(path:string)=>{
      if(path.startsWith('/definitions/feed'))return {definitionIds:[999]};
      if(path.includes('&ids='))throw Object.assign(new Error('Daily limit'),{status:503});
      expect(path).toBe(popularHomePath(script));return {results:rows};
    });
    const result=await initialHome<Record<string,unknown>>(read as HomeRead,script);
    expect(result.definitionIds).toEqual([2]);expect(result.results).toEqual([rows[0]]);expect(result.results[0].isLiked).toBe(true);
    expect(read).toHaveBeenCalledTimes(3);
  });
  it.each([400,401,403,404])('does not hide an upstream %s error',async status=>{
    const error=Object.assign(new Error('Denied'),{status}),read=vi.fn(async()=>{throw error;});
    await expect(initialHome(read as HomeRead,'franco')).rejects.toBe(error);expect(read).toHaveBeenCalledTimes(1);
  });
  it('does not render invented, empty or invalid fallback content',async()=>{
    const read=vi.fn(async(path:string)=>{if(path.startsWith('/definitions/feed'))throw Object.assign(new Error('Unavailable'),{status:503});return {results:[{definitionId:0,isArabic:0},{definitionId:2,isArabic:1}]};});
    await expect(initialHome(read as HomeRead,'franco')).rejects.toThrow('fallback is unavailable');
  });
});
