export type HomeRead=<T=unknown>(path:string)=>Promise<T>;
export const popularHomePath=(script:string)=>`/word/explore?script=${script}&scope=all&sort=popular&page=1&limit=12`;
export function homeAvailabilityError(error:unknown):boolean {
  const status=(error as {status?:number})?.status;
  return status===429||typeof status==='number'&&status>=500&&status<=599;
}
export async function popularHome<T>(read:HomeRead,script:string):Promise<{definitionIds:number[];results:T[]}> {
  const page=await read<{results:T[]}>(popularHomePath(script));
  if(!Array.isArray(page?.results))throw new Error('Invalid public home fallback');
  const seen=new Set<number>();
  const results=page.results.filter(value=>{
    if(!value||typeof value!=='object')return false;
    const row=value as Record<string,unknown>,id=Number(row.definitionId??row.id);
    if(!Number.isSafeInteger(id)||id<1||seen.has(id)||![0,1,false,true].includes(row.isArabic as number|boolean)||Boolean(row.isArabic)!==(script==='ar'))return false;
    seen.add(id);return true;
  }).slice(0,10);
  if(!results.length)throw new Error('Public home fallback is unavailable');
  return {definitionIds:results.map(value=>Number((value as Record<string,unknown>).definitionId??(value as Record<string,unknown>).id)),results};
}
export async function initialHome<T>(read:HomeRead,script:string) {
  try {
    const order=await read<{definitionIds:number[]}>('/definitions/feed?script='+script);
    const ids=order.definitionIds.slice(0,10);
    const page=ids.length?await read<{results:T[]}>(`/word/explore?script=${script}&ids=${ids.join(',')}`):{results:[]};
    return {...order,results:page.results};
  } catch(error) {
    if(!homeAvailabilityError(error))throw error;
    return popularHome<T>(read,script);
  }
}
