import React from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {act,render,screen,waitFor} from './render';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from 'react-query';
import {createInstance} from 'i18next';
import {I18nextProvider} from 'react-i18next';
import translations from '../assets/en/translation.json';
import arabic from '../assets/ar/translation.json';
import SearchResults from '../../pages/SearchResults';
import {keywordSearchKey} from '../utils/keyword-search';

vi.mock('../components/ContentBox',()=>({default:(props:any)=>props.definitionId===0?<header>{props.item.word}</header>:<article>{props.item.word}</article>}));
vi.mock('../components/AdSenseWrapper',()=>({default:()=>null}));
const result=(id:number)=>({word:'Result '+id,definition:'Meaning',wordId:id,definitionId:id,isArabic:0,isLiked:false,isDisliked:false,isReported:false,example:''});
const page=(number:number,results:ReturnType<typeof result>[],hasMore:boolean)=>({page:number,limit:20,results,hasMore});
async function mount(seed?:ReturnType<typeof page>) {
  const i18n=createInstance();await i18n.init({lng:'en',resources:{en:{translation:translations},ar:{translation:arabic}},interpolation:{escapeValue:false}});
  const client=new QueryClient({defaultOptions:{queries:{retry:false,cacheTime:0,staleTime:60000}}});
  if(seed)client.setQueryData(keywordSearchKey('test'),{pages:[seed],pageParams:[1]});
  render(<I18nextProvider i18n={i18n}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/search/test']}>
    <Routes><Route path="/search/:query" element={<SearchResults/>}/></Routes>
  </MemoryRouter></QueryClientProvider></I18nextProvider>);
  return {client,i18n,user:userEvent.setup()};
}
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
beforeEach(()=>vi.unstubAllGlobals());
describe('bounded keyword searches',()=>{
  it('loads the next page without losing earlier cards or requesting the entire result set',async()=>{
    const fetcher=vi.fn(async(input:string)=>response(input.includes('page=2')?page(2,[result(21)],false):page(1,Array.from({length:20},(_,i)=>result(i+1)),true)));
    vi.stubGlobal('fetch',fetcher);const {user}=await mount();
    expect(await screen.findByText('Result 1')).toBeInTheDocument();expect(screen.getAllByRole('article')).toHaveLength(20);
    await act(async()=>{await user.click(screen.getByRole('button',{name:'Load more'}));});
    expect(await screen.findByText('Result 21')).toBeInTheDocument();expect(screen.getAllByRole('article')).toHaveLength(21);
    expect(screen.queryByRole('button',{name:'Load more'})).not.toBeInTheDocument();
    expect(fetcher.mock.calls.map(([path])=>path)).toEqual(['/api/word/search/kwd=test?page=1&limit=20&language=en','/api/word/search/kwd=test?page=2&limit=20&language=en']);
  });
  it('hydrates the first page without refetching and retains it if the next page fails',async()=>{
    const fetcher=vi.fn(async(_input:string)=>response({message:'Busy'},503));vi.stubGlobal('fetch',fetcher);
    const {user}=await mount(page(1,[result(1)],true));expect(fetcher).not.toHaveBeenCalled();
    await act(async()=>{await user.click(screen.getByRole('button',{name:'Load more'}));});
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load more');expect(screen.getByText('Result 1')).toBeInTheDocument();
    fetcher.mockImplementation(async()=>response(page(2,[result(2)],false)));
    await act(async()=>{await user.click(screen.getByRole('button',{name:'Load more'}));});
    await waitFor(()=>expect(screen.getByText('Result 2')).toBeInTheDocument());expect(screen.getByText('Result 1')).toBeInTheDocument();
    expect(fetcher.mock.calls.every(([path])=>String(path).includes('page=2&limit=20'))).toBe(true);
  });
  it('requests a separate first page when the reader changes language',async()=>{
    const fetcher=vi.fn(async(_input:string)=>response(page(1,[{...result(2),isArabic:1}],false)));vi.stubGlobal('fetch',fetcher);
    const {i18n}=await mount(page(1,[result(1)],false));
    await act(async()=>{await i18n.changeLanguage('ar');});
    expect(await screen.findByText('Result 2')).toBeInTheDocument();expect(screen.queryByText('Result 1')).not.toBeInTheDocument();
    expect(fetcher.mock.calls[0][0]).toContain('page=1&limit=20&language=ar');
  });
});
