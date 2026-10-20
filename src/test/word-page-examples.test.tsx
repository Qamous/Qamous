import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WordPage from '../../pages/WordPage';

vi.mock('react-i18next', () => ({ useTranslation: () => ({
  i18n: { language: 'ar', changeLanguage: vi.fn() },
  t: (key: string) => key === 'content_box_buttons'
    ? { like: 'Like', dislike: 'Dislike', share: 'Share', report: 'Report' } : key,
}) }));
vi.mock('../components/AdSenseWrapper', () => ({ default: () => null }));
vi.mock('../components/RelatedWords', () => ({ default: () => null }));

afterEach(() => vi.unstubAllGlobals());

describe('word page examples', () => {
  it.each([null, 'معلش، هتتعوض.'])('preserves the saved Arabic example (%j) through the page and card', async (arabicExample) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 106, wordId: 61, isArabic: true, definition: 'لا بأس',
      example: 'Ma3lish, hatet3awwad.', arabicExample,
      word: { arabicWord: 'معلش', francoArabicWord: 'ma3lish' },
      sourcePronunciations: [{scheme:'translit',value:'maʕliš',language:'ar',kind:'transcription',sourceId:'dictionary',sourceName:'Dictionary',sourceUrl:'https://example.org/entry',sourceEntryId:'1',dialect:'Egyptian'}],
    }]))));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(<QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/word/61/ar']}><Routes>
        <Route path="/word/:wordId/:lang" element={<WordPage />} />
      </Routes></MemoryRouter>
    </QueryClientProvider>);

    await screen.findByRole('heading', { name: 'معلش' });
    expect(container.querySelector('.pronunciation > summary')).toHaveTextContent('maʕliš');
    expect(screen.queryByText('Ma3lish, hatet3awwad.')).not.toBeInTheDocument();
    if (arabicExample) {
      expect(screen.getByText(arabicExample)).toHaveAttribute('dir', 'rtl');
    } else {
      expect(container.querySelector('.content-box-example')).not.toBeInTheDocument();
    }
    client.clear();
  });
});
