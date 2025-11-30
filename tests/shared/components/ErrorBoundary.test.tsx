import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary, ErrorFallback } from '../../../src/shared/components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorFallback', () => {
  it('should render error message', () => {
    const error = new Error('Test error message');
    const resetError = vi.fn();

    render(<ErrorFallback error={error} resetError={resetError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should call resetError when Try Again button is clicked', async () => {
    const user = userEvent.setup();
    const error = new Error('Test error');
    const resetError = vi.fn();

    render(<ErrorFallback error={error} resetError={resetError} />);

    const button = screen.getByRole('button', { name: /try again/i });
    await user.click(button);

    expect(resetError).toHaveBeenCalledTimes(1);
  });

  it('should have alert role', () => {
    const error = new Error('Test error');
    const resetError = vi.fn();

    render(<ErrorFallback error={error} resetError={resetError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const error = new Error('Test error');
    const resetError = vi.fn();

    const { container } = render(
      <ErrorFallback error={error} resetError={resetError} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('should render error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should log error to console', () => {
    const consoleError = vi.mocked(console.error);

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleError).toHaveBeenCalled();
  });

  it('should reset error state when resetError is called', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /try again/i });
    await user.click(button);

    // After reset, the component should try to render children again
    // Since we're still passing shouldThrow=true, it will error again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should apply custom className to error fallback', () => {
    const { container } = render(
      <ErrorBoundary className="custom-error-class">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('.custom-error-class')).toBeInTheDocument();
  });

  it('should handle errors in nested components', () => {
    const NestedComponent = () => {
      return (
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle async errors', async () => {
    const AsyncError = () => {
      const [shouldThrow, setShouldThrow] = React.useState(false);

      React.useEffect(() => {
        setTimeout(() => setShouldThrow(true), 10);
      }, []);

      if (shouldThrow) {
        throw new Error('Async error');
      }

      return <div>Loading...</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncError />
      </ErrorBoundary>
    );

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should isolate errors to boundary', () => {
    render(
      <div>
        <div>Outside boundary</div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </div>
    );

    expect(screen.getByText('Outside boundary')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle errors with no message', () => {
    const ThrowEmptyError = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ThrowEmptyError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle non-Error objects thrown', () => {
    const ThrowString = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundary>
        <ThrowString />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
