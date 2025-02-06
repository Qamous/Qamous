import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentBox from '../ContentBox';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'content_box_buttons') {
        return {
          like: 'Like',
          dislike: 'Dislike',
          report: 'Report',
          share: 'Share'
        };
      }
      return key;
    }
  })
}));

// Add these mocks at the top of the file
jest.mock('i18next', () => ({
  language: 'en',
}));

// Mock getCountryName utility
jest.mock('../../assets/utils', () => ({
  getCountryName: jest.fn().mockResolvedValue('Test Country'),
}));

const queryClient = new QueryClient();

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
  isReported: false
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('ContentBox', () => {
  beforeEach(() => {
    queryClient.clear();
    // Reset fetch mocks between tests
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders word and definition', () => {
    renderWithProviders(<ContentBox {...mockProps} />);
    
    expect(screen.getByText('Test Word')).toBeInTheDocument();
    expect(screen.getByText('Test Definition')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderWithProviders(<ContentBox {...mockProps} />);
    
    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Dislike')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('shows share options when share button is clicked', () => {
    renderWithProviders(<ContentBox {...mockProps} />);
    
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);
    
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('X / Twitter')).toBeInTheDocument();
  });

  it('does not render buttons when index is 0', () => {
    renderWithProviders(<ContentBox {...mockProps} index={0} />);
    
    expect(screen.queryByText('Like')).not.toBeInTheDocument();
    expect(screen.queryByText('Dislike')).not.toBeInTheDocument();
    expect(screen.queryByText('Report')).not.toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('handles like button click', async () => {
    renderWithProviders(<ContentBox {...mockProps} />);
    
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    
    // Wait for mutation to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reactions/1/like'),
        expect.any(Object)
      );
    });
  });
});
