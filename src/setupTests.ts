import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn().mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

window.IntersectionObserver = mockIntersectionObserver;

// Mock GSAP
jest.mock('gsap', () => ({
  timeline: jest.fn().mockReturnValue({
    to: jest.fn().mockReturnThis(),
    fromTo: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
  }),
  utils: {
    wrap: jest.fn(),
  },
  set: jest.fn(),
}));

// Mock html-to-image
jest.mock('html-to-image', () => ({
  toPng: jest.fn().mockResolvedValue('data:image/png;base64,'),
}));

// Mock react-country-flag
jest.mock('react-country-flag', () => ({
  __esModule: true,
  default: () => 'Country Flag Mock'
}));

// Mock react-helmet
jest.mock('react-helmet', () => ({
  Helmet: () => null
}));

// Mock react-adsense
jest.mock('react-adsense', () => ({
  __esModule: true,
  default: {
    Google: () => 'AdSense Mock'
  }
}));

// Mock i18next
jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key
}));

// Mock window resize
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1200
});

// Mock window matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
