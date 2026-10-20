import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ContentBoxPreview } from '../components/ContentBoxView';
import { attributionText, type SourceCredit } from '../types/provenance';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key === 'content_box_buttons'
  ? { like: 'Like', dislike: 'Dislike', share: 'Share', report: 'Report' } : key }) }));
const credit: SourceCredit = {
  sourceId: 'maknuune', sourceName: 'Maknuune', sourceUrl: 'https://example.org/entry', sourceEntryId: 'sense1',
  license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  rightsStatus: 'licensed', attributionRequired: true, credit: 'Original research authors',
  notice: 'Original copyright notice.', changes: ['Extracted; wording preserved.'],
  importer: {username:'qalam01',accountKind:'import'}, transliteration: 'kitāb',
};
const content = { item:{word:'كتاب',definition:'A book.'},lang:'en',example:'' };

describe('source credits',()=>{
  it('keeps credits collapsed with readable access to original authorship and the import profile',()=>{
    render(<MemoryRouter><ContentBoxPreview {...content} sourceCredits={[credit]} /></MemoryRouter>);
    const details=screen.getByTestId('source-credits');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Source'));
    expect(screen.getByRole('link',{name:'Maknuune'})).toHaveAttribute('href',credit.sourceUrl);
    expect(screen.getByRole('link',{name:'@qalam01'})).toHaveAttribute('href','/contributors/qalam01');
    expect(screen.getByText('Transliteration: kitāb')).toBeInTheDocument();
    expect(screen.queryByText(/Posted by/)).not.toBeInTheDocument();
  });
  it('does not add optional attribution to CC0 cards',()=>{
    render(<MemoryRouter><ContentBoxPreview {...content} sourceCredits={[{...credit,license:'CC0',attributionRequired:false}]} /></MemoryRouter>);
    expect(screen.queryByTestId('source-credits')).not.toBeInTheDocument();
    expect(attributionText([{...credit,attributionRequired:false}])).toBe('');
  });
  it('keeps original technical notation behind Source and its own disclosure',()=>{
    render(<MemoryRouter><ContentBoxPreview {...content} sourceCredits={[credit]} sourcePronunciations={[{
      scheme:'CAPHI++',value:'2 a b',language:'ar',kind:'transcription',sourceId:'maknuune',sourceName:'Maknuune',sourceUrl:credit.sourceUrl,sourceEntryId:'sense1',dialect:'Palestinian',
    }]} /></MemoryRouter>);
    expect(screen.getByText('CAPHI++')).not.toBeVisible();
    fireEvent.click(screen.getByText('Source'));
    expect(screen.getByText('Original notation')).toBeVisible();
    expect(screen.getByText('CAPHI++')).not.toBeVisible();
    fireEvent.click(screen.getByText('Original notation'));
    expect(screen.getByText('CAPHI++')).toBeVisible();
  });
  it('keeps English and Franco examples distinctly labeled',()=>{
    render(<MemoryRouter><ContentBoxPreview {...content} sourceExamples={[
      {text:'This is a book.',language:'en',script:'Latin',kind:'translation',groupId:'source:1',alignment:'source'},
      {text:'Hada kitab.',language:'ar-Latn',script:'Latin',kind:'usage',groupId:'source:1',alignment:'source'},
      {text:'هذا كتاب.',language:'ar',script:'Arabic',kind:'usage',groupId:'source:1',alignment:'source'},
    ]} /></MemoryRouter>);
    expect(screen.getByText('English translation')).toBeInTheDocument();
    expect(screen.getByText('Franco')).toBeInTheDocument();
    expect(screen.getByText('هذا كتاب.')).not.toBeVisible();
  });
  it('retains license, source link, notice and change statement in exportable credit text',()=>{
    const text=attributionText([credit]);
    for(const value of [credit.credit,credit.licenseUrl,credit.sourceUrl,credit.notice,credit.changes[0]]) expect(text).toContain(value);
  });
});
