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
  it('shows optional pronunciation fields together, with a vowel example and symbol helpers',()=>{
    mount();fireEvent.click(screen.getByRole('button',{name:'Add or edit vowels'}));
    for(const name of [/^Reading with vowels/,/^Transliteration/,/^IPA/]){
      const input=screen.getByLabelText(name);expect(input).toBeVisible();expect(input).not.toBeRequired();
      expect(input.closest('.contribute-field')?.querySelector('label .contribute-optional')).toHaveTextContent('Optional');
    }
    expect(screen.getByText('عِلْم')).toBeVisible();
    expect(screen.queryByText('More pronunciation details')).not.toBeInTheDocument();
    expect(screen.queryByText(/This reading belongs/)).not.toBeInTheDocument();
    expect(screen.queryByText(/For a transcription system/)).not.toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Insert symbol for Transliteration'})).toBeVisible();
    expect(screen.getByRole('button',{name:'Insert symbol for IPA'})).toBeVisible();
  });
  it('identifies and quotes the example that English translates',()=>{
    mount();
    fireEvent.change(screen.getByLabelText(/Franco example/),{target:{value:'Ma3lish.'}});
    let english=screen.getByLabelText(/^English translation of the Franco example/);
    expect(document.getElementById(english.getAttribute('aria-describedby')!)).toHaveTextContent('Ma3lish.');
    fireEvent.change(screen.getByLabelText(/Arabic example/),{target:{value:'معلش.'}});
    english=screen.getByLabelText(/^English translation of the Arabic example/);
    expect(document.getElementById(english.getAttribute('aria-describedby')!)).toHaveTextContent('معلش.');
    expect(document.getElementById('english-example-original')).toHaveAttribute('lang','ar');
  });
  it.each(['علم','عِلْم'])('accepts %s without asking the user to remove or supply vowels',async(word)=>{
    const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({wordId:61,definitionIds:[106]}),{status:201}));vi.stubGlobal('fetch',fetch);mount();
    fireEvent.change(screen.getByLabelText(/Arabic word/),{target:{value:word}});
    fireEvent.change(screen.getByLabelText('English definition'),{target:{value:'knowledge'}});
    expect(screen.getByLabelText(/^Reading with vowels/)).not.toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));
    fireEvent.click(screen.getByRole('button',{name:'Add word'}));await screen.findByText('Saved word page');
    const payload=JSON.parse(fetch.mock.calls[0][1].body);expect(payload.arabicWord).toBe(word);expect(payload.arabicForm).toBe(word);
  });
  it('offers optional vowels and stores pronunciation, Franco and English examples with the meaning',async()=>{
    const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({wordId:61,definitionIds:[106]}),{status:201}));vi.stubGlobal('fetch',fetch);mount();
    fireEvent.change(screen.getByLabelText(/Arabic word/),{target:{value:'علم'}});fireEvent.change(screen.getByLabelText('English definition'),{target:{value:'knowledge'}});
    fireEvent.click(screen.getByRole('button',{name:'Add or edit vowels'}));
    fireEvent.change(screen.getByLabelText(/^Reading with vowels/),{target:{value:'عِلْم'}});
    fireEvent.change(screen.getByLabelText(/^Franco spelling/),{target:{value:'3ilm'}});
    fireEvent.change(screen.getByLabelText(/^Transliteration/),{target:{value:'ʕilm'}});fireEvent.change(screen.getByLabelText(/^IPA/),{target:{value:'/ʕilm/'}});
    fireEvent.change(screen.getByLabelText(/English translation/),{target:{value:'Knowledge is useful.'}});
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));fireEvent.click(screen.getByRole('button',{name:'Add word'}));await screen.findByText('Saved word page');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({arabicWord:'علم',arabicForm:'عِلْم',francoArabicWord:'3ilm',transliteration:'ʕilm',ipa:'/ʕilm/',englishExample:'Knowledge is useful.',exampleAlignment:'parallel'});
  });
  it('saves Yamli conversions from native change events and reattaches after draft review',async()=>{
    const yamlify=vi.fn(),deyamlify=vi.fn();vi.stubGlobal('Yamli',{init:()=>true,yamlify,deyamlify});
    const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({wordId:61,definitionIds:[106]}),{status:201}));vi.stubGlobal('fetch',fetch);mount();
    const input=screen.getByLabelText(/Arabic word/) as HTMLInputElement;
    expect(yamlify).toHaveBeenCalledWith('new-arabic-word',expect.objectContaining({generateOnChangeEvent:true,settingsXOffset:10,settingsYOffset:0}));
    expect(yamlify).toHaveBeenCalledWith('arabic-definition',expect.objectContaining({settingsXOffset:10,settingsYOffset:10}));
    expect(yamlify.mock.calls.some(([id])=>id==='vocalized-word')).toBe(false);
    fireEvent.click(screen.getByRole('button',{name:'Add or edit vowels'}));
    fireEvent.focus(screen.getByLabelText(/^Reading with vowels/));
    expect(yamlify).toHaveBeenCalledWith('vocalized-word',expect.objectContaining({generateOnChangeEvent:true}));
    input.value='كِتاب';fireEvent.change(input);
    fireEvent.change(screen.getByLabelText('English definition'),{target:{value:'book'}});
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));fireEvent.click(screen.getByRole('button',{name:'Keep editing'}));
    expect(screen.getByLabelText(/Arabic word/)).toHaveValue('كِتاب');expect(deyamlify).toHaveBeenCalledWith('new-arabic-word');
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));fireEvent.click(screen.getByRole('button',{name:'Add word'}));await screen.findByText('Saved word page');
    expect(JSON.parse(fetch.mock.calls[0][1].body).arabicForm).toBe('كِتاب');
  });
  it('keeps the draft on failure and reuses its request ID on retry, then opens the saved word',async()=>{
    const fetch=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({message:'Temporary failure'}),{status:503}))
      .mockResolvedValueOnce(new Response(JSON.stringify({wordId:61,definitionIds:[106]}),{status:201}));
    vi.stubGlobal('fetch',fetch);mount();fill();
    expect(screen.queryByRole('button',{name:'Fill an example'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Review word'}));
    expect(screen.getByText('معلش، هتتعوض.')).not.toBeVisible();
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
