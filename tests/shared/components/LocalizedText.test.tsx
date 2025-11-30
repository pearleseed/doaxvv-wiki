import React, { type ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocalizedText } from '../../../src/shared/components/LocalizedText';
import { LanguageProvider } from '../../../src/shared/contexts/LanguageContext';
import type { LocalizedString } from '../../../src/shared/types/localization';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LocalizedText', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });
  const mockLocalized: LocalizedString = {
    en: 'Hello',
    jp: 'こんにちは',
    cn: '你好',
    tw: '你好',
    kr: '안녕하세요',
  };

  it('should render English text by default', () => {
    render(<LocalizedText localized={mockLocalized} />, { wrapper });

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <LocalizedText localized={mockLocalized} className="custom-class" />,
      { wrapper }
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render without indicator by default', () => {
    const { container } = render(<LocalizedText localized={mockLocalized} />, { wrapper });

    expect(container.querySelector('span')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle empty translations', () => {
    const emptyLocalized: LocalizedString = {
      en: '',
      jp: '',
      cn: '',
      tw: '',
      kr: '',
    };

    render(<LocalizedText localized={emptyLocalized} />, { wrapper });

    // Should render empty span
    const span = screen.getByText('', { selector: 'span' });
    expect(span).toBeInTheDocument();
  });

  it('should fallback to English when translation is missing', () => {
    const partialLocalized: LocalizedString = {
      en: 'English only',
      jp: '',
      cn: '',
      tw: '',
      kr: '',
    };

    render(<LocalizedText localized={partialLocalized} />, { wrapper });

    expect(screen.getByText('English only')).toBeInTheDocument();
  });
});
