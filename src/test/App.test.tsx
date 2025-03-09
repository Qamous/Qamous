import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { act } from 'react-dom/test-utils';

// Mock the components that are lazy loaded
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <div data-testid="mock-icon" />,
}));

vi.mock('../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock('../components/Snackbar', () => ({
  default: () => <div data-testid="mock-snackbar">Snackbar</div>,
}));

vi.mock('../components/LoadingSpinner', () => ({
  default: () => <div data-testid="mock-loading">Loading...</div>,
}));

// Mock the Vercel analytics components
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="mock-analytics" />,
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="mock-speed-insights" />,
}));

// Mock the i18n functionality
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Create a wrapper component that provides the necessary context
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

describe('App Component', () => {
  it('renders without crashing', async () => {
    // Arrange & Act
    await act(async () => {
      renderWithProviders(<App />);
    });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });
});