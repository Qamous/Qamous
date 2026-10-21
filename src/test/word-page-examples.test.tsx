import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from './render';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WordPage from '../../pages/WordPage';

const locale=vi.hoisted(()=>({language:'ar'}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({
  i18n: { language: locale.language, changeLanguage: vi.fn() },
  t: (key: string) => key === 'content_box_buttons'
    ? { like: 'Like', dislike: 'Dislike', share: 'Share', report: 'Report' } : key,
}) }));
vi.mock('../components/AdSenseWrapper', () => ({ default: () => null }));
vi.mock('../components/RelatedWords', () => ({ default: () => null }));

afterEach(() => {locale.language='ar';vi.unstubAllGlobals();});

describe('word page examples', () => {
  it('follows the language toggle after opening an Arabic URL',async()=>{
    const rows=[{id:1,isArabic:true,definition:'أب'},{id:2,isArabic:false,definition:'father'}].map(row=>({...row,meaningForms:[{meaningId:'same-sense'}],wordId:61,word:{arabicWord:'أب',francoArabicWord:'2ab'}}));
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(rows))));
    const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    const tree=()=><QueryClientProvider client={client}><MemoryRouter initialEntries={['/word/61/ar']}><Routes><Route path="/word/:wordId/:lang" element={<WordPage/>}/></Routes></MemoryRouter></QueryClientProvider>;
    const {rerender}=render(tree());await screen.findByRole('heading',{name:'أب'});
    expect(screen.queryByText('father')).not.toBeInTheDocument();
    locale.language='en';rerender(tree());
    expect(screen.getByText('father')).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'2ab'})).toBeInTheDocument();client.clear();
  });

  it('keeps an English-only meaning visible under its Arabic headword and avoids repeating a translated sense',async()=>{
    const rows=[{id:1,isArabic:true,definition:'معرفة',meaningForms:[{meaningId:'sense:1'}]},{id:2,isArabic:false,definition:'covered English meaning',meaningForms:[{meaningId:'sense:1'}]},{id:3,isArabic:false,definition:'flag',meaningForms:[{meaningId:'sense:2'}]}].map(row=>({...row,wordId:61,word:{arabicWord:'علم',francoArabicWord:'3ilm'}}));
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(rows))));
    const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/word/61/ar']}><Routes><Route path="/word/:wordId/:lang" element={<WordPage/>}/></Routes></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByText('flag')).toHaveAttribute('dir','ltr');
    expect(screen.getByText('معنى بالإنجليزية')).toBeInTheDocument();expect(screen.queryByText('covered English meaning')).not.toBeInTheDocument();
    expect(screen.queryByText('لا يوجد معنى بالعربية بعد')).not.toBeInTheDocument();
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

  it.each([
    {language:'en',isArabic:true,definition:'طعام من اللحم والخل',word:'ssekbaaj',notice:'No English yet',action:'Add English'},
    {language:'ar',isArabic:false,definition:'flaming, blazing, burning',word:'ح د م',notice:'لا يوجد معنى بالعربية بعد',action:'أضف معنى بالعربية'},
  ])('labels an untranslated word and offers a compact contribution link in $language',async({language,isArabic,definition,word,notice,action})=>{
    locale.language=language;
    const arabicWord=language==='ar'?'ح د م':'سكباج';
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify([
      {id:1,wordId:61,isArabic,definition,word:{arabicWord,francoArabicWord:'ssekbaaj'}},
      {id:2,wordId:61,isArabic,definition:'A second meaning',word:{arabicWord,francoArabicWord:'ssekbaaj'}},
    ]))));
    const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/word/61']}><Routes><Route path="/word/:wordId" element={<WordPage/>}/></Routes></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByText(definition)).toHaveAttribute('lang',isArabic?'ar':'en');
    expect(screen.getAllByRole('heading',{name:word})).toHaveLength(2);
    expect(screen.getAllByText(notice)).toHaveLength(1);
    expect(screen.getByRole('link',{name:action})).toHaveAttribute('href','/add-definition?word=61');
    expect(screen.getAllByText(language==='ar'?'معنى بالإنجليزية':'Arabic meaning')).toHaveLength(2);
    client.clear();
  });
});
