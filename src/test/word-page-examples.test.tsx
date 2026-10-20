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
  it('keeps an English-only meaning visible under its Arabic headword and avoids repeating a translated sense',async()=>{
    const rows=[{id:1,isArabic:true,definition:'معرفة',meaningForms:[{meaningId:'sense:1'}]},{id:2,isArabic:false,definition:'covered English meaning',meaningForms:[{meaningId:'sense:1'}]},{id:3,isArabic:false,definition:'flag',meaningForms:[{meaningId:'sense:2'}]}].map(row=>({...row,wordId:61,word:{arabicWord:'علم',francoArabicWord:'3ilm'}}));
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(rows))));
    const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/word/61/ar']}><Routes><Route path="/word/:wordId/:lang" element={<WordPage/>}/></Routes></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByText('flag')).toHaveAttribute('dir','ltr');
    expect(screen.getByText('معنى بالإنجليزية')).toBeInTheDocument();expect(screen.queryByText('covered English meaning')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading',{name:'علم'})).toHaveLength(2);client.clear();
  });
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
