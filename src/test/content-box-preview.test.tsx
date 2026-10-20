import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import ContentBox from '../components/ContentBox';
import { ContentBoxPreview } from '../components/ContentBoxView';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key === 'content_box_buttons'
  ? { like: 'Like', dislike: 'Dislike', share: 'Share', report: 'Report' } : key }) }));
vi.mock('i18next', () => ({ default: { language: 'en' } }));

afterEach(() => vi.unstubAllGlobals());

const content = {
  item: { word: 'ma3lish', definition: 'Never mind; it’s okay.' }, lang: 'en',
  countryCode: 'EG', countryName: 'Egypt', example: 'Ma3lish, hatet3awwad.',
};

describe('feed card previews', () => {
  it.each([undefined, null, '', '   '])('hides missing Arabic examples (%j) in both feed and review cards', (arabicExample) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const arabicContent = { ...content, lang: 'ar', arabicExample };
    const { container } = render(<>
      <QueryClientProvider client={client}><MemoryRouter>
        <ContentBox {...arabicContent} index={1} wordId={61} definitionId={106} isLiked={false} isDisliked={false} isReported={false} />
      </MemoryRouter></QueryClientProvider>
      <ContentBoxPreview {...arabicContent} />
    </>);
    expect(container.querySelectorAll('.content-box')).toHaveLength(2);
    expect(container.querySelector('.content-box-example')).not.toBeInTheDocument();
    expect(screen.queryByText(content.example)).not.toBeInTheDocument();
    client.clear();
  });

  it.each(['', '   '])('marks generated Franco when only an Arabic example exists (%j)', (example) => {
    const { container } = render(<ContentBoxPreview {...content} example={example} arabicExample="معلش، هتتعوض." />);
    expect(container.querySelector('.content-box-example')).toBeInTheDocument();
    expect(screen.getByText('Franco (approx.)')).toBeVisible();
    expect(screen.getByText('معلش، هتتعوض.')).not.toBeVisible();
  });

  it.each([['ar', 'معلش، هتتعوض.', 'rtl'], ['en', content.example, 'ltr']])('shows only the matching example for %s cards', (lang, expectedExample, direction) => {
    render(<ContentBoxPreview {...content} lang={lang} arabicExample="معلش، هتتعوض." />);
    expect(screen.getByText(expectedExample)).toHaveAttribute('dir', direction);
    expect(screen.queryByText(lang === 'ar' ? content.example : 'معلش، هتتعوض.')).not.toBeInTheDocument();
  });

  it('renders without routing or reaction providers and cannot navigate or submit actions', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { container } = render(<ContentBoxPreview {...content} alternateSpellings={['ma3lesh']} />);

    expect(screen.getByRole('heading', { name: 'ma3lish' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(content.example)).toBeInTheDocument();
    expect(screen.getByText('ma3lesh')).toBeInTheDocument();
    expect(screen.getByLabelText('Egypt')).toBeInTheDocument();
    expect(container.querySelector('.content-box-first')).not.toBeInTheDocument();
    for (const label of ['Like', 'Dislike', 'Share', 'Report']) {
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shares feed markup for content and controls while keeping feed titles linked', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(<>
      <QueryClientProvider client={client}><MemoryRouter>
        <ContentBox {...content} index={1} wordId={61} definitionId={106} isLiked={false} isDisliked={false} isReported={false} />
      </MemoryRouter></QueryClientProvider>
      <ContentBoxPreview {...content} />
    </>);
    const [feed, preview] = Array.from(container.querySelectorAll<HTMLElement>('.content-box'));
    expect(feed.className).toBe(preview.className);
    expect(within(feed).getByRole('link', { name: 'ma3lish' })).toHaveAttribute('href', '/word/61');
    expect(within(preview).queryByRole('link')).not.toBeInTheDocument();
    for (const selector of ['.content-box-description', '.content-box-example']) {
      expect(feed.querySelector(selector)?.outerHTML).toBe(preview.querySelector(selector)?.outerHTML);
    }
    expect(within(feed).getByRole('button', { name: 'Like' })).toBeEnabled();
    expect(within(preview).getByRole('button', { name: 'Like' })).toBeDisabled();
    client.clear();
  });
});
