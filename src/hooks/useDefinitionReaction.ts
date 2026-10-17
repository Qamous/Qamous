import { useEffect, useRef } from 'react';
import { useIsMutating, useMutation, useQuery, useQueryClient } from 'react-query';
import { API_URL, apiJson } from '../api';

interface ReactionState {
  definitionId: number;
  isLiked: boolean;
  isDisliked: boolean;
  likeCount?: number;
  dislikeCount?: number;
}
const listKeys = ['homeContent', 'searchResults', 'definitions'];

// The home feed is paginated; word and search results are arrays. Patch existing
// records without changing page order or causing a refetch to jump the feed.
function updateRecords(value: unknown, state: ReactionState): unknown {
  if (Array.isArray(value)) return value.map(item => updateRecords(item, state));
  if (!value || typeof value !== 'object') return value;
  const row = value as Record<string, unknown>;
  if (row.definitionId === state.definitionId || (row.id === state.definitionId && 'wordId' in row)) {
    return { ...row, ...state, likeDislikeDifference: (state.likeCount ?? 0) - (state.dislikeCount ?? 0) };
  }
  if ('pages' in row) return { ...row, pages: updateRecords(row.pages, state) };
  return value;
}

export function useDefinitionReaction(definitionId: number, isLiked: boolean, isDisliked: boolean) {
  const client = useQueryClient();
  const key = ['reaction', definitionId];
  const { data: state } = useQuery<ReactionState>(key, {
    enabled: false,
    initialData: { definitionId, isLiked: !!isLiked, isDisliked: !!isDisliked },
  });
  const previousProps = useRef({ definitionId, isLiked, isDisliked });
  useEffect(() => {
    const previous = previousProps.current;
    // A remount can receive older list props; retain a confirmed cached vote.
    // Fresh server props on the same mounted definition can still update it.
    if (previous.definitionId === definitionId && (previous.isLiked !== isLiked || previous.isDisliked !== isDisliked)) {
      client.setQueryData<ReactionState>(['reaction', definitionId], { definitionId, isLiked: !!isLiked, isDisliked: !!isDisliked });
    }
    previousProps.current = { definitionId, isLiked, isDisliked };
  }, [client, definitionId, isLiked, isDisliked]);

  const mutation = useMutation<ReactionState, Error, { id: number; action: string }>({
    mutationKey: key,
    // Ignore reads begun before the vote so their older flags cannot overwrite
    // the confirmed response when a background request finishes later.
    onMutate: async () => { await Promise.all(listKeys.map(root => client.cancelQueries(root))); },
    mutationFn: async ({ id, action }) => {
      const response = await fetch(`${API_URL}/reactions/${id}/${action}`, { method: 'POST', credentials: 'include' });
      const result = await apiJson<ReactionState>(response);
      if (typeof result.isLiked !== 'boolean' || typeof result.isDisliked !== 'boolean' || (result.isLiked && result.isDisliked) || result.definitionId !== id) {
        throw new Error('Could not confirm your vote. Please refresh and try again.');
      }
      return result;
    },
    onSuccess: (result, { id }) => {
      client.setQueryData(['reaction', id], result);
      for (const root of listKeys) {
        client.setQueriesData(root, value => updateRecords(value, result));
        void client.invalidateQueries(root, { refetchActive: false });
      }
      void client.invalidateQueries('user');
    },
  });
  const pending = useIsMutating({ mutationKey: key }) > 0;
  const vote = (target: 'like' | 'dislike') => {
    // MutationCache changes synchronously, so this also covers clicks in the
    // same browser tick and other mounted cards for the same definition.
    if (client.isMutating({ mutationKey: key })) return;
    const current = client.getQueryData<ReactionState>(key);
    const selected = target === 'like' ? current?.isLiked : current?.isDisliked;
    mutation.mutate({ id: definitionId, action: selected ? target === 'like' ? 'unlike' : 'undislike' : target });
  };
  return { isLiked: state?.isLiked ?? isLiked, isDisliked: state?.isDisliked ?? isDisliked, pending, vote, error: mutation.error };
}
