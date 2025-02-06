import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Home from '../Home';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

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

// Mock react-adsense
jest.mock('react-adsense', () => ({
  __esModule: true,
  default: {
    Google: ({ client, slot, style }: any) => (
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

// Mock useIntersectionObserver hook
jest.mock('../../../assets/utils', () => ({
  ...jest.requireActual('../../../assets/utils'),
  useIntersectionObserver: () => {
    const mockRef = { current: null };
    const setRef = (node: any) => {
      mockRef.current = node;
    };
    return [setRef, false];
  },
  getCountryName: jest.fn().mockResolvedValue('Test Country'),
}));

// Mock react-query with proper return values
jest.mock('react-query', () => {
  const originalModule = jest.requireActual('react-query');
  return {
    ...originalModule,
    useInfiniteQuery: jest.fn().mockImplementation(() => ({
      data: {
        pages: [[{
          word: 'Test Word',
          definition: 'Test Definition',
          isArabic: 0,
          wordId: 1,
          definitionId: 1
        }]]
      },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }))
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

    // Reset the useInfiniteQuery mock for loading state test
    const { useInfiniteQuery } = require('react-query');
    useInfiniteQuery.mockImplementation(() => ({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }));
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
    const { useInfiniteQuery } = require('react-query');
    
    // Render component
    await act(async () => {
      renderWithProviders(<Home />);
    });

    // Verify that useInfiniteQuery was called with correct parameters
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      'homeContent',
      expect.any(Function),
      expect.any(Object)
    );

    // Get the query function that was passed to useInfiniteQuery
    const queryFn = useInfiniteQuery.mock.calls[0][1];
    
    // Call the query function
    await act(async () => {
      await queryFn({ pageParam: 1 });
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
