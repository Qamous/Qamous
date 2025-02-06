import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ContentBox from '../ContentBox';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, UseMutationResult } from 'react-query';
import * as htmlToImage from 'html-to-image';

// Add type definitions for mocked components
interface ReactCountryFlagProps {
  countryCode: string;
  svg?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

interface AdSenseProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
}

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case 'content_box_buttons':
          return {
            like: 'Like',
            dislike: 'Dislike',
            report: 'Report',
            share: 'Share'
          };
        case 'login.must_login':
          return 'Please log in';
        default:
          return key;
      }
    }
  })
}));

// Mock react-query mutations
const mockMutate = jest.fn();
const mockMutation: Partial<UseMutationResult> = {
  mutate: mockMutate,
  isLoading: false,
  isError: false,
  error: null,
};

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useMutation: () => mockMutation
}));

// Mock react-country-flag with proper types
jest.mock('react-country-flag', () => ({
  __esModule: true,
  default: ({ countryCode, svg, style, title }: ReactCountryFlagProps) => (
    <div data-testid="country-flag" data-country={countryCode}>
      {title}
    </div>
  )
}));

// Mock react-adsense with proper types
jest.mock('react-adsense', () => ({
  __esModule: true,
  default: {
    Google: ({ client, slot, style }: AdSenseProps) => (
      <div data-testid="adsense-mock" data-client={client} data-slot={slot}>
        AdSense Mock
      </div>
    )
  }
}));

// Setup test client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockProps = {
  item: {
    word: 'Test Word',
    definition: 'Test Definition'
  },
  index: 1,
  lang: 'en',
  wordId: 1,
  definitionId: 1,
  isLiked: false,
  isDisliked: false,
  isReported: false,
  countryCode: 'US'
};

const renderContentBox = async () => {
  let component;
  await act(async () => {
    component = render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ContentBox {...mockProps} />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
  return component;
};

describe('ContentBox', () => {
  beforeEach(() => {
    queryClient.clear();
    mockMutate.mockClear();
    // Mock fetch with proper response handling
    global.fetch = jest.fn((url) => {
      if (url.endsWith('countries.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('CountryCode,CountryName\nUS,United States'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  it('renders word and definition', async () => {
    await renderContentBox();
    expect(screen.getByText('Test Word')).toBeInTheDocument();
    expect(screen.getByText('Test Definition')).toBeInTheDocument();
  });

  it('renders action buttons when index is not 0', async () => {
    await renderContentBox();
    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Dislike')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('does not render buttons when index is 0', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ContentBox {...mockProps} index={0} />
          </QueryClientProvider>
        </BrowserRouter>
      );
    });
    
    expect(screen.queryByText('Like')).not.toBeInTheDocument();
    expect(screen.queryByText('Dislike')).not.toBeInTheDocument();
  });

  it('handles like button click', async () => {
    await renderContentBox();
    const likeButton = screen.getByText('Like');
    
    await act(async () => {
      fireEvent.click(likeButton);
    });
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(likeButton).toHaveClass('clicked');
    });
  });

  it('shows share options when share button is clicked', async () => {
    await renderContentBox();
    
    const shareButton = screen.getByText('Share');
    await act(async () => {
      fireEvent.click(shareButton);
    });
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('X / Twitter')).toBeInTheDocument();
  });

  it('renders country flag when countryCode is provided', async () => {
    await renderContentBox();
    
    await waitFor(() => {
      const flag = screen.getByTestId('country-flag');
      expect(flag).toBeInTheDocument();
      expect(flag).toHaveAttribute('data-country', 'US');
    });
  });
});
