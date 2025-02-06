import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider, UseInfiniteQueryResult, InfiniteData, QueryFunctionContext, QueryKey } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import * as ReactQuery from 'react-query';
import Home from '../Home';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'sample_home') {
        return [{
          word: 'Sample Word',
          definition: 'Sample Definition'
        }];
      }
      return key;
    }
  })
}));

// Add type definitions for mocked components
interface AdSenseProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
}

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

// Mock i18next
jest.mock('i18next', () => ({
  language: 'en',
}));

// Mock useIntersectionObserver hook with proper types
type SetRefType = (node: Element | null) => void;

jest.mock('../../../assets/utils', () => ({
  ...jest.requireActual('../../../assets/utils'),
  useIntersectionObserver: () => {
    // Return a noop function for setRef that explicitly returns undefined
    const setRef: SetRefType = (node: Element | null): void => {
      return undefined;
    };
    return [setRef, false] as [SetRefType, boolean];
  },
  getCountryName: jest.fn().mockResolvedValue('Test Country'),
}));

// Define the type for our content data
interface HomeContent {
  word: string;
  definition: string;
  isArabic: number;
  wordId: number;
  definitionId: number;
}

// Setup mock data and query client before using them
const mockQueryResponse: Partial<UseInfiniteQueryResult<HomeContent[]>> = {
  data: {
    pages: [[{
      word: 'Test Word',
      definition: 'Test Definition',
      isArabic: 0,
      wordId: 1,
      definitionId: 1
    }]],
    pageParams: [null] // Add this line to fix the type error
  } as InfiniteData<HomeContent[]>,
  isLoading: false,
  isError: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
};

// Mock react-query
jest.mock('react-query', () => {
  const actual = jest.requireActual('react-query');
  return {
    ...actual,
    useInfiniteQuery: jest.fn().mockImplementation(() => mockQueryResponse)
  };
});

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock fetch with default response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{
        word: 'Test Word',
        definition: 'Test Definition',
        isArabic: 0,
        wordId: 1,
        definitionId: 1
      }])
    });

    // Reset the useInfiniteQuery mock for loading state test with proper typing
    (ReactQuery.useInfiniteQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as Partial<UseInfiniteQueryResult<HomeContent[]>>));
  });

  it('renders loading state initially', async () => {
    await act(async () => {
      renderWithProviders(<Home />);
    });
    
    expect(screen.getByText('Sample Word')).toBeInTheDocument();
    expect(screen.getByText('Sample Definition')).toBeInTheDocument();
  });

  it('renders feed container', async () => {
    await act(async () => {
      renderWithProviders(<Home />);
    });
    
    // Use querySelector instead of getByClassName
    expect(document.querySelector('.feed')).toBeInTheDocument();
    expect(document.querySelector('.feed-posts')).toBeInTheDocument();
  });

  it('fetches and displays content', async () => {
    // Get the mocked useInfiniteQuery with proper typing
    const useInfiniteQuerySpy = jest.spyOn(ReactQuery, 'useInfiniteQuery');
    
    // Render component
    await act(async () => {
      renderWithProviders(<Home />);
    });

    // Verify that useInfiniteQuery was called with correct parameters
    expect(useInfiniteQuerySpy).toHaveBeenCalledWith(
      'homeContent',
      expect.any(Function),
      expect.any(Object)
    );

    // Get the query function that was passed to useInfiniteQuery
    const queryFn = useInfiniteQuerySpy.mock.calls[0][1];
    
    // Call the query function
    await act(async () => {
      await queryFn({
        pageParam: 1,
        queryKey: ['homeContent'],
        meta: undefined
      } as QueryFunctionContext<QueryKey, number>);
    });

    // Verify the fetch call
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/definitions/most-liked'),
      expect.any(Object)
    );

    // Verify content is displayed
    expect(screen.getByText('Sample Word')).toBeInTheDocument();
    expect(screen.getByText('Sample Definition')).toBeInTheDocument();
  });
});
