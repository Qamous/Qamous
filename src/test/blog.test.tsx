import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from 'react-query';
import {afterEach, describe, expect, it, vi} from 'vitest';
import Blog from '../../pages/Blog';
import {blogCopy, blogGuides} from '../content/blog-guides';

const locale = vi.hoisted(() => ({language: 'en'}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: (key: string) => key, i18n: locale})}));
afterEach(() => { vi.unstubAllGlobals(); locale.language = 'en'; });

describe('blog learning guides', () => {
  it.each(['en', 'ar-EG'])('keeps guides readable in %s when community posts fail', async (language) => {
    locale.language = language;
    vi.stubGlobal('fetch', vi.fn(async (input: string) => input.endsWith('/auth/session')
      ? new Response(JSON.stringify({session: null}))
      : new Response(JSON.stringify({message: 'Posts unavailable'}), {status: 503})));
    const client = new QueryClient({defaultOptions: {queries: {retry: false, cacheTime: 0}}});
    const {container} = render(<QueryClientProvider client={client}><MemoryRouter><Blog /></MemoryRouter></QueryClientProvider>);
    const lang = language.startsWith('ar') ? 'ar' : 'en';
    expect(screen.getByRole('heading', {level: 1, name: blogCopy[lang].title})).toBeInTheDocument();
    for (const guide of blogGuides) {
      expect(screen.getByRole('heading', {level: 2, name: guide[lang].title})).toBeInTheDocument();
      for (const paragraph of guide[lang].paragraphs) expect(screen.getByText(paragraph)).toBeVisible();
    }
    expect(container.querySelector('.blog')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    expect(screen.getByRole('link', {name: blogGuides[2][lang].links[0].label})).toHaveAttribute('href', '/advanced-search/Egypt');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });
});
