import React,{useState} from 'react';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {describe,it,expect,vi} from 'vitest';
import SymbolInput from '../components/SymbolInput';

function Field({kind='transliteration',initial='kitab',submit=()=>{}}:{kind?:'transliteration'|'ipa';initial?:string;submit?:()=>void}){
 const [value,setValue]=useState(initial);
 return <form onSubmit={event=>{event.preventDefault();submit();}}><SymbolInput id="symbols-test" label={kind==='ipa'?'IPA':'Transliteration'} kind={kind} value={value} onChange={setValue} ar={false} placeholder=""/></form>;
}
describe('pronunciation symbol pickers',()=>{
 it('replaces the selected text, restores the caret, and never submits the form',async()=>{
  const submit=vi.fn();render(<Field submit={submit}/>);
  const input=screen.getByLabelText(/^Transliteration/) as HTMLInputElement;
  input.focus();input.setSelectionRange(3,4);
  fireEvent.click(screen.getByRole('button',{name:'Insert symbol for Transliteration'}));
  fireEvent.click(screen.getByRole('button',{name:'Insert ā (ا)'}));
  expect(input).toHaveValue('kitāb');expect(submit).not.toHaveBeenCalled();
  await waitFor(()=>{expect(input).toHaveFocus();expect(input.selectionStart).toBe(4);});
 });
 it('offers IPA sounds and length marks with Arabic cues',()=>{
  render(<Field kind="ipa" initial="/ma/"/>);
  const input=screen.getByLabelText(/^IPA/) as HTMLInputElement;input.setSelectionRange(3,3);
  fireEvent.click(screen.getByRole('button',{name:'Insert symbol for IPA'}));
  fireEvent.click(screen.getByRole('button',{name:'Insert ʕ (ع)'}));
  expect(input).toHaveValue('/maʕ/');
  expect(screen.getByRole('button',{name:'Insert ː (length)'})).toBeVisible();
 });
 it('keeps the same maximum length as direct typing',()=>{
  render(<Field initial={'a'.repeat(255)}/>);
  fireEvent.click(screen.getByRole('button',{name:'Insert symbol for Transliteration'}));fireEvent.click(screen.getByRole('button',{name:'Insert ā (ا)'}));
  expect(screen.getByLabelText(/^Transliteration/)).toHaveValue('a'.repeat(255));
 });
});
