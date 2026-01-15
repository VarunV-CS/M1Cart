import { Component } from 'react';

const withErrorBoundary = (WrappedComponent) => {
  class WithErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <h2>Something went wrong.</h2>
            <p>Please try refreshing the page.</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
              </details>
            )}
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundary;
};

export default withErrorBoundary;