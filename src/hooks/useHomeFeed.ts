import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import { API_URL, apiJson } from '../api';
import {useRef} from 'react';
import {homeAvailabilityError,popularHome,type HomeRead} from '../utils/home-page-data';

const PAGE_SIZE = 10;

export function useHomeFeed<T>(language: string) {
  const script = language === 'ar' ? 'ar' : 'franco';
  const queryClient=useQueryClient();
  const initialFallback=useRef<{script:string;results:T[]}|null>(null);
  const reader=(signal?:AbortSignal):HomeRead=>async<R>(path:string)=>apiJson<R>(await fetch(API_URL+path,{credentials:'include',signal}));
  const order = useQuery(['homeFeedOrder', script, 'definition-language-v2'], async ({ signal }) => {
    try {return (await reader(signal)<{definitionIds:number[]}>('/definitions/feed?script='+script)).definitionIds;}
    catch(error) {
      if(!homeAvailabilityError(error))throw error;
      const page=await popularHome<T>(reader(signal),script);initialFallback.current={script,results:page.results};return page.definitionIds;
    }
  }, { staleTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false });
  const fallbackKey=['homeFeedFallback',script,'definition-language-v2',order.dataUpdatedAt];

  const content = useInfiniteQuery<T[]>(['homeContent', script, 'definition-language-v2', order.dataUpdatedAt], async ({ pageParam = 1, signal }) => {
    const ids = order.data!.slice((pageParam - 1) * PAGE_SIZE, pageParam * PAGE_SIZE);
    if (!ids.length) return [];
    if(pageParam===1&&initialFallback.current?.script===script){const rows=initialFallback.current.results;initialFallback.current=null;return rows;}
    try {return (await reader(signal)<{results:T[]}>(`/word/explore?script=${script}&ids=${ids.join(',')}`)).results;}
    catch(error) {
      if(pageParam!==1||!homeAvailabilityError(error))throw error;
      const page=await popularHome<T>(reader(signal),script);queryClient.setQueryData(fallbackKey,true);return page.results;
    }
  }, {
    enabled: !!order.data,
    // Missing/deleted cards must not terminate the remaining snapshot.
    getNextPageParam: (_lastPage, pages) => queryClient.getQueryData(fallbackKey)!==true&&pages.length * PAGE_SIZE < (order.data?.length ?? 0) ? pages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });

  return { ...content, isLoading: order.isLoading || (order.isSuccess && content.isLoading), isError: order.isError || content.isError };
}
