import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import translations from '../assets/en/translation.json';
import AdvancedSearch from '../../pages/AdvancedSearch';

const card = vi.hoisted(() => vi.fn());
vi.mock('../components/ContentBox', () => ({ default: (props: any) => {
  card(props);
  return <article>{props.item.word}<p>{props.example}</p></article>;
} }));
const countries = [{ countryCode: 'EG', countryName: 'Egypt' }, { countryCode: 'LB', countryName: 'Lebanon' }];
const result = { word: 'Ma3lish', definition: 'Never mind', wordId: 2, definitionId: 4, isArabic: 0,
  isLiked: 0, isDisliked: 1, isReported: false, countryCode: 'EG', example: 'Ma3lish, hatet3awwad' };
const requests: string[] = [];
function Location() {
  const location = useLocation(); const navigate = useNavigate();
  return <><output data-testid="url">{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>Back</button></>;
}
async function mount(path = '/advanced-search') {
  const i18n = createInstance();
  await i18n.init({ lng: 'en', resources: { en: { translation: translations } }, interpolation: { escapeValue: false } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  render(<I18nextProvider i18n={i18n}><QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>
    <Location /><Routes><Route path="/advanced-search/:countryName?" element={<AdvancedSearch />} /></Routes>
  </MemoryRouter></QueryClientProvider></I18nextProvider>);
  const user = userEvent.setup();
  return {
    click: async (element: HTMLElement) => { await act(async () => { await user.click(element); }); },
    type: async (element: HTMLElement, value: string) => { await act(async () => { await user.type(element, value); }); },
    selectOptions: async (element: HTMLElement, value: string) => { await act(async () => { await user.selectOptions(element, value); }); },
  };
}
beforeEach(() => {
  requests.length = 0; card.mockClear();
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    requests.push(input);
    return new Response(JSON.stringify(input.endsWith('/countries') ? countries : { results: [result], total: 25, page: 1, limit: 12 }), { headers: { 'Content-Type': 'application/json' } });
  }));
});

describe('advanced search', () => {
  it('provides a dialect guide, featured word links and cross-dialect navigation', async () => {
    await mount('/advanced-search/Egypt');
    expect(await screen.findByRole('heading', {level:1,name:/Egyptian Arabic slang dictionary/})).toBeInTheDocument();
    expect(await screen.findByRole('link',{name:'Ma3lish'})).toHaveAttribute('href','/word/2');
    expect(screen.getByRole('link',{name:'Lebanese Arabic slang dictionary'})).toHaveAttribute('href','/advanced-search/Lebanon');
    expect(screen.getByText(/Start with everyday expressions/)).toBeInTheDocument();
  });
  it('renders home cards with examples, normal actions and numeric reaction flags normalized', async () => {
    await mount();
    expect(await screen.findByText(result.example)).toBeInTheDocument();
    const props = card.mock.calls.at(-1)?.[0];
    expect(props).toMatchObject({ wordId: 2, definitionId: 4, index: 1, isLiked: false, isDisliked: true, lang: 'en', example: result.example });
    expect(props.isAdvancedSearch).toBeUndefined();
  });
  it('combines keyword, multiple dialects, script, scope and examples in the request and URL', async () => {
    const user = await mount();
    await screen.findByText(result.example);
    await user.type(screen.getByRole('searchbox'), 'hello & goodbye');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(screen.getByRole('checkbox', { name: 'Egypt' }));
    await user.click(screen.getByRole('checkbox', { name: 'Lebanon' }));
    await user.click(screen.getByRole('button', { name: 'Both' }));
    await user.selectOptions(screen.getByLabelText('Search in', { selector: 'select' }), 'words');
    await user.click(screen.getByRole('checkbox', { name: /With examples/ }));
    await waitFor(() => {
      const latest = new URL(requests.filter(url => url.includes('/word/explore')).at(-1)!, 'http://localhost');
      expect(latest.searchParams.get('q')).toBe('hello & goodbye');
      expect(latest.searchParams.getAll('country')).toEqual(['EG', 'LB']);
      expect(latest.searchParams.get('script')).toBe('both');
      expect(latest.searchParams.get('scope')).toBe('words');
      expect(latest.searchParams.get('examples')).toBe('1');
    });
  });
  it('resets pagination when filters change and restores searches with browser back', async () => {
    const user = await mount('/advanced-search?q=hello&page=2');
    await screen.findByText(result.example);
    await user.click(screen.getByRole('checkbox', { name: 'Egypt' }));
    expect(screen.getByTestId('url').textContent).not.toContain('page=2');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('url').textContent).toContain('q=hello&page=2');
    expect(screen.getByRole('searchbox')).toHaveValue('hello');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByTestId('url')).toHaveTextContent('/advanced-search');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
  it('retains a country from the existing country route when searching', async () => {
    const user = await mount('/advanced-search/Egypt');
    await screen.findByText(result.example);
    await user.type(screen.getByRole('searchbox'), 'hi');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByTestId('url').textContent).toContain('country=EG');
    expect(screen.getByTestId('url').textContent).toContain('q=hi');
  });
  it('shows a useful empty state for an unknown legacy country without browsing every dialect', async () => {
    await mount('/advanced-search/Unknown');
    expect(await screen.findByText('No words this time')).toBeInTheDocument();
    expect(requests.filter(url => url.includes('/word/explore'))).toHaveLength(0);
  });
});
