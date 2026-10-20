import React from 'react';
import {render,screen,within} from '@testing-library/react';
import {describe,it,expect} from 'vitest';
import ExampleList from '../components/ExampleList';
import type {SourceExample} from '../types/provenance';
const original:SourceExample={text:'هذا كتاب.',language:'ar',script:'Arabic',kind:'usage',groupId:'a',alignment:'source'};
const translation:SourceExample={text:'This is a book.',language:'en',script:'Latin',kind:'translation',groupId:'a',alignment:'source'};
describe('paired examples',()=>{
 it('shows Arabic-only source examples as Franco followed by their translation with a quiet original disclosure',()=>{
  const {container}=render(<ExampleList language="en" entries={[original,translation]}/>);
  expect(container.querySelectorAll('.content-box-example')).toHaveLength(1);
  expect(screen.getByText('Franco')).toBeVisible();
  expect(screen.getByText('English translation')).toBeVisible();
  expect(screen.getByText(translation.text)).toBeVisible();
  expect(screen.getByText(original.text)).not.toBeVisible();
  expect(screen.getByText('Arabic original')).toBeVisible();
  expect(screen.queryByText(/approx|automatic|generated/i)).not.toBeInTheDocument();
 });
 it('keeps different source example blocks together and retains source Franco',()=>{
  const franco:SourceExample={text:'Hada kitab.',language:'ar-Latn',script:'Latin',kind:'usage',groupId:'a',alignment:'source'};
  const {container}=render(<ExampleList language="en" entries={[original,translation,franco,{...original,text:'دار',groupId:'b'},{...translation,text:'A house.',groupId:'b'}]}/>);
  const cards=container.querySelectorAll<HTMLElement>('.content-box-example');
  expect(cards).toHaveLength(2);
  expect(within(cards[0]).getByText(franco.text)).toBeVisible();
  expect(within(cards[0]).queryByText('A house.')).not.toBeInTheDocument();
  expect(within(cards[1]).getByText('A house.')).toBeVisible();
 });
 it('never labels unpaired English as usage or guesses its original',()=>{
  const {container}=render(<ExampleList language="en" entries={[{...translation,groupId:undefined,alignment:'unverified',kind:'unclassified'}]}/>);
  expect(container.querySelector('.content-box-example')).not.toBeInTheDocument();
 });
 it('shows the original Arabic beside its English translation in Arabic mode',()=>{
  render(<ExampleList language="ar" entries={[original,translation]}/>);
  expect(screen.getByText(original.text)).toHaveAttribute('dir','rtl');
  expect(screen.getByText(translation.text)).toHaveAttribute('dir','ltr');
  expect(screen.queryByText('Franco (approx.)')).not.toBeInTheDocument();
 });
});
