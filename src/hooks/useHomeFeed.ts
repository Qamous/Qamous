import { useInfiniteQuery, useQuery } from 'react-query';
import { API_URL, apiJson } from '../api';

const PAGE_SIZE = 10;

export function useHomeFeed<T>(language: string) {
  const script = language === 'ar' ? 'ar' : 'franco';
  const order = useQuery(['homeFeedOrder', script, 'definition-language-v2'], async ({ signal }) => {
    const result = await apiJson<{ definitionIds: number[] }>(await fetch(`${API_URL}/definitions/feed?script=${script}`, {
      credentials: 'include', signal,
    }));
    return result.definitionIds;
  }, { staleTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false });

  const content = useInfiniteQuery<T[]>(['homeContent', script, 'definition-language-v2', order.dataUpdatedAt], async ({ pageParam = 1, signal }) => {
    const ids = order.data!.slice((pageParam - 1) * PAGE_SIZE, pageParam * PAGE_SIZE);
    if (!ids.length) return [];
    const result = await apiJson<{ results: T[] }>(await fetch(`${API_URL}/word/explore?script=${script}&ids=${ids.join(',')}`, {
      credentials: 'include', signal,
    }));
    return result.results;
  }, {
    enabled: !!order.data,
    // Missing/deleted cards must not terminate the remaining snapshot.
    getNextPageParam: (_lastPage, pages) => pages.length * PAGE_SIZE < (order.data?.length ?? 0) ? pages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });

  return { ...content, isLoading: order.isLoading || (order.isSuccess && content.isLoading), isError: order.isError || content.isError };
}
