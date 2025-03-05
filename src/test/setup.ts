import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with React Testing Library matchers
expect.extend(matchers);

// Mock window.scrollTo which is not implemented in JSDOM
beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
  });
});

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});