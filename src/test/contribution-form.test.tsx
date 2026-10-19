import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ContributionForm from '../../pages/ContributionForm';

vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'},t:(key:string)=>key==='content_box_buttons'?{like:'Like',dislike:'Dislike',share:'Share',report:'Report'}:key})}));
vi.mock('papaparse',()=>({default:{parse:(_url:string,options:{complete:(result:unknown)=>void})=>options.complete({data:[{CountryCode:'EG',' CountryName':'Egypt'}]})}}));
afterEach(()=>vi.unstubAllGlobals());
function mount() {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
  return render(<QueryClientProvider client={client}><MemoryRouter><Routes><Route path="/" element={<ContributionForm/>}/><Route path="/word/:id" element={<p>Saved word page</p>}/></Routes></MemoryRouter></QueryClientProvider>);
}
function fill() {
  fireEvent.change(screen.getByLabelText(/Arabic word/),{target:{value:'معلش'}});
  fireEvent.change(screen.getByLabelText('English definition'),{target:{value:'Never mind'}});
  fireEvent.change(screen.getByLabelText(/Arabic example/),{target:{value:'معلش، هتتعوض.'}});
}
describe('contribution submission',()=>{
  it('keeps the draft on failure and reuses its request ID on retry, then opens the saved word',async()=>{
    const fetch=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({message:'Temporary failure'}),{status:503}))
      .mockResolvedValueOnce(new Response(JSON.stringify({wordId:61,definitionIds:[106]}),{status:201}));
    vi.stubGlobal('fetch',fetch);mount();fill();
    expect(screen.queryByRole('button',{name:'Fill an example'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));
    expect(screen.getByText('معلش، هتتعوض.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Add word'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your draft is still here');
    fireEvent.click(screen.getByRole('button',{name:'Add word'}));
    await screen.findByText('Saved word page');
    const [first,retry]=fetch.mock.calls.map(call=>JSON.parse(call[1].body));
    expect(first.requestId).toBe(retry.requestId);
    expect(first).toMatchObject({arabicWord:'معلش',englishDefinition:'Never mind',arabicDefinition:null,arabicExample:'معلش، هتتعوض.',francoExample:null});
  });
  it('searches real words and submits an existing word ID rather than creating another word',async()=>{
    const fetch=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify([{id:42,arabicWord:'معلش',francoArabicWord:'ma3lish'}])))
      .mockResolvedValueOnce(new Response(JSON.stringify({wordId:42,definitionIds:[107]}),{status:201}));
    vi.stubGlobal('fetch',fetch);mount();
    fireEvent.click(screen.getByRole('button',{name:'Another meaning'}));
    fireEvent.change(screen.getByLabelText(/Existing word/),{target:{value:'ma3lish'}});
    fireEvent.click(await screen.findByRole('button',{name:'معلش ma3lish'}));
    fireEvent.change(screen.getByLabelText('English definition'),{target:{value:'It is okay'}});
    fireEvent.click(screen.getByRole('button',{name:'Review meaning'}));
    fireEvent.click(screen.getByRole('button',{name:'Add meaning'}));
    await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2));
    const payload=JSON.parse(fetch.mock.calls[1][1].body);
    expect(payload.wordId).toBe(42);expect(payload).not.toHaveProperty('arabicWord');
    await screen.findByText('Saved word page');
  });
});
