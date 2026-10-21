import React from 'react';
import { act, fireEvent, render, screen, waitFor } from './render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import ContentBox from '../components/ContentBox';
import UserProfile from '../../pages/UserProfile';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key === 'content_box_buttons' ? { like: 'Like', dislike: 'Dislike', share: 'Share', report: 'Report' } : key, i18n:{language:'en'} }) }));
vi.mock('i18next', () => ({ default: { language: 'en' } }));
afterEach(() => vi.unstubAllGlobals());
const confirmed = (isLiked: boolean, isDisliked = false, success = true) => ({ definitionId: 106, isLiked, isDisliked, likeCount: Number(isLiked), dislikeCount: Number(isDisliked), success });
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function card(client: QueryClient, liked = false, id = 106) {
  return <QueryClientProvider client={client}><MemoryRouter><ContentBox item={{ word: 'Test', definition: 'Meaning' }} index={1} lang='en' wordId={61} definitionId={id} isLiked={liked} isDisliked={false} isReported={false} example='' /></MemoryRouter></QueryClientProvider>;
}
const client = () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300000 }, mutations: { retry: false } } });

describe('definition voting', () => {
  it('uses canonical flags even when a stale unlike changes nothing on the server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(confirmed(false, true, false))));
    render(card(client(), true)); fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dislike' })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'false');
  });
  it('blocks overlapping opposite votes, including a second mounted copy', async () => {
    let finish!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const cache = client(); render(<>{card(cache)}{card(cache)}</>);
    fireEvent.click(screen.getAllByRole('button', { name: 'Like' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Dislike' })[1]);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole('button', { name: 'Dislike' })[0]).toBeDisabled();
    await act(async () => { finish(response(confirmed(true))); });
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Like' })[1]).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getAllByRole('button', { name: 'Dislike' })[1]).toHaveAttribute('aria-pressed', 'false');
  });
  it('updates feed, search and word caches and retains a confirmed selection on remount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(confirmed(true))));
    const cache = client();
    cache.setQueryData('homeContent', { pages: [[{ definitionId: 106, isLiked: 0 }]], pageParams: [1] });
    cache.setQueryData(['homeContent', 61], [{ definitionId: 106, isLiked: false, item: { definition: 'Meaning' } }]);
    cache.setQueryData(['searchResults', 'test'], [{ definitionId: 106, isLiked: false }]);
    const first = render(card(cache)); fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'true'));
    expect(cache.getQueryData<any>('homeContent').pages[0][0].isLiked).toBe(true);
    expect(cache.getQueryData<any>(['homeContent', 61])[0].isLiked).toBe(true);
    expect(cache.getQueryData<any>(['searchResults', 'test'])[0].isLiked).toBe(true);
    first.unmount(); render(card(cache));
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('does not select a vote on network errors or redirect a self-vote rejection to login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ message: 'You cannot react to your own definitions' }, 403)));
    render(card(client())); fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(screen.getByText('You cannot react to your own definitions')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Dislike' })).toHaveAttribute('aria-pressed', 'false');
  });
  it('ignores older in-flight reads after a confirmed vote', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(confirmed(true))));
    const cache = client();
    const oldData = { pages: [[{ definitionId: 106, isLiked: false }]], pageParams: [1] };
    cache.setQueryData('homeContent', oldData);
    let finish!: (value: typeof oldData) => void;
    const read = cache.fetchQuery('homeContent', () => new Promise<typeof oldData>(resolve => { finish = resolve; }), { staleTime: 0 }).catch(() => undefined);
    render(card(cache)); fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'true'));
    await act(async () => { finish(oldData); await read; });
    expect(cache.getQueryData<any>('homeContent').pages[0][0].isLiked).toBe(true);
  });
  it('does not apply a completed request to a different definition after navigation', async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
    const cache = client(); const view = render(card(cache));
    fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(finish).toBeDefined());
    view.rerender(card(cache, false, 107));
    await act(async () => { finish(response(confirmed(true))); });
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'false');
    expect(cache.getQueryData<any>(['reaction', 106]).isLiked).toBe(true);
  });
});

it('retains points and contributions when reopening the profile and uses the server breakdown', async () => {
  const user = { id: 1, firstName: 'Audit', username: 'audit' };
  const definition = { id: 106, wordId: 61, userId: 1, definition: 'Meaning', example: '', isArabic: true, AddedTimestamp: '2026-10-17', likeCount: 3, dislikeCount: 0, reportCount: 0, word: { id: 61, userId: 1, arabicWord: 'Test', francoArabicWord: 'Test', createdAt: '2026-10-17', reportCount: 0 } };
  vi.stubGlobal('fetch', vi.fn(async (url: string) => response(url.endsWith('/auth/session') ? { session: { passport: { user } } } : url.endsWith('/users/me/points') ? { points: 5, definitionPoints: 1, wordBonusPoints: 1, reactionPoints: 3 } : [definition])));
  const cache = client();
  const element = <QueryClientProvider client={cache}><MemoryRouter initialEntries={['/profile']}><UserProfile /></MemoryRouter></QueryClientProvider>;
  const first = render(element);
  await waitFor(() => expect(screen.getByText('user_profile.points: 5')).toBeInTheDocument());
  expect(screen.getByText('user_profile.definition_points: +1')).toBeInTheDocument();
  expect(screen.getByText('user_profile.word_bonus_points: +1')).toBeInTheDocument();
  expect(screen.getByText('user_profile.reaction_points: 3')).toBeInTheDocument();
  first.unmount(); render(element);
  await waitFor(() => expect(screen.getByText('user_profile.points: 5')).toBeInTheDocument());
  expect(screen.getByText('user_profile.definition_points: +1')).toBeInTheDocument();
  expect(screen.getByText('Meaning')).toBeInTheDocument();
});
