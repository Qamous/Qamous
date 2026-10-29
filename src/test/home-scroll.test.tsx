import { render, screen, waitFor } from './render';
import { expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import {MemoryRouter} from 'react-router-dom';
import Home from '../../pages/Home';

vi.mock('i18next',()=>({default:{language:'en'}}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key==='sample_home'?[{word:'Welcome',definition:'Intro'}]:key,i18n:{language:'en'}})}));
vi.mock('../assets/utils',()=>({useIntersectionObserver:()=>[()=>{},true]}));
vi.mock('../components/ContentBox',()=>({default:({item}:{item:{word:string}})=><article>{item.word}</article>}));

it('Home automatically advances past a removed batch while its loading marker remains visible', async()=>{
  const batches:number[][]=[];
  vi.stubGlobal('fetch',vi.fn(async(input:string)=>{
    const url=new URL(input,'https://qamous.org');
    if(url.pathname.endsWith('/definitions/feed')) return new Response(JSON.stringify({definitionIds:Array.from({length:21},(_,i)=>i+1)}));
    const ids=url.searchParams.get('ids')!.split(',').map(Number);batches.push(ids);
    return new Response(JSON.stringify({results:ids[0]===11?[]:ids.map(id=>({definitionId:id,wordId:id,word:'Word '+id,isArabic:0}))}));
  }));
  const client=new QueryClient({defaultOptions:{queries:{retry:false,cacheTime:0}}});
  const view=render(<MemoryRouter><QueryClientProvider client={client}><Home/></QueryClientProvider></MemoryRouter>);
  await waitFor(()=>expect(screen.getByText('Word 21')).toBeInTheDocument());
  expect(batches.map(ids=>ids[0])).toEqual([1,11,21]);
  expect(screen.getAllByRole('article')).toHaveLength(11);
  expect(screen.getByRole('heading',{level:1,name:'Arabic words and everyday meanings'})).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Egyptian Arabic'})).toHaveAttribute('href','/advanced-search/Egypt');
  view.unmount();client.clear();vi.unstubAllGlobals();
});
