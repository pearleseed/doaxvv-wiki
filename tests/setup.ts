import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock DOMMatrix for pdfjs-dist
class DOMMatrixMock {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true;
  isIdentity = true;
  inverse() { return new DOMMatrixMock(); }
  multiply() { return new DOMMatrixMock(); }
  translate() { return new DOMMatrixMock(); }
  scale() { return new DOMMatrixMock(); }
  rotate() { return new DOMMatrixMock(); }
  transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
}
global.DOMMatrix = DOMMatrixMock as any;

// Mock react-pdf to avoid pdfjs-dist issues in tests
vi.mock('react-pdf', () => ({
  Document: ({ children }: any) => children,
  Page: () => null,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup DOM mocks before all tests
beforeAll(() => {
  // Mock window.matchMedia
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
