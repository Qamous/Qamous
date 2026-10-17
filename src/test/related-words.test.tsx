import {describe,it,expect,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from 'react-query';
import RelatedWords from '../components/RelatedWords';

describe('related public vocabulary links',()=>{
  it('links to the country guide and other words without sending session credentials',async()=>{
    const fetcher=vi.fn(async(input:string,_options?:RequestInit)=>new Response(JSON.stringify(input.endsWith('/countries')
      ?[{countryCode:'EG',countryName:'Egypt'}]
      :{results:[{wordId:2,word:'Current word',isArabic:1},{wordId:3,word:'يلا',isArabic:1},{wordId:3,word:'Duplicate',isArabic:1}]})));
    vi.stubGlobal('fetch',fetcher);
    const client=new QueryClient({defaultOptions:{queries:{retry:false,cacheTime:0}}});
    render(<QueryClientProvider client={client}><MemoryRouter><RelatedWords countryCode="EG" wordId={2} lang="ar"/></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByRole('link',{name:'يلا'})).toHaveAttribute('href','/word/3/ar');
    expect(screen.getByRole('link',{name:'تصفح هذه اللهجة'})).toHaveAttribute('href','/advanced-search/Egypt');
    expect(screen.queryByText('Current word')).not.toBeInTheDocument();expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    for(const call of fetcher.mock.calls) expect(call[1]).toMatchObject({credentials:'omit'});
  });
});
