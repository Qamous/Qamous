import React from 'react';
import { render,screen,fireEvent } from '@testing-library/react';
import { describe,it,expect } from 'vitest';
import Pronunciation, { OriginalNotation, type SourcePronunciation } from '../components/Pronunciation';
const row=(scheme:string,value:string):SourcePronunciation=>({scheme,value,kind:'transcription',language:'ar',sourceId:'dictionary',sourceName:'Dictionary',sourceUrl:'https://example.org/word',sourceEntryId:'1',dialect:'Palestinian'});
describe('source pronunciation proposal',()=>{
  it('shows the meaning-specific Arabic reading in RTL and retains the separate IPA',()=>{
    const {container}=render(<Pronunciation entries={[row('Arabic vocalization','عَلَم'),row('IPA','/ʕalam/')]} language="ar"/>);
    expect(container.querySelector('summary')).toHaveTextContent('عَلَم');
    expect(container.querySelector('summary .pronunciation-value')).toHaveAttribute('dir','rtl');
    expect(screen.getByText('/ʕalam/')).toBeInTheDocument();
    expect(container.querySelectorAll('.pronunciation-entry')).toHaveLength(2);
  });
  it('keeps transliteration and IPA separately labeled with source details in a disclosure',()=>{
    const {container}=render(<Pronunciation entries={[row('translit','ktāb'),row('phonemic','/ktaːb/')]} />);
    const details=container.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    expect(details.querySelector('summary')).toHaveTextContent('Transliteration');
    expect(details.querySelector('summary')).toHaveTextContent('IPA');
    fireEvent.click(details.querySelector('summary')!);
    expect(screen.getAllByRole('link',{name:'Dictionary'})[0]).toHaveAttribute('href','https://example.org/word');
    expect(container.querySelector('audio')).toBeNull();
  });
  it('does not pair an unrelated IPA variant with a single romanization',()=>{
    const {container}=render(<Pronunciation entries={[row('translit','ʔahwe'),row('phonemic','/ʔahwe/'),row('phonemic','/kahwa/')]} />);
    expect(container.querySelector('summary')).toHaveTextContent('2 variants');
    expect(container.querySelector('summary')).not.toHaveTextContent('/kahwa/');
  });
  it('does not pair pronunciation and transliteration from unrelated source entries',()=>{
    const {container}=render(<Pronunciation entries={[row('translit','ktāb'),{...row('IPA','/different/'),sourceEntryId:'2'}]} />);
    expect(container.querySelector('summary')).toHaveTextContent('ktāb');
    expect(container.querySelector('summary')).not.toHaveTextContent('/different/');
    expect(screen.getByText('/different/')).not.toBeVisible();
  });
  it('keeps technical encoding off the pronunciation line and inside a collapsed original-notation section',()=>{
    const entries=[row('CAPHI++','2 a b')];
    const {container,rerender}=render(<Pronunciation entries={entries} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<OriginalNotation entries={entries} />);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
    expect(container.querySelector('summary')).toHaveTextContent('Original notation');
    expect(container.querySelector('summary')).not.toHaveTextContent('CAPHI++');
    expect(screen.getByText('2 a b')).toBeInTheDocument();
  });
  it('supports RTL while isolating phonetic text LTR, and preserves exact source strings',()=>{
    const {container}=render(<Pronunciation entries={[row('IPA','[ˈʃʊkɾan]')]} language="ar" />);
    expect(container.querySelector('details')).toHaveAttribute('dir','rtl');
    expect(container.querySelector('summary')).toHaveTextContent('النطق');
    expect(container.querySelector('bdi')).toHaveAttribute('dir','ltr');
    expect(container.querySelector('bdi')).toHaveTextContent('[ˈʃʊkɾan]');
  });
  it('does not show an empty section; removes only exact duplicate source rows',()=>{
    const {container,rerender}=render(<Pronunciation />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Pronunciation entries={[row('IPA','/a/'),row('IPA','/a/'),row('IPA','/b/')]} />);
    expect(container.querySelectorAll('.pronunciation-entry')).toHaveLength(2);
  });
});
