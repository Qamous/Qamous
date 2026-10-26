import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useHomeFeed } from '../hooks/useHomeFeed';

afterEach(() => vi.unstubAllGlobals());
function setup() {
  const requests: string[] = [];
  const orders = { franco: Array.from({length:24},(_,i)=>24-i), ar: [101,102] };
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    requests.push(input);
    const url = new URL(input,'https://qamous.org');
    if (url.pathname.endsWith('/definitions/feed')) {
      return new Response(JSON.stringify({definitionIds: orders[url.searchParams.get('script') as keyof typeof orders]}));
    }
    const ids = url.searchParams.get('ids')!.split(',').map(Number);
    expect(['ar','franco']).toContain(url.searchParams.get('script'));
    // One entire page was removed after creating the order; pagination continues.
    return new Response(JSON.stringify({ results: ids[0] === 14 ? [] : ids.map(definitionId=>({definitionId})) }));
  }));
  const client = new QueryClient({defaultOptions:{queries:{retry:false,cacheTime:Infinity}}});
  const wrapper = ({children}: {children: React.ReactNode}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return {requests,client,wrapper};
}

it('retains an ordered visit through scrolling, empty pages, vote invalidation and remounts', async () => {
  const {requests,client,wrapper} = setup();
  const hook=renderHook(()=>useHomeFeed<{definitionId:number}>('en'),{wrapper});
  await waitFor(()=>expect(hook.result.current.data?.pages[0]).toHaveLength(10));
  const first=hook.result.current.data!.pages[0].map(row=>row.definitionId);
  expect(first).toEqual([24,23,22,21,20,19,18,17,16,15]);
  await act(async()=>{await hook.result.current.fetchNextPage();});
  expect(hook.result.current.data!.pages[1]).toEqual([]);
  expect(hook.result.current.hasNextPage).toBe(true);
  await act(async()=>{await hook.result.current.fetchNextPage();});
  expect(hook.result.current.data!.pages[2].map(row=>row.definitionId)).toEqual([4,3,2,1]);
  expect(hook.result.current.hasNextPage).toBe(false);
  await act(async()=>{await client.invalidateQueries('homeContent',{refetchActive:false});});
  hook.unmount();
  const restored=renderHook(()=>useHomeFeed<{definitionId:number}>('en'),{wrapper});
  await waitFor(()=>expect(restored.result.current.data?.pages[0].map(row=>row.definitionId)).toEqual(first));
  expect(requests.filter(url=>url.includes('/definitions/feed'))).toHaveLength(1);
  restored.unmount();client.clear();
});

it('fetches separate snapshots for language changes and a fresh one after reload', async () => {
  const {requests,client,wrapper}=setup();
  const hook=renderHook(({language})=>useHomeFeed<{definitionId:number}>(language),{wrapper,initialProps:{language:'en'}});
  await waitFor(()=>expect(hook.result.current.data?.pages[0]).toHaveLength(10));
  hook.rerender({language:'ar'});
  await waitFor(()=>expect(hook.result.current.data?.pages[0].map(row=>row.definitionId)).toEqual([101,102]));
  expect(hook.result.current.hasNextPage).toBe(false);
  hook.rerender({language:'en'});
  await waitFor(()=>expect(hook.result.current.data?.pages[0]).toHaveLength(10));
  expect(requests.filter(url=>url.includes('/definitions/feed?script=franco'))).toHaveLength(1);
  hook.unmount();client.clear();
  const fresh=renderHook(()=>useHomeFeed('en'),{wrapper});
  await waitFor(()=>expect(fresh.result.current.data?.pages[0]).toHaveLength(10));
  expect(requests.filter(url=>url.includes('/definitions/feed?script=franco'))).toHaveLength(2);
  fresh.unmount();client.clear();
});

it('surfaces order failures instead of remaining stuck in loading', async () => {
  const {client,wrapper}=setup();
  vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:503})));
  const hook=renderHook(()=>useHomeFeed('en'),{wrapper});
  await waitFor(()=>expect(hook.result.current.isError).toBe(true));
  expect(hook.result.current.isLoading).toBe(false);
  hook.unmount();client.clear();
});

it('shows available public cards when random hydration is closed and stops unavailable random pagination',async()=>{
  const {client,wrapper}=setup();
  vi.stubGlobal('fetch',vi.fn(async(input:string,init:RequestInit)=>{
    expect(init.credentials).toBe('include');
    if(input.includes('/definitions/feed'))return Response.json({definitionIds:[900,901,902,903,904,905,906,907,908,909,910]});
    if(input.includes('&ids='))return Response.json({code:'D1_READ_BUDGET'},{status:503});
    expect(input).toContain('scope=all&sort=popular&page=1&limit=12');
    return Response.json({results:[{definitionId:2,isArabic:0,isLiked:true}]});
  }));
  const hook=renderHook(()=>useHomeFeed<{definitionId:number;isLiked:boolean}>('en'),{wrapper});
  await waitFor(()=>expect(hook.result.current.data?.pages[0]).toEqual([{definitionId:2,isArabic:0,isLiked:true}]));
  await waitFor(()=>expect(hook.result.current.hasNextPage).toBe(false));expect(hook.result.current.isError).toBe(false);
  hook.unmount();client.clear();
});

it('retains fallback pagination state when cached home content remounts without refetching',async()=>{
  const {client,wrapper}=setup();client.setDefaultOptions({queries:{retry:false,cacheTime:Infinity,staleTime:Infinity}});
  const fetcher=vi.fn(async(input:string)=>{
    if(input.includes('/definitions/feed'))return Response.json({definitionIds:Array.from({length:24},(_,id)=>id+900)});
    if(input.includes('&ids='))return Response.json({code:'D1_READ_BUDGET'},{status:503});
    return Response.json({results:[{definitionId:2,isArabic:0}]});
  });vi.stubGlobal('fetch',fetcher);
  const first=renderHook(()=>useHomeFeed<{definitionId:number}>('en'),{wrapper});
  await waitFor(()=>expect(first.result.current.data?.pages[0]).toEqual([{definitionId:2,isArabic:0}]));
  expect(first.result.current.hasNextPage).toBe(false);first.unmount();const calls=fetcher.mock.calls.length;
  const restored=renderHook(()=>useHomeFeed<{definitionId:number}>('en'),{wrapper});
  await waitFor(()=>expect(restored.result.current.data?.pages[0]).toEqual([{definitionId:2,isArabic:0}]));
  expect(restored.result.current.hasNextPage).toBe(false);expect(fetcher).toHaveBeenCalledTimes(calls);
  restored.unmount();client.clear();
});
